# Buttons-Eyebrow

## 按鈕

只有兩種：`.btn`（實心品牌色，主要動作）與 `.btn.ghost`（描邊，次要）。**一個區塊最多一個 `.btn`。**

```html
<a class="btn" href="/contact/">洽詢專案 <span class="ar">→</span></a>
<a class="btn ghost" href="/work/">看全部實績 <span class="ar">→</span></a>
```

`.ar` 是 mono 箭頭（→ 或 ↓），與文字有間距。

## Eyebrow

每個區塊上緣的小標。`.n` 是編號或英文短詞（品牌色），後面接說明。

```html
<div class="eyebrow"><span class="n">03</span><span>Process · 七段流程</span></div>
```

前綴的 28px 髮絲線由 CSS `::before` 自動產生，不要手動加。

## 硬規則

- 圓角只有 4px（`--radius-control`，僅按鈕）——**其他一切零圓角**
- **MUST NOT** 加外光暈、漸層或陰影
- 觸控目標 ≥44px
