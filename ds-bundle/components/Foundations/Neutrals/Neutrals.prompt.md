# Neutrals

所有背景、文字、線條的來源。三個灰階前景對應標題／正文／註記。

## 用法

`--bg`／`--bg-sunken`／`--bg-inverse`／`--bg-immersive`；`--fg`／`--fg-2`／`--fg-3`；`--line`（髮絲）／`--line-ink`（區塊上緣墨線）。全部在 light／dark 兩主題下已定義。

```html
<section style="background:var(--bg-sunken)"><div class="wrap"><h2 class="cjk">區塊標題</h2></div></section>
```

## 注意

- **MUST NOT** 只在 media query 或 `[data-theme]` 內定義顏色——會在未標記主題的狀態下失效
- `--line-ink` 用於區塊上緣的粗分隔；`--line` 用於卡片與列之間

