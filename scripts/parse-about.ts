// parse-about.ts — Phase 1.6：將 about.html 轉成符合 about.schema.json 的物件
// 僅抽取中文欄位；schema 內無 required 欄位，但仍將主要區塊輸出為穩定 shape。
// 區塊：stats / story / team / certifications（timeline 與 teamMembers 此頁無資料）
//
// 處理重點：
// 1. 根目錄頁，圖片路徑不含 "../" 前綴；仍保留 normalize 以避免遺漏。
// 2. Team cells 以順序對應 schema enum: MD / PM / Site / Designer / Finance。
// 3. Certifications 僅有 chip 文字（中文 / 英文混雜），與 globals.json 對照補英文。

import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

export type TeamRole = "MD" | "PM" | "Site" | "Designer" | "Finance";

export interface AboutStat {
  number: string;
  labelZh: string;
  labelEn: string;
}

export interface AboutStory {
  tagline: string;
  paragraphsZh: string[];
  paragraphEn: string;
  image: string;
  imageCaption: string;
}

export interface TeamCell {
  role: TeamRole;
  roleLabelZh: string;
  roleLabelEn: string;
  count: number;
}

export interface AboutTeam {
  summaryZh: string;
  summaryEn: string;
  cells: TeamCell[];
}

export interface AboutCertification {
  code: string;
  labelZh: string;
  labelEn: string;
  descZh?: string;
  image?: string;
}

export interface AboutData {
  stats: AboutStat[];
  story: AboutStory;
  team: AboutTeam;
  certifications: AboutCertification[];
  teamMembers?: never[];
  timeline?: never[];
}

// ── helpers ──────────────────────────────────────────────────────────────────
const norm = (s: string | undefined | null): string =>
  (s ?? "").replace(/\s+/g, " ").trim();

/**
 * 將 ../assets/... 統一改寫為 assets/...
 * about.html 位於專案根目錄，路徑通常已是 assets/...，仍保留處理以防意外。
 */
const normalizeImage = (src: string | undefined): string => {
  if (!src) return "";
  let s = src.trim();
  if (s.startsWith("../")) s = s.slice(3);
  return s;
};

/**
 * 從 chip 文字推斷代碼。對照 globals.json 的 code 順序。
 */
const CERT_MAP: Record<string, { code: string; labelEn: string }> = {
  LEED: { code: "LEED", labelEn: "LEED Green Building" },
  綠建築標章: { code: "GREEN", labelEn: "Taiwan Green Building Label" },
  "AIoT Integration": { code: "AIOT", labelEn: "AIoT Smart Space" },
  "ESG-Aligned": { code: "ESG", labelEn: "ESG Sustainability" },
  節能減碳: { code: "ENERGY", labelEn: "Energy Efficiency" },
  健康建築材料: { code: "HEALTH", labelEn: "Healthy Building Materials" },
};

// ── stats ───────────────────────────────────────────────────────────────────
function extractStats($: CheerioAPI): AboutStat[] {
  const stats: AboutStat[] = [];
  $(".about-stats .about-stat").each((_, el) => {
    const $el = $(el);
    // num + 可能跟著 .unit
    const numText = norm($el.find(".num").first().text());
    const labelZh = norm($el.find(".zh").first().text());
    const labelEn = norm($el.find(".en-s").first().text());
    if (numText && labelZh) {
      stats.push({ number: numText, labelZh, labelEn });
    }
  });
  return stats;
}

// ── story ───────────────────────────────────────────────────────────────────
function extractStory($: CheerioAPI): AboutStory {
  // story 區塊在第二個 .section（緊接 stats 之後）
  // 以 .label = "Our Story" 為錨點抓對應 grid container。
  const ourStoryLabel = $(".section span.label")
    .filter((_, el) => norm($(el).text()) === "Our Story")
    .first();
  const storyBlock = ourStoryLabel.closest("div").parent(); // grid container
  const left = ourStoryLabel.closest("div"); // 文字欄
  const right = left.next("div"); // 圖片欄

  // h2 內含 <br>，取純文字並用單一空白合併，避免與原文已有的標點重複
  const h2 = left.find("h2").first();
  const h2Clone = h2.clone();
  h2Clone.find("br").replaceWith(" ");
  // 收斂多餘空白並合併連續中文標點
  const tagline = norm(h2Clone.text())
    .replace(/\s+/g, "")
    .replace(/，{2,}/g, "，")
    .replace(/，$/, "");

  // 取 left 內所有 <p>
  const paragraphsZh: string[] = [];
  let paragraphEn = "";
  left.find("p").each((_, el) => {
    const $p = $(el);
    const text = norm($p.text());
    if (!text) return;
    const style = $p.attr("style") ?? "";
    // 判斷英文段落：使用 font-en 變數或常見英文起始字
    if (/font-en/.test(style) || /^[A-Za-z]/.test(text)) {
      paragraphEn = text;
    } else {
      paragraphsZh.push(text);
    }
  });

  const img = right.find("img").first();
  const image = normalizeImage(img.attr("src"));
  const imageCaption = norm(img.attr("alt"));

  // 避免未使用變數警告（保留鏡像 closure 結構）
  void storyBlock;

  return {
    tagline,
    paragraphsZh,
    paragraphEn,
    image,
    imageCaption,
  };
}

// ── team ────────────────────────────────────────────────────────────────────
const TEAM_ROLE_ORDER: TeamRole[] = ["MD", "PM", "Site", "Designer", "Finance"];

function extractTeam($: CheerioAPI): AboutTeam {
  // 「團隊架構」section
  const teamSection = $("section")
    .filter((_, el) => norm($(el).find("h2").first().text()) === "團隊架構")
    .first();

  const summaryZh = ""; // about.html 本頁沒有獨立中文 summary 區塊
  const summaryEn = norm(teamSection.find(".sub-en").first().text());

  // 5 個格子按 DOM 順序對應 enum
  const cells: TeamCell[] = [];
  // 第一個 grid 是 5 欄那一塊；用包含 5 子元素的容器辨識
  const gridChildren = teamSection
    .find("div")
    .filter((_, el) => {
      const $el = $(el);
      const style = $el.attr("style") ?? "";
      return /grid-template-columns:\s*repeat\(5/.test(style);
    })
    .first()
    .children();

  gridChildren.each((idx, el) => {
    if (idx >= TEAM_ROLE_ORDER.length) return;
    const $el = $(el);
    // 取 count（第一個 number 文字節點）
    const countText = norm($el.children().first().text());
    const count = parseInt(countText, 10);

    // 中文 label 在第二個 div：text() 包含中文 + <span> 英文，取中文部分
    const labelDiv = $el.children().eq(1);
    const labelClone = labelDiv.clone();
    labelClone.find("span, br").remove();
    const roleLabelZh = norm(labelClone.text());

    // 英文在 span 內
    const roleLabelEn = norm(labelDiv.find("span").first().text());

    cells.push({
      role: TEAM_ROLE_ORDER[idx],
      roleLabelZh,
      roleLabelEn,
      count: Number.isFinite(count) ? count : 0,
    });
  });

  return { summaryZh, summaryEn, cells };
}

// ── certifications ─────────────────────────────────────────────────────────
function extractCertifications($: CheerioAPI): AboutCertification[] {
  const certs: AboutCertification[] = [];
  $(".cert-chip").each((_, el) => {
    const text = norm($(el).text());
    if (!text) return;
    const mapped = CERT_MAP[text];
    if (mapped) {
      // 中文/英文 chip 都統一輸出中文 label 與英文 label
      const labelZh = /[一-鿿]/.test(text) ? text : mapped.labelEn;
      certs.push({
        code: mapped.code,
        labelZh: /[一-鿿]/.test(text) ? text : codeToZh(mapped.code),
        labelEn: mapped.labelEn,
      });
      void labelZh;
    } else {
      // 兜底：以 chip 文字為 code，避免遺漏
      certs.push({
        code: text,
        labelZh: /[一-鿿]/.test(text) ? text : "",
        labelEn: /^[A-Za-z]/.test(text) ? text : "",
      });
    }
  });
  return certs;
}

// 對 CERT_MAP 反查中文 label（與 globals.json 對齊）
function codeToZh(code: string): string {
  const reverse: Record<string, string> = {
    LEED: "LEED綠建築認證",
    GREEN: "綠建築標章",
    AIOT: "AIoT智慧空間",
    ESG: "ESG永續設計",
    ENERGY: "節能減碳",
    HEALTH: "健康建築材料",
  };
  return reverse[code] ?? "";
}

// ── main entry point ───────────────────────────────────────────────────────
export function parseAbout(html: string): AboutData {
  const $ = cheerio.load(html);

  const stats = extractStats($);
  const story = extractStory($);
  const team = extractTeam($);
  const certifications = extractCertifications($);

  return {
    stats,
    story,
    team,
    certifications,
  };
}
