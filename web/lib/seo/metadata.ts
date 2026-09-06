import type { Metadata } from "next";
import { ORG } from "@/lib/site";
import { ONE_LINER } from "./identity";
import type { Parity } from "./parity";

export type SeoLocale = "zh" | "en";

/** hreflang 值。seo/analysis.md §4.2-3：zh 用 zh-Hant-TW，en 用 en。 */
const HREFLANG = { zh: "zh-Hant-TW", en: "en" } as const;
/** OG locale 值與 hreflang 不同格式，兩者不可混用。 */
const OG_LOCALE = { zh: "zh_TW", en: "en_US" } as const;

/** 品牌後綴。seo/analysis.md §3.1：由舊站的 38 字元縮到約 12 字元，
 *  釋出標題預算給描述性關鍵字。 */
export const BRAND_SUFFIX = `惠強 ${ORG.shortEn}`;

/** 路徑正規化：一律無尾斜線、一律以 / 開頭（§4.1-2 要求全站單一化）。 */
function normalise(path: string): string {
  if (!path || path === "/") return "";
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.endsWith("/") ? p.slice(0, -1) : p;
}

/** 絕對 URL。§4.2-1：canonical MUST 為絕對且自我指向。 */
export function absoluteUrl(locale: SeoLocale, path = ""): string {
  return `${ORG.origin}/${locale}${normalise(path)}`;
}

export type PageSeo = {
  locale: SeoLocale;
  /** locale 之後的路徑，例："/work/secom-nangang-complex"；首頁傳 "" */
  path?: string;
  /** 完整標題。已含品牌後綴時傳 brandedTitle，未含時傳 title。 */
  title?: string;
  /** 內容層已寫好完整 title（含品牌後綴）時用這個，避免後綴出現兩次。 */
  brandedTitle?: string;
  description?: string;
  /** 專屬 og:image 路徑（public 下的絕對路徑，例 "/og/work/x.jpg"）。 */
  image?: string;
  imageAlt?: string;
  /** 英文覆蓋率。partial 時本頁 noindex,follow 且排除於 sitemap。 */
  parity?: Parity;
  /** 本頁是否存在對應語言版本。目前兩語系皆全頁對應，保留給未來單語頁。 */
  hasAlternate?: boolean;
};

/**
 * 全站唯一的 metadata 產生器。
 *
 * 一次解決 seo/analysis.md 技術檢核表的 T03（canonical）、T04（hreflang）、
 * T07（OG／Twitter Card）與 P0-13（parity noindex）。
 * 頁面層不得自行拼 canonical 或 hreflang——舊站 0/27 有 canonical、0/27 有 hreflang
 * 的原因就是這件事沒有單一出口。
 */
export function pageMetadata({
  locale,
  path = "",
  title,
  brandedTitle,
  description,
  image = "/og/default.jpg",
  imageAlt,
  parity = "full",
  hasAlternate = true,
}: PageSeo): Metadata {
  const url = absoluteUrl(locale, path);
  const desc = description ?? ONE_LINER[locale];
  const resolvedTitle = brandedTitle ?? (title ? `${title}｜${BRAND_SUFFIX}` : BRAND_SUFFIX);
  const ogImage = image.startsWith("http") ? image : `${ORG.origin}${image}`;

  // §4.2-2：hreflang MUST 雙向對稱。zh 頁列 en、en 頁也列 zh，缺一邊會讓
  // Google 整組忽略。x-default 依 §4.2-3 指向 zh。
  const languages: Record<string, string> = hasAlternate
    ? {
        [HREFLANG.zh]: absoluteUrl("zh", path),
        [HREFLANG.en]: absoluteUrl("en", path),
        "x-default": absoluteUrl("zh", path),
      }
    : { [HREFLANG[locale]]: url, "x-default": absoluteUrl("zh", path) };

  // parity 只約束 /en/。中文是權威語言、不存在 fallback，
  // 所以 zh 永遠可索引——否則傳入 partial 會連中文頁一起 noindex。
  const indexable = locale === "zh" || parity === "full";

  return {
    title: { absolute: resolvedTitle },
    description: desc,
    alternates: { canonical: url, languages },
    robots: indexable
      ? { index: true, follow: true }
      : // §3.3-4：薄內容不進索引，但連結權重仍要流動，所以是 follow 不是 nofollow。
        { index: false, follow: true },
    openGraph: {
      type: "website",
      url,
      siteName: `${ORG.shortZh} ${ORG.shortEn}`,
      title: resolvedTitle,
      description: desc,
      locale: OG_LOCALE[locale],
      alternateLocale: hasAlternate ? [OG_LOCALE[locale === "zh" ? "en" : "zh"]] : [],
      images: [{ url: ogImage, width: 1200, height: 630, alt: imageAlt ?? resolvedTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: desc,
      images: [ogImage],
    },
  };
}

/** 描述長度守衛。§3.1 要求 60–80 中文字元；超過必被 SERP 截斷。 */
export function clampDescription(text: string, max = 80): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}
