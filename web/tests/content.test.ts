import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { load } from "cheerio";
import {
  snapshotSchema,
  deferred,
  addedSlugs,
  pingFromSqm,
  formatArea,
  localizedPath,
} from "../lib/project";
import { safeJson, metadata, projectJsonLd } from "../lib/seo";
import { imageType } from "../lib/cms/media";
import initial from "../content/initial-release.json";
import pages from "../content/generated/pages.json";

test("square metres remain authoritative; ping is derived once and rounded only for display", () => {
  assert.equal(pingFromSqm(3300), 1000);
  assert.equal(formatArea(711, "zh", true), "711 m²（約 215.5 坪）");
  assert.equal(formatArea(200, "zh", true), "200 m²（約 60.6 坪）");
  for (const value of [null, 0, -1, NaN, Infinity])
    assert.equal(formatArea(value, "en"), "");
  assert.equal(formatArea(3300, "en"), "3,300 m²");
});
test("28 projects include exactly the eight additions and exclude deferred/orphan cases", () => {
  const release = snapshotSchema.parse(initial);
  assert.equal(release.projects.length, 28);
  for (const slug of addedSlugs)
    assert.ok(release.projects.some((p) => p.slug === slug));
  for (const p of release.projects) assert.ok(!deferred.has(p.slug));
  assert.throws(() =>
    snapshotSchema.parse({
      ...initial,
      projects: [initial.projects[0], initial.projects[0]],
    }),
  );
});
test("selected local pictures win, disputed Polytron replacement is absent", () => {
  const find = (slug: string) => initial.projects.find((p) => p.slug === slug)!;
  assert.match(find("csun").images[0].src, /selected-20260923-01.webp$/);
  assert.ok(
    find("csun").images.some((i) => /retouched-20260923-02.webp$/.test(i.src)),
  );
  assert.equal(
    find("qijia").images.filter((i) => /retouched/.test(i.src)).length,
    8,
  );
  assert.equal(find("guochan-office").images.length, 4);
  assert.ok(
    find("polytron").images.every(
      (i) =>
        !i.src.includes("baohua") && !i.src.includes("selected-20260923-02"),
    ),
  );
});
test("all referenced gallery files are individual raster images; no Figma boards or contactsheets", async () => {
  for (const p of initial.projects)
    for (const image of p.images) {
      assert.ok(!/figma|contact.?sheet|p\d+-?sheet/i.test(image.src));
      const bytes = await readFile("public" + image.src);
      assert.match(imageType(bytes), /^image\//);
    }
});
test("all static pages retain accessible links/forms and have no legacy executable scripts", async () => {
  assert.equal(Object.keys(pages).length, 16);
  for (const [key, page] of Object.entries(pages)) {
    const $ = load(page.html);
    assert.equal($("h1").length, 1, key);
    assert.equal($("script").length, 0, key);
    assert.ok(!/以下為 AI 編修|AI-enhanced/.test(page.html));
    for (const element of $("[href], [src]").toArray()) {
      const href = $(element).attr("href") || $(element).attr("src") || "";
      assert.ok(!/\.html(?:#|$)/.test(href), href);
      if (href.startsWith("/assets/")) await access("public" + href);
    }
    $('form input:not([type="hidden"]),form select,form textarea').each(
      (_, el) => {
        assert.ok($(el).attr("id"), key);
      },
    );
  }
});
test("SEO uses clean bilingual canonical URLs and square metres", () => {
  const p = snapshotSchema.parse(initial).projects[0];
  const seo = metadata("Title", "Description", "/projects/csun", "zh");
  assert.equal(
    seo.alternates?.canonical,
    "https://www.hqdesign.tw/zh/projects/csun",
  );
  assert.equal(projectJsonLd(p, "zh").size?.unitCode, "MTK");
  assert.equal(localizedPath("/", "zh"), "/zh");
  assert.equal(localizedPath("/", "en"), "/");
  assert.ok(
    !safeJson({ name: "</script><script>alert(1)</script>" }).includes("<"),
  );
});
