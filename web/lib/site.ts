/** 公司資料的唯一來源。全站不得出現字面公司名，一律引用這裡。 */
export const ORG = {
  nameZh: "惠強室內裝修股份有限公司",
  nameEn: "HQ DESIGN CO., LTD.",
  shortZh: "惠強室內裝修",
  shortEn: "HQ Design",
  foundedYear: 1995,
  projectCount: "1,600+",
  tel: "+886-2-2557-3003",
  email: "info@hqdesign.tw",
  address: {
    streetAddress: "經貿二路135號9樓",
    addressLocality: "南港區",
    addressRegion: "台北市",
    addressCountry: "TW",
  },
  origin: "https://www.hqdesign.tw",
} as const;

/** 品牌主色。權威來源：HQ DESIGN — 品牌視覺規範與 CIS 系統.md v1.0 §3.1。
 *  LOGO 資料夾 SVG 內的 #DB421A 是過期值，不得使用。 */
export const BRAND = "#D64518" as const;
