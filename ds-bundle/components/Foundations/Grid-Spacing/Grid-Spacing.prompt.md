# Grid-Spacing

版面骨架。容器、欄位與間距尺標。

## 用法

`.wrap` 容器（max 1320 + 24 gutter）｜`.grid` 12 欄 grid｜間距 `--s1`(4) 至 `--s10`(128)｜區塊垂直間距 `--section-y`。

**影像一律 3:2**，走 9／6／4 欄配置，避免 8 欄。

```html
<section>
  <div class="wrap">
    <div class="grid">
      <div style="grid-column:1/span 9"><img src="…" style="aspect-ratio:3/2;object-fit:cover"></div>
      <aside style="grid-column:10/span 3">…</aside>
    </div>
  </div>
</section>
```

## 硬規則

- **零圓角**（通用圓角變數 不存在；僅 logo 印記用 9.8%）
- 用 flex/grid 的 `gap` 排版，不要逐元素 margin
- **MUST NOT** 用 `100vh`／`h-screen`

