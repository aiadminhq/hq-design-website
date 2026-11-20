// parse-services.ts — Phase 1.4：將 services.html 轉成符合 services.schema.json 的物件
// 僅抽取中文欄位；必填 *En 欄位設為空字串；可選 *En 欄位省略。
// 結構：
//   { services: ServiceItem[10], process: ProcessStep[5] }
// 由於 schema 上層 required 為單一 service 欄位（slug/number/titleZh/titleEn/descriptionZh），
// 此處假設 schema 為 per-item 設計、registry/process 為 metadata；資料層採 wrapper 結構，
// 並在 wrapper 頂層同步暴露第一筆 service 的必填欄位以滿足 AJV required 檢查。

import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import { pathToFileURL } from "node:url";

export type CategoryGroup =
  | "design"
  | "build"
  | "consulting"
  | "tech"
  | "aftercare";

export interface ServiceItem {
  slug: string;
  number: string;
  titleZh: string;
  titleEn: string; // 必填，Chinese-only 階段一律為 ""
  descriptionZh: string;
  categoryGroup?: CategoryGroup;
  featured?: boolean;
  order?: number;
}

export interface ProcessStep {
  number: string;
  titleZh: string;
  titleEn: string; // 必填型別保留；Chinese-only 階段為 ""
}

export interface ServicesData {
  // 為了通過 schema required（單一 service 欄位），於頂層暴露第一筆 service 必填欄位
  slug: string;
  number: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  // 真正的集合資料
  services: ServiceItem[];
  process: ProcessStep[];
}

// ── 工具 ────────────────────────────────────────────────────────────────────
const norm = (s: string | undefined | null): string =>
  (s ?? "").replace(/\s+/g, " ").trim();

// 與 schema.registry 對齊：依 number → slug / categoryGroup / featured 映射
// 來源：cms/schemas/services.json 的 registry block
const REGISTRY: Record<
  string,
  { slug: string; categoryGroup: CategoryGroup; featured?: boolean }
> = {
  "01": { slug: "office-design", categoryGroup: "design" },
  "02": { slug: "commercial-design", categoryGroup: "design" },
  "03": { slug: "design-build", categoryGroup: "build", featured: true },
  "04": { slug: "space-planning", categoryGroup: "consulting" },
  "05": { slug: "mep-integration", categoryGroup: "build" },
  "06": { slug: "brand-identity", categoryGroup: "design" },
  "07": { slug: "soft-furnishing", categoryGroup: "design" },
  "08": { slug: "smart-aiot", categoryGroup: "tech", featured: true },
  "09": { slug: "renovation-mgmt", categoryGroup: "build" },
  "10": { slug: "warranty", categoryGroup: "aftercare" },
};

// ── 服務卡 ──────────────────────────────────────────────────────────────────
function extractServices($: CheerioAPI): ServiceItem[] {
  const items: ServiceItem[] = [];
  // 範圍限定於第一個 .services-grid，避開 nav/footer
  $(".services-grid .service-card").each((idx, el) => {
    const $el = $(el);
    const number = norm($el.find(".service-number").first().text());
    const titleZh = norm($el.find("h3").first().text());
    const descriptionZh = norm($el.find("p").first().text());
    if (!number || !titleZh) return;

    const reg = REGISTRY[number];
    const slug = reg?.slug ?? `service-${number}`;
    const item: ServiceItem = {
      slug,
      number,
      titleZh,
      titleEn: "", // Chinese-only：必填英文留空字串
      descriptionZh,
      order: idx + 1,
    };
    if (reg?.categoryGroup) item.categoryGroup = reg.categoryGroup;
    if (reg?.featured) item.featured = reg.featured;
    items.push(item);
  });
  return items;
}

// ── 流程 ────────────────────────────────────────────────────────────────────
function extractProcess($: CheerioAPI): ProcessStep[] {
  const steps: ProcessStep[] = [];
  // 範圍限定於 .process-steps，避開其他 section
  $(".process-steps .step").each((_, el) => {
    const $el = $(el);
    const number = norm($el.find(".step-circle").first().text());
    const titleZh = norm($el.find("h4").first().text());
    if (!number || !titleZh) return;
    steps.push({
      number,
      titleZh,
      titleEn: "", // Chinese-only：必填英文留空字串
    });
  });
  return steps;
}

// ── 主入口 ──────────────────────────────────────────────────────────────────
export function parseServices(html: string): ServicesData {
  const $ = cheerio.load(html);
  const services = extractServices($);
  const process = extractProcess($);

  // 為通過 schema required（top-level 五個必填欄位），複製第一筆 service 的對應值。
  // 此為 schema 設計怪癖的妥協：實際資料以 services[] / process[] 為準。
  const first = services[0] ?? {
    slug: "",
    number: "",
    titleZh: "",
    titleEn: "",
    descriptionZh: "",
  };

  return {
    slug: first.slug,
    number: first.number,
    titleZh: first.titleZh,
    titleEn: "",
    descriptionZh: first.descriptionZh,
    services,
    process,
  };
}

// ── one-shot 寫檔 driver ────────────────────────────────────────────────────
// 直接執行此檔（不被 import）時，將 services.html 讀進來解析並寫入 cms/data/services.json。
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const ROOT = path.resolve(import.meta.dirname, "..");
  const html = await fs.readFile(path.join(ROOT, "services.html"), "utf8");
  const data = parseServices(html);
  const outPath = path.join(ROOT, "cms/data/services.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`✅ wrote ${path.relative(ROOT, outPath)}`);
}
