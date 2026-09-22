# HQ Design Framer Website — ChatGPT Work Handoff

更新日期：2026-09-07（Asia/Taipei）  
任務狀態：Framer Canvas 與 CMS 已有實際修改；尚未完成 Localization、全頁 responsive Preview 與 Publish。  
主要目標：以 Framer 作為 HQ Design 正式網站平台，整合舊官網、近期 Next.js 內容與 Figma 選圖；繁體中文為預設語系，英文可切換。

## 給 ChatGPT Work 的續作指令

請接手 HQ Design Framer 官網整合，先執行 read-only audit，再延續已完成的 Canvas 與 CMS 狀態。不可把本機 Next.js dirty WIP 當成可覆寫目標，也不可在未取得使用者明確確認前 Publish、刪除 legacy pages／CMS items 或將 Draft 專案公開。

續作順序：

1. 連接 HQ Design Framer 專案後，先呼叫 `getProjectXml`、`getCMSCollections`，再回讀 Home、About、Projects 與 Projects CMS；不得依賴本文件中的 node IDs 判定現況。
2. 在 Framer Localization 將 `Chinese (Traditional Han) / zh-Hant` 設為主要語系，新增 English locale；使用 Framer 原生 Locale Selector，不建立兩套獨立 CMS。
3. 完成 `/services` 中文主文、English 翻譯，以及 `/projects/:slug` 的固定 UI 標籤與 Image reference 語系內容。
4. 修正全站 Nav／Footer：正式路徑為 `/`、`/projects`、`/services`、`/about`、`/careers`、`/contact`；移除舊 `/hq-home#...` 導覽依賴，但不得刪除 legacy pages。
5. 逐頁檢查 Desktop 1200、Tablet 1199–810、Phone 809 以下；中文使用 Noto Sans TC，英文使用 Satoshi，不使用 serif。
6. 只產生 Framer Preview 供人工內容與視覺確認。Preview、Publish、人工核可與正式交付必須分開回報。

## 專案入口

- Framer editor：<https://framer.com/projects/HQ-Design-Website--iqM3UmTum2Zx9sORaSmy-eIYoV>
- 目前正式網址：<https://mobile-empathy-306426.framer.app/>
- 本機 Next.js 中文來源：<http://localhost:3000/zh>
- 本機 Next.js 英文來源：<http://localhost:3000/en>
- 舊官網內容參考：<https://www.hqdesign.tw/>
- 本機內容來源：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website`

## 兩個 Framer MCP 端點

> 安全提醒：下列 URL 已遮罩憑證。請從使用者現有 MCP connector 設定或本次原始對話安全取得完整值；不要把 `secret` 或 `prooflyToken` 貼進聊天、截圖、repo、shell history 或公開文件。

1. Unframer MCP  
   `https://mcp.unframer.co/mcp?id=c6580500ffdcdb4ee8efd716fe832d6d5385b3e41f74f22771e9f7773d289dcd&secret=<REDACTED>`

2. Proofly MCP  
   `https://mcp.proofly.ae/mcp?projectId=e3bbb228505ffb07184262539fbfe76bf71eecfb9c8faeb541001851d6298ffa&secret=<REDACTED>&prooflyToken=<REDACTED>`

兩個端點指向同一個 HQ Design Website 工作範圍，但連線 session、目前 focused page 與可用方法可能不同。必須分別執行握手與窄範圍 read-back，不可因 URL 可開啟就判定 MCP 已連線。

## 已完成的 Framer Canvas 工作

### Home `/`

- Hero 保留 `SPACES, WITH PURPOSE. HQ DESIGN.` 品牌識別。
- 中文主標語更新為「從空間構想到落地交付」。
- 公司介紹更新為「設計，是想像。交付，讓它成真。」及中文服務敘事。
- 核心服務更新為：辦公空間設計、設計施工統包、機電消防整合、裝修工程管理。
- 工作流程更新為需求釐清與技術驗證、設計深化、BIM 協調、現場交付。
- AI × 參數化 × BIM 區塊與 CTA 已改為中文主敘事。
- MCP 回讀顯示 Home 主要靜態文案已中文化；未執行視覺 Preview。

### Projects `/projects`

- 頁首更新為「專案索引」、「完工空間與設計研究」、「空間，持續發生。」
- 介紹文案改為中文主版，CMS collection list 維持現有版型。
- MCP 回讀已確認主要頁首文字。

### About `/about`

- 公司故事、跨專業團隊、服務範圍、設計施工整合與公司沿革已中文化。
- 納入 1995 年創立、三十年經驗、全台累積超過 1,600 件商業空間案件。
- 納入 AI 事業發展與商業應用、參數化方法與 BIM 的角色說明。
- 三個 CTA 按鈕更新為「加入惠強」、「查看服務項目」、「聯絡惠強」。
- 客戶品牌名 SECOM、C.SUN、Kimpton Hotel、Popeyes、Soup Spoon 等保留英文商標。
- MCP 回讀已確認 35 個中文文字／Badge 更新與三個 Button label 更新。

### 中文 Typography

已建立並回讀以下 Framer text styles：

- `/ZH/Heading 1 L` — Noto Sans TC 700
- `/ZH/Heading L` — Noto Sans TC 700
- `/ZH/Heading 2` — Noto Sans TC 500
- `/ZH/Heading 4` — Noto Sans TC 500
- `/ZH/Body 20` — Noto Sans TC Regular
- `/ZH/Badge` — Noto Sans TC 500

Home 與 Projects 的 19 個主要中文文字節點已改用上述 styles。Component instance 內部中文字體仍需在 Localization／Component 層做 responsive 視覺確認。

## 已完成的 Projects CMS 工作

- Collection：`Projects`
- Collection ID：`p_qCPdaU5`
- 已建立／更新 21 筆 HQ Design 專案，全部維持 `Draft = true`。
- 每筆具有 Hero Image、Gallery（目前兩張）、Project name、Short text、Heading、Text、Year、Location、Scope、Size、Category。
- 專案欄位已改為中文優先、英文保留，例如：
  - `金普頓大安酒店｜KIMPTON DA AN HOTEL`
  - `志聖工業｜C.SUN INDUSTRIAL`
  - `大力水手許昌店｜POPEYES — XUCHANG`
- Project formatted text 目前順序為：中文摘要 → English summary → 影像來源說明 / Image reference。
- 已抽查 Kimpton、C.SUN、Popeyes；另修正四筆多段英文案名的語序。
- 影像類型仍明確區分 Completed-project photography、Design visualisation 與 AI-enhanced project photography。
- 四筆 legacy template items 仍存在且可能為 public：`stone-linen`、`white-horizon`、`midnight-structure`、`amber-sanctuary-residence`。未經確認不得刪除或覆寫。

### Projects CMS 欄位 IDs

| 欄位 | Field ID |
|---|---|
| Hero Image | `rTXTpRgl1` |
| Gallery | `yIT6pjNEK` |
| Project name | `N3RhcSzvj` |
| Short text | `vejOa_CI5` |
| Heading | `NTj6Wqkga` |
| Text | `dCPdaxOG_` |
| Year | `PQ_RrtUW2` |
| Location | `uc7CQSEk5` |
| Scope | `yHSinaN7g` |
| Size | `hjPEZX02f` |
| Category | `H9NRFCkaf` |

## Framer 頁面清單與目前狀態

| Path | Page ID | 狀態 |
|---|---|---|
| `/` | `augiA20Il` | 中文主文已寫入並由 MCP 回讀；待 Preview |
| `/projects` | `eajrWd4hw` | 中文頁首與 21 筆 CMS 已串接；待 Preview |
| `/projects/:slug` | `U0tVeRcqT` | CMS 動態內容已具備；固定標籤與語系 UI 待完成 |
| `/about` | `annK3gBX5` | 中文主文已寫入並由 MCP 回讀；待 Preview |
| `/services` | `nXU0Kvn42` | 現有四段模板仍待以 HQ 十項服務內容重整 |
| `/careers` | `d9Txg5rhK` | 待 read-back 與雙語整合 |
| `/contact` | `C3f3XeUfC` | 待 read-back；必須移除任何 legacy template 聯絡資料 |
| `/hq-home` | `GcRr7rS33` | 舊第一輪頁面，暫時保留，不可視為正式 `/` |

其他 legacy 路徑 `/blog`、`/gallery`、`/gallery-2`、`/page`、`/404` 仍可在專案中看到。是否封存、redirect 或刪除需另行取得使用者確認。

## 尚未完成與建議優先級

### P0 — 建立真正的中英文切換

- 在 Framer Localization 設定 `zh-Hant` 為 base locale、English 為第二 locale。
- 將中文視為 source；英文來源優先使用本機 Next.js `/en` 內容，不使用未審核 AI 直譯。
- 加入新版 Locale Selector，顯示「中 / EN」。
- 確認同一 CMS item 在兩個 locale 中共用 slug、圖片與 metadata，避免雙份 collection。
- 檢查 `lang`、`hreflang`、localized page paths 與 locale fallback。

### P0 — 完成 Services 與 Project 子頁

- `/services` 應採「完整的空間，整合的專業」為中文主題，納入十項服務：辦公空間設計、商業空間設計、設計施工統包、空間規劃顧問、機電消防整合、品牌空間識別、家具與軟裝、智慧空間／AIoT、裝修工程管理、完工保固服務。
- `/projects/:slug` 應完成返回專案索引、專案類型、專案說明、Client、Location、Area、Year、Scope、Image reference 與上一／下一案等固定標籤。
- 不可把 Design visualisation 誤標為完工實景。

### P1 — 修正全站導覽與 Footer

- 現有 Nav component 曾讀到 `/hq-home#projects`、`/hq-home#services`、`/hq-home#about`、`/hq-home#cta` 等舊路徑。
- 先在 Framer UI 聚焦 `nav-bar` component，再修正所有 Desktop／Mobile variants。
- 在同一輪加入 Locale Selector，並檢查 keyboard focus、mobile menu 與 active state。
- Footer 聯絡資料應以 `info@hqdesign.tw`、`+886 2 2557 3003` 與台北南港公司地址為 authority；不得沿用 template 的 Copenhagen／Mia Cruz／example@example.com。

### P1 — Responsive 與內容 QA

- Desktop、Tablet、Phone 分別檢查中文字換行、Heading 高度、CMS card 長度、Gallery 圖片裁切與 CTA。
- Home 的 Projects sticky section 曾讀到 `opacity="0.1"`；需在 Preview 判定是 animation 初始狀態還是誤設，不可直接改成 1。
- 確認中文 Noto Sans TC 與英文 Satoshi 都沒有 fallback 或 serif。
- 為所有 project hero／gallery 補齊 locale-specific alt text。

### P2 — SEO、Preview 與發布安全邊界

- 設定中文首頁、Services、About、Projects 與 CMS detail 的 title／description。
- CMS detail metadata 應使用 Project name 與 Short text 動態欄位。
- 產生 Preview 後逐頁 read-back；記錄可開啟、路徑、文字、圖片、語系與 responsive 狀態。
- 只有使用者或指定審核者明確確認後才能 Publish。

## 本機 WIP 與 owner boundary

- Repo：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website`
- Branch：`feat/geo-seo`
- 目前存在大量 staged／untracked WIP，包含 `content/`、`web/`、`design/`、`scripts/` 等。
- 本輪 Framer 工作將此 repo 視為 read-only content authority；沒有清理、stash、reset、checkout、commit 或 push。
- ChatGPT Work 若需要修改本機程式，必須先重新檢查 `git status`、`.workflow/active/WFS-hq-website-reset/workflow-session.json` 與 owner boundary，再決定是否需要 isolated worktree。

## 已知 Framer MCP／UI 限制

- `getNodeXml` 可讀取 Home、Projects、About；Services、Project detail、Careers、Contact 曾回傳 `Node is not a text node`。
- 這些頁面應先由 Framer Pages panel 或 `zoomIntoView` 聚焦，再呼叫 `getSelectedNodesXml`／`getNodeXml`；不可依 runtime DOM IDs 盲寫。
- Framer UI 曾因 Mac 鎖定無法操作，且兩個 Chrome profile 同時開啟同一 Framer 專案。續作前要先確認 MCP 實際跟隨哪個 browser／tab／focused page。
- `getProjectXml` 的 focused page 曾仍停留在 Home，即使另一個 Framer tab 已切到 Services。

## 交付與驗證定義

- Canvas text update 成功：只代表節點已修改。
- MCP read-back 成功：代表目前專案資料可讀到修改。
- Framer Preview 可開啟：代表可進行視覺與互動檢查。
- Publish 成功：代表公開網址已更新。
- 人工內容確認：代表使用者或指定審核者接受內容。
- 正式交付：以上狀態都不能互相替代。

目前公開網址仍可讀到舊英文文案；因此上述中文 Canvas／CMS 更新不可宣稱已上線。

## 完成條件

只有以下條件全部具備，才可將 HQ Design Framer 官網整合標記為完成：

- 中文為 Framer base locale，英文可以「中 / EN」切換。
- Home、Projects、Project detail、Services、About、Careers、Contact 皆完成雙語內容與正式路徑。
- 21 筆 HQ project CMS 在兩個 locale 中內容正確，影像來源與性質標示無誤。
- Nav、Footer、metadata、localized paths、alt text 與 404 行為完成。
- Desktop、Tablet、Phone Preview 檢查通過。
- 使用者完成內容與視覺確認。
- 使用者另行明確授權後才 Publish，並在公開網址逐頁 read-back。
