# Session 交接 · Fable 5.1 → Astra

> 日期 2026-09-06 · 撰寫：Fable 5.1（Claude Code session `hq-design-website-a4`）
> 給 Astra：你要接手的是「惠強官網重建」的**設計層**，重新優化整體網頁風格與框架。
> 這份文件回答三件事：我做了什麼、最終版本在哪、哪些東西值得參考、哪些是中間產物。
> 實作規格本身在 [`HANDOFF-web-design-fable-to-codex.md`](HANDOFF-web-design-fable-to-codex.md)，不在這裡重複。

---

## 1. 三方分工與現況

| 方                                                           | 身分                       | 職掌                                                                                                                | 狀態                                                                                                                                                                                                    |
| ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude `hqdesign-8d`（session 名「HQ Design 網站重置規劃」） | 內容層、資料管線、基礎建設 | `content/**`、`scripts/**`、`web/lib/**`、`web/next.config.ts`、`middleware.ts`、`web/package.json`、`web/app/_ds/` | `web/` 可建置，`/zh` `/en` 靜態產生，27 條 301 全對；token 已同步；影像管線 582 webp 完成；四個介面（`bim` 標示變體、`focal`、`pairs`、`web/messages` 劃給設計方）已完成。正在做 favicon／OG／`lib/seo` |
| Fable 5.1（我，這份文件的作者）                              | 視覺語言與設計             | `web/app/**`（不含 `_ds/`）、`web/components/**`、所有 CSS、`web/messages/**`、`design/**`                          | 設計完成到 v0.3，**沒有寫任何 web/ 程式碼**；使用者決定實作交給 Codex                                                                                                                                   |
| Codex                                                        | Motion 元件與互動實作      | worktree `hq-design-website-motion/` @ `codex/hq-motion-first`，`prototype/next-motion-site/**`                     | 有一個可跑的 Motion 原型（`next dev -p 3011`）；接下來依我的交接文件在 `web/` 實作                                                                                                                      |
| Astra（你）                                                  | 重新優化整體風格與框架     | 接手 Fable 的路徑                                                                                                   | —                                                                                                                                                                                                       |

**協作契約**：repo 根 `COORDINATION.md`（`hqdesign-8d` 維護）。硬規則：不 `git push`（推送由使用者執行，本次 PR 是使用者以 Create PR 指令授權）、不 `git add -A`（個資排除只靠 `.gitignore`，公開 repo）、不動別人的未提交修改、要改別人的路徑先在 §6 登記一行。

**Git 狀態**（我離開時）：分支 `feat/site-rebuild`，PR #2 已開（https://github.com/aiadminhq/hq-design-website/pull/2，非草稿），內容只有 `design/**` 與另一方先前提交的 `reports/framer-component-audit/`。工作樹裡 `web/`、`content/`、`COORDINATION.md`、`.gitignore` 修改、`framer reference/`（來源不明）都**刻意未提交**，由所有者處理。

---

## 2. 我做了什麼（時間序）

1. **探索**：讀完計畫、Codex 兩份互動規格、Token 3.0（`ds-bundle/tokens/hq.css`）、19 份元件規格、CIS 文件、《線條與標誌幾何標準 v2》（60°／51／12／63，v1.0 的 45° 已作廢）、Figma 32 頁簡介（node `798:98780`）、Figma 品牌 pattern（node `1073:100220`）、33 案資料模型、品牌資產盤點、Framer 匯出鏡像、Codex 原型 worktree。
2. **發現並處理協作風險**：session 進行中 repo 被另一個 Claude 建立 `web/` 與 `COORDINATION.md`；確認三方分工，全程只在自有路徑寫檔。
3. **提案 v0.1**：概念「一套會動的施工圖說」。結構上仍偏「現有靜態站排版 + Powerhouse 拼貼」。
4. **使用者裁示**：參考只是參考，要原創且實用；首頁就是要 Powerhouse 式捲動影像場；漸層可接受；納入 Codex 已完成元件；pattern 從 Figma 抽；把一個 Framer 元件轉成本站可用元件。
5. **提案 v0.2 → v0.3**：六個原創介面裝置（圖名框、尺寸線、圖層、對照 wipe、圖紙索引、座標讀數），全部在提案頁可操作；納入 Figma pattern 向量、HQ Mesh 四組受控漸層、Codex 元件銜接表、變更理由表、決策清單 D1–D7。
6. **Framer → React**：子代理從 Framer 桌面 App 讀出節點 `RhV2IHfHj` 的原始碼（純 CSS 漸進模糊，非 WebGL），轉成 `HqUnfocusedMesh.tsx`，移除色散／失真／blur-glow／玻璃面板，顏色與角度以型別鎖定。
7. **交接**：寫 `HANDOFF-web-design-fable-to-codex.md`，把全部產出放進 `design/`，開 PR #2。

---

## 3. 最終版本在哪（以 repo 為準）

| 檔案                                                                                        | 這是什麼                                                                                                                                                 | 狀態                                               |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `design/HANDOFF-web-design-fable-to-codex.md`                                               | 實作規格：所有權、11 條硬規則含修正、token／字級／網格、資料介面、六個常駐元件、十類頁面、元件契約、motion token、原型處置、七道閘門與效能預算、決策狀態 | **最終**（已提交）                                 |
| `design/proposal/hq-design-visual-proposal-v0.3.html`                                       | 單檔視覺提案，含可操作示範。**版面與元件的視覺基準**                                                                                                     | **最終**（已提交）                                 |
| `design/framer-port/HqUnfocusedMesh.tsx` `README.md` `SOURCE-NOTES.md` `preview/index.html` | shader 元件與說明                                                                                                                                        | **最終**（已提交）；drift 動畫尚未在 Next dev 實測 |
| `design/assets/pattern/hq-pattern-1073-100220-currentColor.svg`                             | 品牌 pattern 可上色版（fill=currentColor、已去 id）                                                                                                      | **最終**（已提交）                                 |
| `design/assets/pattern/*-original.svg`                                                      | Figma 原始三檔（Variant2 白底、Default 橘底 graphic、Default icon 外框）                                                                                 | 參考                                               |
| `design/handoff.md`                                                                         | 本文件                                                                                                                                                   | —                                                  |

---

## 4. Scratchpad：哪些可參考、哪些是中間產物

路徑：`/private/tmp/claude-501/-Users-christianwu-Library-CloudStorage-Dropbox-HQdesign-hq-design-website/f8e79a87-046f-4aca-b844-a043f726ee53/scratchpad/`

**⚠️ 這是 session 專屬的暫存目錄，可能被清掉。** 凡標「最終」者在 `design/` 都有同一份（提案 HTML 已用 md5 核對相同）。**提案原始碼與組裝腳本已另存一份可重建的版本在 `design/proposal/src/`**（`proposal.template.html`、`assemble.py`、`figma/` 四張裁切與 pattern；縮圖與字體改從 repo 內既有資源產生，見該目錄 README）。以下 scratchpad 清單只剩 Figma 截圖、logo 渲染與 Framer 原始碼是 repo 沒有的。

### 值得參考（要改提案就從這裡改）

| 檔案                                                                             | 說明                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `proposal-v2.template.html`                                                      | **提案的原始碼**（119 KB）。含 `{{FONT_SATOSHI}}`、`{{IMG:slug}}`、`{{ISO:x}}`、`{{CMP:x}}`、`{{PAT:name}}` 佔位。要改提案改這個，不要改組裝後的 2 MB 檔                                                                       |
| `assemble.py`                                                                    | 組裝腳本：`python3 assemble.py [template]` 把佔位換成 base64／inline SVG，輸出 `hq-design-visual-proposal.html`。有缺檔或殘留佔位會 exit 1                                                                                     |
| `hq-design-visual-proposal.html`                                                 | 組裝結果 = `design/proposal/…v0.3.html`（md5 `35847232…`）                                                                                                                                                                     |
| `figma/pattern-cc.svg`                                                           | = `design/assets/pattern/…currentColor.svg`                                                                                                                                                                                    |
| `figma/pattern-white.svg` `pattern-orange-graphic.svg` `pattern-orange-icon.svg` | Figma 原始向量（Figma 資產 URL 7 天過期，這是唯一本地副本；repo 已有同檔）                                                                                                                                                     |
| `figma/p01-cover.png` … `p32-render.png`、`profile-overview.png`                 | Figma 32 頁簡介的截圖（封面、里程碑、整合交付、協作五階段、AI 優勢、參數化、BIM、施工六步、服務、組織、客戶、SECOM 圖集、渲染頁）。**內容權威的視覉參考**：eyebrow 橘紅 caps + 黑色 CJK 大標 + 等角 BIM 線稿的語言就是從這裡來 |
| `figma/bg-pattern.png`                                                           | pattern 兩變體的截圖                                                                                                                                                                                                           |
| `figma/iso-a.png` `iso-b.png` `iso-c.png`                                        | 從 p07／p08／p32 裁出的等角 BIM 線稿（模型空間章節用；正式站應改由 Figma 匯出原檔）                                                                                                                                            |
| `figma/cmp-line.png` `cmp-render.png`                                            | 同一辦公區的線稿與渲染（p32），對照 wipe 示範用                                                                                                                                                                                |
| `logo/HQ-logo.svg` `HQ-logo-wordmark.svg` `HQ-line-system.svg` + `.png` 渲染     | 從 `HQ Design - Design System/HQ-logo/` 複製的正確色（#D64518）logo 與線條系統。`LOGO/` 資料夾的 #DB421A 全部不用                                                                                                              |
| `framer-port/_source_UnfocusedComponent.framer.tsx` `_raw_readCodeFile.txt`      | Framer 元件原始碼（1,641 行）。**沒進 repo**，只供比對；若要重做轉換要從這裡看                                                                                                                                                 |
| `thumbs/*.jpg`                                                                   | 16 張 720×480 的 3:2 案例縮圖，從 `site/assets/img/work/<slug>/<slug>-hero-01.jpg` 用 sips 縮放裁切而來。可重現，僅供提案頁                                                                                                    |

### 中間產物／可丟

`proposal.template.html`（v0.1，已被 v2 取代）、`satoshi-variable.b64`（字體 base64，可由 `.workflow/active/WFS-hq-website-reset/codex-out/satoshi/Satoshi-Variable.woff2` 重做）、`pr-body.md`、`.DS_Store`。

---

## 5. 設計定案摘要（細節看提案頁與交接文件）

- **概念**：一套會動的施工圖說。白紙、墨線、mono 標註、60° 剖面線；影像是版面唯一的顏色；動態是「把圖畫出來」。
- **首頁**：Powerhouse 式捲動影像場（使用者確認）。12 張 3:2 tile 在 12 欄格上、不旋轉、三層視差、中心 tile 放大並畫出尺寸線、點圖以 `layoutId` 放大成案例 hero。舞台底層用 `HqUnfocusedMesh` 紙白變體。sticky 舞台是全站唯一允許 `100svh` 之處。
- **六個裝置**：圖名框（右下常駐，兼進度／麵包屑／語言）、尺寸線（取代所有圖說，右端標示只能來自 `sourceLabel()`）、圖層（解釋 BIM，建築＋機電同開時顯示衝突）、對照 wipe（60° 斜邊，`pairs[].intent===null` 顯示空框不湊圖）、圖紙索引（桌機左緣直排）、座標讀數。
- **字體**：Satoshi 300 對 Noto Sans TC 700 的對比；「×」改 60° slash 字形；直排只在索引與圖名框。
- **色彩**：Token 3.0 不新增色碼；55 白／25 深藍／10 圖紋／≤10 橘紅；HQ Mesh 只四組配對 + 3–8% grain 作底層。
- **實績**：圖例式 filter、找圖式 search、竣工圖集與設計圖集兩帶不混排、1–3 張圖的案子改名冊列。
- **案例**：不做滿版 hero；圖名框 + 9 欄 hero + 尺寸線 + mono「關閉 · ESC」。
- **流程**：三軌同圖（七段／外部設計意圖五階段對齊 03→07／施工六步落在 06→07）。

---

## 6. Astra 該優先重新優化的地方（我知道的弱點）

1. **首頁示範與規格不一致。** 提案頁的拼貼示範是「不釘住的 CSS 變數視差」，但交接文件 §6.1 依使用者要的 Powerhouse 感改成「釘住舞台 + `scale` 1→1.28 的 scroll zoom」。兩者手感不同，示範頁沒更新到釘住版。建議先做一個真正的 `ScrollZoomScene` 原型，再回頭決定舞台高度（240svh）與 scale 上限。
2. **手機版沒有認真設計。** 圖名框在 <700px 改四格貼底、圖紙索引隱藏、拼貼退成單欄，這些只是「不壞」，不是設計。尺寸線的 `white-space:nowrap` 在窄螢幕會溢出。
3. **`HqUnfocusedMesh` 的 drift 動畫未在 Next dev 實測**；預設橘紅色帶約 3.3% 但視覺很搶，建議 accent 寬度 1.5 或 null。
4. **橘紅像素稽核沒有實際跑過**（提案頁與規格都只是宣稱 ≤10%）。要用 Playwright 逐頁截圖算。
5. **D4–D7 是我的建議值**，使用者沒有逐項回覆：1.79 渲染裁 3:2 用 focal；30+ 年與 info@；首頁可混入標示過的 viz；14 張直式 2:3 允許在圖集用 2:3 框成對進 4 欄。任何一項可直接改交接文件 §12。
6. **等角 BIM 線稿是截圖裁切**，正式站要從 Figma 匯出原檔並經影像管線。
7. **`content/process` 沒有 loader**（`web/lib` 只有 projects loader）。需要時在 `COORDINATION.md` §6 登記後加 `web/lib/content/process.ts`，或請 `hqdesign-8d` 加。
8. **Vercel 專案 root directory 目前是 repo 根**，正式 app 在 `web/`。`web/` 提交後要改設定，否則預覽部署會拿到舊靜態頁。
9. **Codex 原型的 drawing 標示**「圖面 · DRAWING」與權威「設計圖面 · FLOOR PLAN」不一致，已寫進交接與契約待辦，尚未修。
10. **`framer reference/`** 目錄來源不明、內容未看，不要讓它進 commit 直到有人確認。

---

## 7. 關鍵參考路徑

| 用途                       | 路徑                                                                                                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Token 權威                 | `ds-bundle/tokens/hq.css`（superset）；`web/app/_ds/` 是它的同步產物，勿手改                                                                                                                                                                      |
| 元件規格 19 份             | `ds-bundle/components/**/*.prompt.md`；設計慣例 `ds-bundle/README.md`；事實表 `ds-bundle/guidelines/facts.md`                                                                                                                                     |
| 品牌 CIS                   | `HQ Design - Design System/Claude Design/DESIGN.md`（數位版權威，冷灰不用暖砂）；`HQ-logo/HQ DESIGN — 品牌視覺規範與 CIS 系統.md`（v1.0，45° 已作廢）；`HQ-logo/HQ-線條與標誌幾何標準-v2.md`（60°／51／12／63，權威）                             |
| Logo                       | `HQ Design - Design System/HQ-logo/export/`（#D64518，正確）；`LOGO/`（#DB421A，過期不用）                                                                                                                                                        |
| Figma                      | 檔案 `3viWBkQGZAEQnJntysBxZ7`；32 頁簡介 node `798:98780`；pattern node `1073:100220`（Default `925:103940`、Variant2 `1073:100221`）                                                                                                             |
| 字體                       | `.workflow/active/WFS-hq-website-reset/codex-out/satoshi/`（12 woff2 含 Variable，不 subset 不轉檔）；Noto Sans TC 與 Geist Mono 走 Google Fonts 或 next/font                                                                                     |
| 內容層                     | `content/projects/*.json`（33 案）、`content/process/*.json` + `figures/*.svg`、`content/NEEDS-REVIEW.json`；schema 與 loader 在 `web/lib/content/`；公司常數 `web/lib/site.ts`                                                                   |
| 影像                       | `web/public/media/work/<slug>/<stem>-<w>.webp`（六尺寸，不裁切）、`web/lib/content/generated/images.json`（blurDataURL）；AI 渲染母檔 `_EXCHANGE/ai-renders/final/`（26 張 5504×3072）與 `figma-ready/`（web 用 jpg）                             |
| 互動參考（只參考，不複製） | Powerhouse Company 首頁／Projects／專案頁；repo 根 `HQ Design React Project Experience System.md`、`HQ Design Motion-first 動畫元件系統.md`；`hq-design-website-motion/CLAUDE-INTEGRATION-HANDOFF.md` 與 `prototype/next-motion-site/components/` |
| 舊站（只當文字來源）       | `site/**`（48 頁）、repo 根 `*.html`                                                                                                                                                                                                              |

---

## 8. 給 Astra 的一句話

規則都在 `HANDOFF-web-design-fable-to-codex.md` §2，改設計時先看那十一條；提案頁 `design/proposal/…v0.3.html` 是目前的視覺基準，要推翻它就從 `proposal-v2.template.html` 改、`assemble.py` 組裝，並在 §14 變更表寫下為什麼。使用者要的是原創且實用，不是漂亮的參考複製。
