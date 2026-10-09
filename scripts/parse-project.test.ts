// parse-project.test.ts — 針對兩種 gallery 結構的 TDD 測試
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { parseProject } from "./parse-project.ts";

// These parsers target the archived Chinese template, not the current bilingual main.
const ROOT = path.resolve(import.meta.dirname, "fixtures/legacy-1fdff97");

async function readFixture(slug: string): Promise<string> {
  return fs.readFile(path.join(ROOT, "projects", `${slug}.html`), "utf8");
}

test("parseProject(kimpton) — 扁平 gallery 模式", async () => {
  const html = await readFixture("kimpton");
  const data = parseProject(html, "kimpton", {
    category: "hospitality",
    featured: true,
    groupedGallery: false,
    client: "Kimpton",
  });

  // Required schema fields
  assert.equal(data.slug, "kimpton");
  assert.ok(data.nameZh.length > 0, "nameZh 應非空");
  assert.equal(data.nameEn, ""); // Phase 1：英文留空
  assert.equal(data.category, "hospitality");
  assert.equal(typeof data.year, "number");
  assert.equal(data.year, 2022);
  assert.ok(
    data.heroImage.length > 0 && data.heroImage.endsWith(".jpg"),
    "heroImage 應為圖片 URL",
  );

  // Hero 衍生欄位
  assert.equal(data.categoryLabel, "Hospitality");
  assert.ok(data.locationZh && data.locationZh.includes("台北"));
  assert.equal(data.designBuildLabel, "HQ Interior");

  // 描述與 scope
  assert.ok(
    data.descriptionZh && data.descriptionZh.includes("Kimpton"),
    "descriptionZh 應包含 Kimpton 字樣",
  );
  assert.ok(
    data.scopeZh && data.scopeZh.includes("國際飯店"),
    "scopeZh 應含 label 文字",
  );

  // Specs：kimpton 有 6 條 spec-row
  assert.ok(Array.isArray(data.specs));
  assert.ok(data.specs!.length >= 5, "specs 至少 5 筆");
  for (const s of data.specs!) {
    assert.ok(s.labelZh && s.labelZh.length > 0);
    assert.ok(s.value && s.value.length > 0);
  }

  // Flat gallery
  assert.ok(Array.isArray(data.gallery), "kimpton 應為 flat gallery");
  assert.equal(data.gallerySections, undefined);
  assert.ok(data.gallery!.length >= 6, "kimpton 應至少 6 張 gallery");
  for (const g of data.gallery!) {
    assert.ok(g.image && g.image.endsWith(".jpg"));
  }

  // Client 從 registry 帶入
  assert.equal(data.client, "Kimpton");
  assert.equal(data.featured, true);
});

test("parseProject(zhongbao-nangang) — grouped gallerySections 模式", async () => {
  const html = await readFixture("zhongbao-nangang");
  const data = parseProject(html, "zhongbao-nangang", {
    category: "office",
    featured: true,
    groupedGallery: true,
    client: "中保科技",
  });

  // Required
  assert.equal(data.slug, "zhongbao-nangang");
  assert.ok(data.nameZh.length > 0);
  assert.equal(data.nameEn, "");
  assert.equal(data.category, "office");
  assert.equal(data.year, 2025);
  assert.ok(data.heroImage.includes("zhongbao-nangang"));

  // Grouped gallery
  assert.equal(data.gallery, undefined, "grouped 模式不應有 flat gallery");
  assert.ok(
    Array.isArray(data.gallerySections),
    "grouped 模式應有 gallerySections",
  );
  assert.ok(data.gallerySections!.length >= 5, "至少 5 個 section");

  for (const section of data.gallerySections!) {
    assert.ok(
      section.titleZh && section.titleZh.length > 0,
      "section.titleZh 必填",
    );
    assert.ok(
      Array.isArray(section.items) && section.items.length > 0,
      "section.items 至少 1 筆",
    );
    for (const item of section.items) {
      assert.ok(item.image && item.image.endsWith(".jpg"));
    }
  }

  // 確認第一段為「大樓整體規劃」
  assert.equal(data.gallerySections![0].titleZh, "大樓整體規劃");

  // Specs
  assert.ok(data.specs && data.specs.length >= 4);

  // Client 從 registry 帶入
  assert.equal(data.client, "中保科技");
});
