# HQ Design System 資料夾重組建議

**對象**：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/HQ Design - Design System`（8.1 GB／1,368 檔／110 目錄）
**產出日期**：2026-09-03
**依據**：`ds-folder-inventory.md`（同目錄）的實證盤點
**狀態**：**建議書，尚未執行。** 實際搬移由使用者決定，腳本見 `ds-folder-move-plan.sh`（預設 dry-run）

> **重要前提**：本資料夾位於 Dropbox CloudStorage 同步路徑。7.3 GB 的作品集搬移會觸發大量同步流量。本計畫因此**分四階段**，每階段可獨立停止，且把大容量搬移排在最後。

---

## 1. 設計原則（為什麼這樣分）

### 1.1 現況的四個結構問題

| # | 問題 | 實證 |
|---|---|---|
| 1 | **層級語意缺失**：19 個頂層項目混雜規範、資產、參考、交付、垃圾五種性質 | 頂層同時存在 `DESIGN-firecrawl.md`（外部參考）、`名片.ai`（歷史交付）、`colors_and_type.css`（核心規範）、`CleanShot ....png`（截圖垃圾） |
| 2 | **同類資產分散**：logo 散在 4 處、Aeonik 散在 3 處、pattern 散在 3 處 | `HQ-logo/`、`LOGO/`、`LOGO.zip`、`Claude Design/{assets,brand-guide/assets,uploads}/`；`Pattern/`、`pattern-ref.png`、`Claude Design/patterns/` |
| 3 | **關鍵檔案位置錯誤導致系統失效** | `colors_and_type.css` 上移一層，打斷 7 條引用，使 Token v2.0 從未生效（盤點 §4.2） |
| 4 | **外部參考佔容量第二大且與自家資產混放** | `Danelec/` 569 MiB，其中 `PDF/` 518 MiB 為可重生的逐頁 PNG |

### 1.2 分層邏輯：依「誰在什麼時機讀它」而非依檔案格式

現況若依格式分（`PDF/`、`PNG/`、`SVG/`）會讓同一個決策的證據散開。本計畫改依**消費者與時機**分層：

| 層 | 誰讀它 | 什麼時機 | 可否修改 | 對應目錄 |
|---|---|---|---|---|
| **1｜品牌權威** | AI 代理人、設計師 | 每次產出前必讀 | 只有品牌負責人可改 | `10-brand-authority/` |
| **2｜可用資產** | 設計師、前端、簡報製作 | 製作時取用 | 唯讀取用，新增需經權威層核准 | `20-assets/` |
| **3｜設計系統實作** | 前端、Framer 實作 | 實作與預覽 | 開發中會改 | `30-design-system/` |
| **4｜參考資料** | 設計師 | 找靈感、追溯決策 | 只讀不改 | `40-reference/` |
| **5｜歷史交付** | 業務、行政 | 需要舊物料時 | 凍結 | `50-deliverables/` |
| **6｜工作中** | 當事人 | 短期暫存 | 隨意 | `90-inbox/` |

**數字前綴的作用**：Finder 與 `ls` 依字典序排列，數字前綴讓「必讀的規範」永遠排在最上、「暫存區」永遠在最下。這比 `assets/`、`brand/`、`reference/` 的字母序更能表達優先級。

**為什麼是 6 層而非更多**：任務要求四到五層以內。頂層 6 個目錄、每層內最多再兩層（如 `20-assets/logo/master/`），最深路徑深度為 3——遠低於現況 `HQ Design Company Profile/作品集-更新版/金普頓/金埔頓拍照/小檔案電腦看圖/` 的深度 5。

### 1.3 路徑穩定性原則（本計畫最重要的約束）

盤點 §4.3 的實測結論決定了整份計畫的形狀：

> **210 條有效相對引用，100% 都是 `Claude Design/` 子樹內部（或 `Satoshi_Complete/` 子樹內部）的引用。**

由此推出兩條硬規則：

- ✅ **可以搬移或改名整個 `Claude Design/` 頂層目錄** — 相對路徑隨子樹一起移動，210 條全部保持有效。
- ❌ **不可以搬動 `Claude Design/` 子樹「內部」的檔案** — 特別是 `assets/`、`fonts/`、`preview/card.css`。把 `brand-guide/assets/` 抽出去共用會一次打斷 58 + 56 = 114 條引用。

**因此本計畫刻意「不整併」`Claude Design/` 內部的 4 份 logo 複本與 3 份 Aeonik 複本**，即使它們位元相同。`styles.css` 檔頭已明載這是刻意的可攜性設計。用 12 KB 的重複換 114 條引用的穩定，是正確的取捨。

---

## 2. 目標目錄結構

```
HQ Design - Design System/
├── CLAUDE.md                          ← 留在原位（12 行路徑引用需更新）
├── README.md                          ← 【新增】頂層導覽索引
├── .mcp.json  .claude/                ← 留在原位（工具設定）
│
├── 10-brand-authority/                ← 層 1：品牌權威（每次產出前必讀）
│   ├── DESIGN.md                      ← 從 Claude Design/ 複製或連結（見 §4 變更 #9）
│   ├── README.md                      ← 同上
│   ├── SKILL.md                       ← 同上
│   └── archive/                       ← 被取代的舊版規範
│       ├── HQ DESIGN — 品牌視覺規範與 CIS 系統.md      ← 自 HQ-logo/（57 節舊版）
│       ├── HQ-線條與標誌幾何標準-v2.md                 ← 自 HQ-logo/
│       └── DESIGN-260628-ChatGPT.md                    ← 自 Claude Design/
│
├── 20-assets/                         ← 層 2：可用資產
│   ├── logo/
│   │   ├── master/                    ← 自 HQ-logo/（含 export/、Pattern.ai、HQ-line-system.svg）
│   │   └── figma-icons/               ← 自 LOGO/（icon × 底色矩陣 20 檔）
│   ├── fonts/
│   │   └── Satoshi_Complete/          ← 整包移入，內部結構不動（36 條引用）
│   ├── patterns/
│   │   ├── webp-v1/                   ← 自 Pattern/（12 檔早期世代）
│   │   └── ref/                       ← 自 pattern-ref.png
│   └── photography/
│       └── portfolio/                 ← 自 HQ Design Company Profile/作品集-更新版/（7.3 GB）
│
├── 30-design-system/                  ← 層 3：= 現 Claude Design/（僅改名，內部完全不動）
│   ├── colors_and_type.css            ← 【關鍵】自資料夾根層移入，修復 7 條斷鏈
│   ├── DESIGN.md  README.md  SKILL.md
│   ├── _ds_manifest.json  _ds_bundle.js  _adherence.oxlintrc.json
│   ├── styles.css  index.html
│   ├── assets/  fonts/  brand-guide/  preview/  patterns/  ui_kits/
│   └── uploads/                       ← 建議改名為 _scratch/ 並清理（見變更 #12）
│
├── 40-reference/                      ← 層 4：外部參考（只讀不改）
│   ├── danelec/                       ← 自 Danelec/ + Danelec-17.pdf + Danelec-18.pdf
│   ├── firecrawl-design-system.md     ← 自 DESIGN-firecrawl.md（改名以標明是外部系統）
│   └── inspiration/
│       └── office-rendering/          ← 自 pinterest-office-rendering/
│
├── 50-deliverables/                   ← 層 5：歷史交付（凍結）
│   ├── company-profile/               ← 自 HQ Design Company Profile/（作品集已移出）
│   │   └── archive-2020/              ← 自 drive-download-20260629T081556Z-3-001/
│   ├── business-cards/                ← 自 名片/ + 名片.ai
│   └── proposals/                     ← 自 HQ Design Company Profile/新增包含項目的檔案夾/
│
└── 90-inbox/                          ← 層 6：待判斷（人工處理後清空）
    ├── CleanShot 2026-07-14 at 15.43.55@2x.png
    ├── HQ-design-system.html
    └── untitled-decks/                ← 自 Untitled.pptx + Untitled.pdf
```

**與現況的頂層項目數對比**：19 → 8（6 個分層目錄 + `CLAUDE.md` + `README.md`，另加 2 個隱藏設定項）。

---

## 3. 為什麼不採用另外三種分法（決策記錄）

| 被否決的方案 | 否決理由 |
|---|---|
| **依檔案格式分**（`pdf/`、`ai/`、`svg/`、`png/`） | 會把「名片的 AI 檔」與「Danelec 品牌書 PDF」放在完全不同的地方，同一個交付物的證據鏈被打斷。且無法表達優先級 |
| **依時間分**（`2020/`、`2026/`） | 品牌規範不是時間序資產，`DESIGN.md` 是持續演進的單一事實來源而非某年的快照。時間分層只適合 `50-deliverables/` 內部（已採用，見 `archive-2020/`） |
| **把 `Claude Design/` 內容打散到各分層** | 會打斷 210 條相對引用中的絕大多數（`assets/` 114 條、`preview/card.css` 27 條、`fonts/` 2 條…）。**這是本計畫最主要的否決項**——語意純度不值得用整套設計系統的可用性去換 |

---

## 4. 逐項變更清單

**風險等級定義**
- **低**：不影響任何程式碼引用，或引用會隨子樹同步移動；純目錄改名／搬移
- **中**：需同步更新文件層引用（`CLAUDE.md`、workflow 文件），或有大容量同步成本
- **高**：會打斷程式碼引用，需同時修改程式碼

**可逆性**：Dropbox 保留 30 天（Plus）／180 天（Professional／Business）版本歷史。所有 `mv` 皆可透過 Dropbox 網頁版「已刪除的檔案」還原，或直接反向 `mv`。**唯有刪除操作需依賴 Dropbox 版本歷史**。

---

### 階段 1｜零風險修復（強烈建議優先執行）

#### 變更 #1 — ⭐ `colors_and_type.css` 移回 `Claude Design/`

| 項目 | 內容 |
|---|---|
| 動作 | `mv "colors_and_type.css" "Claude Design/colors_and_type.css"` |
| 風險 | **低** |
| 可逆 | 完全可逆（反向 `mv`） |
| **修復的引用** | **8 處**（見下） |
| **打斷的引用** | **0 處程式碼**；1 行文件（`CLAUDE.md:14`） |

**這是整份計畫價值最高、風險最低的單一變更。** 修復清單：

| # | 檔案:行號 | 現況 | 移入後 |
|---|---|---|---|
| 1 | `Claude Design/styles.css:12` | `@import url("./colors_and_type.css")` → 斷 | ✅ 通 |
| 2 | `Claude Design/index.html:9` | `href="./colors_and_type.css"` → 斷 | ✅ 通 |
| 3 | `Claude Design/preview/card.css:4` | `@import url("../colors_and_type.css")` → 斷 | ✅ 通 |
| 4 | `Claude Design/brand-guide/hq-pattern-shader-preview.html:8` | `href="../colors_and_type.css"` → 斷 | ✅ 通 |
| 5 | `Claude Design/ui_kits/website/kit.css:1` | `@import url("../../colors_and_type.css")` → 斷 | ✅ 通 |
| 6 | `colors_and_type.css:17` | `url("./fonts/Aeonik-Regular.ttf")` → 斷 | ✅ 通（解析至 `Claude Design/fonts/`） |
| 7 | `colors_and_type.css:24` | `url("./fonts/Aeonik-Bold.ttf")` → 斷 | ✅ 通 |
| 8 | `Claude Design/_ds_manifest.json` | `globalCssPaths:["colors_and_type.css",...]` + 136 條 `tokens[].definedIn` → 全部指向不存在的路徑 | ✅ 全部正確 |

**驗證方式（搬移後執行）**：
```bash
open "Claude Design/index.html"   # Vermillion 色票與 Aeonik 標題應正確渲染
open "Claude Design/preview/color-brand.html"
```
若 token 生效，`preview/color-brand.html` 應顯示 `#D64518` 色塊而非瀏覽器預設樣式。

**須同步修正的引用（1 個檔案 1 行）**：
- `HQ Design - Design System/CLAUDE.md:14` — `| Design Tokens | \`colors_and_type.css\` |` → 改為 `\`Claude Design/colors_and_type.css\``

---

#### 變更 #2 — 刪除 `LOGO.zip`

| 項目 | 內容 |
|---|---|
| 動作 | 刪除（或先移至 `90-inbox/` 觀察一週） |
| 實證 | 20/20 檔案 `shasum -a 256` 與 `LOGO/` 完全一致，雙向無多餘檔案 |
| 風險 | **低** |
| 可逆 | 依賴 Dropbox 版本歷史；或用 `zip -r LOGO.zip LOGO/` 重建 |
| 回收 | 158,014 bytes |
| 引用影響 | 0 |

---

#### 變更 #3 — 刪除 `HQ-logo/export/` 內 2 個 Figma 重複匯出

| 項目 | 內容 |
|---|---|
| 動作 | 刪除 `HQ-logo/export/HQ-logo-bk-bk0-1.png` 與 `HQ-logo-bk-bk0-1.svg` |
| 實證 | hash 分別與 `HQ-logo-bk-bk0.png`（18,751 bytes）／`HQ-logo-bk-bk0.svg`（929 bytes）完全一致 |
| 風險 | **低** |
| 可逆 | Dropbox 版本歷史 |
| 回收 | 19,680 bytes |
| 引用影響 | 0（grep 確認無任何檔案引用 `-bk-bk0-1`） |

---

#### 變更 #4 — ⭐ 修復 2 條 JSX 元件 logo 路徑（**程式碼修改，非搬移**）

| 項目 | 內容 |
|---|---|
| 動作 | 將 `../../assets/HQ-logo.png` 改為 `../../../assets/HQ-logo.png` |
| 檔案 | `Claude Design/ui_kits/website/components/TopNav.jsx:41`<br>`Claude Design/ui_kits/website/components/FooterAndCTA.jsx:56` |
| 風險 | **低**（單字串修正，改前後皆可用瀏覽器驗證） |
| 可逆 | 完全可逆 |
| 為何現在做 | guidance-spec §6.3 要實測「Framer code component 承載這 9 個 JSX 元件」。**這 2 條斷鏈會讓 Hero 區與 Footer 的 logo 破圖**，若不先修，實測結論會被誤判為 Framer 的問題 |

**根因**：`ui_kits/website/index.html:8` 用 `../../assets/HQ-logo.png` 是正確的（從 `website/` 上兩層到 `Claude Design/`）。兩個元件檔在 `website/components/`，深了一層，卻沿用同一字串。

---

#### 變更 #5 — 修復 `_ds_bundle.js` 路徑

| 項目 | 內容 |
|---|---|
| 動作 | `Claude Design/_ds_bundle.js:340` 的 `deck-stage.js` → `brand-guide/deck-stage.js` |
| 風險 | **中**（`_ds_bundle.js` 為 182 KB 產生物，可能由建置流程重新產出而覆蓋手改） |
| 可逆 | 完全可逆 |
| 建議 | **先確認 `_ds_bundle.js` 是否為手寫或產生物**。若為產生物，應修來源而非改 bundle |

---

#### 變更 #6 — 執行垃圾清理

| 項目 | 內容 |
|---|---|
| 動作 | `bash ds-folder-cleanup.sh --execute` |
| 對象 | 33 `.DS_Store` + 54 `Thumbs.db` + 4 `~$*.pptx` = 91 檔 |
| 風險 | **低** |
| 可逆 | Dropbox 版本歷史（且這些檔案本身會自動重建） |
| 回收 | **12,577,048 bytes（11.99 MiB）** |
| 引用影響 | 0 |

**階段 1 小結**：回收 12.16 MiB，修復 11 處引用問題（8 + 2 + 1），零程式碼破壞風險。**建議先只做階段 1，觀察一週後再進階段 2。**

---

### 階段 2｜低風險搬移（小容量，不動 `Claude Design/`）

#### 變更 #7 — 建立分層目錄並搬移小型項目

| 現有項目 | 目標位置 | 容量 | 風險 | 打斷的程式碼引用 | 須同步修正的文件引用 |
|---|---|---|---|---|---|
| `HQ-logo/` | `20-assets/logo/master/` | 2.8 MiB | 低 | **0** | 0 |
| `LOGO/` | `20-assets/logo/figma-icons/` | 244 KiB | 低 | **0** | `CLAUDE.md:15`、`CLAUDE.md:66`、`CLAUDE.md:67`（共 3 行） |
| `Pattern/` | `20-assets/patterns/webp-v1/` | 244 KiB | 低 | **0** | `CLAUDE.md:16`（1 行） |
| `pattern-ref.png` | `20-assets/patterns/ref/` | 4.26 MiB | 低 | **0** | 0 |
| `Satoshi_Complete/` | `20-assets/fonts/Satoshi_Complete/` | 3.3 MiB | 低 | **0**（36 條引用全在 `Fonts/WEB/` 子樹內，隨整包移動） | 0 |
| `DESIGN-firecrawl.md` | `40-reference/firecrawl-design-system.md` | 12.5 KiB | 低 | **0** | 0 |
| `pinterest-office-rendering/` | `40-reference/inspiration/office-rendering/` | 6.0 MiB | 低 | **0** | 0 |
| `Danelec/` + `Danelec-17.pdf` + `Danelec-18.pdf` | `40-reference/danelec/` | 571 MiB | **中**（容量：571 MiB 的 Dropbox 重新同步） | **0** | 0 |
| `名片/` + `名片.ai` | `50-deliverables/business-cards/` | 28 MiB | 低 | **0** | 0 |
| `drive-download-20260629T081556Z-3-001/` | `50-deliverables/company-profile/archive-2020/` | 30 MiB | 低 | **0** | 0 |
| `CleanShot 2026-07-14 at 15.43.55@2x.png` | `90-inbox/` | 2.45 MiB | 低 | **0** | 0 |
| `HQ-design-system.html` | `90-inbox/` | 15.6 KiB | 低 | **0**（自包含，無外部引用；grep 確認 0 條相對引用） | 0 |
| `Untitled.pptx` + `Untitled.pdf` | `90-inbox/untitled-decks/` | 16.3 MiB | 低 | **0** | 0 |
| `HQ Design Company Profile/新增包含項目的檔案夾/` | `50-deliverables/proposals/` | 34 MiB | 低 | **0** | 0 |
| `HQ-logo/HQ DESIGN — ...CIS 系統.md`<br>`HQ-logo/HQ-線條與標誌幾何標準-v2.md`<br>`Claude Design/DESIGN-260628-ChatGPT.md` | `10-brand-authority/archive/` | 39 KiB | 低 | **0** | 0 |
| `Danelec/HQ-logo-w.png` | `20-assets/logo/master/` | 20 KiB | 低 | **0** | 0（誤置資產歸還） |

**階段 2 合計**：搬移約 700 MiB，**打斷程式碼引用 0 條**，須修正文件引用 **4 行**（全部在 `CLAUDE.md`）。

**注意**：`HQ Design Company Profile/` 在階段 2 後只剩簡介檔案，改名為 `50-deliverables/company-profile/` 於階段 4 執行（因為 `作品集-更新版/` 還在裡面）。

---

### 階段 3｜中風險：`Claude Design/` 改名

#### 變更 #8 — `Claude Design/` → `30-design-system/`

| 項目 | 內容 |
|---|---|
| 動作 | `mv "Claude Design" "30-design-system"` |
| 風險 | **中** |
| 可逆 | 完全可逆（反向 `mv`） |
| **打斷的程式碼引用** | **0 條** — 210 條有效引用全部是子樹內部相對路徑，隨子樹一起移動 |
| **須同步修正的文件引用** | **19 處，分佈 7 個檔案**（見下表） |

**須同步修正的引用清單**：

| 檔案 | 行號／處數 | 內容 |
|---|---|---|
| `HQ Design - Design System/CLAUDE.md` | 4 行：`13`、`19`、`56`、`72` | 資源表、主要參考檔、簡報流程、Pattern 生成 |
| `hq-design-website/.workflow/active/WFS-hq-website-reset/.brainstorming/ui-designer/analysis.md` | 4 處 | — |
| `.../.brainstorming/guidance-specification.md` | 3 處 | §2 術語表定義 `DESIGN.md v1.0` 與 `colors_and_type.css v2.0` 的權威路徑 |
| `.../CODEX-HANDOFF.md` | 2 處 | — |
| `.../.process/context-package.json` | 2 處 | — |
| `.../.brainstorming/system-architect/analysis.md` | 1 處 | — |
| `.../.process/nas-portfolio-inventory.md` | 1 處 | — |
| **合計** | **19 處** | |

**風險評估**：這 19 處都是**文件引用而非程式碼**——不會造成渲染或建置錯誤，但會讓後續 AI 代理人與同事依 guidance-spec 的路徑找不到檔案。由於 `guidance-specification.md` 被明定為「下游所有階段的單一事實來源」，**改名前 MUST 先更新它**，否則會產生權威文件與實際檔案系統不一致的狀態。

**替代方案（更保守）**：**不改名，維持 `Claude Design/`。** 代價是頂層目錄的命名體系不一致（一個沒有數字前綴），好處是 19 處文件引用完全不動。

> **建議**：若使用者對 19 處文件同步更新沒有把握，**跳過變更 #8**。它是純語意收益，沒有任何功能修復價值。階段 1 才是有實質收益的部分。

---

#### 變更 #9 — `10-brand-authority/` 的權威文件如何擺放（**需使用者決定**）

問題：`DESIGN.md`、`README.md`、`SKILL.md` 同時是「品牌權威文件」（層 1）與「設計系統的一部分」（層 3）。三種做法：

| 方案 | 做法 | 優點 | 缺點 | 風險 |
|---|---|---|---|---|
| **A（建議）** | 留在 `30-design-system/`，`10-brand-authority/` 只放一個 `README.md` 指路 | 零重複、零路徑破壞、guidance-spec 的路徑只需改前綴 | 「必讀規範」不在最顯眼的層 1 | 低 |
| **B** | 用 symlink：`10-brand-authority/DESIGN.md -> ../30-design-system/DESIGN.md` | 兩處都看得到，單一實體 | **Dropbox 對 symlink 的同步行為不可靠**，跨機器可能斷開 | **高** |
| **C** | 實體複製到 `10-brand-authority/` | 層 1 名副其實 | **產生兩份會分歧的權威文件**，直接違反「單一事實來源」 | **高** |

**建議採 A。** 本計畫的目標結構圖中 `10-brand-authority/` 的 `DESIGN.md` 等項標為「複製或連結」，實際執行時**應改為只放 `README.md` 指路**。`ds-folder-move-plan.sh` 依方案 A 產生指令。

---

### 階段 4｜高容量搬移（7.3 GB，最後執行）

#### 變更 #10 — `作品集-更新版/` → `20-assets/photography/portfolio/`

| 項目 | 內容 |
|---|---|
| 動作 | `mv "HQ Design Company Profile/作品集-更新版" "20-assets/photography/portfolio"` |
| 容量 | **7.3 GB**／33 個案件目錄／1,000+ 檔 |
| 風險 | **中**（不是引用風險，是同步風險） |
| **打斷的程式碼引用** | **0 條** |
| **`photo-index.json` 影響** | **無** — 已實測該 191 KB 索引以案件名為 key，`作品集-更新版` 出現 0 次、`HQ Design - Design System` 出現 0 次。只要內部結構不變即安全 |
| 須同步修正的文件引用 | `nas-portfolio-inventory.md` 1 處 |

**同步風險說明**：Dropbox 的 `mv` 在同一個同步根內通常是 server-side move（不重傳），但 CloudStorage／File Provider 實作下**不保證**。7.3 GB 若被判定為新增，會觸發完整重新上傳。

**緩解措施（腳本已內建為前置檢查）**：
1. 搬移前確認 Dropbox 已完成同步（menu bar 顯示「已是最新狀態」）。
2. 搬移期間**不要**關機或中斷網路。
3. 先用一個小目錄試搬（如 `作品集-更新版/照片/`，544 KiB／2 檔），觀察 Dropbox 是否重新上傳，再決定是否整批搬。
4. 考慮**暫停 Dropbox 同步 → 搬移 → 恢復同步**，讓 Dropbox 以差異比對方式處理。

> **⚠ 已實測的環境限制**：本機磁碟 `df -h` 顯示 **總計 926 GiB、可用僅 2.1 GiB、使用率 100%**。
> 若 Dropbox 把這次搬移判定為「新增」而重新上傳，本機可能因空間不足而同步失敗或卡住。
> **在釋出至少 10 GiB 空間之前，不建議執行變更 #10。** `ds-folder-move-plan.sh` 的前置檢查已內建此警告。

**替代方案**：**不搬。** 7.3 GB 攝影母帶留在 `HQ Design Company Profile/作品集-更新版/`，僅在 `20-assets/photography/README.md` 記錄其位置。理由：它已有專責索引（`photo-index.json` + `nas-portfolio-inventory.md`），語意收益低於 7.3 GB 的同步風險。**若時程或網路條件緊張，建議採此替代方案。**

---

#### 變更 #11 — `HQ Design Company Profile/` → `50-deliverables/company-profile/`

| 項目 | 內容 |
|---|---|
| 前置 | 變更 #7（`新增包含項目的檔案夾/` 移出）與 #10（作品集移出）完成後執行 |
| 剩餘容量 | 約 34 MiB（5 個簡介檔 + `flora-ai-local-skill.md`） |
| 風險 | **低** |
| 打斷的程式碼引用 | **0** |
| 須同步修正的文件引用 | `CLAUDE.md:17`、`CLAUDE.md:57`（2 行） |

**若採變更 #10 的替代方案（作品集不搬）**，則此變更也應跳過，`HQ Design Company Profile/` 維持原名。

---

### 階段 5｜清理與收尾（需人工判斷）

#### 變更 #12 — `Claude Design/uploads/` 處理

| 項目 | 內容 |
|---|---|
| 現況 | 9.5 MiB／9 檔。含 3 份與 `Claude Design/fonts/` 位元相同的 Aeonik 副本、3 份與 `assets/` 位元相同或相異的 logo、`pasted-1779429627208-0.png`（8.5 MiB）、`beams-1779632486770.png`（735 KiB）、1 個 `~$PowerPoint.pptx` |
| 建議 | 1) `~$PowerPoint.pptx` 由變更 #6 自動清除<br>2) `fonnts.com-Aeonik-*.ttf` 2 檔（198 KiB）可刪 — 與 `fonts/` 位元相同，且 grep 確認無引用<br>3) `HQ-logo*.{png,svg}` 3 檔可刪 — 無引用<br>4) `pasted-*.png`（8.5 MiB）與 `beams-*.png`（735 KiB）**需人工開啟確認**是否為某 shader／pattern 的來源圖<br>5) 目錄改名為 `_scratch/` 以標明性質 |
| 風險 | **低**（2、3 項）／**中**（4 項需人工確認） |
| 回收 | 確定可回收 198 KiB + 26 KiB；待確認 9.2 MiB |
| 引用影響 | 0（已 grep 驗證 `uploads/` 內無任何檔案被引用） |

#### 變更 #13 — `Danelec/PDF/` 518 MiB 處置（**需人工拍板**）

| 項目 | 內容 |
|---|---|
| 現況 | 73 張 `Danelec_BrandGuide_V1_2024_<n>.png`，為同目錄 50 MiB PDF 的逐頁轉檔 |
| 選項 A | **刪除**，需要時用 `pdftoppm -png -r 150 Danelec_BrandGuide_V1_2024.pdf page` 重生。回收 **518 MiB** |
| 選項 B | 轉為 webp 或降解析度 PNG。預估回收 400–480 MiB |
| 選項 C | 保留（若曾用於某簡報的貼圖來源，重生的檔名／解析度可能不同而失效） |
| 風險 | **中**（選項 A 依賴「確實可重生」的假設） |
| 可逆 | 選項 A 依賴 Dropbox 版本歷史 |
| 建議 | 先執行 `pdftoppm` 抽一頁比對解析度是否一致，再決定。**不納入自動清理腳本** |

#### 變更 #14 — 空目錄與新增索引

| 項目 | 內容 |
|---|---|
| `名片/PDF/` | 變更 #6 清掉 `.DS_Store` 後成空目錄，可移除。風險低 |
| 新增 `README.md`（頂層） | 說明六層結構、各層的修改權限、以及「AI 代理人必讀 `30-design-system/DESIGN.md`」。**這是重組能否維持的關鍵**——沒有索引，三個月後又會回到 19 個混雜的頂層項目 |
| 新增 `90-inbox/README.md` | 寫明「此處為暫存區，每月清空；放進來的東西必須在一個月內歸位或刪除」 |

---

## 5. 引用影響總表

| 類別 | 數量 |
|---|---|
| 資料夾內相對路徑引用總數（實測） | **220** |
| 其中有效 | 210 |
| **其中既有斷鏈（重組的修復機會）** | **10** |
| 執行變更 #1 後修復的引用 | **8** |
| 執行變更 #4 後修復的引用 | **2** |
| 執行變更 #5 後修復的引用 | **1**（需先確認 bundle 性質） |
| **完成階段 1 後的剩餘斷鏈** | **0** |
| **本計畫全部搬移會打斷的程式碼引用** | **0** |
| **本計畫全部搬移須同步修正的文件引用** | **25 處，分佈 7 個檔案** |

**文件引用修正明細**：
- `HQ Design - Design System/CLAUDE.md` — **12 行**（`13`、`14`、`15`、`16`、`17`、`19`、`56`、`57`、`58`、`66`、`67`、`72`）
- `hq-design-website/.workflow/.../ui-designer/analysis.md` — 4 處
- `hq-design-website/.workflow/.../guidance-specification.md` — 3 處
- `hq-design-website/.workflow/.../CODEX-HANDOFF.md` — 2 處
- `hq-design-website/.workflow/.../context-package.json` — 2 處
- `hq-design-website/.workflow/.../system-architect/analysis.md` — 1 處
- `hq-design-website/.workflow/.../nas-portfolio-inventory.md` — 1 處

> **`guidance-specification.md` 為明定的「下游單一事實來源」，任何搬移 MUST 先更新它。**

---

## 6. 容量效果

| 項目 | 回收 | 風險 |
|---|---|---|
| 垃圾清理（變更 #6） | **11.99 MiB** | 低（腳本化） |
| `LOGO.zip`（變更 #2） | 158 KiB | 低 |
| `HQ-logo/export/*-bk-bk0-1.*`（變更 #3） | 19.7 KiB | 低 |
| `uploads/` 確定可刪部分（變更 #12） | 224 KiB | 低 |
| **階段 1 + 低風險去重合計** | **≈ 12.4 MiB** | **低** |
| `uploads/pasted-*.png` + `beams-*.png`（待人工確認） | 9.2 MiB | 中 |
| **`Danelec/PDF/`（待人工拍板）** | **518 MiB** | 中 |
| **全部執行後理論上限** | **≈ 540 MiB（8.1 GB → 7.6 GB，−6.6%）** | |

**注意**：容量不是本次重組的主要目標。8.1 GB 中有 7.3 GB 是不可壓縮的攝影母帶（且為網站主力素材）。**真正的價值在修復 10 條斷鏈與建立可維護的語意分層。**

---

## 7. 執行順序建議

```
階段 1（零風險，建議立即）
  #6 垃圾清理 → #1 colors_and_type.css 移回 → 瀏覽器驗證 token 生效
  → #4 修 2 條 JSX 路徑 → #2 刪 LOGO.zip → #3 刪 2 個重複匯出
  → #5 修 _ds_bundle.js（先確認是否為產生物）
  ✅ 檢查點：重跑 linkcheck，斷鏈應為 0

  ── 觀察一週，確認 Dropbox 同步無異常 ──

階段 2（低風險小容量）
  #7 建立分層目錄 + 搬移 15 個小型項目
  → 更新 CLAUDE.md 的 4 行引用
  ✅ 檢查點：逐一開啟 Claude Design/index.html、brand-guide/EN.html、
             ui_kits/website/index.html 確認渲染正常

階段 3（中風險，可選）
  #9 決定權威文件擺放（建議方案 A）
  → 先更新 guidance-specification.md 等 19 處文件引用
  → #8 Claude Design/ → 30-design-system/
  ⚠ 若對 19 處同步更新沒把握，跳過此階段

階段 4（高容量，可選）
  先試搬 作品集-更新版/照片/（544 KiB）觀察 Dropbox 行為
  → 若未重新上傳：#10 搬 7.3 GB 作品集 → #11 改名 company-profile
  → 若重新上傳：採替代方案，作品集不搬，僅記錄位置
  ⚠ 搬移期間不可中斷網路

階段 5（人工判斷）
  #12 uploads/ 清理 → #13 Danelec/PDF/ 拍板 → #14 新增 README 索引
```

---

## 8. 需要使用者確認的決策點

| # | 決策 | 選項 | 建議 |
|---|---|---|---|
| 1 | 是否改名 `Claude Design/`？ | 改（語意一致，但需同步 19 處文件）／不改（零風險） | 若時間有限，**不改**。無功能收益 |
| 2 | `10-brand-authority/` 如何擺放權威文件？ | A 只放索引／B symlink／C 實體複製 | **A**。B 在 Dropbox 不可靠，C 違反單一事實來源 |
| 3 | 是否搬移 7.3 GB 作品集？ | 搬／不搬（僅記錄位置） | **本機可用空間僅 2.1 GiB（使用率 100%）**，建議先釋出空間或直接採「不搬」 |
| 4 | `Danelec/PDF/` 518 MiB 如何處置？ | 刪除／轉 webp／保留 | 先驗證 `pdftoppm` 可重生同等品質 |
| 5 | `Untitled.pptx` 與 `Untitled.pdf` 是否同一份？ | 需人工開啟確認 | 若確認 PDF 為 PPTX 匯出，可只留 PPTX（回收 7.6 MiB） |
| 6 | Aeonik 授權來源是否需處理？ | 見盤點 §2.6 | 建議與 Satoshi 授權確認一併進行 |

---

## 9. 本計畫未執行任何操作

本文件為建議書。`ds-folder-move-plan.sh` 依本計畫產生實際指令，**預設 dry-run**，須傳 `--execute` 才會動作，且會在執行前做 Dropbox 同步與目標路徑衝突檢查。

**所有判定均附實證**：檔案大小為 `stat -f %z` 實測、重複判定為 `shasum -a 256` 比對、引用數為 Python 路徑解析器實測、容量為 `du -sk` 實測。
