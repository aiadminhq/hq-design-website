import {
  addedSlugs,
  deferred,
  snapshotSchema,
  type Project,
  type Snapshot,
} from "../project";
import confirmedAreas from "../../content/area-confirmed.json";

type Property = {
  type?: string;
  number?: number | null;
  checkbox?: boolean;
  select?: { name: string } | null;
  title?: { plain_text?: string; text?: { content: string } }[];
  rich_text?: { plain_text?: string; text?: { content: string } }[];
  files?: {
    name?: string;
    type: string;
    file?: { url: string };
    external?: { url: string };
  }[];
};
export type NotionRow = { id: string; properties: Record<string, Property> };
function text(p: Property | undefined) {
  return (p?.rich_text || p?.title || [])
    .map((t) => t.plain_text ?? t.text?.content ?? "")
    .join("");
}
export function mergeNotion(
  rows: NotionRow[],
  base: Snapshot,
  version: string,
): Snapshot {
  const projects: Project[] = [];
  for (const row of rows) {
    const p = row.properties;
    const slug = text(p.Slug);
    const old = base.projects.find((project) => project.slug === slug);
    if (
      deferred.has(slug) ||
      p["Is Internal"]?.checkbox ||
      p["Publish Status"]?.select?.name === "legacy-orphan"
    )
      continue;
    if (
      p["Publish Status"]?.select?.name !== "live" &&
      !addedSlugs.includes(slug)
    )
      continue;
    if (!old)
      throw new Error(
        `Upload and map individual photos before importing new project: ${slug}`,
      );
    const localized = (name: string, fallback: { en: string; zh: string }) => ({
      en: text(p[name + " En"]) || fallback.en,
      zh: text(p[name + " Zh"]) || fallback.zh,
    });
    const area =
      p["Area Sqm"]?.number ??
      (confirmedAreas as Record<string, number>)[slug] ??
      null;
    const ordered = [] as Project["images"];
    // Only filenames that resolve to the pinned selection may affect ordering. Old or expiring attachments never replace files.
    const key = (src: string) =>
      decodeURIComponent(
        new URL(src, "https://hq.invalid").searchParams.get("key") ||
          new URL(src, "https://hq.invalid").pathname,
      )
        .split("/")
        .pop();
    for (const field of [
      "Hero Image",
      ...Array.from({ length: 8 }, (_, i) => `Image ${i + 1}`),
    ]) {
      const name = p[field]?.files?.[0]?.name;
      const selected = old.images.find(
        (image) => name === (image.assetName || key(image.src)),
      );
      if (selected && !ordered.some((image) => image.src === selected.src))
        ordered.push(selected);
    }
    const images = [
      ...ordered,
      ...old.images.filter(
        (image) => !ordered.some((item) => item.src === image.src),
      ),
    ];
    projects.push({
      ...old,
      name: localized("Name", old.name),
      description: localized("Description", old.description),
      location: {
        en: text(p.Location) || old.location.en,
        zh: text(p["Location Zh"]) || old.location.zh,
      },
      client: { en: text(p["Client En"]), zh: text(p.Client) },
      areaSqm: area,
      year: p.Year?.number ?? null,
      category: p.Category?.select?.name || old.category,
      order: p["Sort Order"]?.number ?? old.order,
      featured: p.Featured?.checkbox ?? old.featured,
      featuredOrder: p["Sort Order"]?.number ?? old.featuredOrder,
      images,
    });
  }
  return snapshotSchema.parse({
    version,
    createdAt: new Date().toISOString(),
    projects: projects.sort((a, b) => a.order - b.order),
  });
}
export async function notionDraft(base: Snapshot, version: string) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is required");
  const dataSource =
    process.env.NOTION_PROJECTS_DATA_SOURCE ||
    "00619820-569a-40a2-bade-2f3fd8c1997a";
  const rows: NotionRow[] = [];
  let cursor: string | undefined;
  do {
    const response = await fetch(
      `https://api.notion.com/v1/data_sources/${dataSource}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": "2025-09-03",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!response.ok)
      throw new Error(
        `Notion query failed (${response.status}); public release is unchanged`,
      );
    const data = await response.json();
    rows.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return mergeNotion(rows, base, version);
}
