// 所有權：Claude（SEO 基礎建設，見 COORDINATION.md §6 登記）
import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/content/loader";
import { getAllStages } from "@/lib/content/process";
import { absoluteUrl } from "@/lib/seo/metadata";
import { projectParity, stageParity } from "@/lib/seo/parity";

/** locale 無關的靜態頁。兩語系皆有實際英文文案，故 en 版可索引。 */
const STATIC_PATHS = [
  "",
  "/work",
  "/process",
  "/about",
  "/services",
  "/careers",
  "/contact",
  "/model",
  "/image-policy",
] as const;

/**
 * 雙語 sitemap。
 *
 * seo/analysis.md T02／P0-13 的硬性規則：`parity != full` 的 /en/ 頁
 * MUST 排除於 sitemap。所以 en 條目不是照抄 zh，而是逐頁問過 parity。
 *
 * 刻意不輸出 lastModified：git checkout 後的檔案 mtime 是取出時間而非
 * 編輯時間，寫進去等於對外宣告一個錯的日期。沒有值比錯的值好。
 * priority／changefreq 同理省略——Google 明確表示不使用。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, stages] = await Promise.all([getAllProjects(), getAllStages()]);

  const entries: MetadataRoute.Sitemap = [];

  const push = (path: string, enIndexable: boolean) => {
    const languages: Record<string, string> = {
      "zh-Hant-TW": absoluteUrl("zh", path),
      "x-default": absoluteUrl("zh", path),
    };
    if (enIndexable) languages.en = absoluteUrl("en", path);

    entries.push({ url: absoluteUrl("zh", path), alternates: { languages } });
    if (enIndexable) entries.push({ url: absoluteUrl("en", path), alternates: { languages } });
  };

  for (const p of STATIC_PATHS) push(p, true);
  for (const p of projects) push(`/work/${p.slug}`, projectParity(p) === "full");
  for (const s of stages) push(`/process/${s.slug}`, stageParity(s) === "full");

  return entries;
}
