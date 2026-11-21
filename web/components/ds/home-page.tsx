import type { Metadata } from "next";
import jsonLd from "../../content/ds/home-jsonld.json";
import { safeJson, metadata as seo } from "../../lib/seo";
import { home, type Locale } from "./copy";
import { Home } from "./home";

export const homeMetadata = (locale: Locale): Metadata =>
  seo(home[locale].meta.title, home[locale].meta.description, "/", locale);

export function HomePage({ locale }: { locale: Locale }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(jsonLd[locale]) }}
      />
      <Home locale={locale} />
    </>
  );
}
