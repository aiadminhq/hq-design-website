import { access } from "node:fs/promises";
import { snapshotSchema, addedSlugs, deferred } from "../lib/project";
import data from "../content/initial-release.json";
import pages from "../content/generated/pages.json";
const release = snapshotSchema.parse(data);
for (const slug of addedSlugs)
  if (!release.projects.some((p) => p.slug === slug))
    throw new Error("Missing addition: " + slug);
for (const p of release.projects) {
  if (deferred.has(p.slug)) throw new Error("Deferred project published");
  for (const image of p.images) {
    if (!image.src.startsWith("/assets/"))
      throw new Error("Initial photo must be local");
    await access("public" + image.src);
  }
}
for (const page of Object.values(pages))
  if (/以下為 AI 編修|AI-enhanced/.test(page.html))
    throw new Error("Removed caption resurfaced");
console.log(
  `Content checks passed: ${release.projects.length} projects; ${Object.keys(pages).length} main pages; excluded projects absent; individual image files present.`,
);
