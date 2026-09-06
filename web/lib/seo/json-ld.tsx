import { ORG } from "@/lib/site";
import { verifiedFacts, sourceLabel } from "@/lib/content/loader";
import type { Project, ProjectImage, Locale } from "@/lib/content/schema";
import type { StageWithMeta } from "@/lib/content/process-schema";
import { ALTERNATE_NAMES, KNOWS_ABOUT, ONE_LINER, ORG_ID, SAME_AS, SITE_ID } from "./identity";
import { absoluteUrl, type SeoLocale } from "./metadata";

type Node = Record<string, unknown>;

/**
 * JSON-LD 注入點。
 *
 * geo/analysis.md §5.3 的判定要記住：LLM 讀 HTML 時把 JSON-LD 當純文字 token，
 * 不解析為結構化資料，受控測試中增益消失。**schema 是基礎設施，不是引用槓桿。**
 * 所以這裡的投入理由是「搜尋引擎的實體消歧義與複合式結果」，
 * MUST NOT 記為「提升 AI 引用」——那個說法沒有證據支持。
 */
export function JsonLd({ graph }: { graph: Node[] }) {
  return (
    <script
      type="application/ld+json"
      // 內容全部來自本 repo 的內容層，非使用者輸入；仍做 < 逸出以防 </script> 提前結束。
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
          /</g,
          "\\u003c",
        ),
      }}
    />
  );
}

/**
 * 全站實體。seo/analysis.md §5.1：用 ["Organization","GeneralContractor"]，
 * GeneralContractor 是 LocalBusiness→HomeAndConstructionBusiness 的子型，
 * 比裸用 LocalBusiness 精確。
 */
export function organizationNode(locale: SeoLocale): Node {
  return {
    "@type": ["Organization", "GeneralContractor"],
    "@id": ORG_ID,
    name: locale === "zh" ? ORG.nameZh : ORG.nameEn,
    alternateName: [...ALTERNATE_NAMES],
    legalName: ORG.nameZh,
    description: ONE_LINER[locale],
    url: absoluteUrl(locale),
    logo: `${ORG.origin}/brand/hq-design-lockup.svg`,
    image: `${ORG.origin}/og/default.jpg`,
    telephone: ORG.tel,
    email: ORG.email,
    foundingDate: String(ORG.foundedYear),
    address: {
      "@type": "PostalAddress",
      streetAddress: ORG.address.streetAddress,
      addressLocality: ORG.address.addressLocality,
      addressRegion: ORG.address.addressRegion,
      addressCountry: ORG.address.addressCountry,
    },
    areaServed: { "@type": "Country", name: "Taiwan", identifier: "TW" },
    knowsAbout: [...KNOWS_ABOUT],
    sameAs: [...SAME_AS],
  };
}

export function webSiteNode(locale: SeoLocale): Node {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: absoluteUrl(locale),
    name: `${ORG.shortZh} ${ORG.shortEn}`,
    inLanguage: locale === "zh" ? "zh-Hant-TW" : "en",
    publisher: { "@id": ORG_ID },
  };
}

export function webPageNode(args: {
  locale: SeoLocale;
  path?: string;
  name: string;
  description: string;
  breadcrumbId?: string;
}): Node {
  const url = absoluteUrl(args.locale, args.path ?? "");
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: args.name,
    description: args.description,
    inLanguage: args.locale === "zh" ? "zh-Hant-TW" : "en",
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    ...(args.breadcrumbId ? { breadcrumb: { "@id": args.breadcrumbId } } : {}),
  };
}

/** 麵包屑。seo/analysis.md T13：/process/* 與 /work/<slug> MUST 有。 */
export function breadcrumbNode(
  locale: SeoLocale,
  trail: { name: string; path: string }[],
): Node {
  const url = absoluteUrl(locale, trail[trail.length - 1]?.path ?? "");
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: absoluteUrl(locale, t.path),
    })),
  };
}

/**
 * 影像的授權與來源標註。seo/analysis.md §6.3：creditText／copyrightNotice
 * 是 Google 圖片會顯示的授權欄位，標註因此跟著圖片出現在搜尋結果——
 * 比頁內文字更符合「標註隨檔案傳遞」的意圖，也讓 alt 回歸描述空間。
 *
 * creditText 由 prov 單向推導（COORDINATION.md §5 紅線），不得手寫。
 */
export function imageObjectNode(im: ProjectImage, slug: string, locale: Locale): Node {
  const variant = (im.labelVariant ?? "default") as never;
  return {
    "@type": "ImageObject",
    "@id": `${ORG.origin}/media/work/${slug}/${im.stem}#image`,
    contentUrl: `${ORG.origin}/media/work/${slug}/${im.stem}-1600.webp`,
    width: im.width,
    height: im.height,
    caption: im.alt[locale] ?? im.alt.zh,
    creditText: sourceLabel(im.prov, locale, variant),
    copyrightNotice: `© ${ORG.nameEn}`,
    creator: { "@id": ORG_ID },
    license: absoluteUrl(locale === "en" ? "en" : "zh", "/image-policy"),
    acquireLicensePage: absoluteUrl(locale === "en" ? "en" : "zh", "/image-policy"),
  };
}

/**
 * 案例頁。schema.org 沒有 Project 型別，用 CreativeWork（seo §5.1）；
 * MUST NOT 用 Product——這不是販售商品。
 *
 * 只吃 verifiedFacts()：暫填（verified=false）與缺漏的事實不得進入
 * 機器可讀宣稱（COORDINATION.md §4）。這是硬性資料政策，不是風格選擇。
 */
export function creativeWorkNode(p: Project, locale: Locale, name: string): Node {
  const f = verifiedFacts(p) as {
    locationZh?: string;
    year?: number;
    areaSqm?: number;
    typeZh?: string;
  };
  const url = absoluteUrl(locale, `/work/${p.slug}`);
  const hero = [...p.images].sort((a, b) => a.order - b.order)[0];
  return {
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    url,
    name,
    description: (p.lede[locale] ?? p.lede.zh).replace(/\s+/g, " ").trim(),
    inLanguage: locale === "zh" ? "zh-Hant-TW" : "en",
    creator: { "@id": ORG_ID },
    provider: { "@id": ORG_ID },
    ...(f.year ? { dateCreated: String(f.year) } : {}),
    ...(f.locationZh
      ? {
          locationCreated: {
            "@type": "Place",
            name: f.locationZh,
            address: { "@type": "PostalAddress", addressCountry: "TW" },
          },
        }
      : {}),
    ...(f.areaSqm
      ? {
          size: {
            "@type": "QuantitativeValue",
            value: f.areaSqm,
            unitCode: "MTK",
            unitText: "sqm",
          },
        }
      : {}),
    ...(f.typeZh ? { genre: f.typeZh } : {}),
    ...(hero ? { image: { "@id": `${ORG.origin}/media/work/${p.slug}/${hero.stem}#image` } } : {}),
  };
}

/** /work 列表頁。 */
export function itemListNode(
  locale: SeoLocale,
  items: { slug: string; name: string }[],
): Node {
  const url = absoluteUrl(locale, "/work");
  return {
    "@type": "ItemList",
    "@id": `${url}#list`,
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absoluteUrl(locale, `/work/${it.slug}`),
    })),
  };
}

/** /services 十項。seo/analysis.md §5.1：Service ×10，provider 指回 @id。 */
export function serviceNodes(
  locale: SeoLocale,
  services: { slug: string; name: string; description: string }[],
): Node[] {
  return services.map((s) => ({
    "@type": "Service",
    "@id": `${absoluteUrl(locale, "/services")}#${s.slug}`,
    name: s.name,
    description: s.description,
    serviceType: s.name,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "Taiwan", identifier: "TW" },
  }));
}

/**
 * 七段流程的階段頁。
 *
 * 刻意 **不用** HowTo：Google 已下架該複合式搜尋結果（seo §5.1），
 * 而 geo §1.2／§5.3 對「加 schema 提升 AI 引用」有反向證據。
 * 用 WebPage + BreadcrumbList，語意正確且不做無證據的投入。
 */
export function stagePageGraph(
  locale: SeoLocale,
  s: StageWithMeta,
  name: string,
  description: string,
): Node[] {
  const trail = [
    { name: locale === "zh" ? "首頁" : "Home", path: "" },
    { name: locale === "zh" ? "設計流程" : "Process", path: "/process" },
    { name, path: `/process/${s.slug}` },
  ];
  const crumb = breadcrumbNode(locale, trail);
  return [
    crumb,
    webPageNode({
      locale,
      path: `/process/${s.slug}`,
      name,
      description,
      breadcrumbId: crumb["@id"] as string,
    }),
  ];
}
