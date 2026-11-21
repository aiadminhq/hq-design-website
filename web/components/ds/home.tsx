import type { Locale } from "./copy";
import { home } from "./copy";
import { Arrow } from "./arrow";
import { clean, CONTACT } from "./util";

export function Home({ locale }: { locale: Locale }) {
  const c = home[locale];
  const zh = locale === "zh";
  const prefix = zh ? "/zh" : "";
  return (
    <>
      <section className="ds-hero" data-theme="navy">
        <img className="ds-hero__bg" src="/assets/images/projects/secom-nangang-complex/photo-01.jpg" alt="" fetchPriority="high" />
        <div className="hq-container">
          <div className="ds-hero__body">
            <span className="hq-label">{c.hero.label}</span>
            <h1 className="ds-hero__title">
              {c.hero.title[0]}
              <em>{c.hero.title[1]}</em>
            </h1>
            <p className="hq-lead">{c.hero.sub}</p>
            {c.hero.sub2 && <p className="hq-lead">{c.hero.sub2}</p>}
            <div className="hq-btn-row">
              <a className="hq-btn hq-btn--accent hq-btn--lg" href={clean(c.hero.primary[1])}>
                {c.hero.primary[0]} <Arrow />
              </a>
              <a className="hq-btn hq-btn--inverse hq-btn--lg" href={clean(c.hero.secondary[1])}>
                {c.hero.secondary[0]}
              </a>
            </div>
          </div>
          <div className="hq-stats ds-hero__stats">
            {c.hero.stats.map((s) => (
              <div className="hq-stat" key={s.label}>
                <div className="hq-stat__num">
                  {s.num}
                  <span className="hq-stat__unit">{s.unit}</span>
                </div>
                <div className="hq-stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hq-section" id="audience-doors">
        <div className="hq-container">
          <div className="hq-section-head">
            <span className="hq-label">{c.doors.label}</span>
            <h2 className="hq-h2">{c.doors.title}</h2>
            <p className="hq-lead">{c.doors.sub}</p>
          </div>
          <div className="ds-grid ds-grid--2">
            {c.doors.items.map((d, i) => (
              <a key={d.title} className={`hq-card ds-door${i === 1 ? " ds-door--accent" : ""}`} href={clean(d.href)}>
                <span className="hq-label">{d.kicker}</span>
                <h3 className="hq-card__title">{d.title}</h3>
                <p className="hq-card__body">{d.body}</p>
                <span className="ds-door__cta">{d.cta} →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="ds-logos">
        <div className="hq-container">
          <p className="ds-logos__label">{zh ? "合作客戶" : "Trusted by"}</p>
          <ul className="ds-logos__list">
            {["SECOM", "TransAsia Catering", "Kimpton Hotel", "Popeyes", "Soup Spoon", "Cheogajip", "Goldsun Group", "Wellpool"].map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </div>

      <section className="hq-section ds-wedge" data-theme="navy">
        <div className="hq-container">
          <span className="hq-label">{c.wedge.label}</span>
          <h2 className="hq-h2">{c.wedge.title}</h2>
          <p className="hq-lead">{c.wedge.body}</p>
          <ul className="ds-checks">
            {c.wedge.checks.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <div>
            <a className="hq-btn hq-btn--accent" href={clean(c.contactHref)}>
              {c.wedge.cta} <Arrow />
            </a>
          </div>
        </div>
      </section>

      <section className="hq-section">
        <div className="hq-container">
          <div className="hq-section-head hq-section-head--center">
            <span className="hq-label">{c.why.label}</span>
            <h2 className="hq-h2">{c.why.title}</h2>
            <p className="hq-lead">{c.why.sub}</p>
          </div>
          <div className="ds-grid ds-grid--3">
            {c.why.items.map((w, i) => (
              <article className="hq-card" key={w.title}>
                <span className="ds-why__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="hq-card__title">{w.title}</h3>
                <p className="hq-card__body">{w.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hq-section hq-section--subtle">
        <div className="hq-container">
          <div className="hq-section-head">
            <span className="hq-label">{c.work.label}</span>
            <h2 className="hq-h2">{c.work.title}</h2>
            <p className="hq-lead">{c.work.sub}</p>
          </div>
          <div className="ds-projects">
            {c.work.items.map((p) => (
              <a className="ds-project" key={p.slug} href={`${prefix}/projects/${p.slug}`}>
                <img src={p.src} alt={zh ? p.nameZh : p.nameEn} loading="lazy" />
                <div className="ds-project__body">
                  <h3 className="ds-project__name">
                    {zh ? p.nameZh : p.nameEn}
                    <span>{zh ? p.nameEn : p.nameZh}</span>
                  </h3>
                  <span className="ds-project__meta">{p.meta}</span>
                  <span className="hq-tag hq-tag--accent">{p.type}</span>
                </div>
              </a>
            ))}
          </div>
          <div className="ds-center">
            <a className="hq-btn hq-btn--outline" href={clean(c.work.all[1])}>{c.work.all[0]} <Arrow /></a>
          </div>
        </div>
      </section>

      <section className="hq-section">
        <div className="hq-container">
          <div className="hq-section-head">
            <span className="hq-label">{c.services.label}</span>
            <h2 className="hq-h2">{c.services.title}</h2>
            <p className="hq-lead">{c.services.sub}</p>
          </div>
          <div className="ds-grid ds-grid--3">
            {c.services.items.map((s, i) => (
              <article className="hq-card hq-card--outline" key={s.title}>
                <span className="hq-label">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="hq-card__title">{s.title}</h3>
                <p className="hq-card__body">{s.body}</p>
                {s.href && <a className="ds-door__cta" href={clean(s.href)}>{s.link} →</a>}
              </article>
            ))}
          </div>
          <div className="ds-center">
            <a className="hq-btn hq-btn--primary" href={clean(c.services.all[1])}>{c.services.all[0]} <Arrow /></a>
          </div>
        </div>
      </section>

      <section className="hq-section" data-theme="navy">
        <div className="hq-container ds-banner__inner">
          <div className="hq-stack">
            <h2 className="hq-h2">{c.banner.title}</h2>
            <p className="hq-lead">{c.banner.sub}</p>
            <a className="hq-btn hq-btn--accent" href={clean(c.contactHref)}>{c.banner.cta} <Arrow /></a>
          </div>
          <div className="ds-banner__contact">
            <a href={`tel:${CONTACT.tel}`}>{CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </div>
        </div>
      </section>
    </>
  );
}
