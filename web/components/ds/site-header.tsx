"use client";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "./copy";
import { home } from "./copy";
import { clean } from "./util";

export function SiteHeader({ locale }: { locale: Locale }) {
  const c = home[locale];
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <header className="ds-header" data-open={open}>
      <div className="hq-container ds-header__inner">
        <a className="ds-brand" href={locale === "zh" ? "/zh" : "/"}>
          <img src="/assets/images/logo/IMG_6412.PNG" alt="HQ Design" />
          <span className="ds-brand__name">
            {locale === "zh" ? "惠強室內裝修" : "HQ Design"}
            <span className="ds-brand__sub">Since 1995</span>
          </span>
        </a>
        <nav aria-label={locale === "zh" ? "主要導覽" : "Main navigation"}>
          <ul className="ds-nav" id="ds-nav">
            {c.nav.map((n) => (
              <li key={n.href}>
                <a href={clean(n.href)}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <a className="ds-lang" href={c.langSwitch.href} hrefLang={locale === "zh" ? "en" : "zh-Hant"}>
          {c.langSwitch.label}
        </a>
        <a className="hq-btn hq-btn--primary hq-btn--sm ds-header__cta" href={clean(c.contactHref)}>
          {c.cta}
        </a>
        <button
          ref={btn}
          type="button"
          className="ds-burger"
          aria-expanded={open}
          aria-controls="ds-nav"
          aria-label={locale === "zh" ? "選單" : "Menu"}
          onClick={() => setOpen(!open)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
    </header>
  );
}
