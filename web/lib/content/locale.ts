import { DEFAULT_LOCALE, type Locale } from "./schema";

export type Resolved<T> = { value: T; lang: Locale; isFallback: boolean };

/**
 * 雙語解析。英文缺席時回落到中文並標記 isFallback。
 * 標記有三個用途：WCAG 3.1.2 的 lang 屬性、螢幕閱讀器語音切換、待譯覆蓋率統計。
 */
export function resolve<T>(f: { zh: T; en: T | null }, locale: Locale): Resolved<T> {
  if (locale === DEFAULT_LOCALE) return { value: f.zh, lang: DEFAULT_LOCALE, isFallback: false };
  return f.en != null
    ? { value: f.en, lang: locale, isFallback: false }
    : { value: f.zh, lang: DEFAULT_LOCALE, isFallback: true };
}

export function isLocale(v: string): v is Locale {
  return v === "zh" || v === "en";
}
