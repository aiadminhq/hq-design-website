"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/content/schema";
import { ORG } from "@/lib/site";

export function SiteNav({ locale }: { locale: Locale }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const links = [
    ["work", "實績", "Projects"],
    ["process", "設計流程", "Process"],
    ["about", "關於", "About"],
    ["contact", "聯絡", "Contact"],
  ];
  useEffect(() => {
    setOpen(false);
  }, [path]);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.current?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const alt = path.replace(
    /^\/(zh|en)(?=\/|$)/,
    locale === "zh" ? "/en" : "/zh",
  );
  return (
    <>
      <a className="skip-link" href="#main">
        {locale === "zh" ? "跳至主要內容" : "Skip to content"}
      </a>
      <header className="site-nav">
        <a href={`/${locale}`} className="wordmark" aria-label={ORG.shortEn}>
          <img src="/brand/hq-icon-black.svg" width="44" height="44" alt="" />
          <span>HQ DESIGN</span>
        </a>
        <nav
          aria-label={locale === "zh" ? "主要導覽" : "Main navigation"}
          className="desktop-nav"
        >
          {links.map(([slug, zh, en]) => (
            <a
              key={slug}
              href={`/${locale}/${slug}`}
              aria-current={
                path.startsWith(`/${locale}/${slug}`) ? "page" : undefined
              }
            >
              {locale === "zh" ? zh : en}
            </a>
          ))}
        </nav>
        <a
          className="locale-switch mono"
          href={alt}
          hrefLang={locale === "zh" ? "en" : "zh-Hant"}
        >
          {locale === "zh" ? "EN" : "中"}
        </a>
        <button
          ref={trigger}
          className="menu-button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          {locale === "zh" ? "選單" : "Menu"} +
        </button>
      </header>
      <dialog
        aria-label={locale === "zh" ? "網站選單" : "Site menu"}
        id="mobile-menu"
        ref={dialog}
        className="mobile-menu"
        onCancel={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <button className="menu-close" onClick={close}>
          {locale === "zh" ? "關閉" : "Close"} ×
        </button>
        <nav aria-label={locale === "zh" ? "手機導覽" : "Mobile navigation"}>
          {links
            .concat([
              ["services", "服務項目", "Services"],
              ["careers", "加入我們", "Careers"],
            ])
            .map(([slug, zh, en], i) => (
              <a key={slug} href={`/${locale}/${slug}`} onClick={close}>
                <span className="mono">0{i + 1}</span>
                {locale === "zh" ? zh : en}
              </a>
            ))}
        </nav>
      </dialog>
    </>
  );
}
