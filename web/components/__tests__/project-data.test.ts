import { registerHooks } from "node:module";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import assert from "node:assert/strict";
import { test } from "node:test";
import type { Project } from "../../lib/content/schema";
import hqLoader from "../../lib/image-loader";
import manifest from "../../lib/content/generated/images.json";
import { existsSync } from "node:fs";

// Next aliases this build-boundary marker; mirror that resolution in Node tests.
registerHooks({
  resolve(specifier, context, next) {
    return next(
      specifier === "server-only"
        ? "next/dist/compiled/server-only/empty.js"
        : specifier,
      context,
    );
  },
});
const { plain, toCardData, imageData } = await import("../project-data");
const root = join(process.cwd(), "..", "content", "projects");
const projects: Project[] = await Promise.all(
  (await readdir(root))
    .filter((f) => f.endsWith(".json"))
    .map(async (f) => JSON.parse(await readFile(join(root, f), "utf8"))),
);

test("editorial copy removes HTML formatting and decodes source entities", () => {
  assert.equal(
    plain("<b>Design</b> &amp; Build&nbsp;&rarr; Space"),
    "Design & Build → Space",
  );
  assert.equal(plain(""), "");
});
test("every project produces a public card without internal review metadata", () => {
  for (const project of projects)
    for (const locale of ["zh", "en"] as const) {
      const card = toCardData(project, locale);
      assert.ok(card.href.startsWith(`/${locale}/work/`));
      assert.ok(card.image.src.startsWith(`/media/work/${project.slug}/`));
      assert.ok(card.name.length > 0);
      assert.equal("dataQuality" in card, false);
      assert.equal("risks" in card.image, false);
      assert.equal("retouchNote" in card.image, false);
      if (!project.name.en && locale === "en")
        assert.equal(card.lang, "zh-Hant");
    }
});
test("all 126 images retain their source family and usable blur placeholders", () => {
  let count = 0;
  for (const p of projects)
    for (const im of p.images) {
      const image = imageData(p, im, "en");
      assert.equal(image.prov, im.prov);
      assert.ok(image.blur?.startsWith("data:image/"));
      if (im.prov !== "photo") assert.ok(!image.label.includes("AS-BUILT"));
      assert.ok(!image.src.includes("sourceFile"));
      count++;
    }
  assert.equal(count, 126);
});
test("missing hero falls back to first source image; provisional facts stay off cards", () => {
  const p = structuredClone(projects[0]);
  p.images.forEach((im) => {
    im.role = "gallery";
  });
  p.specs = [
    { labelZh: "面積", labelEn: "Area", value: "UNVERIFIED", valueEn: null, verified: false },
  ];
  const card = toCardData(p, "en");
  assert.equal(card.image.stem, p.images[0].stem);
  assert.equal(card.facts, "");
});
test("image focal point is preserved for responsive cropping", () => {
  const p = projects[0];
  const im = { ...p.images[0], focal: { x: 0.25, y: 0.75 } };
  assert.equal(imageData(p, im, "zh").position, "25% 75%");
});

test("responsive image requests always select a generated file, including oversize requests", () => {
  for (const [key, entry] of Object.entries(manifest.images)) {
    for (const width of [320, 800, 1024, 1280, 1600, 1920, 2560, 5000]) {
      const src = hqLoader({ src: `/media/work/${key}`, width });
      assert.ok(existsSync(join(process.cwd(), "public", src)), src);
      const selected = Number(src.match(/-(\d+)\.webp$/)?.[1]);
      assert.ok(entry.widths.includes(selected));
    }
  }
});

test("unknown media fails explicitly rather than manufacturing a broken URL", () => {
  assert.throws(
    () => hqLoader({ src: "/media/work/missing/image", width: 800 }),
    /manifest/,
  );
});
