# Brand-Color

品牌色的唯一來源。任何強調、CTA、focus ring 都取自這裡，不要自訂色碼。

## 用法

`var(--brand)` 主色｜`var(--brand-hover)`｜`var(--brand-pressed)`｜`var(--brand-subtle)` 極淡底。深色主題下 `--brand` 自動降為 300 階以維持對比。

```html
<a class="btn" href="#">洽詢專案 <span class="ar">→</span></a>
```

## 硬規則

- **MUST NOT** 新增任何彩色、霓虹、玻璃擬態或高飽和科技色
- 橘紅是重點不是底色：單頁像素佔比上限 10%
- 深色主題不要手動改色，token 已處理

