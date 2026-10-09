import { z } from "zod";

export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const deferred = new Set([
  "airport-lounges",
  "staff-facility",
  "zhongbao-smart-facility",
  "zhongbao-store-daan",
  "zhongbao-store-zhuangjing",
  "zhongbao-nangang",
]);
export const addedSlugs = [
  "guochan-office",
  "guochan-showroom",
  "secom-reception",
  "longteng-travel",
  "transasia-bakery-dayuan",
  "transasia-bakery-chunri",
  "budaejjigae",
  "burger-ray",
];
const localized = z.object({ en: z.string(), zh: z.string() });
export const imageSchema = z.object({
  src: z.string().min(1),
  alt: localized,
  kind: z.enum(["image", "plan"]).default("image"),
  assetName: z.string().optional(),
});
export const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: localized,
  description: localized,
  location: localized,
  client: localized,
  category: z.string(),
  year: z.number().int().positive().nullable(),
  areaSqm: z.number().positive().nullable(),
  order: z.number(),
  featured: z.boolean(),
  featuredOrder: z.number().optional(),
  images: z.array(imageSchema).min(1),
});
export const snapshotSchema = z
  .object({
    version: z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/),
    createdAt: z.string(),
    projects: z.array(projectSchema).min(1),
  })
  .superRefine((snapshot, ctx) => {
    const slugs = new Set<string>();
    for (const project of snapshot.projects) {
      if (slugs.has(project.slug) || deferred.has(project.slug))
        ctx.addIssue({
          code: "custom",
          message: "Duplicate or deferred project: " + project.slug,
        });
      slugs.add(project.slug);
    }
  });
export type Project = z.infer<typeof projectSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
export function pingFromSqm(sqm: number | null): number | null {
  return sqm !== null && Number.isFinite(sqm) && sqm > 0 ? sqm / 3.3 : null;
}
export function formatArea(
  sqm: number | null,
  locale: Locale,
  withPing = false,
): string {
  const ping = pingFromSqm(sqm);
  if (ping === null) return "";
  const nf = new Intl.NumberFormat(locale === "zh" ? "zh-TW" : "en", {
    maximumFractionDigits: 1,
  });
  return (
    nf.format(sqm!) +
    " m²" +
    (withPing && locale === "zh" ? `（約 ${nf.format(ping)} 坪）` : "")
  );
}
export function localizedPath(path: string, locale: Locale) {
  return (locale === "zh" ? "/zh" : "") + (path === "/" ? "" : path) || "/";
}
export const categoryNames: Record<string, [string, string]> = {
  office: ["Corporate Office", "辦公空間"],
  fb: ["Food & Beverage", "餐飲空間"],
  hospitality: ["Hospitality", "飯店空間"],
  exhibition: ["Exhibition Hall", "展示空間"],
  showroom: ["Showroom", "展示空間"],
  retail: ["Retail", "零售空間"],
  other: ["Other", "其他空間"],
};
export function categoryName(category: string, locale: Locale) {
  return categoryNames[category]?.[locale === "en" ? 0 : 1] ?? category;
}
