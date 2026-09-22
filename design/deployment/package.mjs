import { cp, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

// Deliberately package only build inputs; never copy the entire working tree.
const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const target = await mkdtemp(join(tmpdir(), "hq-design-next-"));
const copy = async (relative) => {
  await mkdir(dirname(join(target, relative)), { recursive: true });
  await cp(join(root, relative), join(target, relative), {
    recursive: true,
    filter: (path) => !/(^|\/)(\.DS_Store|\.env[^/]*|node_modules|\.git|\.next|\.vercel)(\/|$)/.test(path),
  });
};
for (const relative of [
  "web/app", "web/components", "web/lib", "web/messages", "web/scripts",
  "web/public/brand", "web/public/fonts", "web/public/media",
  "web/package.json", "web/package-lock.json", "web/next.config.ts",
  "web/next-env.d.ts", "web/tsconfig.json", "web/middleware.ts",
  "content/projects", "content/process", "ds-bundle/tokens", "ds-bundle/fonts",
  "cms/data/about.json", "cms/data/services.json", "cms/data/careers.json",
  "design/assets/pattern/hq-pattern-1073-100220-currentColor.svg",
]) await copy(relative);

// Copy only images explicitly referenced by the approved content pipeline.
const { readdir } = await import("node:fs/promises");
for (const file of await readdir(join(root, "content/projects"))) {
  if (!file.endsWith(".json")) continue;
  const project = JSON.parse(await readFile(join(root, "content/projects", file), "utf8"));
  for (const image of project.images) {
    if (!/^[a-z0-9-]+$/.test(project.slug) || /[/\\]|^\./.test(image.sourceFile)) {
      throw new Error(`Unexpected image path in ${file}`);
    }
    await copy(`site/assets/img/work/${project.slug}/${image.sourceFile}`);
  }
}
await writeFile(join(target, ".vercelignore"), "**/.DS_Store\n**/node_modules\n**/.next\n**/*.tsbuildinfo\n");
console.log(target);
