# Source-Label

**每一張影像都必須帶來源標示。** 這是內容政策的硬要求，不是可選的裝飾——用來確保業主不會把設計視覺誤認為完工實景。

## 用法

在 `<figure class="fig" data-provenance="...">` 上設定四種值之一，圖說第一個 span 放標示文字：

| `data-provenance` | 標示文字 | 用於 |
|---|---|---|
| `photo` | 完工實景 · AS-BUILT | 真實完工攝影 |
| `viz` | 設計提案視覺 · DESIGN VISUALISATION | 由設計圖面 AI 重製，非完工實景 |
| `enh` | 實拍 · AI 光影強化 · AI-ENHANCED | 以實拍為底經 AI 修整，與原始實拍已有差異 |
| `drawing` | 設計圖面 · FLOOR PLAN | 平面／立面圖 |

```html
<figure class="fig" data-provenance="viz">
  <img src="…" alt="…" width="2560" height="1707">
  <figcaption><span class="src">設計提案視覺 · DESIGN VISUALISATION</span><span class="sp">開放辦公區</span></figcaption>
</figure>
```

## 硬規則

- **MUST NOT** 省略標示，也 **MUST NOT** 把 `viz` 或 `enh` 標成 `photo`
- 標示用 mono 字 + 1px 60° 引線，是版面秩序的一部分，不是免責聲明——**不要**做成 badge、色塊或彈出提示
- 案例頁若整案皆為 `viz`，另外在頁面加一個「影像性質」說明區塊
