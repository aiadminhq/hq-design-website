import type { Locale } from "./copy";
import { home } from "./copy";
import { clean, CONTACT } from "./util";

export function SiteFooter({ locale }: { locale: Locale }) {
  const f = home[locale].footer;
  return (
    <footer className="ds-footer">
      <div className="hq-container">
        <div className="ds-footer__grid">
          <div>
            <p className="ds-footer__brand">{f.brand}</p>
            <p>{f.brandSub}</p>
            <p>{f.tagline}</p>
          </div>
          {f.cols.map((col) => (
            <div key={col.title}>
              <h2>{col.title}</h2>
              <ul>
                {col.links.map((l, i) => (
                  <li key={l.label + i}>
                    <a href={clean(l.href)}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2>{locale === "zh" ? "聯絡" : "Contact"}</h2>
            <ul>
              <li>{f.address}</li>
              <li><a href={`tel:${CONTACT.tel}`}>{CONTACT.phone}</a></li>
              <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            </ul>
          </div>
        </div>
        <div className="ds-footer__legal">
          <span>{f.copy}</span>
          <span>{f.tax}</span>
        </div>
      </div>
    </footer>
  );
}
