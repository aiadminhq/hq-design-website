import { z } from "zod";

/**
 * 七段流程的內容層。文案本體與 60° 幾何製圖都由 scripts/site/export_content.py
 * 從 build_process.py 抽出，不是重寫的。
 *
 * 順序權威在 site/_partials/stages.json，這裡固定下來——七段是一條管線，
 * 順序本身就是內容，不能靠檔名排序。
 */
export const STAGES = [
  {
    idx: "01",
    slug: "site-survey",
    zh: "現況掃描",
    en: "Site Survey",
    tag: "AI",
  },
  {
    idx: "02",
    slug: "parametric",
    zh: "參數化方案",
    en: "Parametric Design",
    tag: "Parametric",
  },
  {
    idx: "03",
    slug: "design-intent",
    zh: "設計意圖定案",
    en: "Design Intent",
    tag: null,
  },
  {
    idx: "04",
    slug: "technical-validation",
    zh: "技術驗證",
    en: "Technical Validation",
    tag: null,
  },
  {
    idx: "05",
    slug: "bim",
    zh: "BIM 協調",
    en: "BIM Coordination",
    tag: "BIM",
  },
  {
    idx: "06",
    slug: "construction-docs",
    zh: "施工圖說",
    en: "Construction Documentation",
    tag: null,
  },
  {
    idx: "07",
    slug: "delivery",
    zh: "交付與專案管理",
    en: "Delivery & AI PM",
    tag: "AI PM",
  },
] as const;

export type StageSlug = (typeof STAGES)[number]["slug"];
export const STAGE_SLUGS = STAGES.map((s) => s.slug) as readonly StageSlug[];

/** [英文標題, 中文標題, 說明, 佐證數據]——第四項在部分段落是空字串 */
const Triple = z.tuple([z.string(), z.string(), z.string()]).rest(z.string());

const Evidence = z.object({
  href: z.string().startsWith("/"),
  t: z.string().min(1),
  en: z.string().default(""),
  d: z.string().default(""),
});

export const Stage = z.object({
  title: z.string().min(1),
  desc: z.string().min(1),
  h1: z.string().min(1),
  lede: z.string().min(1),
  gloss: z.string().min(1),
  /** 這一段吃什麼、吐什麼——七段作為管線的接口定義 */
  inp: z.string().min(1),
  out: z.string().min(1),
  /** 業主會問的那一句 */
  q: z.string().min(1),
  qen: z.string().min(1),
  quote: z.string().min(1),
  quote2: z.string().min(1),
  how_h2: z.string().min(1),
  how: z.array(Triple).min(1),
  why_h2: z.string().min(1),
  why: z.array(Triple).min(1),
  fig_lab: z.string().min(1),
  /** [英文小標, 中文說明（含 HTML）] */
  cap: z.array(z.string()).min(2),
  ev_h2: z.string().min(1),
  ev: z.array(Evidence),
  /**
   * 英文主體文案。目前 7 段皆未提供，所以 /en/process/<slug> 由
   * lib/seo/parity.ts 判為 partial 並自動 noindex（seo/analysis.md §3.3-4）。
   * 補齊這五個欄位即自動解除，不需要改任何設定。
   */
  titleEn: z.string().nullable().default(null),
  descEn: z.string().nullable().default(null),
  h1En: z.string().nullable().default(null),
  ledeEn: z.string().nullable().default(null),
  inpEn: z.string().nullable().default(null),
  outEn: z.string().nullable().default(null),
  howH2En: z.string().nullable().default(null),
  whyH2En: z.string().nullable().default(null),
  /** [英文小標, 英文說明]，長度必須與 how／why 一致（見下方 superRefine）。 */
  howEn: z.array(z.tuple([z.string(), z.string()])).default([]),
  whyEn: z.array(z.tuple([z.string(), z.string()])).default([]),
  evFootEn: z.string().nullable().default(null),
  evNoneEn: z.string().nullable().default(null),
  /** 製圖的英文無障礙描述。英文頁會用它替換 SVG 內的中文 <title>。 */
  figAltEn: z.string().nullable().default(null),

  /** 有佐證案例時的註腳；兩段沒有 */
  ev_foot: z.string().optional(),
  /** 無佐證案例時的誠實說明；只有兩段有 */
  ev_none: z.string().optional(),
})
.superRefine((s, ctx) => {
  // 英文段落若存在就必須與中文一一對應，否則英文頁會缺格或錯位。
  // 允許長度 0（尚未翻譯），但不允許長度不符。
  if (s.howEn.length && s.howEn.length !== s.how.length)
    ctx.addIssue({ code: "custom", message: "howEn 長度與 how 不符", path: ["howEn"] });
  if (s.whyEn.length && s.whyEn.length !== s.why.length)
    ctx.addIssue({ code: "custom", message: "whyEn 長度與 why 不符", path: ["whyEn"] });
  // ev_foot／ev_none 有中文就必須有英文，否則英文頁會掉出一段中文誠實聲明。
  if (s.ev_foot && !s.evFootEn)
    ctx.addIssue({ code: "custom", message: "有 ev_foot 就必須有 evFootEn", path: ["evFootEn"] });
  if (s.ev_none && !s.evNoneEn)
    ctx.addIssue({ code: "custom", message: "有 ev_none 就必須有 evNoneEn", path: ["evNoneEn"] });
});

export type Stage = z.infer<typeof Stage>;
export type StageWithMeta = Stage &
  (typeof STAGES)[number] & { figure: string; figureEn: string };
