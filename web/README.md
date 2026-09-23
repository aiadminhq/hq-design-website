# HQ Design Next.js rebuild

此應用位於 `feat/site-rebuild`，以官方 `aiadminhq/hq-design-website` 的 main `423df0c` 為版型與非專案文案基準。採用 App Router，英文在根路徑、繁中在 `/zh`。主要頁面在伺服器端轉為 React 元素；互動元件只涵蓋導覽、Motion、作品分類與 Gallery。

根目錄保留舊 CMS 工具。舊 HTML 解析器僅支援歷史中文模板，測試輸入固定於 `scripts/fixtures/legacy-1fdff97/`，原斷言保留；`extract` 必須明確設定歷史來源，避免新版 main 被舊解析器誤讀。新官網以此目錄的 Notion 草稿流程管理專案。

## 本機開發

```sh
cd web
npm ci
npm run dev
npm test
npm run typecheck
npm run content:check
npm run build
```

`content/generated/pages.json` 保留 main 的文案、區塊順序與頁面專用樣式。共用導覽、頁尾、CTA、作品卡片及 Gallery 位於 `components/`；不要直接在原始 HTML 上繼續實作 Next.js 互動。更新 main 後，可透過 `scripts/import-main.ts` 重建凍結內容。

```sh
HQ_PHOTO_SOURCE_ROOT='/absolute/path/to/approved-photo-checkout' npm run content:import
```

此指令重建自己產生的 `public/assets/`，不修改來源照片。照片以本機作品頁的單張影像清單為優先，不接受 Figma 整頁或 contact sheet。JPEG 網站副本限制長邊 2400px、品質 85；已選 WebP 保留原檔。完整來源照片留在原 checkout。Motion 的 duration/ease/stagger 來自 `codex/hq-motion-first`，沒有整批合併原型。

## 資料權責

- `content/initial-release.json`：隨此 Preview 提供的 28 專案基準快照；不是正式官網發布授權。
- `content/notion-metadata.json`：此次透過已連接 Notion 讀取的專案資料，不包含 Token 或臨時附件網址。
- `content/area-confirmed.json`：使用者 2026-09-23 截圖明確提供的平方米。只有 Notion 空值時才補用；日後 Notion 有數值時以 Notion 為準。來源可在 `content/generated/source-report.json` 查閱。
- 只保存 `areaSqm`；坪數於顯示時計算 `areaSqm / 3.3`，最多一位小數，整數不補 `.0`。未提供面積與年份時省略。
- 五組暫緩專案及歷史 orphan `zhongbao-nangang` 不進入公開列表、路由或 sitemap。
- 保創第二張爭議照片未採用；本機來源與編修紀錄留在原工作區的 `codex-out/portfolio-image-refresh-20260923/`、`codex-out/csun-qijia-refresh-20260923/` 與 `codex-out/guochan-portfolio-20260923/`。
- 新增專案的英文說明是對既有中文說明的翻譯，沒有新增年份、業主或工程事實。

## 草稿、照片、發布與回退

伺服器／內部 CLI 使用 `.env.example` 所列設定，實際值放在忽略追蹤的 `.env.local` 或 Vercel 環境變數。CLI 自動載入 `.env.local`；憑證不可放入命令列參數、聊天內容或 Git。

必要設定：`NOTION_TOKEN`（需可讀取 Projects data source）、`HQ_BLOB_PRIVATE_TOKEN`、`HQ_BLOB_PUBLIC_TOKEN`、至少 32 隨機字元的 `HQ_CMS_SECRET`、`HQ_CMS_URL`。連線版本使用 Notion `2025-09-03` API。

Vercel Preview 與 Production 的快照及發布指標分別位於 `preview/`、`production/`；Preview 不能因環境設定誤指向正式指標。本機 CLI 操作 Blob 時，以 `HQ_CMS_NAMESPACE=preview` 對應 Preview。正式發布前須另外確認並明確改為 `production`。建議兩種環境使用不同 CMS secret。

沒有 Blob 設定時，網站使用基準快照，發布接口不開放寫入；不會假裝已完成 Notion 即時串接。`HQ_CMS_LOCAL=1` 僅支援本機測試，Vercel 不會退回本機檔案儲存。

### 1. 先上傳本機單張照片

建立本機 manifest（不要提交含絕對路徑的工作清單）：

```json
[
  {
    "slug": "guochan-office",
    "files": ["/absolute/path/meeting.webp", "/absolute/path/office.webp"]
  }
]
```

```sh
npm run cms -- upload photos-20260923 /absolute/path/manifest.json
```

照片依 slug、檔案雜湊與陣列順序寫入私有儲存。每個草稿版本不可覆寫。新專案可在 manifest 額外提供符合 `projectSchema` 的 `project` Metadata。

### 2. 讀取 Notion 成為新的草稿

```sh
npm run cms -- draft review-20260923 photos-20260923
```

省略最後一個草稿版本時，以上次已發布快照為基礎。Notion 的 `Sort Order` 控制專案排序；`Hero Image`、`Image 1` 至 `Image 8` 的檔名若與已選照片的 `assetName` 相符，可調整同一組照片的封面與順序。未匹配的舊附件不能覆蓋已選照片；新照片須先經本機 upload。Notion 中的新專案若尚未映射單張影像，匯入會明確失敗。

### 3. 取得受限預覽連結

```sh
npm run cms -- preview review-20260923
```

指令回傳版本、SHA-256 digest 及 30 分鐘有效的簽署預覽連結。瀏覽器使用 HttpOnly cookie；私有照片只對該版本開放，頁面標示 `noindex`。預覽不修改公開版本，不呼叫正式表單、不寫入 Notion。

### 4. 人工確認指定版本後發布

```sh
npm run cms -- publish review-20260923 SHA256_DIGEST_FROM_REVIEW
```

發布接口使用 Bearer secret，不提供公開管理後台。先將影像轉成版本化公開 Blob URL，再寫不可變發布快照，最後透過 ETag 條件寫入切換指標。草稿變更、上傳失敗或舊指標競爭都不會切換目前版本。過期 Notion 附件不作為公開圖片網址。

```sh
npm run cms -- inspect previous-version
npm run cms -- rollback previous-version SHA256_DIGEST_FROM_INSPECT
```

回退仍需指定已確認版本及 digest。無法讀取目前快照時可使用指標記錄的上一版；整個儲存服務不可用時顯示內容暫時無法載入，不會默默換回較舊的打包資料。

## 部署與正式切換

目前 Vercel 專案的正式部署仍以根目錄的 legacy main 為準。這次從 `web/` 使用 `vercel deploy` 建立 Next.js Preview，`web/vercel.json` 的設定只套用該部署，沒有變更正式網域或專案全域 Root Directory。

正式切換前需人工確認 Preview、重新核對最新 main，並調整 Vercel Root Directory 為 `web`、Framework 為 Next.js、配置正式環境 CMS 憑證及確認回退部署。不要直接執行 `vercel --prod`。

舊 `index.html` 與 `.html` 路徑均以 308 導向乾淨路徑。canonical、hreflang、sitemap、JSON-LD、Search Console 與既有 GA4 ID 保留；GA4 僅在 Production 且非草稿預覽啟用。Preview 全站禁止索引。

## 驗收指令

```sh
npm run start -- --port 3010
# 在另一個 terminal
npx tsx scripts/check-routes.ts
npx tsx scripts/check-preview.ts
```

路由檢查包含 72 個中英文頁面與 sitemap、72 個 legacy 轉址及 5 組排除專案。預覽整合測試使用暫存目錄及臨時 secret，在 3012 啟動正式 build，測試結束即停止並清除測試資料，不對 Notion 或 Blob 寫入。
