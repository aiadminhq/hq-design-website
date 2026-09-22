import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const web = fileURLToPath(new URL("../../web/", import.meta.url));
const origin = process.env.SITE_TEST_ORIGIN || "http://127.0.0.1:3020";
const manifest = JSON.parse(await readFile(join(web, ".next/prerender-manifest.json"), "utf8"));
const pages = Object.keys(manifest.routes).filter((path) => /^\/(zh|en)(\/|$)/.test(path));
const redirects = JSON.parse(await readFile(join(web, "lib/routes/legacy-redirects.json"), "utf8"));
const links = new Set();
const assets = new Set(["/brand/hq-pattern.svg", "/icon.svg"]);

test("all localised pages render main content and only local project media", async () => {
  assert.equal(pages.length, 96);
  for (let i = 0; i < pages.length; i += 8) {
    await Promise.all(pages.slice(i, i + 8).map(async (path) => {
      const response = await fetch(origin + path);
      assert.equal(response.status, 200, path);
      const html = await response.text();
      assert.ok(html.includes('id="main"'), path);
      assert.ok(!html.includes("/_next/image?"), path);
      for (const [, href] of html.matchAll(/<a[^>]+href="([^"]+)"/g)) {
        if (href.startsWith("/") && !href.startsWith("//")) links.add(href.split("?")[0].split("#")[0]);
      }
      for (const [, src] of html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
        assert.ok(src.startsWith("/media/work/") || /^\/brand\/hq-(icon-black|design-lockup)\.svg$/.test(src), `${path}: ${src}`);
        assets.add(src);
      }
      for (const [, srcset] of html.matchAll(/<img[^>]+srcSet="([^"]+)"/gi)) {
        for (const candidate of srcset.split(",")) assets.add(candidate.trim().split(" ")[0]);
      }
    }));
  }
});

test("every internal link and responsive image candidate is reachable", async () => {
  for (const list of [[...links], [...assets]]) {
    for (let i = 0; i < list.length; i += 12) {
      await Promise.all(list.slice(i, i + 12).map(async (path) => {
        const response = await fetch(origin + path, { method: "HEAD" });
        assert.equal(response.status, 200, path);
      }));
    }
  }
  assert.ok(assets.size >= 126);
  console.log(`Checked ${links.size} internal destinations and ${assets.size} image variants.`);
});

test("all legacy redirects resolve to their declared localised destination", async () => {
  for (const item of redirects) {
    const response = await fetch(origin + item.from, { redirect: "manual" });
    assert.equal(response.status, 301, item.from);
    assert.equal(new URL(response.headers.get("location"), origin).pathname, item.to, item.from);
  }
});

test("unknown projects and pages return 404", async () => {
  for (const path of ["/zh/work/not-a-project", "/en/process/not-a-stage", "/zh/not-a-page"]) {
    assert.equal((await fetch(origin + path)).status, 404, path);
  }
});
