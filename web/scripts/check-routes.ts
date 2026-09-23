import assert from "node:assert/strict";
import { load } from "cheerio";
import snapshot from "../content/initial-release.json";
const base = process.env.HQ_TEST_URL || "http://127.0.0.1:3010";
const pages = [
  "",
  "projects",
  "services",
  "about",
  "contact",
  "careers",
  "local-partner-international-pm",
  "faq",
];
let checked = 0;
for (const locale of ["", "/zh"]) {
  for (const route of [
    ...pages,
    ...snapshot.projects.map((p) => "projects/" + p.slug),
  ]) {
    const pathname = locale + (route ? "/" + route : "") || "/";
    const response = await fetch(base + pathname);
    assert.equal(response.status, 200, pathname);
    const $ = load(await response.text());
    assert.equal($("h1").length, 1, pathname);
    assert.equal($("html").attr("lang"), locale ? "zh-Hant" : "en");
    assert.equal(
      new URL($("link[rel=canonical]").attr("href")!).href,
      new URL("https://www.hqdesign.tw" + pathname).href,
    );
    assert.equal($("nav").length, 1);
    assert.equal($("footer").length, 1);
    checked++;
    const legacy = locale + "/" + (route || "index") + ".html";
    const redirect = await fetch(base + legacy, { redirect: "manual" });
    assert.equal(redirect.status, 308, legacy);
    assert.equal(
      new URL(redirect.headers.get("location")!, base).pathname,
      pathname,
      legacy,
    );
    checked++;
  }
}
const sitemap = await (await fetch(base + "/sitemap.xml")).text();
assert.equal((sitemap.match(/<url>/g) || []).length, 72);
for (const slug of [
  "airport-lounges",
  "staff-facility",
  "zhongbao-smart-facility",
  "zhongbao-store-daan",
  "zhongbao-store-zhuangjing",
]) {
  assert.ok(!sitemap.includes(slug));
  const response = await fetch(base + "/projects/" + slug);
  assert.equal(response.status, 404, slug);
  const body = await response.text();
  assert.ok(body.includes("Page not found"));
  assert.ok(body.includes("noindex"));
  checked++;
}
const response = await fetch(base + "/api/internal/release", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "publish",
    version: "initial-20260923",
    digest: "x",
  }),
});
assert.ok(response.status >= 400);
console.log(
  `Route checks passed: ${checked} route/redirect/exclusion checks; 72 sitemap URLs; unauthorized publishing rejected.`,
);
