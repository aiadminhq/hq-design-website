# 給 Fable 的可複製工作提示

請以本交接包作為 Framer portfolio 的 read-only reference，協助重建 HQ Design website 的可重用 design components。

## 目標

建立可維護、可重用、內容與視覺分離的 HQ Design component layer。先處理 layout structure、responsive behavior、component states 與 token usage，再接入正式內容；不要把個人 portfolio 的內容、個人資料或未授權圖片帶入 HQ Design。

## 來源元件

優先查閱以下 Framer component node：

- Navigation：`ClWUvICnj`
- Card-Portfolio-Vertical：`RMWQkGShv`
- Gallery Section：`AGUPnwAVB`
- Timeline：`HAziGIbgH`
- Card/Clients Card：`Tz4ObI3jO`

下列元件只能作為待確認 reference：`kwZpx_ioN` Hero、`nMFCaAwuJ` Footer、FAQ/Accordion 系列，以及任何 `Node is not a text node` 的 component。若需要細節，先以 live MCP 重新取得 node XML，不得依名稱或 screenshot 自行補齊 props。

## 實作規則

1. 先建立 semantic component API：`Navigation`、`Hero`、`ProjectCard`、`ProjectGallery`、`ProcessTimeline`、`ClientCard`、`FAQ`、`Footer`。
2. 將 content、image source、link、label、locale 與 alt text 以 props/data model 注入；不可把 portfolio copy hard-code 到 component。
3. 保留 responsive states 與 keyboard/focus/reduced-motion behavior；任何 motion 都必須有靜態 fallback。
4. 套用 HQ Design tokens：`#D64518`、英文 Satoshi、中文 Noto Sans TC、零圓角規範、4px button radius；不得新增 serif、gradient text、glassmorphism 或 emoji。
5. 真實照片優先。AI render 必須有逐案 provenance 與 review state；`queued`、`restricted`、`in-progress`、`refunded` 不得視為可交付素材。
6. 不要直接搬移 Framer runtime bundle、外部 CDN dependency 或個人 portfolio 的 Code Component source。`Counter.tsx` 可作獨立動效研究，但先使用 canonical candidate `K4D4TwM`，並避開其重複副本。
7. `Blur Essence`、`RetroGrid`、`TypewriterEffect`、WebGL/canvas 與 glass 類效果預設停用，只有在頁面需求、效能與 accessibility 檢查完成後才提出 bounded pilot。

## 交付與檢查

- 先在 Fable 所屬的 `web/components/**` 與相關 design scope 建立小批可回復變更。
- 每個元件附上 source mapping、props、states、responsive notes、asset provenance 與檢查結果。
- 交付前至少完成 build、typecheck、runtime screenshot/read-back、keyboard focus、reduced-motion 與 mobile layout 檢查。
- 不要執行 Framer canvas mutation、publish、CMS mutation 或刪除/合併舊元件；如確實需要，停止並提出 action scope、預期 diff 與 rollback 方法。
