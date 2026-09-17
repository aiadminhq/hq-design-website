# HQ Design — 設計慣例（給 design agent）

用這套元件庫為**惠強室內裝修（HQ Design）**建置介面。這是一家台北的商用空間 design & build 公司，定位是「AI 深度整合設計流程」，不是「AI 當渲染工具」。視覺基調：**製圖式、精準、克制**——像一份施工圖說，不像行銷網站。

## 設定：只需一個樣式入口

```html
<link rel="stylesheet" href="_ds/<folder>/styles.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Geist+Mono:wght@400;500&display=swap">
```

`styles.css` 會 `@import` `tokens/hq.css`（token 與 `@font-face`）與 `tokens/components.css`（元件樣式）。**沒有 provider、沒有 JS runtime**——這是純 CSS 系統，元件用 class 組合。Satoshi 由 `tokens/hq.css` 的 `@font-face` 從 `fonts/*.woff2` 載入；中文與等寬字走 Google Fonts。缺了任一個 link，字體會退回系統 sans，整體立刻失去質感。

## 樣式慣用法：class 組合 + CSS 變數

沒有 utility class 系統，也沒有 props。版面用**語意 class**（`.wrap`、`.grid`、`.eyebrow`、`.btn`、`.case`、`.step`、`.cmp`、`.fig`），自訂間距與顏色時取 **CSS 變數**，不要寫死數值。

**顏色**（完整清單見 `tokens/hq.css`）

| 用途 | 變數 |
|---|---|
| 品牌唯一英雄色 | `--brand`（#D64518）、`--brand-hover`、`--brand-pressed`、`--brand-subtle` |
| 背景 | `--bg`、`--bg-sunken`、`--bg-inverse`、`--bg-immersive` |
| 前景三階 | `--fg`（標題）、`--fg-2`（正文）、`--fg-3`（註記） |
| 線條 | `--line`（髮絲）、`--line-ink`（區塊上緣墨線）、`--line-strong` |

**字體**：`--f-en`（Satoshi）、`--f-cjk`（Noto Sans TC）、`--f-sans`（兩者串接）、`--f-mono`（Geist Mono，用於數字與標籤）

**間距**：`--s1`(4px) 至 `--s10`(128px)、`--gutter`(24)、`--container`(1320)、`--section-y`

中文內容加 `.cjk` 取得正確行高字距；數字與規格用 `.mono`。

## 硬規則（違反會破壞品牌一致性）

1. **絕無襯線體。** `DESIGN.md` 原文：No serifs. Anywhere. Ever.
2. **零圓角。** 只有按鈕 4px（`--radius-control`），logo 印記 9.8%（`--radius-mark`）。其餘一律直角——系統刻意不提供通用圓角變數。
3. **橘紅是重點不是底色。** 單頁 `--brand` 像素佔比上限 10%（`--hq-ratio-brand-max`）。CTA、focus ring、eyebrow 編號、60° slash——到此為止。
4. **MUST NOT** 新增彩色、霓虹、玻璃擬態、高飽和科技色、外光暈、漸層文字。
5. **影像一律 3:2**（`aspect-ratio:3/2;object-fit:cover`），走 9／6／4 欄配置，**避免 8 欄**（581.3px 脫離 8px 節奏；9 欄得 656px = 8×82 完全貼合）。
6. **每張影像都要來源標示。** 見 `components/Components/Source-Label`。四種：`photo`／`viz`／`enh`／`drawing`。把設計視覺標成完工實景是內容政策紅線。
7. **MUST NOT** 用 `100vh`／`h-screen`，**MUST NOT** 三等分卡片牆作主結構，**MUST NOT** 用 emoji。
8. 角度只用 **0°／90°／60°／120°／30°／150°**（`DESIGN.md` §5.1.6 的角度族）。60° slash 是品牌簽名，用在 eyebrow 前綴、來源標示引線、對照表右欄。

## 真相在哪裡

- **樣式**：`_ds/<folder>/styles.css` 與它 `@import` 的 `tokens/hq.css`、`tokens/components.css`。**先讀這兩個檔案再動手**，裡面有全部可用的 class 與變數。
- **元件用法**：`components/<group>/<Name>/<Name>.prompt.md` — 每個元件的 API、範例與硬規則。
- **完整頁面範例**：`components/Pages/*` — 10 個真實頁面的快照，是版面節奏最好的參考。
- **內容事實**：`guidelines/` — 七段流程的正式命名、影像來源政策、公司事實（面積、年份、案例名）。

## 一個慣用範例

```html
<section>
  <div class="wrap">
    <div class="eyebrow"><span class="n">03</span><span>Process · 七段流程</span></div>
    <h2 class="cjk">從現況掃描到交付，<br>每一段都有人負責、有系統加速。</h2>
    <div class="grid" style="margin-top:var(--s8)">
      <figure class="fig" data-provenance="photo" style="grid-column:1/span 9;margin:0">
        <img src="…" alt="…" width="2560" height="1707">
        <figcaption><span class="src">完工實景 · AS-BUILT</span><span class="sp">接待大廳</span></figcaption>
      </figure>
      <aside style="grid-column:10/span 3;align-self:end">
        <p class="small cjk" style="color:var(--fg-2)">5,940 sqm · 分區施工 · 零重大缺失驗收</p>
        <a class="btn ghost" href="#">看旗艦案 <span class="ar">→</span></a>
      </aside>
    </div>
  </div>
</section>
```

版面用 `.grid` 的 9／3 欄不對稱切分；控制項用庫的 `.btn`；自訂間距取 `var(--s8)`。這是這套系統的標準寫法。
