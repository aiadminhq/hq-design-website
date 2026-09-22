# Case-Card

案例列表的基本單位。**不做等分卡片牆**——卡片寬度由可用影像的數量與品質決定。

## 用法

```html
<div class="cases">
  <a class="case" href="/work/<slug>/" data-cat="office" data-provenance="photo">
    <div class="imgw"><img src="…" alt="…" width="2560" height="1707"></div>
    <div class="meta">
      <div class="t cjk">中文案名<span class="en">English gloss</span></div>
      <div class="d"><b>5,940</b> sqm<br>NANGANG · 2025</div>
      <div class="src">完工實景 · AS-BUILT</div>
    </div>
  </a>
</div>
```

- `data-cat`：`office`／`hospitality`／`fb`／`showroom`／`lounge`（純 CSS 篩選用）
- `data-provenance`：見 Source-Label
- `.d` 用 mono，面積數字包 `<b>`
- 版面權重：旗艦案 `grid-column:1/span 8`，中型 6 欄，小型 4 欄

## 硬規則

- 影像 **MUST** 是 3:2（`aspect-ratio:3/2;object-fit:cover`）
- **MUST NOT** 三等分卡片牆作為主結構
- 只有 1–3 張影像的案例改用名冊列（`.reg .row`），不做卡
