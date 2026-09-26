# HQ Design 官網重置 — 已確認指導規格書

**Session**: WFS-hq-website-reset
**產生日期**: 2026-09-03
**類型**: brainstorming / guidance-specification
**執行模式**: auto（完整多角色分析）
**選定角色**: system-architect, ux-expert, ui-designer, product-manager, data-architect
**權威來源**: 本文件為下游所有階段的單一事實來源

---

## 1. 專案定位與目標

### 1.1 CONFIRMED 專案性質

本專案為 **HQ Design（惠強室內裝修股份有限公司）官網整體重建**。

CONFIRMED：重置範圍為「整體重建，只留內容素材」。既有 HTML 結構、CSS、資訊架構、CMS schema 與視覺實作 MUST NOT 被視為約束；文字與照片素材 MUST 被視為可沿用資產。

### 1.2 CONFIRMED 核心差異化敘事

網站主軸 MUST 是「AI 深度整合設計流程」，而非「AI 作為渲染圖工具」。

權威敘事來源為 `HQ Company for profiles-260903.pdf`（21 頁，2026-09-03 產出）：

| 來源 | 內容 | 網站用途 |
|---|---|---|
| P01 | `AI parametric × Construction EXECUTION`／完美實現 藝顯境成／1,600+ · 30+ · EST. 1995 | Hero 主標與信任數據 |
| P02 | 30 年實戰經驗 → AI 可用資料庫 → 可複用／可迭代／可規模化智慧生產系統 | About 敘事骨幹 |
| P03 | 1995 → 2010 → 2019 → 2022 → 2023 → 2024 → 2025 → **2026.4 AI TRANSFORMATION** | 里程碑時間軸 |
| P04 | 四項核心能力：空間設計／專案管理／施工交付／技術協調 | 能力區塊 |
| P05 | 五段流程：Design Intent Review → Technical Validation → BIM Coordination → Construction Documentation → Site Delivery | 流程敘事主幹 |
| P06 | **THE HQ AI ADVANTAGE — 「AI 不只畫圖，而是提升整個交付」**，含一般流程 vs HQ AI-Integrated 對照 | 差異化核心頁 |
| P07 | **PARAMETRIC ADVANTAGE — 一個條件改變，整套空間同步更新**（ONE CHANGE. MULTIPLE VERIFIED OPTIONS.） | 參數化說明頁 |
| P08 | **BIM ADVANTAGE — 在進場前，把問題先解決** | BIM 說明頁 |
| P09 | 施工深化與交付六步驟 | 交付能力頁 |
| P10 | 十項服務 | 服務頁 |
| P11 | 組織架構（含 AI 部門：AI & Parametric Design、BIM & Digital Coordination、Smart Office & AIoT） | 組織可信度 |
| P12–P18 | 案例：SECOM 南港總部 5,940 sqm、C.SUN、AIONTECH、LIWEI、眾寶保經、DXC | 案例庫 |

### 1.3 CONFIRMED 表達原則

CONFIRMED：差異化敘事 MUST 以「業主看得懂」的方式呈現。

- 技術名詞（parametric design、BIM coordination、construction documentation）MUST 搭配視覺化圖解或情境圖，MUST NOT 僅以文字條列呈現。
- 每一項技術主張 SHOULD 對應一個業主可感知的效益陳述（如「不必從頭重畫」、「問題在進場前被發現」）。
- 頁面 SHOULD 沿用簡介 PDF 已驗證的「對照表」修辭（一般流程 vs HQ AI-Integrated），因該結構已具備業主可讀性。

### 1.4 CONFIRMED 成功判準

- 網站 MUST 能讓機構型客戶（外商 HQ、飯店集團、上市公司、政府標案）在不具備設計專業的前提下，理解 HQ 與同業的流程差異。
- 網站 MUST 完成中英雙語對等呈現。
- 網站 MUST 落實既有品牌 CIS 定位「AI × Design 的未來實驗場」，該定位目前完全未在上線版執行。
- 品質優先於時程：CONFIRMED 無硬性上線期限，舊站 MAY 持續服務至新站達到可接受品質。

---

## 2. 概念與術語

| 術語 | 定義 | 別名 | 類別 |
|---|---|---|---|
| Design Token 3.0 | 本次重建產出的單一權威設計 token 體系，收斂現存三套不一致的 token 定義 | Token 3.0、DS 3.0 | core |
| DESIGN.md v1.0 | `HQ Design - Design System/Claude Design/DESIGN.md`，既有品牌 CIS 與視覺 DNA 規範，主色 #D64518 | CIS 規範、品牌規範 | core |
| colors_and_type.css v2.0 | `HQ Design - Design System/colors_and_type.css`，10 階色票與 Aeonik 字體定義，從未落地至網站 | Design Tokens v2.0 | core |
| 上線版 style.css | `hq-design-website/assets/css/style.css`，現行上線網站樣式（deep navy #1C2B3A + Inter），與品牌規範不一致 | 現行樣式 | technical |
| 視覺 DNA | DESIGN.md 第 2 節定義的圖形語彙：等粗 monoline、60° 斜向軸、疊層穿插、製圖留白、直角網格、僅允許 60/120/30/150 角度族 | 圖形語彙、LOGO 語彙 | core |
| HQ Mesh | DESIGN.md 允許的受控漸層／質地系統，含 Grain Texture 與 Swiss Slicing Pattern | Mesh、品牌質地 | core |
| Claude Design 元件庫 | `Claude Design/preview/` 與 `ui_kits/website/`，既有 HTML 元件預覽與 React JSX 網站元件 | 既有元件庫 | technical |
| shader 系統 | `Claude Design/brand-guide/` 下四套 WebGL shader：mesh、beams、grid-scan、pattern | WebGL shader | technical |
| 欄位層雙語 | 每一內容欄位同時持有 zh 與 en 兩組值，由單一 CMS 記錄驅動兩個語言版本 | field-level bilingual | core |
| 影像來源分層政策 | 規範實拍照片、實拍修復、生成式影像各自可用區域與標註義務的規則集 | provenance policy | core |
| 代理人分工 | Claude Code 與 Codex 在本專案的職責邊界定義 | agent orchestration | technical |
| Fable 設計升級軌 | 以 Fable 模型進行風格提案、平行對照與定稿升級的獨立工作軌 | Fable track | core |
| 能力實測 | 針對 Framer code component 承載 React 元件與 WebGL shader 的效能與行動端實地驗證 | capability probe | technical |

**術語規則**：所有下游文件 MUST 使用上表正式術語；別名僅供對照。角色分析新引入的術語 MUST 回寫本表。

---

## 3. Non-Goals（明確排除範圍）

> **來源說明**：以下各項為從使用者已確認選擇**推導**而得，未經獨立確認。標註「推導」者若與實際意圖不符，MUST 於分析階段回報修正。

| 排除項 | 理由 | 來源 |
|---|---|---|
| 更換品牌主色 #D64518 | 使用者確認「保留主色與 DNA，重建的是系統與應用」 | 直接確認 |
| 重新設計 LOGO 與視覺 DNA 圖形語彙 | 同上；monoline、60° 軸系、Swiss grid 等 MUST 保留 | 直接確認 |
| 既有品牌資產（brand-guide 33 頁雙語 deck、公司簡介、名片）改用 Satoshi | 使用者確認「先只網站用 Satoshi，舊資產不動」 | 直接確認 |
| 更換發佈平台（不改用自建 Next.js 為主要發佈層） | 使用者確認「維持 Framer 發佈（延續 ADR-001）」 | 直接確認 |
| 任何襯線體的使用 | 使用者明示「絕對不要有襯線體」；DESIGN.md 亦載明「No serifs. Anywhere. Ever.」 | 直接確認 |
| 行動端原生 App | 本次為網站重建，未見任何 App 需求訊號 | 推導 |
| 會員系統、電商結帳、線上即時報價 | 未見需求訊號；且合約金額屬機密，MUST NOT 於公開網站呈現 | 推導 |
| 舊 HTML 頁面的樣式修補 | 「整體重建」意味舊 inline override MUST 被廢棄而非修補 | 推導 |

---

## 4. UI 設計決策（ui-designer）

### 4.1 SELECTED 視覺權威

**設計 token 收斂**：CONFIRMED 建立 Design Token 3.0。

- Token 3.0 MUST 保留 `#D64518` 為品牌唯一英雄色，並保留 DESIGN.md 第 2 節全部視覺 DNA。
- Token 3.0 MUST 重建的範圍為：層級、間距、字型階、動態、語意層（semantic tokens）。
- Token 3.0 MUST 成為單一權威來源，並 SHOULD 能同時供給 Framer、Figma 與程式碼三個消費端。
- **Rationale**：現存三套 token（DESIGN.md v1.0、colors_and_type.css v2.0、上線版 style.css）互不一致，且最完整的 v2.0 從未落地。問題不在方向缺失，而在系統未收斂。

### 4.2 SELECTED 字體

- 英文字體 MUST 為 **Satoshi**（取代 Aeonik）。
- 中文字體 MUST 為 **Noto Sans TC**。
- 任何襯線體 MUST NOT 出現於網站任何位置。
- 遷移範圍 CONFIRMED 僅限網站；brand-guide、公司簡介、名片等既有資產 MUST 維持 Aeonik 不動。
- **已知後果**：網站與公司簡介將出現字型不一致。此為使用者明示接受的取捨，MUST 於交付時明確告知，並 SHOULD 提出後續全品牌遷移的建議時點。
- **未解事項**：`Claude Design/fonts/` 僅有 Aeonik。Satoshi 字檔取得與商用授權 MUST 於執行前確認。

### 4.3 視覺強度取捨

- 大改版 CONFIRMED 為使用者期望。
- 惟 DESIGN.md 明載「少即是多、留白是主角、橘紅克制、禁止霓虹／玻璃擬態／高飽和科技色」。
- ui-designer MUST 提出「如何在不違反既有品牌約束的前提下達成大改版感受」的具體手段，並 MUST 標示任何需要鬆綁既有規範的提議。

### 4.4 Figma 視覺元素

- 權威檔案：`https://www.figma.com/design/3viWBkQGZAEQnJntysBxZ7/HQ-Design`（fileKey `3viWBkQGZAEQnJntysBxZ7`）
- 頁面：P01 (`0:1`)、**P02 (`590:276`，使用者指向)**、P03 (`112:3034`)
- **已知限制**：`get_metadata` 對 P02 整頁的回應超出單次上限而失敗。ui-designer MUST 改以子節點分層讀取或 `get_screenshot` 取得視覺，MUST NOT 重複整頁請求。

---

## 5. UX 決策（ux-expert）

### 5.1 SELECTED 資訊架構主軸

CONFIRMED：IA 主軸 MUST 為「AI 深度整合設計流程」的差異化敘事，而非單純的案例導向或服務導向。

流程鏈 MUST 完整呈現：site survey → parametric design → schematic design → 設計資產 → construction drawing → AI construction management／project management。

- ux-expert MUST 將此流程鏈映射為可導覽的資訊結構，並 MUST 說明使用者如何在其中定位自己的關注點。
- ux-expert SHOULD 評估此流程鏈與簡介 PDF P05 既有五段流程（Design Intent Review → Technical Validation → BIM Coordination → Construction Documentation → Site Delivery）的對應關係，並指出兩者差異或需整併之處。
- **待處理事實**：使用者陳述的流程鏈以 site survey 起頭並延伸至 AI 專案管理，較 P05 五段流程更前端也更後端。此落差 MUST 被明確處理，MUST NOT 假設兩者等同。

### 5.2 受眾

依 DESIGN.md 第 1.5 節，受眾 MUST 包含：商辦／企業空間客戶、B2B 工程採購、政府標案、展會觀眾、資深設計師招募。

ux-designer 與 product-manager SHOULD 就「單一網站服務五類受眾」的可行性提出分層或分流建議。

### 5.3 雙語

CONFIRMED：中英完整雙語，**欄位層並存**。

- 每一內容欄位 MUST 同時持有 zh 與 en 值。
- 語言切換 MUST 保持使用者所在頁面的對應關係。
- **已知落差**：現行實作為 `index.html` 使用 `lang="en"`、其餘四頁使用 `lang="zh-TW"`，且無獨立中文版檔案。此斷裂狀態 MUST 被完全取代。
- **未解事項**：DESIGN.md 第 0.6 節載明「中文為主、英文為輔」，與「完整對等雙語」存在語意落差。主從關係 MUST 於分析中釐清。

---

## 6. 系統架構決策（system-architect）

### 6.1 SELECTED 發佈層

CONFIRMED：維持 Framer 作為發佈層，延續 ADR-001（Notion authoring → Framer CMS → Unframer git 快照）。

### 6.2 Framer template 與 MCP

- Framer template MUST 重新從 Framer marketplace 挑選適合的範本作為改造基底。原遷移計畫「Framer template 候選（待使用者拍板）」至今未解。
- Framer MCP 連線 MUST 重新建立。**已驗證**：目前 MCP 未連線，錯誤訊息為 `Framer plugin not connected`，須於 Framer 內開啟 MCP plugin（cmd-K 搜尋 MCP）。
- template 選型 MUST 以本規格的 IA 主軸與視覺方向為篩選條件，MUST NOT 先選 template 再遷就 IA。

### 6.3 技術承載能力實測

CONFIRMED：由 system-architect 實測後建議，本規格不預設結論。

MUST 實測並回報的項目：
1. Framer code component 承載既有 React JSX 元件（`ui_kits/website/components/`：Hero、TopNav、TrustedBy、FeaturedProjects、WhyHQ、ForeignHQSection、Services、InnerViews、FooterAndCTA）的可行性。
2. Framer code component 承載四套 WebGL shader（mesh、beams、grid-scan、pattern）的效能表現與行動端行為。
3. Satoshi 自訂字體於 Framer 的載入方式與授權限制。
4. 欄位層雙語在 Framer CMS ＋ Notion plugin 組合下的實作方式與限制。
5. 若 Framer 承載力不足，MUST 提出逃生路徑（降級為預渲染素材、或關鍵頁改自建）與其成本。

**約束**：實測結論 MUST 附具體證據（實際測量值或官方文件引用），MUST NOT 僅憑推測給出建議。

### 6.4 代理人分工

CONFIRMED：Codex 納入本專案，職責為 macOS GUI 視窗操作與 computer_use 執行，並 MAY 支援 UI/UX 與素材生成。

system-architect MUST 定義 Claude Code 與 Codex 的職責邊界、交接格式與衝突避免機制。

### 6.5 已知環境事實

| 項目 | 狀態 | 影響 |
|---|---|---|
| Framer MCP | 未連線（已驗證） | 執行前置條件 |
| Figma MCP | 已連線；HQ Design team 為 pro tier／Full seat | 可直接讀取設計檔 |
| Figma `get_metadata` 整頁 | P02 回應超限失敗（已驗證） | MUST 分層讀取 |
| repo remote | 本機為 `chr1st1anw0w/hq-design-website`；使用者陳述為 `aiadminhq/hq-design-website` | **MUST 釐清發佈權與帳號歸屬** |
| 建置流程 | 無（純靜態） | 新架構需重新定義 |

---

## 7. 資料架構決策（data-architect）

### 7.1 既有資產狀態

- `cms/schemas/`：6 個 JSON Schema（globals、projects、services、careers、homepage、about），已具 zod／ajv 驗證。
- `cms/data/`：已完成抽取，含 21 個專案 JSON。
- 抽取工具鏈：`extract-html.ts`、`parse-*.ts`（含測試）、`validate-schemas.ts`、`push-to-notion.ts`。

### 7.2 SELECTED schema 處理原則

- 「整體重建，只留內容素材」CONFIRMED：既有 schema 結構 MUST NOT 被視為約束。
- 惟既有 `cms/data/` 的**內容值** MUST 被視為可沿用素材，MUST NOT 重新人工抽取。
- data-architect MUST 產出新舊 schema 的對映策略，並 MUST 標示無法自動對映而需人工補充的欄位。

### 7.3 雙語資料模型

data-architect MUST 設計欄位層雙語模型，並 MUST 同時滿足：
- git 內 JSON 作為 single source of truth
- Notion DB 作為 authoring 介面（受 property 上限與 3 req/s rate limit 約束）
- Framer CMS collection 作為消費端

### 7.4 影像來源可稽核性

CONFIRMED：影像來源分層政策由分析產出（見 §8.2），惟資料層 MUST 支援：
- 每一影像資產 MUST 具備來源欄位，可區分實拍／實拍修復／生成式。
- 生成式影像 MUST 可追溯產生工具與提示詞。

### 7.5 資產管線

- `assets/` 現為 **525MB**，未經最佳化管線。
- data-architect 與 system-architect MUST 共同定義影像最佳化管線（尺寸階、格式、命名、CDN 或 Framer 資產策略）。

---

## 8. 產品決策（product-manager）

### 8.1 SELECTED 時程

CONFIRMED：無硬性期限，品質優先。舊站 MAY 持續服務。

此決策 CONFIRMED 授權執行高工作量方案，包含 Fable 全程參與與平行對照組。

### 8.2 影像真實性分層政策

CONFIRMED：由分析產出分層政策，本規格不預設結論。

**約束前提**：HQ 主要客戶為外商 HQ、飯店集團、上市公司與政府標案，實績真實性為信賴基礎。product-manager MUST 在政策中處理：
- 各區域（hero／服務頁／案例頁／流程圖解）分別允許的影像類型。
- 生成式影像的標註義務與標註形式。
- 政府標案情境下對實績呈現的額外要求。
- **紅線**：政策 MUST NOT 允許任何可能使業主誤認未完成案件為既有實績的呈現方式。

### 8.3 AI 工具鏈定位

CONFIRMED 四種用途全部納入：
1. 設計探索期的視覺提案與 moodboard
2. 補齊拍攝不足的案例情境圖（受 §8.2 政策約束）
3. 品牌級主視覺與 hero 素材
4. 影片／動態內容（案例走查、品牌短片）

工具清單：Figma、Framer、Higgsfield、flora.ai、Weavy、Claude Design（`HQ Design - Design System/Claude Design/`）。

**未解事項**：Weavy 的具體職責尚未定義，MUST 於分析中釐清或明確標示為不使用。

### 8.4 Fable 設計升級軌

CONFIRMED：Fable 三種用法全部採用——設計探索期風格提案、平行對照組、定稿後視覺升級。

product-manager MUST 明確標示此決策的成本結構，因三種用法疊加意味同一設計工作至少執行兩遍。product-manager MUST 提出各用法的介入時點、產出格式與評比標準，並 SHOULD 標示若需縮減時應優先保留哪一種用法。

---

## 9. 跨角色整合點

| 整合點 | 涉及角色 | 說明 |
|---|---|---|
| Token 3.0 的三端一致性 | ui-designer, system-architect, data-architect | token 需同時餵 Framer、Figma、程式碼；格式與同步機制 MUST 一致 |
| 流程鏈敘事的視覺化需求 | ux-expert, ui-designer, product-manager | IA 主軸決定需要哪些圖解，圖解需求決定生成式工具的工作量 |
| 雙語模型的三層落地 | data-architect, ux-expert, system-architect | 欄位層雙語需同時滿足 git／Notion／Framer 三端 |
| shader 承載與視覺強度 | system-architect, ui-designer | shader 是「參數化」敘事的天然視覺語言，但 Framer 承載力未知，直接影響視覺方案可行性 |
| 影像政策與資料欄位 | product-manager, data-architect | 政策決定需要哪些來源欄位 |
| 代理人分工與工具鏈 | system-architect, product-manager | Codex／Claude Code 邊界需對應各工具的實際操作方式 |

---

## 10. 風險與約束

| 風險 | 影響 | 緩解方向 |
|---|---|---|
| Framer 無法承載 shader 與 React 元件 | 視覺方案需大幅降級，可能推翻 ADR-001 | §6.3 能力實測 MUST 先行；MUST 備逃生路徑 |
| Satoshi 商用授權未確認 | 字體決策無法執行 | 執行前 MUST 確認授權與字檔來源 |
| 生成式影像損害機構客戶信賴 | 商業信譽風險，政府標案風險 | §8.2 分層政策 MUST 設紅線 |
| Fable 三種用法疊加導致工作量失控 | 專案延宕（惟無硬期限，風險可承受） | §8.4 MUST 標示縮減優先序 |
| repo 歸屬不明 | 發佈權限與部署失敗 | MUST 於執行前釐清 |
| 525MB 資產進入 Framer | 效能與額度風險 | 資產管線 MUST 先於內容遷移 |
| DESIGN.md「少即是多」與「大改版」期望張力 | 品牌一致性與期望落差 | §4.3 MUST 明示任何需鬆綁的規範 |
| 既有 cms/data 投入可能部分作廢 | 沉沒成本 | §7.2 內容值 MUST 沿用，僅結構重建 |

---

## 11. 功能點分解

**約束**：最多 8 項｜各項須可獨立交付｜ID 格式 `F-{3 位數}`

| ID | 名稱 | 範圍 | 相關角色 | 優先序 |
|---|---|---|---|---|
| F-001 | `design-token-3-0` | 收斂 DESIGN.md v1.0、colors_and_type.css v2.0、上線版 style.css 三套不一致 token 為單一權威 Design Token 3.0；英文換 Satoshi、中文 Noto Sans TC、保留 #D64518 與視覺 DNA | ui-designer, system-architect, data-architect | High |
| F-002 | `ai-parametric-narrative` | 將簡介 PDF P05–P09 的流程、AI Advantage 對照、參數化與 BIM 論述，轉為業主看得懂的視覺化網站敘事區塊 | ux-expert, ui-designer, product-manager | High |
| F-003 | `ia-restructure-bilingual` | 以 AI 整合流程為主軸重構資訊架構，並建立中英欄位層並存的雙語模型與語言切換機制 | ux-expert, data-architect, product-manager | High |
| F-004 | `framer-template-capability-probe` | Framer marketplace template 選型、MCP 連線重建、code component 承載 React 元件與 WebGL shader 的效能實測與逃生路徑 | system-architect, ui-designer | High |
| F-005 | `asset-pipeline-provenance` | 525MB 影像最佳化管線，以及影像來源分層政策與可稽核的來源欄位設計 | data-architect, product-manager, system-architect | Medium |
| F-006 | `toolchain-orchestration` | Figma／Framer／Higgsfield／flora.ai／Weavy／Claude Design 職責與交接格式，以及 Claude Code ↔ Codex 分工邊界 | system-architect, product-manager | Medium |
| F-007 | `fable-design-upgrade-track` | Fable 於探索期提案、平行對照組、定稿升級三種用法的介入時點、產出格式、評比標準與縮減優先序 | ui-designer, product-manager, system-architect | Medium |
| F-008 | `content-migration-cutover` | 既有 cms/data 內容值對映至新 schema、Notion 後台建置、舊站廢棄與 SEO 轉址 | data-architect, product-manager, system-architect | Medium |

---

## 12. 執行前置條件

以下項目 MUST 於進入實作前解決，且皆非本腦力激盪階段可自行完成：

1. **Framer MCP 連線**：須於 Framer 開啟 MCP plugin（cmd-K → MCP）。已驗證目前未連線。
2. **repo 歸屬釐清**：本機 remote 為 `chr1st1anw0w/hq-design-website`，使用者陳述為 `aiadminhq/hq-design-website`。發佈權與帳號歸屬 MUST 確認。
3. **Satoshi 字體授權與字檔**：`Claude Design/fonts/` 目前僅有 Aeonik。
4. **Figma P02 分層讀取策略**：整頁 metadata 請求已驗證失敗。

---

## 13. 決策追蹤

| ID | 類別 | 問題 | 選定 | 階段 | 依據 |
|---|---|---|---|---|---|
| D-001 | Scope | 重置範圍 | 整體重建，只留內容素材 | 1 | 既有 IA 與視覺未執行品牌定位 |
| D-002 | Platform | 發佈平台 | 維持 Framer（延續 ADR-001） | 1 | 非工程師可自行維護內容 |
| D-003 | Tooling | 生成式工具定位 | 四種用途全採（探索／案例補圖／主視覺／影片） | 1 | 工具鏈已具備實戰經驗 |
| D-004 | Mode | 分析深度 | 完整多角色分析 | 1 | 議題橫跨技術、內容、視覺、流程 |
| D-005 | Fable | Fable 定位 | 三種用法全採 | 2 | 使用者選「全部」 |
| D-006 | Trust | 影像真實性 | 交由分析產出分層政策 | 2 | 需同業慣例與客戶期望依據 |
| D-007 | Roles | 角色組合 | 核心五角色 | 2 | 覆蓋技術／IA／視覺／優先序／資料 |
| D-008 | Visual | 視覺權威 | 全部重新定義並升級為 Token 3.0 | 3 | 三套 token 不一致，最完整者從未落地 |
| D-009 | Type | 字體 | 英文 Satoshi／中文 Noto Sans TC／絕無襯線 | 3 | 使用者明示 |
| D-010 | Bilingual | 雙語策略 | 中英完整雙語，欄位層並存 | 3 | 客戶含外商與本地雙軌 |
| D-011 | IA | IA 主軸 | AI 深度整合設計流程之差異化敘事 | 3 | 對應既有品牌定位「AI × Design 未來實驗場」 |
| D-012 | Timeline | 時程壓力 | 無硬期限，品質優先 | 3 | 授權高工作量方案 |
| D-013 | Brand | 品牌延續度 | 保留主色與視覺 DNA，重建系統與應用 | 4 | 品牌資產重置成本高於效益 |
| D-014 | Type | 字體遷移範圍 | 僅網站用 Satoshi，舊資產不動 | 4 | 接受短期字型不一致 |
| D-015 | Tech | shader／React 承載 | 交由 system-architect 實測後建議 | 4 | 無實測依據不預設結論 |
| D-016 | Asset | Figma 權威檔案 | fileKey `3viWBkQGZAEQnJntysBxZ7`（P02 `590:276`） | 4 | 使用者提供 |
| D-017 | Agents | Codex 納入 | macOS GUI／computer_use 執行角色，兼支援 UI/UX 與素材生成 | 補充 | 使用者中途補充 |
| D-018 | Framer | template 與 MCP | template 須重新選型，MCP 須重建 | 補充 | 使用者中途補充 |
| D-019 | Features | 功能點清單 | 確認八項 | 4.5 | 使用者確認 |

---

## 14. 下一步

本規格書完成後，auto mode MUST 自動續行：

- **Phase 3**：五角色平行分析（system-architect、ux-expert、product-manager、data-architect），各角色 MUST 以本規格為唯一輸入前提。
- **Phase 3.5**：UI 設計探索（ui-designer），MUST 於文字角色分析完成後執行，以取得全部角色脈絡。
- **Phase 4**：跨角色整合，產出 feature specs。

各角色分析 MUST 遵守：本規格中標示為「未解事項」者 MUST 提出建議而非略過；標示為「MUST 實測」者 MUST 附證據。
