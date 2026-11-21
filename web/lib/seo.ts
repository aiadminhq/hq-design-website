import type { Metadata } from "next";
import { localizedPath, type Locale, type Project } from "./project";
export const siteUrl = "https://www.hqdesign.tw";
export function metadata(
  title: string,
  description: string,
  path: string,
  locale: Locale,
  image = "/assets/images/logo/IMG_6412.PNG",
): Metadata {
  const canonical = siteUrl + localizedPath(path, locale);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: siteUrl + localizedPath(path, "en"),
        "zh-Hant": siteUrl + localizedPath(path, "zh"),
        "x-default": siteUrl + localizedPath(path, "en"),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "HQ Design",
      locale: locale === "en" ? "en_US" : "zh_TW",
      images: [image],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
export function projectJsonLd(p: Project, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: p.name[locale],
    description: p.description[locale],
    url: siteUrl + localizedPath("/projects/" + p.slug, locale),
    image: p.images.map((i) =>
      i.src.startsWith("/") ? siteUrl + i.src : i.src,
    ),
    ...(p.areaSqm
      ? {
          size: {
            "@type": "QuantitativeValue",
            value: p.areaSqm,
            unitCode: "MTK",
          },
        }
      : {}),
    ...(p.year ? { dateCreated: String(p.year) } : {}),
    creator: { "@type": "Organization", name: "HQ Design", url: siteUrl },
  };
}
export function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
