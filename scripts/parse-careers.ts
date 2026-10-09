// parse-careers.ts — Phase 1.5：將 careers.html 轉成符合 careers.schema 的物件
//
// Schema 結構：cms/schemas/careers.json 內含 collections.positions / values / perks
// 三個子集合；輸出資料採平坦結構 { positions: [...], values: [...], perks: [...] }。
//
// 中文化策略（Phase 1）：
//   - 僅抽取中文欄位。schema 要求的 *En 欄位（titleEn 等）一律設為空字串。
//   - 選用的 *En 欄位（如 descEn）整個省略。
//   - 程式碼註解一律使用繁體中文。
//
// 注意：圖片路徑、bilingual label split、nav/footer 範圍隔離等慣例見 parse-project.ts。

import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

// ── 型別定義 ────────────────────────────────────────────────────────────────

export type Department =
  | "Design 設計部"
  | "Project 專案部"
  | "Site 工務部"
  | "Operations 行政部";

export interface Position {
  slug: string;
  titleZh: string;
  titleEn: string; // schema required；Phase 1 留空
  department: Department;
  summaryZh?: string;
  skills?: string[];
}

export interface ValueItem {
  slug: string;
  icon: string;
  titleZh: string;
  titleEn: string; // schema required；Phase 1 留空
  descZh: string;
}

export interface PerkItem {
  slug: string;
  icon: string;
  titleZh: string;
  descZh?: string;
}

export interface CareersData {
  positions: Position[];
  values: ValueItem[];
  perks: PerkItem[];
}

// ── 共用工具 ────────────────────────────────────────────────────────────────

const norm = (s: string | undefined | null): string =>
  (s ?? "").replace(/\s+/g, " ").trim();

/**
 * 將中文標題字串轉成 kebab-case slug；
 * 過濾掉純中文字後若為空字串，會回退使用 pinyin-free 的數字編號（fallback）。
 */
function slugify(input: string, fallback: string): string {
  const raw = (input ?? "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  // 若處理後沒有任何 ASCII letters/digits（純 CJK），改用 fallback
  if (!raw || !/[a-z0-9]/.test(raw)) return fallback;
  return raw;
}

/**
 * 部門 tag 文字（如 "Design 設計部"）做 normalize；非預期值會回 undefined。
 */
function parseDepartment(text: string): Department | undefined {
  const t = norm(text);
  const allowed: Department[] = [
    "Design 設計部",
    "Project 專案部",
    "Site 工務部",
    "Operations 行政部",
  ];
  return (allowed as string[]).includes(t) ? (t as Department) : undefined;
}

// ── positions 抽取 ─────────────────────────────────────────────────────────

/**
 * 從 #positions section 內的 .careers-grid > .career-card 抽出職缺。
 * 結構：
 *   .career-tag       → 部門
 *   h3                → titleZh
 *   .en-name          → titleEn (Phase 1 不採用)
 *   p (第一個)        → summaryZh
 *   .career-skill x N → skills 陣列
 *   data-position     → 「中文 English」格式，用來推 slug 的英文部分
 */
function extractPositions($: CheerioAPI): Position[] {
  const positions: Position[] = [];
  // 範圍限制：只看 id="positions" section 內的 career-card
  const cards = $("#positions .careers-grid .career-card");

  cards.each((index, el) => {
    const $card = $(el);

    const department = parseDepartment(
      $card.find(".career-tag").first().text(),
    );
    const titleZh = norm($card.find("h3").first().text());
    if (!department || !titleZh) return;

    const summaryZh = norm($card.find("p").first().text()) || undefined;

    const skills: string[] = [];
    $card.find(".career-skill").each((__, skillEl) => {
      const s = norm($(skillEl).text());
      if (s) skills.push(s);
    });

    // 用 data-position 推 slug（apply-btn 內含「中文 English」字串）
    // 例：「室內設計師 Interior Designer」→ 取 English 部分 → "interior-designer"
    const dataPos = norm($card.find(".apply-btn").attr("data-position"));
    const englishPart = dataPos.replace(/^[^A-Za-z]+/, ""); // 去掉開頭中文
    const slug = slugify(englishPart, `position-${index + 1}`);

    const pos: Position = {
      slug,
      titleZh,
      titleEn: "", // Phase 1：強制空字串
      department,
    };
    if (summaryZh) pos.summaryZh = summaryZh;
    if (skills.length) pos.skills = skills;

    positions.push(pos);
  });

  return positions;
}

// ── values（Why Join HQ）抽取 ─────────────────────────────────────────────

/**
 * 對應 "<!-- WHY JOIN HQ -->" section。
 * 結構：.value-grid > .value-card
 *   .icon (div) → icon
 *   h3          → titleZh
 *   .en (span)  → titleEn (Phase 1 不採用)
 *   p           → descZh
 *
 * slug 由 titleEn 文字推導；若 titleEn 為空則退而求其次用 index。
 */
function extractValues($: CheerioAPI): ValueItem[] {
  const values: ValueItem[] = [];
  const cards = $(".value-grid .value-card");

  cards.each((index, el) => {
    const $card = $(el);
    const icon = norm($card.find(".icon").first().text());
    const titleZh = norm($card.find("h3").first().text());
    const titleEnText = norm($card.find(".en").first().text());
    const descZh = norm($card.find("p").first().text());

    if (!icon || !titleZh || !descZh) return;

    const slug = slugify(titleEnText, `value-${index + 1}`);

    values.push({
      slug,
      icon,
      titleZh,
      titleEn: "", // Phase 1：強制空字串
      descZh,
    });
  });

  return values;
}

// ── perks 抽取 ─────────────────────────────────────────────────────────────

/**
 * 對應 "<!-- PERKS -->" section。
 * 結構：.perks-grid > .perk-item
 *   .perk-icon → icon
 *   h4         → titleZh
 *   p          → descZh
 *
 * perks 的 schema 沒有 titleEn 必填，因此完全不寫入 titleEn。
 * slug 由 titleZh 推導（純中文時用 index fallback）。
 */
function extractPerks($: CheerioAPI): PerkItem[] {
  const perks: PerkItem[] = [];
  const items = $(".perks-grid .perk-item");

  items.each((index, el) => {
    const $item = $(el);
    const icon = norm($item.find(".perk-icon").first().text());
    const titleZh = norm($item.find("h4").first().text());
    const descZh = norm($item.find("p").first().text());

    if (!icon || !titleZh) return;

    const slug = slugify(titleZh, `perk-${index + 1}`);

    const perk: PerkItem = { slug, icon, titleZh };
    if (descZh) perk.descZh = descZh;
    perks.push(perk);
  });

  return perks;
}

// ── 主入口 ─────────────────────────────────────────────────────────────────

export function parseCareers(html: string): CareersData {
  const $ = cheerio.load(html);

  return {
    positions: extractPositions($),
    values: extractValues($),
    perks: extractPerks($),
  };
}
