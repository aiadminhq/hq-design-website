# Astra 視覺先行交接包

日期：2026-09-06（Asia/Taipei）
用途：提供 Astra 新對話快速理解 HQ Design 官網、目前 Prototype、Fable 5.1 元件研究與視覺提案，先產出高擬真首頁版面設計圖，再進入網站整合。

## 0. 本輪目標

目前最值得保留的方向，是 Codex Motion Prototype 的整體視覺線，而不是目前主網站的平鋪清單。Astra 的第一階段只需要完成：

1. 讀懂整個專案的 authority、內容邊界與現有設計語言。
2. 以 Prototype 為主視覺基準，吸收 Fable 的可重用 component 結構與 Claude 的內容／token 規則。
3. 先提出一張桌機首頁高擬真版面設計圖，以及可供 image generation 使用的精確 prompt。
4. 暫不修改程式、CMS、Framer canvas、圖片來源或發布狀態。

## 1. 三方成果如何合併

| 來源 | 可採用 | 不可直接搬移 |
|---|---|---|
| Codex Motion Prototype | 白紙、墨線、Satoshi、mono metadata、作品影像場、scroll motion、tile → detail shared-element、Process section | Prototype 的 placeholder copy、只有 6 案的資料投影、prototype 專用樣式與未接通的正式路由 |
| Fable 5.1 元件研究 | Navigation、Portfolio Card、Gallery、Timeline、Client Card 的 component structure、props、responsive states | 個人 portfolio 的姓名、履歷、聯絡資訊、舊作品文字、外部圖片、Framer runtime |
| Claude 視覺提案 | 12-column grid、3:2 image system、60° slash、Dimension string、Title block、Sheet rail、Intent ↔ As-built、Model space、reduced motion | 未經確認的 content、把 proposal mockup 當成 production page、擴大橘紅或新增 token |
| Powerhouse Resources | editorial project index、featured lead + metadata + taxonomy filter 的資訊架構 | Powerhouse 圖片、Graphik／Optima、canvas cloud runtime、第三方 contact data |

整合原則：Prototype 決定第一眼的氣質，Claude 的 `content/**` 與 `web/lib/**` 決定資料事實，Fable 的 handoff 決定可重用元件語意，視覺提案決定 HQ 自有的介面裝置。

## 2. HQ Design 現況

- 正式網站技術方向：Next.js 15 App Router、React 19、Motion for React、next-intl、Zod。
- 正式內容層：33 個 project JSON、雙語欄位、影像 provenance、verified／provisional facts、project weight。
- 目前首頁仍是最小驗證骨架：把 33 案輸出成單純清單，尚未使用 `lead / w6 / w4 / reg / other` 的版面權重。
- 現有 Design System 已提供 `--brand: #D64518`、Satoshi、Noto Sans TC、Geist Mono、12-column grid、零圓角規則與 3:2 image system。
- 目前 Prototype 已在 `http://127.0.0.1:3000/` 開啟，可直接作為第一優先的 visual reference。

### 建議首頁內容結構

1. Header：HQDESIGN lockup、Projects、Process、About、語系切換。
2. Hero：大尺度 statement，搭配可捲動的作品影像場；不使用傳統行銷式滿版 banner。
3. Featured work：先突出 `SECOM NANGANG` 與 `Kimpton` 兩個 lead projects。
4. Editorial project field：以 12-column grid、3:2 image frame、不同 card weight 建立節奏，不作 33 案平鋪。
5. Project metadata：name、gloss、location／area／year 等 verified facts，以及由 `prov` 推導的影像性質標示。
6. Process：`AI × DESIGN × DELIVERY`，以流程軸與 60° line motion 連接設計意圖、BIM 與交付。
7. Footer／About：保持安靜、資訊清楚，避免將所有內容塞入首頁第一屏。

## 3. 視覺硬規則

- 背景以白紙、深 navy 墨線與低對比灰階為主；影像是主要顏色來源。
- `#D64518` 只作重點，單頁像素比例不超過 10%；可用於 CTA、eyebrow number、60° tick、focus ring、衝突標記。
- 英文使用 Satoshi，中文使用 Noto Sans TC，數字與標籤使用 Geist Mono。
- 一般元件零圓角；button 4px；logo mark 9.8%。
- 影像卡片、拼貼與 hero 使用 3:2；案例圖集可保留直式 2:3 例外。
- 角度只使用 0／30／60／90／120／150°；tile 不旋轉。
- 不使用 serif、emoji、gradient text、glassmorphism、neon、glow、無目的 WebGL 或 canvas。
- 漸層只限 HQ Mesh token 配對，且只作大面積底層；不可放在長篇文字後方。
- 每張影像都要保留 provenance；`viz`／`enh` 不得標成 `AS-BUILT`。
- Motion 必須有 reduced-motion 靜態 fallback；共享元素轉場失敗時仍能正常進入 route。

## 4. Astra 第一階段的輸出格式

請先不要寫程式。第一則回覆請依下列順序輸出：

1. **Project understanding**：用繁中整理專案目的、目前三方分工、source of truth、不可觸碰範圍。
2. **Visual synthesis**：說明 Prototype、Fable、視覺提案、Powerhouse 各自被保留的部分，以及衝突如何裁決。
3. **Homepage composition**：用 desktop 1440×1024 描述首屏、影像場、資訊階層、scroll 後段與 responsive 轉換。
4. **High-fidelity image prompt**：產出一份可直接交給 image generation model 的英文 prompt，附繁中設計意圖說明。
5. **Open decisions**：只列出真正需要使用者確認的視覺選項；不要要求使用者先處理 Git、worktree 或 implementation detail。

首張設計圖應是「高擬真 website art direction board」，不是 logo sheet、純 moodboard、手機 mockup 集合或程式碼截圖。設計圖需要讓人看出：導航、首屏 statement、影像場、project metadata、60° dimension line、Process 入口，以及桌機到手機的資訊收斂方式。

## 5. 參考資源索引

### 優先閱讀

- Prototype：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website-motion/prototype/next-motion-site/README.md`
- Prototype routes：`app/page.tsx`、`app/projects/page.tsx`、`app/projects/[slug]/page.tsx`
- Prototype motion：`lib/motion.ts`
- Prototype project model：`lib/projects.ts`
- Claude／Fable 協作契約：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/COORDINATION.md`
- Fable → Codex 自足交接：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/design/HANDOFF-web-design-fable-to-codex.md`
- HQ Design 視覺提案：`file:///Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/design/proposal/hq-design-visual-proposal-v0.3.html#top`

### Fable 5.1 元件研究

- 元件交接說明：`reports/framer-component-audit/fable-handoff/README.md`
- 可複製工作提示：`reports/framer-component-audit/fable-handoff/fable-prompt.md`
- 機器可讀 catalog：`reports/framer-component-audit/fable-handoff/design-component-catalog.json`
- 人工審查 catalog：`reports/framer-component-audit/fable-handoff/design-component-catalog.md`
- 保留／合併／淘汰邊界：`reports/framer-component-audit/keep-merge-retire.md`

優先研究：`Navigation`、`Card-Portfolio-Vertical`、`Gallery Section`、`Timeline`、`Card/Clients Card`。`Hero`、`Footer`、FAQ 與 experimental/WebGL 類元件只作待確認 reference。

### HQ Design 內容與 token

- Design tokens：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/web/app/_ds/hq.css`
- 共用 layout／component CSS：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/web/app/_ds/components.css`
- 正式首頁骨架：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/web/app/[locale]/page.tsx`
- Content schema：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/web/lib/content/schema.ts`
- Content loader：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/web/lib/content/loader.ts`
- Project records：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/content/projects/`
- Process figures：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/content/process/figures/`

### Framer port candidate

- `HqUnfocusedMesh`：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/design/framer-port/HqUnfocusedMesh.tsx`
- 使用與效能說明：`design/framer-port/README.md`
- 原始元件來源與刪減理由：`design/framer-port/SOURCE-NOTES.md`

這個元件只可作 bounded Model space／section transition candidate，不應變成首頁主視覺，也不應因此引入 Framer runtime。

## 6. 工具與操作邊界

可使用：本機 Prototype browser、local file read-back、Next.js／Motion 的現有 code、Fable catalog、視覺提案與已整理的 project content。
暫不使用：Framer canvas mutation、publish、CMS mutation、Powerhouse 資產複製、外部第三方圖片、未核准的 AI render、主網站直接大改。

若後續由 Astra 進入實作，應先提出視覺稿版本與變更範圍，再由使用者決定是否讓 Fable／Claude 分別整合到 `web/app/**`、`web/components/**` 與內容層；Codex Motion Prototype 維持隔離，不作正式網站 authority。
