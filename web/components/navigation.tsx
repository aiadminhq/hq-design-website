"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { localizedPath, type Locale } from "../lib/project";

export function Navigation({
  locale,
  brand,
}: {
  locale: Locale;
  brand: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const path = pathname.replace(/^\/zh(?=\/|$)/, "") || "/";
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    ["projects", "Projects", "專案"],
    ["services", "Services", "服務"],
    ["local-partner-international-pm", "Local Partner", "在地夥伴"],
    ["about", "About", "關於我們"],
    ["faq", "FAQ", "常見問題"],
  ];
  return (
    <nav
      className={`nav${open ? " nav-mobile-open" : ""}${scrolled ? " scrolled" : ""}`}
      aria-label={locale === "en" ? "Main navigation" : "主要導覽"}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          button.current?.focus();
        }
      }}
    >
      <div className="nav-inner">
        {brand}
        <ul className="nav-links" id="main-nav-links">
          {links.map(([slug, en, zh]) => (
            <li key={slug}>
              <Link
                className={path.startsWith("/" + slug) ? "active" : ""}
                aria-current={path.startsWith("/" + slug) ? "page" : undefined}
                href={localizedPath("/" + slug, locale)}
              >
                {locale === "en" ? en : zh}
              </Link>
            </li>
          ))}
        </ul>
        <div className="lang-toggle" aria-label="Language">
          {/* A document navigation also changes the server-rendered html lang and footer. */}
          <a
            className={`lang-toggle__item${locale === "en" ? " is-active" : ""}`}
            href={path}
            hrefLang="en"
            lang="en"
          >
            EN
          </a>
          <span className="lang-toggle__sep" aria-hidden="true">
            |
          </span>
          <a
            className={`lang-toggle__item${locale === "zh" ? " is-active" : ""}`}
            href={localizedPath(path, "zh")}
            hrefLang="zh-Hant"
            lang="zh-Hant"
          >
            中文
          </a>
        </div>
        <Link
          className="btn btn-primary nav-cta"
          href={localizedPath("/contact", locale)}
        >
          {locale === "en" ? "Contact" : "聯繫我們"}
        </Link>
        <button
          ref={button}
          type="button"
          className="hamburger"
          aria-label={locale === "en" ? "Toggle navigation" : "開啟或關閉導覽"}
          aria-expanded={open}
          aria-controls="main-nav-links"
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
