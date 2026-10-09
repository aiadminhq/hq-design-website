# Typography

字型階與中英混排規則。標題、eyebrow、mono 數字各有專屬用法。

## 用法

`--f-en` Satoshi（拉丁）｜`--f-cjk` Noto Sans TC｜`--f-sans` 兩者串接（拉丁走 Satoshi，CJK 逐字回退）｜`--f-mono` Geist Mono（數字與標籤）。

中文區塊加 `.cjk` 取得正確行高與字距；`.mono` 用於規格、面積、年份；`.eyebrow` 是區塊上緣的小標（mono + 0.14em + 60° 前綴線）。

```html
<div class="eyebrow"><span class="n">03</span><span>Process</span></div>
<h2 class="cjk">從現況掃描到交付</h2>
<p class="lede cjk">段落引言。</p>
<p class="mono">5,940 SQM · NANGANG · 2025</p>
```

## 硬規則

- **MUST NOT** 使用任何襯線體（`DESIGN.md`：No serifs. Anywhere. Ever.）
- H2 = 600 字重需變數字體；靜態檔僅有 300/400/500/700/900
- 數字一律 `font-variant-numeric: tabular-nums`（`.mono` 已內建）

