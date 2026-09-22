import { defineRouting } from "next-intl/routing";

/**
 * localePrefix "always"：兩個語系都帶前綴（/zh、/en）。
 * 理由是 301 對照表要有唯一且靜態可測的目標，而 as-needed 會讓
 * /about 與 /zh/about 都可達，是典型的重複內容陷阱。
 *
 * localeDetection false：不依 Accept-Language 自動導向。主要受眾是中文，
 * 而英文頁目前大量 fallback 回中文，自動把國際訪客丟過去比留在中文頁更糟。
 */
export const routing = defineRouting({
  locales: ["zh", "en"],
  defaultLocale: "zh",
  localePrefix: "always",
  localeDetection: false,
});
