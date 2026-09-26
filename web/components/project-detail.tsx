import Link from "next/link";
import { Gallery } from "./gallery";
import { CallToAction } from "./content";
import {
  formatArea,
  localizedPath,
  categoryName,
  type Project,
  type Locale,
} from "../lib/project";

export function ProjectDetail({
  project: p,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const zh = locale === "zh";
  const specs = [
    [zh ? "業主" : "Client", p.client[locale]],
    [zh ? "類型" : "Type", categoryName(p.category, locale)],
    [zh ? "面積" : "Area", formatArea(p.areaSqm, locale, true)],
    [zh ? "地點" : "Location", p.location[locale]],
    [zh ? "年份" : "Completed", p.year?.toString()],
  ].filter(([, value]) => value);
  return (
    <>
      <div className="proj-hero">
        <img
          className="proj-hero-img"
          src={p.images[0].src}
          alt={p.images[0].alt[locale]}
          fetchPriority="high"
        />
        <div className="proj-hero-overlay" />
        <div className="proj-hero-content">
          <div className="container">
            <Link
              className="proj-back"
              href={localizedPath("/projects", locale)}
            >
              ← {zh ? "全部作品" : "All Projects"}
            </Link>
            <div className="proj-type-badge">
              {categoryName(p.category, locale)}
            </div>
            <h1>{p.name[locale]}</h1>
            <div className="proj-hero-meta">
              {[p.location[locale], formatArea(p.areaSqm, locale), p.year]
                .filter(Boolean)
                .map((v) => (
                  <span key={v}>
                    <strong>{v}</strong>
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
      <section className="proj-body">
        <div className="container">
          <div className="proj-layout">
            <div>
              <span className="label">{categoryName(p.category, locale)}</span>
              {p.description[locale] && (
                <p
                  className="overview-desc"
                  style={{ marginTop: 16, whiteSpace: "pre-line" }}
                >
                  {p.description[locale]}
                </p>
              )}
              <div className="proj-nav-cta">
                <Link
                  className="btn btn-primary"
                  href={localizedPath("/contact", locale)}
                >
                  {zh ? "洽詢類似專案 →" : "Ask about a similar project →"}
                </Link>
                <Link
                  className="btn btn-outline-dark"
                  href={localizedPath("/projects", locale)}
                >
                  {zh ? "更多作品" : "More projects"}
                </Link>
              </div>
            </div>
            <aside className="proj-specs">
              <h2>{zh ? "專案資訊" : "Project Info"}</h2>
              {specs.map(([label, value]) => (
                <div className="spec-row" key={label}>
                  <span className="spec-label">{label}</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </section>
      <Gallery project={p} locale={locale} />
      <CallToAction>
        <div className="container">
          <div className="cta-banner-inner">
            <div className="cta-text">
              <h2>
                {zh ? "正在規劃類似空間？" : "Have a similar project in mind?"}
              </h2>
              <p className="sub">
                {zh
                  ? "歡迎提供需求，安排初步評估與建議。"
                  : "Tell us about your brief — we will provide an initial assessment and recommendations."}
              </p>
            </div>
            <div className="cta-actions">
              <Link
                className="btn btn-primary"
                href={localizedPath("/contact", locale)}
              >
                {zh ? "聯絡我們 →" : "Contact Us →"}
              </Link>
              <div className="cta-contact-info">
                <a href="tel:+886225573003">+886-2-2557-3003</a>
              </div>
            </div>
          </div>
        </div>
      </CallToAction>
    </>
  );
}
