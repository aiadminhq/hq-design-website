import "server-only";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";
import { z } from "zod";
import {
  Project,
  SOURCE_LABEL,
  type Locale,
  type Provenance,
  type LabelVariant,
} from "./schema";

/** content/ 在 repo 根，web/ 的上一層。 */
const CONTENT = join(process.cwd(), "..", "content");
const PROJECTS = join(CONTENT, "projects");

const WEIGHT_ORDER = { lead: 0, w6: 1, w4: 2, reg: 3, other: 4 } as const;

export const getAllProjects = cache(async (): Promise<Project[]> => {
  const files = (await readdir(PROJECTS)).filter((f) => f.endsWith(".json"));
  const out = await Promise.all(
    files.map(async (f) => {
      const raw = JSON.parse(await readFile(join(PROJECTS, f), "utf8"));
      const r = Project.safeParse(raw);
      if (!r.success) {
        // 內容有問題就讓 build 失敗，而不是靜默出錯頁
        throw new Error(`[content] ${f}\n${z.prettifyError(r.error)}`);
      }
      return r.data;
    }),
  );
  return out.sort(
    (a, b) => WEIGHT_ORDER[a.weight] - WEIGHT_ORDER[b.weight] || a.slug.localeCompare(b.slug),
  );
});

export const getProject = cache(async (slug: string): Promise<Project | null> => {
  const all = await getAllProjects();
  return all.find((p) => p.slug === slug) ?? null;
});

/**
 * 來源標示只能從這裡取得，不得手寫字串。
 * variant 只在同一個 prov 家族內換措辭，型別上跨不了家族。
 */
export function sourceLabel<P extends Provenance>(
  prov: P,
  locale: Locale,
  variant: LabelVariant<P> = "default" as LabelVariant<P>,
): string {
  const family = SOURCE_LABEL[prov] as Record<string, Record<Locale, string>>;
  return (family[variant as string] ?? family.default)[locale];
}

/**
 * 對外機器可讀宣稱（JSON-LD／llms.txt／OG／sitemap）只能吃這裡的值。
 * 暫填（verified=false）與缺漏的事實一律排除。
 */
export function verifiedFacts(p: Project) {
  if (!p.dataQuality.factsVerified) return {};
  const provisional = new Set(p.dataQuality.provisionalFields);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p.facts)) {
    if (v != null && !provisional.has(k)) out[k] = v;
  }
  return out;
}
