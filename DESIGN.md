---
version: alpha
name: HQ Design
description: HQ DESIGN design system as implemented in this repo (assets/css/tokens.css, components.css), extended with a homepage redesign layer (dark glass hero, process cards, loader).
colors:
  ink: "#101924"
  navy: "#1f3148"
  navy-deep: "#19273a"
  orange: "#ff4e2a"
  orange-text: "#cc3e22"
  orange-on-dark: "#f7ae9e"
  text-secondary: "#4d4f53"
  text-muted: "#6b6f75"
  surface-subtle: "#f5f5f5"
  border: "#e8e8e8"
  white: "#ffffff"
typography:
  display:
    fontFamily: Satoshi
    fontSize: 88px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.02em
  h1:
    fontFamily: Satoshi
    fontSize: 56px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.01em
  body:
    fontFamily: Satoshi
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: Satoshi
    fontSize: 13px
    fontWeight: 500
    letterSpacing: 0.12em
rounded:
  sm: 8px
  md: 16px
  lg: 24px
  full: 999px
spacing:
  2xs: 4px
  xs: 8px
  sm: 12px
  md: 20px
  lg: 32px
  xl: 50px
  2xl: 64px
  3xl: 96px
  4xl: 128px
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.full}"
    height: 48px
  button-accent:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    height: 48px
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.md}"
---

## Overview

本文件以 repo 內已實作的 HQ DESIGN 設計系統為唯一來源 [S1][S2]，再加上「首頁改版」所需的延伸層（標示為 **proposed**）。
與 `awwwards-design-md` 技能的預設用法不同：本次不是從外部網址反推，所以沒有 `design-evidence.json`；每個值都可回溯到 `assets/css/tokens.css` 的變數，沒有臆測的 token 名稱。
品牌性格：機構級、可信賴、清楚。深藍與墨色為底，品牌橘只做小面積重點；先講清楚服務，再炫技。

分類說明：**observed** = 直接寫在 repo 檔案內；**proposed** = 本次改版新增、尚未回填 Figma。

## Colors

observed [S1]：

| 語意 | 變數 | 值 | 用途 |
| ---- | ---- | -- | ---- |
| 墨色 | `--hq-ink` → `--color-text` | `#101924` | 主文字、深色區塊底（`data-theme="dark"`） |
| 品牌藍 | `--hq-navy-100` → `--color-primary` | `#1f3148` | 主要按鈕、`data-theme="navy"` 底 |
| 深藍 | `--hq-navy-120` | `#19273a` | 深色區塊表面 |
| 品牌橘 | `--hq-orange-100` → `--color-accent-fill` | `#ff4e2a` | 一頁一顆主要 CTA、面積用；**橘底一律深字**（白字僅 3.3:1） |
| 橘字 | `--color-accent-text` | `#cc3e22`（深底 `#f7ae9e`） | 淺底橘色文字／label，白底 4.9:1 |
| 次要文字 | `--color-text-secondary` | `#4d4f53` | 8.2:1 |
| 弱化文字 | `--color-text-muted` | `#6b6f75` | 5.0:1 |
| 淺灰底 | `--color-bg-subtle` | `#f5f5f5` | 交替區塊 |
| 分隔線 | `--color-border` | `#e8e8e8`（深底 `rgb(255 255 255 / .16)`） | 細線 |

proposed（首頁）：深色玻璃面板 = `rgb(255 255 255 / 0.06)` 底 + `1px` `--color-border` + `backdrop-filter: blur(14px)`，文字用 `--color-text` 白；線稿線色 = `rgb(255 255 255 / 0.55)`，重點線 = `--hq-orange-90`。

## Typography

observed [S1]：Latin 用 **Satoshi**（Fontshare），含中文用 **Noto Sans TC**（`:lang(zh)` 自動切換）。字重 400 / 500 / 700 / 900。字級（`clamp`）：display 44→88、h1 32→56、h2 26→36、h3 20→24、body-lg 18、body 16、sm 14、label 13、caption 12。
行高：Latin 1.05 / 1.15 / 1.65；中文 1.15 / 1.3 / 1.8。字距：display −0.02em（中文 +0.01em）、label 0.12em（中文 0.08em）。
proposed：流程編號與小標使用 `ui-monospace` 小字（Heron AI 的 mono label 借鏡），僅作裝飾性數字與 label，不承載必要資訊。

## Layout

observed [S1]：`--container-max: 1200px`、`--container-narrow: 760px`、`--gutter: clamp(16px, 4vw, 32px)`、`--nav-height: 72px`、區塊上下 `--section-y: clamp(64px → 120px)`。斷點 640 / 768 / 1024 / 1280。
proposed 首頁頁面結構（由上而下）：Loader → Hero（深色，線稿 + 玻璃 metrics）→ 流程導向服務卡（六張全寬色塊）→ 兩種入口 → 流程時間軸（Brief→Handover）→ 三大優勢 → 外資段落 → 作品入口（純文字分類卡）→ CTA → Footer。

## Elevation & Depth

observed [S1]：`--shadow-sm 0 1px 2px`、`--shadow-md 0 8px 24px`、`--shadow-lg 0 10px 32px`；圖層 `--z-sticky 100`、`--z-overlay 900`、`--z-modal 1000`。
proposed：loader 使用 `z-index: var(--z-modal)` 以上之專用值 `1100`（高於 nav）。

## Shapes

observed [S1]：圓角 8 / 16 / 24 / 999；線寬 1px（divider）、1.5px（component）。按鈕與 Tag 為膠囊（999）；卡片 16；照片／大區塊 24。
proposed：服務卡為整列全寬色塊，圓角 `--radius-lg`；影像視窗（loader）圓角由 24 → 0 隨展開收斂。

## Components

observed [S2]（`components.css`）：`.hq-btn`（`--primary` 深藍、`--accent` 橘、`--outline`、`--inverse`）、`.hq-tag`、`.hq-card`、`.hq-stats`、`.hq-steps`（流程步驟）、`.hq-label`、`.hq-reveal`（捲動淡入，無 JS 照常顯示）、`.ds-v2 .nav` 導覽。
proposed：`.hm-loader`（開場）、`.hm-hero`、`.hm-glass`、`.hm-service`（流程導向服務卡）、`.hm-timeline`、`.hm-work`（見 `assets/css/home.css`，只引用語意層變數，不寫死色碼，僅線稿 SVG 內使用 `currentColor`）。

## Motion

observed [S1]：`--duration-fast/base/slow = 150/240/400ms`、`--ease-standard cubic-bezier(.2,0,0,1)`、`--ease-out cubic-bezier(.16,1,.3,1)`；`prefers-reduced-motion: reduce` 時 duration 變數歸零。
proposed：loader 時間軸與規格見 `docs/redesign/motion-study.md`；任何動態須能被 `prefers-reduced-motion`、Skip 鈕與 `Esc` 關閉。

## Do's and Don'ts

- Do：只用語意層變數（`--color-*`、`--text-*`、`--space-*`）；橘底配深字；一頁只放一顆 accent 按鈕。
- Do：服務用「編號 + 一句話 + 流程步驟」；年資放在角標或一行 metrics。
- Don't：首頁不得出現客戶照片、圖面、名稱、logo（硬性規則）；影像一律用 HQ 自繪或虛構的線稿。
- Don't：不要把 LPAS 的文字、logo、素材搬過來，只學節奏。
- Don't：不要把純裝飾動態當成資訊載體（loader 文字在 `prefers-reduced-motion` 下不顯示，不影響內容）。

## Sources

- [S1] `assets/css/tokens.css` — 變數原始檔（Figma「HQ DESIGN - New Design System」`YkQYrRyGsKJEpQj1Lo9kzR` 對照）
- [S2] `assets/css/components.css`、`docs/design-system/tokens.md` — 元件與對照表
- [S3] `docs/redesign/inspiration.md`、`docs/redesign/motion-study.md` — Awwwards 參考與 LPAS loader 研究

## Coverage and limitations

- 未涵蓋：Figma 原檔（本次未讀取）、頁面實際渲染值的 computed-style 取樣、深色模式以外的 Color Mode。
- `docs/design-system/tokens.md` 載明的待確認事項仍有效：中文字體最終用 Noto Sans TC 還是 Satoshi 開頭。
- 「proposed」段落為本次改版設計，尚未回填 Figma Web Foundations。

## Unresolved details

- 玻璃面板的 blur 與透明度為視覺調校值，需與設計確認。
- Hero 線稿的最終品牌化（是否改為 HQ 專屬插畫風格）待設計回覆。
