# Next.js 整合檢查紀錄 · 2026-09-23

目前階段為程式實作與 Preview 驗收，尚未取得正式官網切換授權。

## 已完成檢查

- 官方 main 基準：`423df0c`。在獨立 `hq-design-website-rebuild` worktree 整合至 `feat/site-rebuild`；原 main 工作區的 HTML、照片及未提交檔案保留。
- 16 個中英文主要頁面、28 個專案各兩種語言，共 72 個可瀏覽頁面。8 個新增專案已納入；5 組暫緩專案與歷史 orphan 排除。
- 149 項 HTTP 路由檢查：72 個正常頁面、72 個 308 舊網址轉址、5 組暫緩專案實際回傳 404。sitemap 含 72 個網址。
- TypeScript、Next.js 正式 build、內容檢查通過。
- Next.js/CMS 單元測試 13 項通過；根目錄歷史解析器及保護機制 18 項通過。舊解析器測試使用其支援的歷史 fixtures，不代表它支援新版 main。
- 實際啟動正式 build 測試簽署預覽連結、HttpOnly cookie、私有照片授權、noindex、無授權拒絕、公開版本不受草稿影響。
- 發布與回退邏輯測試涵蓋 digest 不符、不可變版本、照片上傳失敗、ETag 競爭與上一版回退；Preview 與 Production 指標分開。
- 桌面瀏覽器比對 main 與 Next.js：Logo、首頁標題、說明、CTA 的位置與尺寸一致。
- 390px 手機檢查：繁中首頁、國產專案與聯絡頁沒有水平溢出；手機選單可開關與 Escape 關閉。
- 起家雞 Gallery 可開啟單張照片、Escape 關閉；返回作品列表後保留餐飲分類及捲動位置。
- reduced-motion 實際模擬為開啟，分類切換後沒有持續運行的動畫。
- Vercel Preview 初次讀回已確認國產四張照片、3,300 m²／約 1,000 坪、中英文完整頁面切換與 noindex。
- 網站資產副本由約 329 MB 降至 41 MB；原始照片沒有改寫。
- 根目錄與 web 的 npm audit 均未回報已知漏洞。

## 尚待雲端啟用與人工確認

- Vercel 團隊當前沒有 Blob store，建立 private/public store 的授權尚未回覆；沒有建立或啟用付費資源。
- Vercel Preview 尚未配置 Notion/Blob/CMS secret。已連接的 Notion 工具可讀取 Metadata，但不等於部署後的伺服器已有 Notion API Token。
- 目前 Preview 使用整理後的基準快照。雲端 Notion 即時查詢、真實 Blob 上傳／發布／回退，須完成環境設定後再驗收；不能將本機模擬測試當作雲端已接通。
- Notion 回傳的部分 Area Sqm 仍空白，已依使用者提供的截圖補入明確數字。來源列於 `content/generated/source-report.json`，沒有自行補造缺值，也沒有改寫 Notion。
- 尚未實際送出聯絡或招募表單，以免製造業務訊息；沿用 main 的 Formspree action，已核對表單欄位與入口。
- 正式官網仍由既有 main 提供。Vercel 專案全域 Root Directory 與 Framework 設定沒有變更；正式切換、最新 main 差異與回退部署仍需最後確認。
