# Framer Template 評估

更新日期：2026-09-03（Asia/Taipei）

## 結論

建議延續目前已複製並完成 CMS 盤點的 **Archiste**，不另行購買 template。它已具備 HQ Design 所需的建築／室內設計語氣、寬幅圖片、留白、Projects CMS、Project detail 與 Process 內容；改造成本主要集中在 HQ 品牌、雙語內容、專案資料與比較模組，而非重建整體資訊架構。

若需要免費備選，**ARCHTER** 是最接近的替代方案。**ASHLAR** 可作為「設計意圖 → 技術驗證 → BIM／施工圖 → 現場交付」流程敘事的參考。**Forja** 僅適合借鏡比較表與 AI 服務銷售架構；視覺系統不適合作為 HQ Design 主站底稿。Nave 因 serif typography 會增加品牌重構成本，不建議採用。

## 決策矩陣

| Candidate | 價格 | Process／Timeline | 比較模組 | CMS Project grid／detail | 3:2 圖像適配 | HQ 品牌適配 | 建議 |
|---|---:|---|---|---|---|---|---|
| **Archiste（目前專案）** | Free／已複製 | ✅ 已有 Process component | △ 需原生新增 | ✅ Projects + Single Project CMS | △ 可透過現有寬幅 frame 調整 | ✅ 留白、克制、建築導向 | **主線保留** |
| **ARCHTER** | Free | ✅ Numbered process／timeline | △ 需新增 | ✅ Project gallery、分類與 case study | ✅ 大圖與寬幅版面友善 | ✅ 黑白、sans-serif、留白明確 | 免費 fallback |
| **ASHLAR** | US$39 | ✅ Process page 與 drawing-set 敘事 | △ 需新增 | ✅ Projects CMS + detail | △ before／after reveal 偏客製 | ✅ 敘事吻合；需收斂 brass／motion | 流程呈現參考 |
| **Nave** | US$99 | ✅ 獨立 Process page | △ 需新增 | ✅ CMS archive + case study | ✅ 大圖、編輯式 spacing | ❌ 畫面以 serif heading 為主 | 不採用 |
| **Forja** | US$129 | ✅ AI sales process | ✅ 原生 head-to-head comparison | ✅ Blog、case studies、careers CMS | ❌ SaaS card 系統不利空間作品 | ❌ AI agency／古典畫面語彙偏離 HQ | 僅借鏡 section architecture |

圖像比例欄位是根據 Marketplace preview 與已擷取畫面判讀，並非 template 內部 frame constraint 的程式化驗證；正式套用時仍需用 3:2 測試圖在 Desktop、Tablet、Phone 三個 breakpoint 讀回 crop 與 focal point。

## 候選詳情

### 1. Archiste — 建議保留

- Marketplace：https://www.framer.com/marketplace/templates/archiste/
- Preview：https://archiste.framer.website/
- 價格：Free
- 官方列出 Home、About、Services、Projects、Single Project CMS、Gallery、Careers、Blog、Contact、404，並標示 CMS-powered projects／blog、responsive 與 SEO-ready。
- Live Framer MCP 已讀回目前副本共有 13 個 web pages、1 個 design page、27 個 reusable components，以及 Articles、Categories、Projects 三個 user-managed CMS collections。
- 目前版型已具備 Process 內容，可直接改寫為 HQ 的設計意圖、技術驗證、BIM、施工圖與現場交付，不必更換整站底稿。
- [擷取畫面](screenshots/01-archiste-current.jpg)

### 2. ARCHTER — 最佳免費備選

- Marketplace：https://www.framer.com/marketplace/templates/archter/
- Preview：https://archter.framer.website/
- 價格：Free
- 官方列出 CMS project gallery、category tagging、individual case study、numbered process／timeline、responsive components 與 SEO-friendly structure。
- 視覺以 minimal black-and-white、generous whitespace、bold editorial typography 與 full-bleed imagery 為主，轉換到 HQ 品牌的阻力低。
- 只有 4 個主要頁面，若取代 Archiste，仍需補齊 Blog、Careers 與多層服務內容，因此不優於延續現有專案。
- [擷取畫面](screenshots/02-archter.jpg)

### 3. ASHLAR — 流程敘事參考

- Marketplace：https://www.framer.com/marketplace/templates/ashlar/
- 價格：US$39（Single-Use）
- 官方列出 15 pages、Projects／Journal 兩個 CMS collections、Work CMS、Project detail、Process、Materials 與 drawing-to-built reveal。
- 「drawing set → built result」的設計可轉譯為 HQ 從設計意圖到技術交付的證據鏈，但 cursor reveal、drafting transition 與 brass accent 會增加維護與效能驗證成本。
- 建議只參考 Process／Materials 的敘事分段，不購買、不移植 custom effect。
- [擷取畫面](screenshots/03-ashlar.jpg)

### 4. Nave — 資訊架構完整，但 typography 不符

- Marketplace：https://www.framer.com/marketplace/templates/nave/
- 價格：US$99（Single-Use）
- 官方列出 CMS project archive／case study，以及 Home、Projects、Project Detail、About、Team、Process、Contact、404。
- 大圖、spacing 與 dual-theme 對建築作品有利，但 preview 的 serif display type 與 HQ 現有 sans-serif design system 不一致；重建 typography 後才可採用，失去購買 template 的效率優勢。
- [擷取畫面](screenshots/04-nave.jpg)

### 5. Forja — 比較模組參考

- Marketplace：https://www.framer.com/marketplace/templates/71982/
- 價格：US$129（Single-Use）
- 官方列出 fixed-price tiers、head-to-head agency comparison、process、case studies，以及 CMS-powered blog／case studies／careers。
- 它能提供 AI 事業與流程服務的銷售架構參考，但 SaaS card density、古典畫面、pricing-first narrative 與空間設計品牌不一致。
- 建議在 Archiste 內以 HQ tokens 原生重建一個節制的 comparison section，不購買 Forja。
- [擷取畫面](screenshots/05-forja.jpg)

## Archiste 實作方向

1. 保留 Archiste 的 global navigation、Projects CMS、Project detail、Gallery 與整體留白節奏。
2. 將目前 Process 區段改為五階段：Design Intent、Technical Validation、BIM Coordination、Construction Documentation、Site Delivery。
3. 新增一個原生 comparison section，比較 Traditional Delivery、HQ Integrated Workflow 與 AI-assisted Validation；避免套用 SaaS pricing cards。
4. Project card 與 detail image frame 統一採 3:2 預設，並在 CMS 補 focal-point／crop 規範；Gallery array 僅保存 image，alt 與 provenance 改放案例層級欄位或獨立 Media collection。
5. 先在 Desktop 建立 tokens 與 layout，再逐項讀回 Tablet／Phone。任何 Publish、custom domain 或付費 template 購買仍須另行確認。

## 證據邊界

- Marketplace 名稱、價格、頁面與功能以 2026-09-03 的 Framer 官方頁面為準；價格可能變動，購買前需再次讀回。
- Screenshots 是候選比較證據，不代表已匯入、購買或套用。
- 目前 Archiste 副本尚未 Publish；本報告也未修改 Framer canvas 或 CMS content。
