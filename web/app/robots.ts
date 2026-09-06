// 所有權：Claude（SEO 基礎建設，見 COORDINATION.md §2「web/lib/seo/**」與 §6 登記）
import type { MetadataRoute } from "next";
import { ORG } from "@/lib/site";

/**
 * 政策：允許所有搜尋與 AI 爬蟲全站取用。依據 geo/analysis.md §2.2 與 §2.3。
 * **變更前 MUST 重讀該節。**
 *
 * 為什麼不封鎖訓練爬蟲（§2.2）：惠強的網站內容是招牌不是商品，
 * 進入模型權重代表「品牌名 ↔ 參數化／BIM／設計施工統包」的關聯被寫進模型先驗；
 * 封鎖換來的是無可驗證的收益。而 OAI-SearchBot／PerplexityBot／Claude-SearchBot
 * 是即時檢索索引，封鎖它們等於自願退出 AI 搜尋，是純損失。
 *
 * 逐一列名而非只寫 User-agent: * 的價值是「文件化意圖」——讓後手知道
 * 這是決定而非疏漏，並提供未來條件式收緊的掛點。技術上 * 已足夠。
 *
 * 唯一的條件式例外（尚未觸發）：若專業攝影授權裁定不允許 AI 訓練使用
 * （geo §2.2、U-G5），則對訓練爬蟲追加 Disallow: /media/，
 * 且 MUST NOT 對三個 SearchBot 追加。
 */
const TRAINING_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
  "Amazonbot",
  "cohere-training-data-crawler",
];

const SEARCH_BOTS = ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot"];

/** 使用者觸發取用與分享預覽。
 *  facebookexternalhit MUST NOT 被封——封了 OG 分享卡會直接失效。 */
const USER_TRIGGERED = [
  "ChatGPT-User",
  "Claude-User",
  "Perplexity-User",
  "facebookexternalhit",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: TRAINING_BOTS, allow: "/" },
      { userAgent: SEARCH_BOTS, allow: "/" },
      { userAgent: USER_TRIGGERED, allow: "/" },
    ],
    // Framer 方案需要宣告兩份 locale sitemap（geo §6）；這裡是自管的 Next.js，
    // 單一 sitemap 內以 xhtml:link alternates 表達雙語，是 Google 建議的作法，
    // 不需要拆兩份。
    sitemap: `${ORG.origin}/sitemap.xml`,
    host: ORG.origin,
  };
}
