import type { Locale } from "@/lib/content/schema";
import { ORG } from "@/lib/site";
import { BrandPattern } from "./brand-pattern";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <p className="eyebrow">NEXT / TOGETHER</p>
        <a className="footer-invite" href={`/${locale}/contact`}>
          {locale === "zh"
            ? "一起，讓空間成真。"
            : "Make room for possibility."}
          <span>↗</span>
        </a>
      </div>
      <div className="footer-grid">
        <div>
          <div className="wordmark">
            <img
              className="footer-logo"
              src="/brand/hq-design-lockup.svg"
              width="246"
              height="130"
              alt="HQ Design — Design and Build"
            />
          </div>
          <p>{locale === "zh" ? ORG.shortZh : ORG.shortEn}</p>
          <p className="mono small">
            INTERIOR DESIGN & BUILD
            <br />
            TAIPEI · SINCE {ORG.foundedYear}
          </p>
        </div>
        <div>
          <a href={`mailto:${ORG.email}`}>{ORG.email}</a>
          <a href={`tel:${ORG.tel}`}>{ORG.tel}</a>
          <p>
            {ORG.address.addressRegion}
            {ORG.address.addressLocality}
            <br />
            {ORG.address.streetAddress}
          </p>
        </div>
        <nav aria-label="Footer">
          {[
            ["services", "服務項目", "Services"],
            ["careers", "加入我們", "Careers"],
            ["model", "模型空間", "Model space"],
            ["contact", "聯絡", "Contact"],
          ].map(([slug, zh, en]) => (
            <a key={slug} href={`/${locale}/${slug}`}>
              {locale === "zh" ? zh : en} ↗
            </a>
          ))}
        </nav>
      </div>
      <BrandPattern />
      <div className="footer-bottom mono small">
        <span>
          © {new Date().getFullYear()} {ORG.shortEn}
        </span>
        <a href="#main">{locale === "zh" ? "回到頂端" : "Back to top"} ↑</a>
      </div>
    </footer>
  );
}
