# HQ DESIGN Design Tokens：Figma ↔ CSS 對照

- Figma：「HQ DESIGN - New Design System」（`YkQYrRyGsKJEpQj1Lo9kzR`），Components 頁 `126:22`
- CSS：`assets/css/tokens.css`（變數）、`assets/css/components.css`（元件）
- 展示頁：`/_ds/`（noindex，不連結、不進 sitemap）
- 建立日期：2026-11-20（PR 0：只新增檔案，現有頁面外觀不變）

## 怎麼用

1. 頁面 `<head>` 依序載入：Satoshi（Fontshare）→ `style.css` → `tokens.css` → `components.css`。
2. `<body>` 加 `class="ds-v2"`，新字體與底色才會生效。
3. 元件用 `.hq-` 開頭的 class；只用語意層變數（`--color-*`、`--text-*`、`--space-*`），不要直接用 `--hq-*` 原始色或寫死色碼。
4. 深色區塊：在 `<section>` 加 `data-theme="navy"` 或 `data-theme="dark"`，元件會自動換色。
5. 捲動淡入：元素加 `class="hq-reveal"`（`main.js` 會處理；沒 JS 時內容照常顯示）。

## 命名規則

Figma 的 `/` 換成 `-`，原始層加 `hq-` 前綴：`color/orange/100` → `--hq-orange-100`。

## 對照表

| Figma Variable                                   | CSS 變數                                        | 值                                      | 備註                                         |
| ------------------------------------------------ | ----------------------------------------------- | --------------------------------------- | -------------------------------------------- |
| color/orange/50–120                              | `--hq-orange-50`…`-120`                         | `#f2ded9`…`#992f19`                     | 100 = `#ff4e2a`                              |
| color/navy/50–120                                | `--hq-navy-50`…`-120`                           | `#8f98a4`…`#19273a`                     | 100 = `#1f3148`                              |
| color/neutral/light-50/75/100                    | `--hq-neutral-light-*`                          | `#fcfcfc` `#f9f9f9` `#f5f5f5`           |                                              |
| color/neutral/dark-25/50/75/100                  | `--hq-neutral-dark-*`                           | `#eeeeee` `#e8e8e8` `#e2e2e2` `#d9d9d9` |                                              |
| slide/text/primary                               | `--hq-ink` → `--color-text`                     | `#101924`                               |                                              |
| slide/text/secondary（`#0a0a0ab2`）              | `--hq-ink-secondary` → `--color-text-secondary` | `#4d4f53`                               | web 改實色，8.2:1                            |
| mode/text/muted（`#0a0a0a80`）                   | `--hq-ink-muted` → `--color-text-muted`         | `#6b6f75`                               | 原值只有 3.7:1，web 調深到 5.0:1             |
| slide/surface                                    | `--color-bg-subtle`、`--color-surface-muted`    | `#f5f5f5`                               |                                              |
| slide/line                                       | `--color-border`                                | `#e8e8e8`                               |                                              |
| slide/action/primary-bg / -text                  | `--color-primary` / `--color-on-primary`        | navy-100 / 白                           |                                              |
| slide/action/accent-bg / -text                   | `--color-accent-fill` / `--color-on-accent`     | `#ff4e2a` / `#101924`                   | 5.4:1。**不用** mode/on-accent 白字（3.3:1） |
| slide/text/accent、mode/accent-text              | `--color-accent-text`                           | `#cc3e22`                               | 白底 4.9:1、淺灰底 4.5:1                     |
| mode/link                                        | `--color-link`                                  | `#1f3148`                               |                                              |
| font/family/brand（Latin）                       | `--font-latin`                                  | Satoshi                                 |                                              |
| font/family/brand（ZH-TW）                       | `--font-zh`                                     | Noto Sans TC                            | `:lang(zh)` 自動切換                         |
| weight/\*                                        | `--weight-regular/medium/bold/black`            | 400/500/700/900                         |                                              |
| tracking/display/xl（Latin −2.4 / ZH +1.2 @120） | `--tracking-display`                            | −0.02em / +0.01em                       |                                              |
| tracking/headline/l（±0.56 @56）                 | `--tracking-heading`                            | −0.01em / +0.01em                       |                                              |
| tracking/body/m（ZH 0.6 @20）                    | `--tracking-body`                               | 0 / 0.03em                              |                                              |
| space/2xs…xl                                     | `--space-2xs`…`--space-xl`                      | 4 8 12 20 32 50                         |                                              |
| radius/sm md lg full                             | `--radius-sm/md/lg/full`                        | 8 16 24 999                             |                                              |
| stroke/divider、stroke/component                 | `--stroke-divider`、`--stroke-component`        | 1px、1.5px                              |                                              |
| container/shadow（0 10 32 #0a0a0a33）            | `--shadow-lg`                                   |                                         |                                              |
| icon/size XS–L                                   | `--icon-xs/sm/md/lg`                            | 16 20 24 32                             |                                              |
| icon/stroke-width                                | `--icon-stroke`                                 | 2                                       |                                              |

## Figma 沒有、網頁補上的 token（待 Figma「Web Foundations」頁回填）

| 類別     | CSS 變數                                                                                                                                         | 值                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| 網頁字級 | `--text-display` `--text-h1` `--text-h2` `--text-h3` `--text-body-lg` `--text-body` `--text-sm` `--text-label` `--text-caption` `--text-numeral` | 會隨螢幕縮放（`clamp`），見 tokens.css                |
| 行高     | `--leading-display/heading/body/tight`                                                                                                           | Latin 1.05 / 1.15 / 1.65 / 1.3；中文 1.15 / 1.3 / 1.8 |
| 大間距   | `--space-2xl/3xl/4xl`、`--section-y`                                                                                                             | 64 / 96 / 128；區塊 64→120                            |
| 版面     | `--container-max`、`--container-narrow`、`--gutter`、`--nav-height`                                                                              | 1200 / 760 / 16→32 / 72                               |
| 斷點     | `--bp-sm/md/lg/xl`                                                                                                                               | 640 / 768 / 1024 / 1280（@media 直接寫數字）          |
| 動態     | `--duration-fast/base/slow`、`--ease-standard`、`--ease-out`                                                                                     | 150 / 240 / 400ms                                     |
| 圖層     | `--z-*`                                                                                                                                          | 0 / 10 / 100 / 900 / 1000                             |
| 狀態色   | `--color-success-*`、`--color-danger-*`、`--color-warning-*`                                                                                     | 沿用退租復原頁                                        |
| 照片遮罩 | `--scrim-color`、`--scrim-strength`                                                                                                              | ink、0.8                                              |
| 焦點外框 | `--color-focus`                                                                                                                                  | `#cc3e22`（深色區 `#fc6f50`）                         |

## 與退租復原頁（`reinstatement-ds.css`）的差異

- 退租復原頁的變數只在 `.rs-page` 內有效，名稱沿用舊的 `--brand`、`--accent`。之後該頁換成 `.ds-v2` 時再統一。
- 退租復原頁中文也用 Satoshi 開頭；本檔依 Figma 規則改成「含中文用 Noto Sans TC」。**需要確認**最後要用哪一種。
