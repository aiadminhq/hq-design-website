// parse-homepage.test.ts — TDD：確認 index.html 解析後符合 homepage schema 的結構與最小欄位
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { parseHomepage } from "./parse-homepage.ts";

// These parsers target the archived Chinese template, not the current bilingual main.
const ROOT = path.resolve(import.meta.dirname, "fixtures/legacy-1fdff97");

async function readHomepageFixture(): Promise<string> {
  return fs.readFile(path.join(ROOT, "index.html"), "utf8");
}

test("parseHomepage — hero 區塊必填欄位齊全", async () => {
  const html = await readHomepageFixture();
  const data = parseHomepage(html);

  assert.ok(data.hero, "hero 物件存在");
  const { hero } = data;

  assert.ok(hero.kicker.length > 0, "hero.kicker 應非空");
  assert.ok(hero.kicker.includes("31 Years"), "kicker 應包含 31 Years 文案");

  // 此頁無中文主標題，依規約以空字串標示
  assert.equal(typeof hero.headlineZh, "string");
  assert.ok(
    hero.headlineEn.includes("Zero Downtime"),
    "headlineEn 含 Zero Downtime",
  );
  assert.ok(
    hero.headlineEn.includes("Turnkey Delivery"),
    "headlineEn 含 Turnkey Delivery",
  );

  assert.ok(hero.subZh.includes("精準施工"), "subZh 應為中文版 tagline");
  assert.ok(
    hero.subEn.includes("Institutional-grade"),
    "subEn 應為英文版 tagline",
  );

  assert.ok(
    hero.backgroundImage.startsWith("assets/images/"),
    "backgroundImage 應為 assets/images/ 開頭的相對路徑",
  );
  assert.ok(hero.backgroundImage.endsWith(".jpg"), "backgroundImage 應為 .jpg");

  // CTA 兩顆
  assert.ok(hero.ctaPrimary.label.includes("Start Your Project"));
  assert.equal(hero.ctaPrimary.href, "contact.html");
  assert.ok(hero.ctaSecondary.label.includes("View Portfolio"));
  assert.equal(hero.ctaSecondary.href, "projects.html");

  // Stats：四筆，數字 + 單位
  assert.ok(Array.isArray(hero.stats));
  assert.equal(hero.stats.length, 4, "hero.stats 應為 4 筆");
  for (const s of hero.stats) {
    assert.ok(s.number.length > 0, "stat.number 必填");
    assert.equal(typeof s.labelZh, "string");
    assert.ok(s.labelEn.length > 0, "stat.labelEn 應非空");
  }
  // 開頭應為 "31+"（含單位）
  assert.equal(hero.stats[0].number, "31+");
  assert.equal(hero.stats[1].number, "1,600+");
  assert.equal(hero.stats[2].number, "100%");
  assert.equal(hero.stats[3].number, "12M");
});

test("parseHomepage — logosBar 7 個客戶 logo", async () => {
  const html = await readHomepageFixture();
  const data = parseHomepage(html);

  assert.ok(data.logosBar, "logosBar 物件存在");
  const { logosBar } = data;

  assert.equal(typeof logosBar.labelZh, "string");
  assert.ok(logosBar.labelEn.toLowerCase().includes("trusted"));

  assert.ok(Array.isArray(logosBar.items));
  assert.equal(logosBar.items.length, 7, "首頁應顯示 7 家客戶 logo");
  for (const item of logosBar.items) {
    assert.ok(item.name && item.name.length > 0, "logo.name 必填");
  }

  // 確認中文名稱被擷取（如「中保科技」）
  const names = logosBar.items.map((i) => i.name);
  assert.ok(
    names.includes("中保科技"),
    `應包含 SECOM 中保科技，實得: ${names.join(",")}`,
  );
  assert.ok(names.includes("金普頓大安酒店"));
});

test("parseHomepage — featuredProjects 為 projects/*.html slug 陣列", async () => {
  const html = await readHomepageFixture();
  const data = parseHomepage(html);

  assert.ok(Array.isArray(data.featuredProjects));
  assert.ok(
    data.featuredProjects.length >= 3,
    `featuredProjects 應至少 3 筆，實得 ${data.featuredProjects.length}`,
  );
  assert.equal(
    data.featuredProjects.length,
    4,
    "目前首頁固定 4 件 featured project",
  );

  // 確認 slug 純字串、無 .html、無資料夾前綴
  for (const slug of data.featuredProjects) {
    assert.equal(typeof slug, "string");
    assert.ok(!slug.includes("/"), `slug 不應含 /，得到: ${slug}`);
    assert.ok(!slug.endsWith(".html"), `slug 不應含 .html，得到: ${slug}`);
  }

  // 第一筆對齊 SECOM
  assert.equal(data.featuredProjects[0], "secom-nangang-complex");
  assert.ok(data.featuredProjects.includes("kimpton"));
});

test("parseHomepage — taiwanWedge 區塊有 bullets 與 CTA", async () => {
  const html = await readHomepageFixture();
  const data = parseHomepage(html);

  assert.ok(data.taiwanWedge, "taiwanWedge 應存在");
  const w = data.taiwanWedge!;

  assert.ok(Array.isArray(w.bullets));
  assert.ok(
    w.bullets.length >= 4,
    `bullets 應至少 4 筆，實得 ${w.bullets.length}`,
  );
  for (const b of w.bullets) {
    assert.ok(typeof b === "string" && b.length > 0, "bullet 為非空字串");
  }
  assert.ok(
    w.bullets.some((b) => /English-language/i.test(b)),
    "bullets 應含 English-language scope 條目",
  );

  assert.ok(w.ctaLabel.length > 0, "ctaLabel 必填");
  assert.equal(w.ctaHref, "contact.html");
});
