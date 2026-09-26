// parse-careers.test.ts — Phase 1.5：對 parseCareers(html) 的 TDD 測試
//
// 驗證重點（依 schema 必填欄位）：
//   - positions[]: slug / titleZh / titleEn / department
//   - values[]:    slug / icon / titleZh / titleEn / descZh
//   - perks[]:     slug / icon / titleZh
//   - Phase 1 中文化策略：必填的 *En 為空字串

import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { parseCareers } from "./parse-careers.ts";

// These parsers target the archived Chinese template, not the current bilingual main.
const ROOT = path.resolve(import.meta.dirname, "fixtures/legacy-1fdff97");

async function readFixture(): Promise<string> {
  return fs.readFile(path.join(ROOT, "careers.html"), "utf8");
}

test("parseCareers — 三個子集合都非空", async () => {
  const html = await readFixture();
  const data = parseCareers(html);

  assert.ok(Array.isArray(data.positions), "positions 必為陣列");
  assert.ok(Array.isArray(data.values), "values 必為陣列");
  assert.ok(Array.isArray(data.perks), "perks 必為陣列");

  assert.ok(data.positions.length >= 4, "positions 至少 4 筆");
  assert.ok(data.values.length >= 6, "values 至少 6 筆 (Why Join HQ)");
  assert.ok(data.perks.length >= 6, "perks 至少 6 筆 (What We Offer)");
});

test("parseCareers.positions — 必填欄位、部門、技能 chip", async () => {
  const html = await readFixture();
  const data = parseCareers(html);

  const slugs = new Set<string>();
  for (const p of data.positions) {
    assert.ok(p.slug && p.slug.length > 0, "slug 必填");
    assert.ok(/^[a-z0-9-]+$/.test(p.slug), `slug 須為 kebab-case：${p.slug}`);
    assert.ok(!slugs.has(p.slug), `slug 須唯一：${p.slug}`);
    slugs.add(p.slug);

    assert.ok(p.titleZh && p.titleZh.length > 0, "titleZh 必填");
    assert.equal(p.titleEn, "", "Phase 1：titleEn 必為空字串");
    assert.ok(
      [
        "Design 設計部",
        "Project 專案部",
        "Site 工務部",
        "Operations 行政部",
      ].includes(p.department),
      `department 須符合 enum：${p.department}`,
    );

    // skills 雖非 schema required，但 HTML 內每張卡都有 chip
    assert.ok(Array.isArray(p.skills) && p.skills.length > 0, "skills 應非空");
    for (const s of p.skills!) {
      assert.ok(s.length > 0, "skill chip 不應為空字串");
    }

    // summaryZh：HTML 內每張卡的第一個 <p> 即職務說明
    assert.ok(p.summaryZh && p.summaryZh.length > 0, "summaryZh 應非空");
  }

  // 確保特定職缺存在
  const titles = data.positions.map((p) => p.titleZh);
  assert.ok(titles.includes("室內設計師"));
  assert.ok(titles.includes("資深室內設計師"));
  assert.ok(titles.includes("專案經理"));
  assert.ok(titles.includes("工務經理"));

  // slug 對應 English 部分
  const designer = data.positions.find((p) => p.titleZh === "室內設計師")!;
  assert.equal(designer.slug, "interior-designer");
});

test("parseCareers.values — Why Join HQ 六張卡", async () => {
  const html = await readFixture();
  const data = parseCareers(html);

  const slugs = new Set<string>();
  for (const v of data.values) {
    assert.ok(v.slug && v.slug.length > 0, "values.slug 必填");
    assert.ok(!slugs.has(v.slug), `values.slug 須唯一：${v.slug}`);
    slugs.add(v.slug);

    assert.ok(v.icon && v.icon.length > 0, "values.icon 必填");
    assert.ok(v.titleZh && v.titleZh.length > 0, "values.titleZh 必填");
    assert.equal(v.titleEn, "", "Phase 1：values.titleEn 必為空字串");
    assert.ok(v.descZh && v.descZh.length > 0, "values.descZh 必填");
  }

  const titles = data.values.map((v) => v.titleZh);
  assert.ok(titles.includes("真實的高端客戶"));
  assert.ok(titles.includes("設計到施工，完整閉環"));
});

test("parseCareers.perks — What We Offer 六張卡", async () => {
  const html = await readFixture();
  const data = parseCareers(html);

  const slugs = new Set<string>();
  for (const p of data.perks) {
    assert.ok(p.slug && p.slug.length > 0, "perks.slug 必填");
    assert.ok(!slugs.has(p.slug), `perks.slug 須唯一：${p.slug}`);
    slugs.add(p.slug);

    assert.ok(p.icon && p.icon.length > 0, "perks.icon 必填");
    assert.ok(p.titleZh && p.titleZh.length > 0, "perks.titleZh 必填");
    // perks 的 titleEn 不在 required 內，因此 schema 允許不存在
    assert.equal(
      (p as { titleEn?: string }).titleEn,
      undefined,
      "Phase 1：perks.titleEn 應省略（非 required 的 *En 欄位）",
    );
  }

  const titles = data.perks.map((p) => p.titleZh);
  assert.ok(titles.includes("真實的高端案件"));
  assert.ok(titles.includes("31+ 年穩定經營"));
});
