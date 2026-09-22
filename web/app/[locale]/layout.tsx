// 所有權：Fable 5.1。骨架，可整份取代。
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/lib/i18n/routing";
import { ORG } from "@/lib/site";
import { ONE_LINER } from "@/lib/seo/identity";
import { JsonLd, organizationNode, webSiteNode } from "@/lib/seo/json-ld";
import type { SeoLocale } from "@/lib/seo/metadata";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { TitleBlock } from "@/components/title-block";
import "./globals.css";
import "./fonts.css";
import "./responsive.css";
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const HTML_LANG = { zh: "zh-Hant-TW", en: "en" } as const;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={HTML_LANG[locale]} data-theme="light">
      <body>
        {/* 全站實體宣告一次，其餘頁面以 @id 引用（seo/analysis.md §5.1）。
            舊站 27 頁 JSON-LD 命中 0，品牌 SERP 因此被公司登記資料站佔滿。 */}
        <JsonLd graph={[organizationNode(locale as SeoLocale), webSiteNode(locale as SeoLocale)]} />
        <NextIntlClientProvider>
          <SiteNav locale={locale} />
          {children}
          <SiteFooter locale={locale} />
          <TitleBlock locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

/** 各頁 metadata 一律由 lib/seo/metadata.ts 的 pageMetadata() 產生，
 *  這裡只留 metadataBase 與 fallback。品牌後綴依 seo/analysis.md §3.1
 *  由舊站的 38 字元縮為「｜惠強 HQ Design」。 */
export const metadata = {
  metadataBase: new URL(ORG.origin),
  title: { default: `${ORG.shortZh} ${ORG.shortEn}`, template: `%s｜惠強 ${ORG.shortEn}` },
  description: ONE_LINER.zh,
  applicationName: `${ORG.shortZh} ${ORG.shortEn}`,
  formatDetection: { telephone: false },
};
