// Homepage copy. Source of truth: the static pages `index.html` / `zh/index.html` on main.
// Facts (numbers, names, areas) are copied verbatim; do not edit here without updating main.
export type Locale = "en" | "zh";

const img = (slug: string, file: string) =>
  `/assets/images/projects/${slug}/${file}`;

type Home = {
  meta: { title: string; description: string };
  nav: { href: string; label: string }[];
  cta: string;
  contactHref: string;
  hero: {
    label: string;
    title: [string, string];
    sub: string;
    sub2?: string;
    primary: [string, string];
    secondary: [string, string];
    stats: { num: string; unit: string; label: string }[];
  };
  doors: {
    label: string;
    title: string;
    sub: string;
    items: { kicker: string; title: string; body: string; cta: string; href: string }[];
  };
  wedge: { label: string; title: string; body: string; checks: string[]; cta: string };
  why: { label: string; title: string; sub: string; items: { title: string; body: string }[] };
  work: {
    label: string;
    title: string;
    sub: string;
    all: [string, string];
    items: { slug: string; src: string; nameEn: string; nameZh: string; meta: string; type: string }[];
  };
  services: {
    label: string;
    title: string;
    sub: string;
    items: { title: string; body: string; href?: string; link?: string }[];
    all: [string, string];
  };
  banner: { title: string; sub: string; cta: string };
  footer: {
    brand: string;
    brandSub: string;
    tagline: string;
    cols: { title: string; links: { href: string; label: string }[] }[];
    address: string;
    copy: string;
    tax: string;
  };
  langSwitch: { href: string; label: string };
};

export const home: Record<Locale, Home> = {
  en: {
    meta: {
      title: "HQ Design | Commercial Fit-Out for International Brands · Taipei",
      description:
        "Institutional-grade commercial fit-out for foreign-HQ enterprises, hotel groups and listed corporations expanding into Taiwan. 31 years. 1,600+ projects. Design & build under one contract.",
    },
    nav: [
      { href: "/projects.html", label: "Projects" },
      { href: "/services.html", label: "Services" },
      { href: "/local-partner-international-pm.html", label: "Local Partner" },
      { href: "/about.html", label: "About" },
      { href: "/faq.html", label: "FAQ" },
    ],
    cta: "Contact",
    contactHref: "/contact.html",
    hero: {
      label: "Commercial Design & Build · 31 Years · Taipei",
      title: ["Zero Downtime.", "Turnkey Delivery."],
      sub: "Institutional-grade fit-out for foreign-HQ enterprises, hotel groups and listed corporations expanding into Taiwan. Design and build, in-house. One contract. One PM.",
      primary: ["Start Your Project", "/contact.html"],
      secondary: ["View Portfolio", "/projects.html"],
      stats: [
        { num: "31", unit: "+", label: "Years in Operation" },
        { num: "1,600", unit: "+", label: "Commercial Projects" },
        { num: "9", unit: "+", label: "Listed clients" },
        { num: "12", unit: "M", label: "Post-Handover Warranty" },
      ],
    },
    doors: {
      label: "Two ways in",
      title: "Who are you working with?",
      sub: "Same licensed Taiwan team. Two clear doors — pick the one that matches your role.",
      items: [
        {
          kicker: "For the client",
          title: "You need a space built",
          body: "You are the occupier or brand. You want design and build under one contract, one PM, and a finished commercial interior in Taipei.",
          cta: "View services",
          href: "/services.html",
        },
        {
          kicker: "For designers & PMs abroad",
          title: "You need a licensed local partner",
          body: "You keep the design and the client. We file permits, run local compliance, procure, and supervise the site in Taiwan.",
          cta: "Local Partner",
          href: "/local-partner-international-pm.html",
        },
      ],
    },
    wedge: {
      label: "For Foreign-HQ Enterprises",
      title: "Opening your first Taipei office, hotel or flagship?",
      body: "We've delivered Taiwan launches for Kimpton (US), Popeyes (US), Soup Spoon (Singapore) and Cheogajip (Korea). We handle local permitting, vendor management, building-management coordination and procurement documentation in English — so your HQ can sign off without a translator.",
      checks: [
        "English specification notes, drawings & reporting",
        "Local permitting & building management liaison",
        "Procurement-grade documentation (audit-ready)",
        "Single PM from briefing to final handover",
      ],
      cta: "Talk to a Project Manager",
    },
    why: {
      label: "Why HQ",
      title: "Three Structural Advantages",
      sub: "What sets HQ apart for institutional and corporate clients",
      items: [
        {
          title: "Zero-Disruption Construction",
          body: "Phased, zone-by-zone construction preserving full business operations throughout. Institutional-grade noise, dust and access management. Weekly progress reports as standard.",
        },
        {
          title: "Single Contract, Single Team",
          body: "Design and build by the same in-house team. One contract. One PM. One point of accountability — from briefing to final handover. Eliminates the #1 source of cost overruns in commercial fit-out.",
        },
        {
          title: "Institutional-Grade Delivery",
          body: "31+ years, 1,600+ projects. Full procurement documentation package — audit-ready for listed-company and financial-institution compliance teams.",
        },
      ],
    },
    work: {
      label: "Selected Work",
      title: "Featured Projects",
      sub: "Office · Hospitality · F&B · Retail — fit-out across sectors",
      all: ["View All 19 Projects", "/projects.html"],
      items: [
        { slug: "secom-nangang-complex", src: img("secom-nangang-complex", "photo-01.jpg"), nameEn: "SECOM Nangang HQ", nameZh: "中興保全南港總部", meta: "6,000 sqm · Nangang, Taipei · 2025", type: "Corporate Office" },
        { slug: "polytron", src: img("polytron", "selected-20260923-01.webp"), nameEn: "Brightron Technology", nameZh: "保創科技", meta: "850 sqm · Nangang, Taipei · 2025", type: "Corporate Office" },
        { slug: "aiontech", src: img("aiontech", "selected-20260923-01.webp"), nameEn: "AIONTECH", nameZh: "博訊科技", meta: "825 sqm · Nangang, Taipei · 2025", type: "Corporate Office" },
        { slug: "kimpton", src: img("kimpton", "photo-01.jpg"), nameEn: "Kimpton Da An Hotel", nameZh: "金普頓大安酒店", meta: "330 sqm · Da An, Taipei · 2022", type: "Hospitality" },
      ],
    },
    services: {
      label: "Services",
      title: "Integrated Services",
      sub: "Six named services — from design-and-build to permits you can buy on their own",
      items: [
        { title: "Design & Build", body: "Design and construction by the same in-house team under one contract and one PM — from briefing through handover." },
        { title: "Permits & Compliance", body: "Interior-renovation permit filing, fire review, and completion inspection. Available standalone under your design lead." },
        { title: "Construction Management", body: "Site supervision, programme control, quality and safety oversight for commercial fit-out in Taiwan." },
        { title: "Public-Sector Tenders", body: "Documentation and packaging support for public-sector procurement tied to interior fit-out delivery." },
        { title: "MEP Coordination", body: "Mechanical, electrical, and fire-protection coordination so systems meet code and stay buildable." },
        { title: "Reinstatement & Handback", body: "End-of-lease reinstatement and structured handback for a clear, compliant close-out.", href: "/office-reinstatement.html", link: "Office reinstatement" },
      ],
      all: ["All Services", "/services.html"],
    },
    banner: {
      title: "Ready to start your Taiwan project?",
      sub: "Tell us your space requirements — we respond within one business day.",
      cta: "Get in Touch",
    },
    footer: {
      brand: "HQ Design CO., LTD.",
      brandSub: "惠強室內裝修股份有限公司",
      tagline: "Precision Craftsmanship. Zero Downtime. 31+ Years.",
      cols: [
        {
          title: "Navigation",
          links: [
            { href: "/projects.html", label: "Projects" },
            { href: "/services.html", label: "Services" },
            { href: "/local-partner-international-pm.html", label: "Local Partner" },
            { href: "/about.html", label: "About" },
            { href: "/faq.html", label: "FAQ" },
            { href: "/careers.html", label: "Careers" },
            { href: "/contact.html", label: "Contact" },
          ],
        },
        {
          title: "Services",
          links: [
            { href: "/services.html", label: "Design & Build" },
            { href: "/services.html", label: "Permits & Compliance" },
            { href: "/services.html", label: "Construction Management" },
            { href: "/services.html", label: "Public-Sector Tenders" },
            { href: "/services.html", label: "MEP Coordination" },
            { href: "/office-reinstatement.html", label: "Reinstatement & Handback" },
          ],
        },
      ],
      address: "9F, No.135 Jingmao 2nd Rd, Nangang, Taipei 115, Taiwan",
      copy: "© 2026 HQ Design CO., LTD. All rights reserved.",
      tax: "Tax ID 89956251 · hqdesign.tw",
    },
    langSwitch: { href: "/zh", label: "中文" },
  },
  zh: {
    meta: {
      title: "HQ Design 惠強室內裝修｜商業空間設計施工 · 台北",
      description:
        "為外資企業、飯店集團與上市櫃公司在台拓點打造機構級商業空間。設計與施工自有整合，一份合約、一位專案經理。",
    },
    nav: [
      { href: "/zh/projects.html", label: "專案" },
      { href: "/zh/services.html", label: "服務" },
      { href: "/zh/local-partner-international-pm.html", label: "在地夥伴" },
      { href: "/zh/about.html", label: "關於我們" },
      { href: "/zh/faq.html", label: "常見問題" },
    ],
    cta: "聯繫我們",
    contactHref: "/zh/contact.html",
    hero: {
      label: "Commercial Design & Build · Since 1995 · Taipei",
      title: ["營運不中斷。", "一站式交付。"],
      sub: "為外資企業、飯店集團與上市櫃公司在台拓點打造機構級商業空間。設計與施工自有整合，一份合約、一位專案經理。",
      sub2: "也服務在地企業辦公室：一位專案經理對口時程、追加與多方協調。百坪以上是我們接得住的協調與責任，不是承接門檻。",
      primary: ["開始您的專案", "/zh/contact.html"],
      secondary: ["查看作品", "/zh/projects.html"],
      stats: [
        { num: "30", unit: "+", label: "年深耕經驗" },
        { num: "1,600", unit: "+", label: "商業空間案件" },
        { num: "9", unit: "+", label: "上市櫃客戶" },
        { num: "12", unit: "月", label: "完工保固" },
      ],
    },
    doors: {
      label: "兩種合作入口",
      title: "您的角色是？",
      sub: "同一支具執照的台灣團隊。兩個清楚入口 — 依您的角色選擇。",
      items: [
        {
          kicker: "業主／品牌",
          title: "我需要打造一個空間",
          body: "您是使用單位或品牌方。需要設計施工一體、單一專案經理，在台北完成商業室內裝修。",
          cta: "查看服務",
          href: "/zh/services.html",
        },
        {
          kicker: "海外設計師與專案經理",
          title: "我需要合格的在地合作夥伴",
          body: "設計與客戶關係由您主導。我們負責台灣許可申請、法規合規、採購與現場監造。",
          cta: "在地合作夥伴",
          href: "/zh/local-partner-international-pm.html",
        },
      ],
    },
    wedge: {
      label: "服務外資總部企業",
      title: "正在開設台北辦公室、飯店或旗艦店？",
      body: "我們曾為 Kimpton（美國）、大力水手（美國）、匙碗湯（新加坡）、起家雞（韓國）完成台灣據點交付。從許可、廠商管理、物業協調到英文採購文件，讓海外總部無需翻譯即可簽核。",
      checks: [
        "英文規格註解、圖面與進度報告",
        "在地許可與物業管理協調",
        "符合稽核標準的採購文件",
        "從簡報到點交單一專案經理",
      ],
      cta: "與專案總監洽談",
    },
    why: {
      label: "為什麼是惠強",
      title: "三大結構優勢",
      sub: "機構級與企業客戶選擇惠強的關鍵",
      items: [
        {
          title: "零停工施工",
          body: "分區分階段施工，確保營運全程不中斷。機構級噪音、粉塵與動線管理，每週進度報告為標準配備。",
        },
        {
          title: "單一合約、同一團隊",
          body: "設計與施工由同一自有團隊執行。一份合約、一位專案經理、單一責任窗口 — 從需求確認到最終點交，消除商業裝修最常見的超支來源。",
        },
        {
          title: "機構級交付標準",
          body: "30+ 年、1,600+ 案件。完整採購文件包，符合上市櫃與金融機構合規稽核需求。",
        },
      ],
    },
    work: {
      label: "精選作品",
      title: "代表案例",
      sub: "辦公室 · 飯店 · 餐飲 · 零售 — 跨產業商業空間實績",
      all: ["查看全部案例", "/zh/projects.html"],
      items: [
        { slug: "secom-nangang-complex", src: img("secom-nangang-complex", "photo-01.jpg"), nameEn: "SECOM Nangang HQ", nameZh: "中興保全南港總部", meta: "1,800 坪 · 台北南港 · 2025", type: "企業辦公" },
        { slug: "polytron", src: img("polytron", "selected-20260923-01.webp"), nameEn: "Brightron Technology", nameZh: "保創科技", meta: "257 坪 · 台北南港 · 2025", type: "企業辦公" },
        { slug: "aiontech", src: img("aiontech", "selected-20260923-01.webp"), nameEn: "AIONTECH", nameZh: "博訊科技", meta: "250 坪 · 台北南港 · 2025", type: "企業辦公" },
        { slug: "kimpton", src: img("kimpton", "photo-01.jpg"), nameEn: "Kimpton Da An Hotel", nameZh: "金普頓大安酒店", meta: "100 坪 · 台北大安 · 2022", type: "飯店" },
      ],
    },
    services: {
      label: "服務項目",
      title: "整合服務",
      sub: "六大服務 — 從設計施工一體到可單獨委託的許可申請",
      items: [
        { title: "設計施工一體", body: "同一自有團隊負責設計與施工，一份合約、一位專案經理，從需求確認到點交。" },
        { title: "許可與法規", body: "室內裝修許可、消防審查與竣工查驗協調。可單獨委託，設計主導權仍屬您方。" },
        { title: "工程管理", body: "現場監造、進度管控、品質與安全監督，服務台灣商業裝修專案。" },
        { title: "政府採購", body: "協助整理與包裝公共工程／政府採購所需之室內裝修相關文件。" },
        { title: "機電整合", body: "機電與消防系統與室內設計協調，符合法規並確保可施工性。" },
        { title: "復原與點交", body: "租約到期復原與結構化點交，讓業主與下一位承租人清楚交接。", href: "/zh/office-reinstatement.html", link: "退租復原工程" },
      ],
      all: ["全部服務", "/zh/services.html"],
    },
    banner: {
      title: "準備好開始台灣專案了嗎？",
      sub: "告訴我們您的空間需求 — 一個工作天內回覆。",
      cta: "聯繫我們",
    },
    footer: {
      brand: "惠強室內裝修股份有限公司",
      brandSub: "HQ Design CO., LTD.",
      tagline: "匠藝專工，一應皆備。30+ 年 · 1,600+ 案。",
      cols: [
        {
          title: "導覽",
          links: [
            { href: "/zh/projects.html", label: "專案" },
            { href: "/zh/services.html", label: "服務" },
            { href: "/zh/taipei-office-renovation.html", label: "台北辦公室裝修" },
            { href: "/zh/office-relocation.html", label: "辦公室搬遷" },
            { href: "/zh/local-partner-international-pm.html", label: "在地夥伴" },
            { href: "/zh/about.html", label: "關於我們" },
            { href: "/zh/faq.html", label: "常見問題" },
            { href: "/zh/careers.html", label: "加入我們" },
            { href: "/zh/contact.html", label: "聯繫我們" },
          ],
        },
        {
          title: "服務",
          links: [
            { href: "/zh/services.html", label: "設計施工一體" },
            { href: "/zh/services.html", label: "許可與法規" },
            { href: "/zh/services.html", label: "工程管理" },
            { href: "/zh/services.html", label: "政府採購" },
            { href: "/zh/services.html", label: "機電整合" },
            { href: "/zh/office-reinstatement.html", label: "復原與點交" },
          ],
        },
      ],
      address: "115台北市南港區經貿二路135號9樓",
      copy: "© 2026 惠強室內裝修股份有限公司 · HQ Design CO., LTD.",
      tax: "統一編號 89956251 · hqdesign.tw",
    },
    langSwitch: { href: "/", label: "EN" },
  },
};
