// parse-project.ts — Phase 1：將 projects/*.html 轉成符合 projects.schema.json 的物件
// 僅抽取中文欄位；nameEn 強制設為空字串。
// 兩種 gallery 結構：
//   1. flat:   .gallery-grid > .gallery-item > img   (例：kimpton.html)
//   2. grouped: <h3 class="gallery-section-label"> + 後續的 .gallery-grid (例：zhongbao-nangang.html)

import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

export type Category =
  | "office"
  | "fb"
  | "hospitality"
  | "exhibition"
  | "retail";

export interface RegistryEntry {
  category: Category;
  featured?: boolean;
  client?: string;
  groupedGallery?: boolean;
}

export interface ProjectSpec {
  labelZh: string;
  value: string;
}

export interface GalleryItem {
  image: string;
  captionZh?: string;
  alt?: string;
}

export interface GallerySection {
  titleZh: string;
  items: GalleryItem[];
}

export interface ProjectData {
  slug: string;
  nameZh: string;
  nameEn: string;
  subtitleZh?: string;
  category: Category;
  categoryLabel?: string;
  year: number;
  yearLabel?: string;
  location?: string;
  locationZh?: string;
  client?: string;
  scopeZh?: string;
  designBuildLabel?: string;
  featured?: boolean;
  heroImage: string;
  thumbnail?: string;
  descriptionZh?: string;
  specs?: ProjectSpec[];
  gallery?: GalleryItem[];
  gallerySections?: GallerySection[];
}

// ── helpers ──────────────────────────────────────────────────────────────────
const norm = (s: string | undefined | null): string =>
  (s ?? "").replace(/\s+/g, " ").trim();

/**
 * HTML 內所有圖片路徑都是相對於 /projects 子目錄（`../assets/...`），
 * 轉成根目錄相對路徑 `assets/...` 以符合 schema 慣例與其他 CMS 資料。
 */
const normalizeImage = (src: string | undefined): string => {
  if (!src) return "";
  let s = src.trim();
  if (s.startsWith("../")) s = s.slice(3);
  return s;
};

const parseYear = (raw: string | undefined): number | undefined => {
  if (!raw) return undefined;
  const m = raw.match(/\b(19|20)\d{2}\b/);
  return m ? Number(m[0]) : undefined;
};

// ── hero ────────────────────────────────────────────────────────────────────
function extractHero($: CheerioAPI): {
  heroImage: string;
  nameZh: string;
  categoryLabel?: string;
  locationZh?: string;
  yearLabel?: string;
  year?: number;
  designBuildLabel?: string;
} {
  const hero = $(".proj-hero").first();
  const heroImage = normalizeImage(hero.find("img.proj-hero-img").attr("src"));

  // h1 第一個 text node 為中文名稱；後續 <span> 為英文，忽略。
  const h1 = hero.find("h1").first();
  const h1Clone = h1.clone();
  h1Clone.find("span, br").remove();
  const nameZh = norm(h1Clone.text());

  const categoryLabel = norm(hero.find(".proj-type-badge").first().text());

  // 三個 meta 欄位順序通常是：location / 完工 YEAR / Design & Build VENDOR
  const metaSpans = hero.find(".proj-hero-meta > span").toArray();
  let locationZh: string | undefined;
  let yearLabel: string | undefined;
  let year: number | undefined;
  let designBuildLabel: string | undefined;

  for (const el of metaSpans) {
    const $el = $(el);
    const text = norm($el.text());
    const strong = norm($el.find("strong").first().text());
    if (!text) continue;

    if (/完工/.test(text)) {
      yearLabel = strong || text.replace(/完工/, "").trim();
      year = parseYear(yearLabel);
    } else if (/Design.*Build/i.test(text)) {
      designBuildLabel = strong || undefined;
    } else if (!locationZh) {
      // 第一個非「完工」「Design」的多半是地點
      locationZh = strong || text;
    }
  }

  return {
    heroImage,
    nameZh,
    categoryLabel: categoryLabel || undefined,
    locationZh,
    yearLabel,
    year,
    designBuildLabel,
  };
}

// ── description / scope ────────────────────────────────────────────────────
function extractDescription($: CheerioAPI): {
  descriptionZh?: string;
  scopeZh?: string;
} {
  const body = $(".proj-body").first();
  const descriptionZh = norm(body.find(".proj-desc-zh").first().text());

  // .label 通常呈現「中文 · English」格式，僅取「·」前段
  const labelText = norm(body.find("span.label").first().text());
  let scopeZh: string | undefined;
  if (labelText) {
    const parts = labelText.split(/[·•・]/);
    scopeZh = norm(parts[0]) || labelText;
  }

  return {
    descriptionZh: descriptionZh || undefined,
    scopeZh,
  };
}

// ── specs ──────────────────────────────────────────────────────────────────
function extractSpecs($: CheerioAPI): ProjectSpec[] {
  const specs: ProjectSpec[] = [];
  $(".proj-specs .spec-row").each((_, el) => {
    const $el = $(el);
    const labelZh = norm($el.find(".spec-label").first().text());
    const value = norm($el.find(".spec-value").first().text());
    if (labelZh && value) specs.push({ labelZh, value });
  });
  return specs;
}

// ── flat gallery ───────────────────────────────────────────────────────────
function extractFlatGallery($: CheerioAPI): GalleryItem[] {
  const items: GalleryItem[] = [];
  $(".proj-gallery .gallery-grid .gallery-item img").each((_, el) => {
    const $el = $(el);
    const image = normalizeImage($el.attr("src"));
    if (!image) return;
    const alt = norm($el.attr("alt"));
    const item: GalleryItem = { image };
    if (alt) item.alt = alt;
    items.push(item);
  });
  return items;
}

// ── grouped gallery sections ───────────────────────────────────────────────
function extractGallerySections($: CheerioAPI): GallerySection[] {
  const sections: GallerySection[] = [];
  const galleryRoot = $(".proj-gallery .container").first();
  // 依序掃過 root 的直接子節點；遇到 h3.gallery-section-label 就開新段，
  // 遇到 .gallery-grid 就把 imgs 加進當前段。
  let current: GallerySection | null = null;

  galleryRoot.children().each((_, el) => {
    const $el = $(el);
    if ($el.is("h3.gallery-section-label")) {
      const titleZh = norm($el.text());
      if (titleZh) {
        current = { titleZh, items: [] };
        sections.push(current);
      }
    } else if ($el.hasClass("gallery-grid")) {
      if (!current) return;
      $el.find(".gallery-item img").each((__, imgEl) => {
        const $img = $(imgEl);
        const image = normalizeImage($img.attr("src"));
        if (!image) return;
        const alt = norm($img.attr("alt"));
        const item: GalleryItem = { image };
        if (alt) item.alt = alt;
        current!.items.push(item);
      });
    }
  });

  return sections;
}

// ── main entry point ───────────────────────────────────────────────────────
export function parseProject(
  html: string,
  slug: string,
  registry: RegistryEntry,
): ProjectData {
  const $ = cheerio.load(html);

  const hero = extractHero($);
  const { descriptionZh, scopeZh } = extractDescription($);
  const specs = extractSpecs($);

  const grouped = registry.groupedGallery === true;
  let gallery: GalleryItem[] | undefined;
  let gallerySections: GallerySection[] | undefined;
  if (grouped) {
    gallerySections = extractGallerySections($);
    // 後備：若 grouped 解析失敗則退回 flat
    if (!gallerySections.length) {
      gallerySections = undefined;
      gallery = extractFlatGallery($);
    }
  } else {
    gallery = extractFlatGallery($);
  }

  const data: ProjectData = {
    slug,
    nameZh: hero.nameZh,
    nameEn: "",
    category: registry.category,
    year: hero.year ?? 0,
    heroImage: hero.heroImage,
  };

  if (hero.categoryLabel) data.categoryLabel = hero.categoryLabel;
  if (hero.locationZh) data.locationZh = hero.locationZh;
  if (hero.yearLabel) data.yearLabel = hero.yearLabel;
  if (hero.designBuildLabel) data.designBuildLabel = hero.designBuildLabel;
  if (descriptionZh) data.descriptionZh = descriptionZh;
  if (scopeZh) data.scopeZh = scopeZh;
  if (specs.length) data.specs = specs;
  if (gallery && gallery.length) data.gallery = gallery;
  if (gallerySections && gallerySections.length)
    data.gallerySections = gallerySections;
  if (registry.client) data.client = registry.client;
  if (registry.featured !== undefined) data.featured = registry.featured;

  return data;
}
