import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import Script from "next/script";
import { Navigation } from "../components/navigation";
import { Content } from "../components/content";
import { MotionProvider, PageTransition } from "../components/motion";
import { chrome } from "../lib/content";
import { verifyTicket } from "../lib/cms/auth";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const preview = verifyTicket((await cookies()).get("hq-preview")?.value);
  return {
    metadataBase: new URL("https://www.hqdesign.tw"),
    verification: { google: "n-eIrJlG7pKRfShuWL4jsNy5_ZeZ-DOvmDSLQjqglxM" },
    ...(preview || process.env.VERCEL_ENV === "preview"
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await headers()).get("x-hq-locale") === "zh" ? "zh" : "en";
  const preview = verifyTicket((await cookies()).get("hq-preview")?.value);
  const analytics = process.env.VERCEL_ENV === "production" && !preview;
  return (
    <html lang={locale === "zh" ? "zh-Hant" : "en"}>
      <head>
        <link rel="stylesheet" href="/assets/css/main.css" />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          {locale === "en" ? "Skip to content" : "跳至主要內容"}
        </a>
        <MotionProvider>
          <Navigation
            locale={locale}
            brand={<Content html={chrome[locale].brand} locale={locale} />}
          />
          {preview && (
            <div className="preview-banner">
              草稿預覽：{preview} · 尚未發布{" "}
              <a href="/api/internal/preview?exit=1">離開預覽</a>
            </div>
          )}
          <PageTransition>{children}</PageTransition>
          <Content html={chrome[locale].footer} locale={locale} />
        </MotionProvider>
        {analytics && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-M7851QG91T"
              strategy="afterInteractive"
            />
            <Script
              id="ga4"
              strategy="afterInteractive"
            >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-M7851QG91T');`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
