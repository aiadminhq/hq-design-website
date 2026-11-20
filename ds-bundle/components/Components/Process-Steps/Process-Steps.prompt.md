# Process-Steps

七段設計流程的時間軸。這是網站差異化敘事的骨幹，**順序與命名不可自創**。

## 定案的七段

| # | slug | 中文 | English | 標籤 |
|---|---|---|---|---|
| 01 | `site-survey` | 現況掃描 | Site Survey | AI |
| 02 | `parametric` | 參數化方案 | Parametric Design | Parametric |
| 03 | `design-intent` | 設計意圖定案 | Design Intent | — |
| 04 | `technical-validation` | 技術驗證 | Technical Validation | — |
| 05 | `bim` | BIM 協調 | BIM Coordination | BIM |
| 06 | `construction-docs` | 施工圖說 | Construction Documentation | — |
| 07 | `delivery` | 交付與專案管理 | Site Delivery & AI PM | AI PM |

## 用法

```html
<div class="steps">
  <div class="step">
    <div class="idx">01</div>
    <div class="en">Site Survey</div>
    <h3 class="cjk">現況掃描</h3>
    <p class="cjk">一句話效益。</p>
    <span class="tag">AI</span>
  </div>
</div>
```

`.tag` 只用於 AI／Parametric／BIM／AI PM 四段——標出 AI 實際介入的位置，不要每段都加。

## 兩種委任模式

- **全案設計施工**：01 → 07
- **外部設計意圖接手**：04 → 07（設計由業主指定團隊完成，惠強從技術驗證接手；金普頓大安酒店即此模式）
