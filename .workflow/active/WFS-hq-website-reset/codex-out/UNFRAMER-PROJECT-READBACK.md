# Unframer template 改造專案讀回

讀回日期：2026-09-03

## Authority

- 使用者已指定所提供的 Unframer MCP endpoint 作為此次 template 改造專案。
- Endpoint 含 secret；本文件與 repo 僅記錄遮罩形式，不保存完整 URL。
- MCP server：`Framer MCP`，version `1.8.0`，由 Unframer 提供。
- JSON-RPC initialize、`tools/list`、`getProjectXml`、`getProjectWebsiteUrl` 與 focused page `getNodeXml` 均成功。

## Project read-back

- Published production URL：`null`
- Published staging URL：`null`
- 目前 focused page：`/hq-home`，node ID `GcRr7rS33`
- Web pages：13 個
  - `/`
  - `/about`
  - `/careers`
  - `/services`
  - `/gallery`
  - `/contact`
  - `/projects/:slug`
  - `/blog`
  - `/blog/:slug`
  - `/projects`
  - `/404`
  - `/hq-home`
  - `/page`
- Design page：`Design`
- Reusable components：29 個；包含 `card - process`、`card - services`、`card - project name`、`card - project details`、`section - testimonials`、`nav-bar`、`Footer` 等。
- Code components／overrides：目前皆為空。

## `/hq-home` 已讀回結構

- Sections：Hero、Trusted、About、Craft、Projects、Services、CTA。
- Hero 已出現 HQ Design 內容：`Commercial Design & Build · 31 Years · Taipei`、`Zero Downtime. Turnkey Delivery.`、中文副標、31+ years 與 1,600+ projects。
- 目前字體仍見 Inter／Inter Display，尚未切換至 Satoshi／Noto Sans TC。

## 執行邊界

此讀回只確認 MCP 可存取與 project 結構，尚未代表 template、內容、CMS、字體、雙語 schema 或視覺已完成。正式修改前仍須依 guidance specification、Token 3.0、Figma P02 與影像真實性政策逐項執行並讀回。
