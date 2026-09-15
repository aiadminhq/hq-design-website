// parse-about.test.ts — TDD：驗證 about.html 解析結果符合 schema 主要欄位
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { parseAbout } from "./parse-about.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

async function readFixture(): Promise<string> {
  return fs.readFile(path.join(ROOT, "about.html"), "utf8");
}

test("parseAbout — stats 四項全部抓到並含中英文 label", async () => {
  const html = await readFixture();
  const data = parseAbout(html);

  assert.ok(Array.isArray(data.stats));
  assert.equal(data.stats.length, 4, "stats 應有 4 筆");
  for (const s of data.stats) {
    assert.ok(s.number && s.number.length > 0, "number 應非空");
    assert.ok(s.labelZh && s.labelZh.length > 0, "labelZh 應非空");
    assert.ok(s.labelEn && s.labelEn.length > 0, "labelEn 應非空");
  }
  // 第一筆應為 1995 / 創立年份
  assert.equal(data.stats[0].number, "1995");
  assert.equal(data.stats[0].labelZh, "創立年份");
  // 第二筆含 1,600+
  assert.ok(data.stats[1].number.includes("1,600"));
});

test("parseAbout — story tagline / 中英段落 / 圖片", async () => {
  const html = await readFixture();
  const data = parseAbout(html);

  assert.ok(data.story.tagline.includes("匠藝專工"), "tagline 應含匠藝專工");
  assert.ok(
    Array.isArray(data.story.paragraphsZh) &&
      data.story.paragraphsZh.length >= 2,
    "paragraphsZh 至少 2 段",
  );
  for (const p of data.story.paragraphsZh) {
    assert.ok(p.length > 0);
  }
  assert.ok(data.story.paragraphEn.startsWith("Founded"));
  assert.ok(
    data.story.image.startsWith("assets/") && data.story.image.endsWith(".jpg"),
    "image 路徑應已 normalize",
  );
});

test("parseAbout — team cells 5 個角色按 enum 順序", async () => {
  const html = await readFixture();
  const data = parseAbout(html);

  assert.ok(Array.isArray(data.team.cells));
  assert.equal(data.team.cells.length, 5);
  const expected: ReadonlyArray<{ role: string; count: number }> = [
    { role: "MD", count: 1 },
    { role: "PM", count: 3 },
    { role: "Site", count: 3 },
    { role: "Designer", count: 3 },
    { role: "Finance", count: 2 },
  ];
  data.team.cells.forEach((c, i) => {
    assert.equal(c.role, expected[i].role);
    assert.equal(c.count, expected[i].count);
    assert.ok(c.roleLabelZh.length > 0, "roleLabelZh 應非空");
    assert.ok(c.roleLabelEn.length > 0, "roleLabelEn 應非空");
  });

  assert.ok(
    data.team.summaryEn.includes("12-person"),
    "team summaryEn 應含 12-person",
  );
});

test("parseAbout — certifications 包含 LEED / 綠建築 / ESG", async () => {
  const html = await readFixture();
  const data = parseAbout(html);

  assert.ok(Array.isArray(data.certifications));
  assert.ok(
    data.certifications.length >= 5,
    "certifications 至少 5 筆 (about.html 有 6 個 chip)",
  );
  const codes = data.certifications.map((c) => c.code);
  assert.ok(codes.includes("LEED"));
  assert.ok(codes.includes("GREEN"));
  assert.ok(codes.includes("ESG"));
  for (const c of data.certifications) {
    assert.ok(c.code && c.code.length > 0);
  }
});
