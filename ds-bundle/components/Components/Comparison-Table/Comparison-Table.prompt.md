# Comparison-Table

「一般設計流程 vs HQ AI-Integrated」的對照表。這是整個網站最有力的單一論證，來源是公司簡介 P06。

## 用法

```html
<div class="cmp">
  <div class="row head">
    <div>Conventional Workflow · 一般設計流程</div>
    <div class="vs"></div>
    <div>HQ AI-Integrated</div>
  </div>
  <div class="row">
    <div><div class="k">Options</div><div class="v cjk">左欄：一般做法</div></div>
    <div class="vs"></div>
    <div><div class="k">Options</div><div class="v cjk">右欄：HQ 做法</div></div>
  </div>
</div>
```

- `.k` 是 mono 小標（Options／Consistency／Risk）
- 右欄的 `.v` 自動帶 60° slash 前綴，左欄不帶
- `.vs` 是中間 1px 分隔線，行動版自動隱藏

## 硬規則

- 左欄描述一般做法時 **MUST NOT** 貶低同業——只陳述流程差異
- 右欄的每一項主張都要能對映到實際能力，**MUST NOT** 加入 HQ 未具備的能力
