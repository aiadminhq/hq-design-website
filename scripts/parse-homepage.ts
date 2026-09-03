// parse-homepage.ts — Phase 1.7：將 index.html 轉成符合 homepage.schema.json 的物件
// 中文優先策略：抽取 *Zh 欄位；required 的 *En 留空字串，optional 的 *En 直接省略。
// 注意事項：
//   * 首頁在 repo 根目錄，圖片路徑為 `assets/...`（無 `../` 前綴）。
//   * background-image 寫在 inline <style> 內，需以 regex 從整份 HTML 抽取。
//   * Hero headline 為純英文（"Zero Downtime. Turnkey Delivery."），無中文版 → headlineZh = ""。
//   * Taiwan wedge、approach、testimonials 區塊缺乏中文對照 → 僅保留語言中性欄位。

import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

// ── 型別定義 ──────────────────────────────────────────────────────────────────
export interface HeroCta {
  label: string;
  href: string;
}

export interface HeroStat {
  number: string;
  labelZh: string;
  labelEn: string;
}

export interface HeroData {
  kicker: string;
  headlineZh: string;
  headlineEn: string;
  subZh: string;
  subEn: string;
  backgroundImage: string;
  ctaPrimary: HeroCta;
  ctaSecondary: HeroCta;
  stats: HeroStat[];
}

export interface LogoItem {
  name: string;
  image?: string;
  alt?: string;
}

export interface LogosBarData {
  labelZh: string;
  labelEn: string;
  items: LogoItem[];
}

export interface TaiwanWedgeData {
  titleZh?: string;
  titleEn?: string;
  descZh?: string;
  descEn?: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface HomepageData {
  hero: HeroData;
  logosBar: LogosBarData;
  featuredProjects: string[];
  taiwanWedge?: TaiwanWedgeData;
}

// ── helpers ──────────────────────────────────────────────────────────────────
const norm = (s: string | undefined | null): string =>
  (s ?? "").replace(/\s+/g, " ").trim();

/**
 * 首頁路徑已是 `assets/...`，但維持 idempotent 正規化以防誤插 `../`。
 */
const normalizeImage = (src: string | undefined): string => {
  if (!src) return "";
  let s = src.trim();
  if (s.startsWith("../")) s = s.slice(3);
  return s;
};

/**
 * 從整份 HTML 抽出 hero `.hero-bg` 的 background-image URL。
 * inline <style> 內形如：`background-image: url('assets/images/.../photo-01.jpg');`
 */
function extractHeroBackgroundImage(html: string): string {
  const m = html.match(
    /\.hero--int\s+\.hero-bg\s*\{[^}]*background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i,
  );
  return m ? normalizeImage(m[1]) : "";
}

/**
 * 將 `.hero-headline` 抓成中英對拆。
 * 此頁範例：「Zero Downtime.<br><span class="accent">Turnkey Delivery.</span>」
 * 全英文 → headlineZh 回傳空字串，headlineEn 仍以純文字保留供日後 i18n。
 */
function extractHeadline($: CheerioAPI): { zh: string; en: string } {
  const h1 = $(".hero--int .hero-headline").first();
  if (!h1.length) return { zh: "", en: "" };
  // 將 <br> 取代為空白，避免兩行黏在一起
  h1.find("br").replaceWith(" ");
  const text = norm(h1.text());
  return { zh: "", en: text };
}

// ── hero ────────────────────────────────────────────────────────────────────
function extractHero($: CheerioAPI, html: string): HeroData {
  const hero = $(".hero--int").first();

  const kicker = norm(hero.find(".hero-label").first().text());
  const { zh: headlineZh, en: headlineEn } = extractHeadline($);
  const subEn = norm(hero.find(".hero-sub-en").first().text());
  const subZh = norm(hero.find(".hero-sub-zh").first().text());
  const backgroundImage = extractHeroBackgroundImage(html);

  // CTA：第 1 顆 .btn-primary、第 2 顆 .btn-outline
  const $actions = hero.find(".hero-actions").first();
  const $primary = $actions.find("a.btn-primary").first();
  const $secondary = $actions.find("a.btn-outline").first();
  const ctaPrimary: HeroCta = {
    label: norm($primary.text()),
    href: norm($primary.attr("href")),
  };
  const ctaSecondary: HeroCta = {
    label: norm($secondary.text()),
    href: norm($secondary.attr("href")),
  };

  // Stats：四個 .stat-item，數字 + 單位 (M/+/%) + 英文 label
  const stats: HeroStat[] = [];
  hero.find(".hero-stats .stat-item").each((_, el) => {
    const $el = $(el);
    const $num = $el.find(".stat-num").first();
    // 在 clone 上把 <span class="stat-unit"> 取出來，避免兩者黏字
    const $numClone = $num.clone();
    const unit = norm($numClone.find(".stat-unit").first().text());
    $numClone.find(".stat-unit").remove();
    const base = norm($numClone.text());
    const number = unit ? `${base}${unit}` : base;
    const labelEn = norm($el.find(".stat-label-en").first().text());
    if (number) {
      // 此頁 stats 僅有英文標籤，labelZh 留空字串以符合 *Zh required 慣例
      stats.push({ number, labelZh: "", labelEn });
    }
  });

  return {
    kicker,
    headlineZh,
    headlineEn,
    subZh,
    subEn,
    backgroundImage,
    ctaPrimary,
    ctaSecondary,
    stats,
  };
}

// ── client logos bar ────────────────────────────────────────────────────────
function extractLogosBar($: CheerioAPI): LogosBarData {
  const root = $(".logos-bar--int").first();
  const labelEn = norm(root.find(".logos-bar-label").first().text());

  const items: LogoItem[] = [];
  root.find(".logos-grid .logo-item").each((_, el) => {
    const $el = $(el);
    const nameEn = norm($el.find(".lo-en").first().text());
    const nameZh = norm($el.find(".lo-zh").first().text());
    if (!nameZh && !nameEn) return;
    // schema 的 `name` 為語言中性欄位；中文優先策略下以中文為主，
    // 英文則放進 `alt` 供 a11y / Framer 後備使用。
    const item: LogoItem = { name: nameZh || nameEn };
    if (nameEn) item.alt = nameEn;
    items.push(item);
  });

  return {
    labelZh: "", // 頁面僅有英文 "Trusted by"，無中文版 → 留空字串
    labelEn,
    items,
  };
}

// ── featured projects (引用 slugs) ──────────────────────────────────────────
function extractFeaturedSlugs($: CheerioAPI): string[] {
  const slugs: string[] = [];
  // 鎖定「Featured Projects」section，避免抓到 nav/footer 連結
  // 透過 .projects-grid > .project-card a.project-link
  $(".projects-grid .project-card a.project-link").each((_, el) => {
    const href = norm($(el).attr("href"));
    // 路徑形如 `projects/<slug>.html`
    const m = href.match(/^projects\/([^/]+)\.html$/);
    if (m && !slugs.includes(m[1])) slugs.push(m[1]);
  });
  return slugs;
}

// ── Taiwan wedge ────────────────────────────────────────────────────────────
function extractTaiwanWedge($: CheerioAPI): TaiwanWedgeData | undefined {
  const root = $(".taiwan-wedge").first();
  if (!root.length) return undefined;

  // 此區塊全英文，僅保留 bullets 與 CTA（語言中性）。
  const bullets: string[] = [];
  root.find(".checks .check span").each((_, el) => {
    const $el = $(el);
    // 跳過 .dot（無文字）
    if ($el.hasClass("dot")) return;
    const text = norm($el.text());
    if (text) bullets.push(text);
  });

  const $cta = root.find("a.btn-primary").first();
  const ctaLabel = norm($cta.text());
  const ctaHref = norm($cta.attr("href"));

  return {
    bullets,
    ctaLabel,
    ctaHref,
  };
}

// ── main entry point ───────────────────────────────────────────────────────
export function parseHomepage(html: string): HomepageData {
  const $ = cheerio.load(html);

  const hero = extractHero($, html);
  const logosBar = extractLogosBar($);
  const featuredProjects = extractFeaturedSlugs($);
  const taiwanWedge = extractTaiwanWedge($);

  const data: HomepageData = {
    hero,
    logosBar,
    featuredProjects,
  };
  if (taiwanWedge) data.taiwanWedge = taiwanWedge;

  return data;
}
