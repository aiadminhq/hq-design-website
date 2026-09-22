import { z } from "zod";

export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh";

/** 雙語欄位。zh 為必填權威，en 缺席時 fallback 到 zh 並標記待譯。 */
const bi = <T extends z.ZodTypeAny>(inner: T) =>
  z.object({ zh: inner, en: inner.nullable().default(null) });

/* ── 影像來源標示 ───────────────────────────────────────────────
   只存 prov，label 由 prov 單向推導。結構上不可能把設計視覺標成完工實景。 */
export const Provenance = z.enum(["photo", "viz", "enh", "drawing"]);
export type Provenance = z.infer<typeof Provenance>;

/**
 * 標示變體。變體只能在同一個 prov 家族內換措辭，永遠不能跨家族——
 * 型別上 photo 就沒有 bim 這個 key，所以「把設計視覺標成完工實景」
 * 在結構上依然不可能發生。
 */
export const SOURCE_LABEL = {
  photo: { default: { zh: "完工實景 · AS-BUILT", en: "AS-BUILT" } },
  viz: {
    default: {
      zh: "設計提案視覺 · DESIGN VISUALISATION",
      en: "DESIGN VISUALISATION",
    },
  },
  enh: {
    default: {
      zh: "實拍 · AI 光影強化 · AI-ENHANCED",
      en: "PHOTO · AI-ENHANCED",
    },
  },
  drawing: {
    default: { zh: "設計圖面 · FLOOR PLAN", en: "FLOOR PLAN" },
    /** 等角 BIM 線稿。仍是圖面，不宣稱完工。 */
    bim: { zh: "設計圖面 · BIM VIEW", en: "BIM VIEW" },
  },
} as const satisfies Record<Provenance, Record<string, Record<Locale, string>>>;

export type LabelVariant<P extends Provenance> = keyof (typeof SOURCE_LABEL)[P];

const slugRe = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const ProjectImage = z.object({
  order: z.number().int().positive(),
  /** context = 補充脈絡（平面圖、環境照），gen_work.py 既有的第四種角色 */
  role: z.enum(["hero", "gallery", "detail", "context"]),
  grade: z.enum(["A", "B", "C"]),
  prov: Provenance,
  /** 檔名 stem，無副檔名無尺寸。loader 補成 /media/work/<slug>/<stem>-<w>.webp */
  stem: z.string().regex(slugRe),
  sourceFile: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  spaceZh: z.string(),
  alt: bi(z.string()),
  /** 裁切焦點，0–1 正規化座標。AI 渲染母檔是 5504×3072（1.792），
   *  裁成 3:2 會切掉兩側，沒有焦點就只能置中硬裁。 */
  focal: z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).optional(),
  /** 標示變體。目前只有 drawing 有 bim 變體，其餘留空。 */
  labelVariant: z.string().optional(),
  retouch: z.enum(["none", "light", "heavy"]).default("none"),
  retouchNote: z.string().default(""),
  risks: z
    .array(
      z.enum([
        "portrait",
        "confidential",
        "housekeeping",
        "thirdparty",
        "resolution",
      ]),
    )
    .default([]),
});
export type ProjectImage = z.infer<typeof ProjectImage>;

export const ProjectCategory = z.enum([
  "office",
  "hospitality",
  "fb",
  "showroom",
  "lounge",
  "other",
]);
export type ProjectCategory = z.infer<typeof ProjectCategory>;

/** 版面權重，沿用 gen_work.py：列表頁的 grid span 控制 */
export const Weight = z.enum(["lead", "w6", "w4", "reg", "other"]);

export const Spec = z.object({
  labelZh: z.string().min(1),
  labelEn: z.string().min(1),
  value: z.string().min(1),
  /**
   * 英文顯示值。null 代表原值本身已是英文或純數字（例 "825 sqm"、"2025"），
   * 英文頁直接沿用 value。只有含中文的值才需要這一欄。
   */
  valueEn: z.string().nullable().default(null),
  /** false = 暫填值。不得進 JSON-LD／llms.txt／OG／sitemap。 */
  verified: z.boolean(),
});

export const Facts = z.object({
  client: z.string().optional(),
  locationZh: z.string().optional(),
  areaSqm: z.number().positive().optional(),
  areaPing: z.number().positive().optional(),
  areaRaw: z.string().optional(),
  year: z.number().int().min(1995).max(2035).optional(),
  yearRaw: z.string().optional(),
  typeZh: z.string().optional(),
});

export const DataQuality = z.object({
  source: z.string().min(1),
  factsVerified: z.boolean(),
  missingFacts: z.array(z.string()).default([]),
  /** 暫填欄位。使用者已裁示可先填以豐富內容，但必須可回溯。 */
  provisionalFields: z.array(z.string()).default([]),
  needsHumanReview: z.array(z.string()).default([]),
});

const PLACEHOLDER =
  /Lorem|待補|TODO|placeholder|賦能|無縫|次世代|顛覆性|Seamless|Unleash/i;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;

export const Project = z
  .object({
    schemaVersion: z.literal(1),
    slug: z.string().regex(slugRe),
    category: ProjectCategory,
    weight: Weight,
    name: bi(z.string().min(1)),
    gloss: z.string().min(1),
    lede: bi(z.string().min(1)),
    specs: z.array(Spec).min(1),
    cardMeta: z.tuple([z.string(), z.string()]),
    note: z
      .object({ title: bi(z.string()), body: bi(z.string()) })
      .nullable()
      .default(null),
    images: z.array(ProjectImage).min(1),
    facts: Facts,
    dataQuality: DataQuality,
    /**
     * 「設計意圖 ↔ 完工實景」同機位對照。
     * intent 允許 null：gen_work.py 既有的做法是渲染圖未到位時保留結構、
     * 不放替代圖。那個誠實的選擇要保住，不要為了湊對而塞圖。
     */
    pairs: z
      .array(
        z.object({
          intent: z.string().regex(slugRe).nullable(),
          asBuilt: z.string().regex(slugRe),
          note: z.string().default(""),
        }),
      )
      .default([]),
    relatedSlugs: z.array(z.string().regex(slugRe)).max(3).default([]),
  })
  .superRefine((p, ctx) => {
    const add = (message: string, path: (string | number)[] = []) =>
      ctx.addIssue({ code: "custom", message, path });

    // R1 · 至多一張 hero
    if (p.images.filter((i) => i.role === "hero").length > 1)
      add("每案至多一張 hero", ["images"]);

    // R2 · 內容政策紅線：含 viz/enh 必須有影像性質聲明
    const provs = new Set(p.images.map((i) => i.prov));
    if ((provs.has("viz") || provs.has("enh")) && !p.note)
      add("含 viz/enh 影像的案子必須有 note 影像性質聲明（內容政策紅線）", [
        "note",
      ]);

    // R3 · viz 與 photo 不得同案混排
    if (provs.has("viz") && provs.has("photo"))
      add("同一案不得混排 viz 與 photo，需分區或拆案", ["images"]);

    // R4/R5 · 佔位文案與 emoji
    const blob = JSON.stringify({ ...p, dataQuality: null });
    if (PLACEHOLDER.test(blob)) add("含佔位文案或 facts.md 禁用詞");
    if (EMOJI.test(blob)) add("含 emoji，違反設計硬規則");

    // R6 · alt 不可為制式編號（防舊 CMS 的「完工實景 01」遺毒）
    p.images.forEach((im, i) => {
      if (/^完工實景\s*\d+$/.test(im.alt.zh))
        add("alt 不可為制式編號", ["images", i, "alt"]);
    });

    // R7 · pairs 的 stem 必須存在於本案影像，且 asBuilt 不得是 viz
    const stems = new Set(p.images.map((i) => i.stem));
    const provOf = new Map(p.images.map((i) => [i.stem, i.prov]));
    p.pairs.forEach((pr, i) => {
      if (pr.intent && !stems.has(pr.intent))
        add(`pairs[${i}].intent「${pr.intent}」不在本案影像中`, ["pairs", i]);
      if (!stems.has(pr.asBuilt))
        add(`pairs[${i}].asBuilt「${pr.asBuilt}」不在本案影像中`, ["pairs", i]);
      if (provOf.get(pr.asBuilt) === "viz")
        add(`pairs[${i}].asBuilt 指向設計視覺，不能當完工實景（內容政策紅線）`, ["pairs", i]);
    });

    // R8 · labelVariant 必須是該 prov 合法的變體
    p.images.forEach((im, i) => {
      if (im.labelVariant && !(im.labelVariant in SOURCE_LABEL[im.prov]))
        add(`prov「${im.prov}」沒有變體「${im.labelVariant}」`, ["images", i, "labelVariant"]);
    });

    // R9 · dataQuality 必須與 facts 一致
    const missing = (["areaSqm", "year", "locationZh"] as const).filter(
      (k) => p.facts[k] == null,
    );
    if (p.dataQuality.factsVerified && missing.length)
      add(`factsVerified=true 但缺 ${missing.join("、")}`, ["dataQuality"]);
  });

export type Project = z.infer<typeof Project>;

/** 投影給 client component 用。內部欄位（retouchNote、risks、dataQuality）不外流。 */
export type ProjectCardData = {
  slug: string;
  category: ProjectCategory;
  weight: z.infer<typeof Weight>;
  name: { zh: string; en: string | null };
  gloss: string;
  cardMeta: [string, string];
  hero: Pick<ProjectImage, "stem" | "width" | "height" | "prov"> & {
    alt: { zh: string; en: string | null };
  };
};

export function toCardData(p: Project): ProjectCardData {
  const hero = p.images.find((i) => i.role === "hero") ?? p.images[0];
  return {
    slug: p.slug,
    category: p.category,
    weight: p.weight,
    name: p.name,
    gloss: p.gloss,
    cardMeta: p.cardMeta,
    hero: {
      stem: hero.stem,
      width: hero.width,
      height: hero.height,
      prov: hero.prov,
      alt: hero.alt,
    },
  };
}
