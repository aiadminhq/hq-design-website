import { readFile } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import path from "node:path";
import initialJson from "../content/initial-release.json";
import { getStore } from "../lib/cms/storage";
import {
  stage,
  published,
  readSnapshot,
  digest,
  versionKey,
} from "../lib/cms/releases";
import { notionDraft } from "../lib/cms/notion";
import { uploadImage } from "../lib/cms/media";
import { snapshotSchema, projectSchema } from "../lib/project";

try {
  loadEnvFile(".env.local");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const [action, versionArg, argument] = process.argv.slice(2);
if (!action || !versionArg)
  throw new Error(
    "Usage: npm run cms -- draft|upload|preview|inspect|publish|rollback VERSION [manifest.json|DIGEST]",
  );
const version = versionKey(versionArg);
if (action === "draft" || action === "upload") {
  const store = getStore();
  const base =
    action === "draft" && argument
      ? await readSnapshot(store, "drafts", versionKey(argument))
      : await published(store, snapshotSchema.parse(initialJson));
  const draft =
    action === "draft"
      ? await notionDraft(base, version)
      : {
          ...structuredClone(base),
          version,
          createdAt: new Date().toISOString(),
        };
  if (action === "upload") {
    if (!argument)
      throw new Error(
        "Pass a local manifest JSON: [{slug, files: [absolute paths], project?: complete project metadata for new slugs}]",
      );
    const manifest = JSON.parse(await readFile(argument, "utf8")) as {
      slug: string;
      files: string[];
      project?: unknown;
    }[];
    for (const entry of manifest) {
      let project = draft.projects.find((p) => p.slug === entry.slug);
      if (!project && entry.project) {
        project = projectSchema.parse(entry.project);
        if (project.slug !== entry.slug) throw new Error("Slug mismatch");
        draft.projects.push(project);
      }
      if (!project) throw new Error("Unknown project: " + entry.slug);
      if (!entry.files.length)
        throw new Error("An individual image is required");
      project.images = [];
      for (const [index, file] of entry.files.entries()) {
        if (!path.isAbsolute(file))
          throw new Error("Image paths must be absolute");
        const src = await uploadImage(store, entry.slug, await readFile(file));
        project.images.push({
          src,
          assetName: path.basename(file),
          kind: "image",
          alt: {
            en: `${project.name.en} — ${index + 1}`,
            zh: `${project.name.zh} — ${index + 1}`,
          },
        });
      }
    }
  }
  console.log(JSON.stringify(await stage(store, draft), null, 2));
} else if (action === "inspect-local") {
  const snapshot = await readSnapshot(getStore(), "drafts", version);
  console.log(JSON.stringify({ version, digest: digest(snapshot) }, null, 2));
} else {
  const base = process.env.HQ_CMS_URL;
  const secret = process.env.HQ_CMS_SECRET;
  if (!base || !secret) throw new Error("Set HQ_CMS_URL and HQ_CMS_SECRET");
  const target = new URL(base);
  if (
    target.protocol !== "https:" &&
    !["localhost", "127.0.0.1"].includes(target.hostname)
  )
    throw new Error("CMS commands require HTTPS");
  if (["publish", "rollback"].includes(action) && !argument)
    throw new Error(
      "Explicitly pass the SHA-256 digest of the reviewed version",
    );
  const response = await fetch(new URL("/api/internal/release", base), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, version, digest: argument }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "CMS command failed");
  console.log(
    JSON.stringify(
      result.previewPath
        ? { ...result, previewUrl: new URL(result.previewPath, base).href }
        : result,
      null,
      2,
    ),
  );
}
