import type { SeoLocale } from "./metadata";

/**
 * 固定頁的 title／description。
 *
 * 全部依 seo/analysis.md §3.1 的模式撰寫：
 *   title       `{描述性關鍵字}｜{目標詞}` ＋ 品牌後綴（由 pageMetadata 補）
 *   description `{業主決策問題}。{HQ 做法}，{可驗證數值}。{行動}。` 60–80 中文字元
 *
 * 描述以問句開頭是刻意的：geo/analysis.md §4.4 的依據是
 * arXiv 2604.25707「問句與答案段落的語意對齊」決定內容是否被吸收進 AI 答案，
 * 而不是 FAQPage schema——後者已有反向證據，MUST NOT 作為投入理由。
 *
 * 舊站的 description 長 180–224 字元、尾段必被 SERP 截斷（§1.2 實測）；
 * 這裡全部壓在 80 以內。
 */
type Copy = { title: string; description: string };

export const HOME_COPY: Record<SeoLocale, Copy & { branded: true }> = {
  zh: {
    branded: true,
    // §P0-8：首頁 title MUST 含「惠強室內裝修」。舊站首頁 title 全英文、
    // 無「惠強」且 lang="en"，是品牌 SERP 被公司登記站佔滿的直接原因。
    title: "商業空間設計施工統包｜AI 參數化與 BIM 流程｜惠強室內裝修 HQ Design",
    description:
      "商業空間該找設計還是找施工？惠強室內裝修設計與施工由同一團隊、單一合約負責，1995 年創立、累積 1,600+ 件案件。看七段流程與實績。",
  },
  en: {
    branded: true,
    title: "Commercial Interior Design & Build, Taipei｜HQ Design 惠強室內裝修",
    description:
      "Design or build — who takes responsibility? HQ Design delivers both under one contract with one team. Founded 1995 in Taipei, 1,600+ commercial interiors.",
  },
};

export const SECTION_COPY: Record<string, Record<SeoLocale, Copy>> = {
  work: {
    zh: {
      title: "商業空間實績｜辦公室、餐飲與展示空間案例",
      description:
        "辦公室、餐飲、展示與貴賓室做過哪些？惠強室內裝修累積 1,600+ 件商業空間案件，本頁收錄可查核實績，含面積、年份與影像來源標示。",
    },
    en: {
      title: "Projects｜Offices, hospitality and showrooms in Taiwan",
      description:
        "What has HQ Design actually delivered? Offices, hospitality, showrooms and airport lounges — each entry lists area, year and image provenance.",
    },
  },
  process: {
    zh: {
      // M1「AI 室內設計」與 M2「AI 室內設計流程」的樞紐頁（§2.3、§3.1）
      title: "AI 室內設計流程｜從現況掃描到交付的七個階段",
      description:
        "AI 導入室內設計流程實際做什麼？惠強室內裝修把現況掃描、參數化方案、BIM 協調到交付串成七段，AI 負責加速運算，專業團隊負責判斷與落地。",
    },
    en: {
      title: "Process｜Seven stages from site survey to delivery",
      description:
        "What does AI actually do in an interior fit-out? HQ Design runs seven stages from site survey through parametric options and BIM to delivery.",
    },
  },
  about: {
    zh: {
      // geo/analysis.md §4.4 Q11「惠強室內裝修是什麼公司？」的落地頁。
      // 首句刻意與 llms.txt 首段同義，跨來源逐字重複是實體解析最有效的訊號（§5.4）。
      title: "關於惠強室內裝修｜1995 年創立的商業空間設計施工統包",
      description:
        "惠強室內裝修是什麼公司？1995 年創立於台北的商業空間設計施工統包公司，累積 1,600+ 件案件，設計與施工由同一團隊在單一合約下負責。",
    },
    en: {
      title: "About HQ Design｜Design-and-build contractor since 1995",
      description:
        "What is HQ Design (惠強室內裝修)? A Taipei commercial interior design-and-build contractor founded in 1995, with 1,600+ projects under single-contract delivery.",
    },
  },
  services: {
    zh: {
      // M3「辦公室設計施工統包」的落地頁（§2.3）
      title: "服務項目｜辦公室設計施工統包與商業空間設計",
      description:
        "設計施工統包和分開發包差在哪？惠強室內裝修提供空間設計到施工管理十項服務，單一合約、單一窗口，責任界面在合約層就界定清楚。",
    },
    en: {
      title: "Services｜Office fit-out and design-and-build in Taipei",
      description:
        "How does design-and-build differ from separate tenders? HQ Design covers ten services from spatial strategy to construction management under one contract.",
    },
  },
  careers: {
    zh: {
      title: "加入惠強室內裝修｜設計與施工整合團隊職缺",
      description:
        "想在設計與施工同一團隊的公司工作？惠強室內裝修 1995 年創立、累積 1,600+ 件商業空間案件。本頁列出目前開放職缺、需求技能與應徵方式。",
    },
    en: {
      title: "Careers at HQ Design｜Design and construction, one team",
      description:
        "Want to work where designers and builders sit in the same team? HQ Design, founded 1995, lists open roles, required skills and how to apply here.",
    },
  },
  contact: {
    zh: {
      title: "聯絡惠強室內裝修｜台北商業空間設計施工諮詢",
      description:
        "想詢價或先討論可行性？惠強室內裝修位於台北市南港區，承接商業空間設計施工統包；來信請附空間類型、面積級距與預計進場時程。",
    },
    en: {
      title: "Contact HQ Design｜Commercial fit-out enquiries, Taipei",
      description:
        "Planning a commercial fit-out in Taiwan? HQ Design is based in Nangang, Taipei. Include space type, approximate area and target dates in your enquiry.",
    },
  },
  model: {
    zh: {
      title: "模型空間｜七段流程的圖說與 BIM 視圖",
      description:
        "想先看圖說再談案子？惠強室內裝修的模型空間收錄七段流程的製圖與 BIM 視圖，說明設計意圖如何一步步轉為可施工的圖面。",
    },
    en: {
      title: "Model space｜Drawings and BIM views across seven stages",
      description:
        "Want to see the drawings first? The model space collects the geometry and BIM views behind each of the seven stages HQ Design runs.",
    },
  },
  "image-policy": {
    zh: {
      title: "影像來源標示政策｜完工實景與設計視覺如何區分",
      description:
        "這張圖是完工實景還是設計提案？惠強室內裝修依實景、設計視覺、AI 光影強化與圖面四類標示每張影像，標示由資料單向推導，不由人手寫。",
    },
    en: {
      title: "Image provenance policy｜As-built versus visualisation",
      description:
        "Is this photograph or a rendering? HQ Design labels every image as as-built, design visualisation, AI-enhanced photo or drawing, derived from data.",
    },
  },
};

export function sectionCopy(section: string, locale: SeoLocale): Copy | null {
  return SECTION_COPY[section]?.[locale] ?? null;
}
