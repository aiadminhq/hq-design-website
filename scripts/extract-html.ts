// extract-html.ts — 讀 cms/schemas/projects.json 的 registry，
// 將 projects/<slug>.html 全部轉成 cms/data/projects/<slug>.json。
import fs from "node:fs/promises";
import path from "node:path";
import { parseProject, type RegistryEntry } from "./parse-project.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const SCHEMA_PATH = path.join(ROOT, "cms/schemas/projects.json");
// The old extractor must never scrape the new English-first main into Chinese CMS fields.
const LEGACY_SOURCE_ROOT = process.env.HQ_LEGACY_HTML_ROOT;
const PROJECTS_HTML_DIR = LEGACY_SOURCE_ROOT ? path.join(path.resolve(LEGACY_SOURCE_ROOT), "projects") : "";
const OUT_DIR = path.join(ROOT, "cms/data/projects");

interface RegistryItem extends RegistryEntry {
  slug: string;
}

interface SchemaWithRegistry {
  registry: RegistryItem[];
}

async function main() {
  if (!LEGACY_SOURCE_ROOT) {
    throw new Error("Legacy extraction requires an explicit HQ_LEGACY_HTML_ROOT pointing at an archived Chinese template. For current project data use web's Notion draft workflow; no CMS files were changed.");
  }
  const schemaRaw = await fs.readFile(SCHEMA_PATH, "utf8");
  const schema = JSON.parse(schemaRaw) as SchemaWithRegistry;
  const registry = schema.registry;
  if (!Array.isArray(registry) || registry.length === 0) {
    throw new Error("registry 為空，請檢查 cms/schemas/projects.json");
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  let okCount = 0;
  let failCount = 0;
  const failures: string[] = [];

  for (const entry of registry) {
    const { slug, ...rest } = entry;
    const htmlPath = path.join(PROJECTS_HTML_DIR, `${slug}.html`);
    const outPath = path.join(OUT_DIR, `${slug}.json`);
    try {
      const html = await fs.readFile(htmlPath, "utf8");
      const data = parseProject(html, slug, rest);
      await fs.writeFile(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
      console.log(`✅ ${slug}`);
      okCount++;
    } catch (err) {
      console.error(`❌ ${slug}:`, err instanceof Error ? err.message : err);
      failures.push(slug);
      failCount++;
    }
  }

  console.log(`\n總計：✅ ${okCount}  ❌ ${failCount}`);
  if (failCount > 0) {
    console.error("失敗清單：", failures);
    process.exit(1);
  }
}

await main();
