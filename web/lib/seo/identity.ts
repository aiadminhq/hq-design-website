import { ORG } from "@/lib/site";

/**
 * 實體識別層。GEO 分析 §5.4 的結論：alternateName 是必要但不充分，
 * 真正決定 LLM 實體解析的是「跨來源共現」——每個平台的簡介欄必須逐字
 * 使用同一句定義。所以這句話在此定義一次，由 JSON-LD、llms.txt、
 * meta description 與各平台簡介共用，不得在別處重寫。
 *
 * 依據：geo/analysis.md §3.3、§5.4；seo/analysis.md §2.5。
 */
export const ONE_LINER = {
  zh:
    `${ORG.shortZh}（${ORG.shortEn}）是台灣台北的商業空間設計施工統包（design & build）公司，` +
    `${ORG.foundedYear} 年創立，累積 ${ORG.projectCount} 件商業空間案件，` +
    `設計與施工由同一團隊在單一合約下負責。`,
  en:
    `${ORG.shortEn} (${ORG.shortZh}) is a commercial interior design-and-build contractor based in Taipei, Taiwan. ` +
    `Founded in ${ORG.foundedYear}, it has delivered ${ORG.projectCount} commercial interior projects, ` +
    `with design and construction handled by one team under a single contract.`,
} as const;

/**
 * 品牌名稱分裂（seo/analysis.md §2.5 實測為四組）。全部列為 alternateName
 * 是實體消歧義的最低成本動作。HuiCiang 是 Facebook 目前使用的孤立羅馬拼音，
 * 列在此處是為了讓機器把它接回同一個實體——不是認可它作為對外展示名。
 */
export const ALTERNATE_NAMES = [
  ORG.shortZh,
  ORG.nameZh,
  "惠強設計",
  "惠強設計工程股份有限公司",
  ORG.shortEn,
  "HQ Design Co., Ltd.",
  "HQ Interior & Space Design",
  "HuiCiang Design",
] as const;

/**
 * 實體消歧義的外部錨點。geo/analysis.md §8「G0-5」判定為 P0 中 CP 值最高的單一動作。
 *
 * 只列「已存在且經實測確認」的官方帳號（seo/analysis.md §9 品牌詞 SERP 實測）。
 * Google Business Profile 與 LinkedIn 依 geo §5.2 為 P1，尚未建立，
 * MUST NOT 先寫進來——sameAs 指向不存在的 URL 會反過來損害實體可信度。
 */
export const SAME_AS = [
  "https://www.facebook.com/HuiCiangDesign/",
  "https://www.104.com.tw/company/15bpmni0",
] as const;

/** JSON-LD 節點識別碼。全站只定義一次 Organization，其餘頁面以 @id 引用。 */
export const ORG_ID = `${ORG.origin}/#organization`;
export const SITE_ID = `${ORG.origin}/#website`;

/** 惠強在 AI／參數化／BIM 的主題範圍。對映 seo/analysis.md §2.3 的四個主攻詞。 */
export const KNOWS_ABOUT = [
  "商業空間室內裝修",
  "設計施工統包",
  "辦公室設計施工",
  "參數化設計",
  "BIM 室內裝修協調",
  "AI 室內設計流程",
  "施工圖說與深化設計",
  "營運不中斷分區施工",
] as const;
