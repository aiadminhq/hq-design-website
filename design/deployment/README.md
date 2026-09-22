# RWD 與 Vercel 部署

2026-09-06。沿用 `feat/site-rebuild`，保留既有 staging。新建 Vercel 專案 `hq-design-next`，team `aiadminhqs-projects`，Root Directory `web`。此專案與既有 `hq-design-website` 分開。

公開網址：https://hq-design-next.vercel.app/zh

最後線上驗證：4 組 HTTP 測試全數通過，包含 96 個中英文內容路由、100 個站內目的地、582 個照片尺寸版本加 4 個品牌資產、27 條轉址與未知頁面 404。本地 `npm run verify` 與 Vercel production build 均通過。

Production deployment：`dpl_9YVE84heWHAVoXrkqGKbxEA8WjPE`；Vercel build 完成並指派上述 alias，瀏覽器已讀回正式 Logo、照片、字型與新的 public pattern。第一版遇到 serverless 404 頁讀不到原本 filesystem pattern，已移除該 runtime 依賴，並設定有限內容路由的 `dynamicParams = false`；線上未知案例已回傳 404。

## RWD

- 小手機標題依寬度縮放；首頁以 svh 配合高度上下限。
- 手機安全邊界、44px 觸控導覽／篩選／Gallery 按鈕、16px 表單字級。
- 平板聯絡與關於單欄、服務資訊欄位調整。
- 橫向短螢幕停用首頁 pinning，選單可捲動。
- 手機移除浮動 Title block，避免遮住圖片與操作。
- 320、390、768、1024px 主要頁面無水平溢出；實測手機導覽與語言／關閉按鈕高度 44px。

## 品牌資產來源

- Footer lockup：`HQ Design - Design System/HQ-logo/export/HQ-logo-wordmark.svg`。
- 導覽 icon：`HQ Design - Design System/LOGO/Icon Color=Black, Background=Transparent.svg`。
- favicon：同來源資料夾 `Icon Color=Orange, Background=White.svg`，網站衍生版本僅將舊橘色 `#DB421A` 統一為 `#D64518`，原始檔未修改。
- 網站副本：`web/public/brand/` 與 `web/app/icon.svg`；保留幾何與長寬比。
- Footer pattern 沿用 `design/assets/pattern/hq-pattern-1073-100220-currentColor.svg`，複製至 public 並使用 CSS mask，避免 serverless 404 渲染時讀取本機路徑。

## 可重複部署

從 repo 執行 `node design/deployment/package.mjs`，得到獨立暫存部署資料夾。腳本僅複製 app 必要路徑、DS tokens/fonts、CMS 三份文案、content、品牌 SVG、衍生照片與 content 指向的 126 張原圖。排除 `.env*`、Git、node_modules、既有 build；不包含第三方鏡像。

在輸出的部署資料夾執行：

```sh
vercel link --yes --project hq-design-next --scope aiadminhqs-projects
vercel deploy --prod --yes --scope aiadminhqs-projects
```

先於原始 `web/` 執行 `npm run verify`。部署後可於原始 `web/` 執行 `SITE_TEST_ORIGIN=https://hq-design-next.vercel.app npm run test:local` 核對 96 個頁面、站內連結、圖片與 27 條轉址。此測試依原始 checkout 的 `.next/prerender-manifest.json` 決定應有頁面。

字型與衍生照片仍依既有規則不進 Git，但會包含於部署包；新電腦須先備齊本機資產。原有域名與 Git 自動部署設定未變更。聯絡表單未實際寄送。
