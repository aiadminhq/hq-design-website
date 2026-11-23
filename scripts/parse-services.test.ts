// parse-services.test.ts — 針對 services.html 的 TDD 測試
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { parseServices } from "./parse-services.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

async function readFixture(): Promise<string> {
  return fs.readFile(path.join(ROOT, "services.html"), "utf8");
}

test("parseServices — services 陣列 10 筆，必填欄位齊備", async () => {
  const html = await readFixture();
  const data = parseServices(html);

  // services 陣列
  assert.ok(Array.isArray(data.services), "services 應為陣列");
  assert.equal(data.services.length, 10, "應抽出 10 項服務");

  for (const s of data.services) {
    // 每筆服務的必填欄位
    assert.ok(s.slug.length > 0, `slug 必填 (number=${s.number})`);
    assert.ok(/^\d{2}$/.test(s.number), `number 為兩位數字 (${s.number})`);
    assert.ok(s.titleZh.length > 0, `titleZh 必填 (number=${s.number})`);
    assert.equal(s.titleEn, "", "Chinese-only：titleEn 為空字串");
    assert.ok(
      s.descriptionZh.length > 0,
      `descriptionZh 必填 (number=${s.number})`,
    );
  }

  // 抽樣驗證對應關係
  const s01 = data.services.find((x) => x.number === "01")!;
  assert.equal(s01.slug, "office-design");
  assert.equal(s01.titleZh, "辦公空間設計");
  assert.equal(s01.categoryGroup, "design");

  const s03 = data.services.find((x) => x.number === "03")!;
  assert.equal(s03.slug, "design-build");
  assert.equal(s03.categoryGroup, "build");
  assert.equal(s03.featured, true);

  const s08 = data.services.find((x) => x.number === "08")!;
  assert.equal(s08.slug, "smart-aiot");
  assert.equal(s08.categoryGroup, "tech");
  assert.equal(s08.featured, true);

  const s10 = data.services.find((x) => x.number === "10")!;
  assert.equal(s10.slug, "warranty");
  assert.equal(s10.categoryGroup, "aftercare");
  assert.ok(s10.descriptionZh.includes("保固"));
});

test("parseServices — process 5 步驟齊備", async () => {
  const html = await readFixture();
  const data = parseServices(html);

  assert.ok(Array.isArray(data.process), "process 應為陣列");
  assert.equal(data.process.length, 5, "應抽出 5 個流程步驟");

  for (const step of data.process) {
    assert.ok(/^\d{2}$/.test(step.number), `step.number 為兩位數字`);
    assert.ok(step.titleZh.length > 0, "step.titleZh 必填");
    assert.equal(step.titleEn, "", "Chinese-only：step.titleEn 為空字串");
  }

  // 驗證順序與對應
  assert.equal(data.process[0].number, "01");
  assert.equal(data.process[0].titleZh, "需求評估");
  assert.equal(data.process[1].titleZh, "設計提案");
  assert.equal(data.process[2].titleZh, "施工執行");
  assert.equal(data.process[3].titleZh, "完工驗收");
  assert.equal(data.process[4].number, "05");
  assert.equal(data.process[4].titleZh, "保固維護");
});

test("parseServices — 頂層必填欄位齊備（schema required 對齊）", async () => {
  const html = await readFixture();
  const data = parseServices(html);

  // schema required: slug / number / titleZh / titleEn / descriptionZh
  assert.ok(data.slug.length > 0, "頂層 slug 必填");
  assert.ok(data.number.length > 0, "頂層 number 必填");
  assert.ok(data.titleZh.length > 0, "頂層 titleZh 必填");
  assert.equal(data.titleEn, "", "頂層 titleEn 為空字串");
  assert.ok(data.descriptionZh.length > 0, "頂層 descriptionZh 必填");

  // 頂層欄位應對應第一筆 service
  assert.equal(data.slug, data.services[0].slug);
  assert.equal(data.number, data.services[0].number);
  assert.equal(data.titleZh, data.services[0].titleZh);
});
