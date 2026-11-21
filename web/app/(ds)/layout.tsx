import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteHeader } from "../../components/ds/site-header";
import { SiteFooter } from "../../components/ds/site-footer";
import "./styles/tokens.css";
import "./styles/components.css";
import "./styles/home.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.hqdesign.tw"),
  verification: { google: "n-eIrJlG7pKRfShuWL4jsNy5_ZeZ-DOvmDSLQjqglxM" },
  ...(process.env.VERCEL_ENV === "preview"
    ? { robots: { index: false, follow: false } }
    : {}),
};

export default async function DsLayout({ children }: { children: React.ReactNode }) {
  const locale = (await headers()).get("x-hq-locale") === "zh" ? "zh" : "en";
  return (
    <html lang={locale === "zh" ? "zh-Hant" : "en"}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Satoshi (Latin) + Noto Sans TC (zh-Hant), per tokens.md */}
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap" />
      </head>
      <body className="ds-v2">
        <a className="skip-link" href="#main-content">
          {locale === "zh" ? "跳至主要內容" : "Skip to content"}
        </a>
        <SiteHeader locale={locale} />
        <main id="main-content">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
