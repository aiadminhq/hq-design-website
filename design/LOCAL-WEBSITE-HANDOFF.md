# HQ Design 本地網站實作交接

日期：2026-09-06。階段：可運行與技術檢查完成，視覺與內容尚待人工確認。

## 開啟與啟動

目前預覽：http://127.0.0.1:3020/zh；英文：http://127.0.0.1:3020/en。
3020 是這次正式 `web/` app 的本地預覽；3000 仍是先前 Motion Prototype。

本次在 `feat/site-rebuild` current checkout 實作。依授權以 `git cherry-pick --no-commit 0e58e8e` 帶入兩份 Astra 文件，保留原先 81 個 staged 檔案；未替使用者 commit 或 push。新增程式及本次修正保留在 working tree。

若預覽服務已停止，可雙擊同資料夾 `啟動本地網站.command`，或執行：

```sh
cd "/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/web"
npm run dev -- --hostname 127.0.0.1 --port 3020
```

若 3020 已有服務，直接開啟預覽即可。不要同時在同一 checkout 執行 dev、build 與 production start；Next.js 共用 `.next`。Production 模式依序執行 `npm run verify` 與 `npm run start -- --hostname 127.0.0.1 --port 3020`。本次測試環境 Node 22.22.3、Next.js 15.5.25。

## 已實作

- 首頁：白底、六欄錯落照片、3:2 影像、浮動導覽、HQ 品牌文字、scroll zoom；手機三欄與 reduced-motion 調整。使用自有案例照片，未搬入 Powerhouse 圖片、字型或 runtime。
- 實績：33 案、類型篩選、搜尋、Grid/List、URL 狀態、無結果處理。
- 案例：33 個詳頁，照片／視覺化／增強影像／圖面分組，放大檢視、鍵盤切換、來源註記、已確認欄位與待核對資訊分別呈現。
- 流程：七階段索引與七個詳頁，沿用既有 SVG、input/output 與佐證資料。
- 關於、10 項服務、徵才、聯絡、模型空間。模型空間是既有製圖的互動示意，非可編輯 BIM。
- 導覽、Project Card、Gallery、Timeline 結構；既有 Framer HqUnfocusedMesh 元件、HQ pattern、60° dimension line、Title block、原有 DS tokens。
- 中英文路由、metadata、404、27 條既有轉址。

## 技術檢查證據

`npm run verify` 通過：TypeScript、7 項 DTO／影像 loader 測試、token checksum、內容與個資 gates、production build。Build 產生 99 個靜態頁面項目，其中 96 個中英文內容路由。

服務運行後執行 `npm run test:local`：4 組整合測試全數通過，覆蓋 96 個內容路由、100 個站內目的地、582 個影像尺寸版本、27 條轉址及未知頁面 404。

瀏覽器已檢查桌機與手機首頁、主要頁面無破圖與水平溢出；390px 首頁 scrollWidth 等於 viewport。已操作搜尋、分類、列表、Gallery 前後切換／Escape／焦點返回、手機選單與表單驗證／確認／返回保留輸入。

修正原有 image-loader 對小尺寸來源要求不存在的 2560px 檔案問題；現在依 generated manifest 的實際 widths 選擇。126 張影像乘以八種請求尺寸皆測試實際檔案存在。

剩餘 build warning 來自未變動的 DS `align-items: end` 相容性提示；token 原始來源未修改。未宣稱全站 UI 測試覆蓋率達 80%。

## 尚未完成的內容與外部驗收

- 18 案的原始資料仍待人工核對；保留既有內容政策，未杜撰事實。
- 英文 UI、服務與職缺名稱已提供；未翻譯的原始敘述依既有政策回退中文並標記語言。
- 聯絡表單接上既有 Formspree endpoint，具確認、timeout、錯誤與成功狀態；本次沒有對外送出測試訊息，收件端仍需人工驗收。
- 字型與衍生影像依既有 `.gitignore` 保留本地。另有 Satoshi Variable、Noto Sans TC 字元子集及 Geist Mono 本地字型。換機或部署須另備合法字型資產；新增中文字後需重新產生子集或提供完整字型。
- 未進行雲端部署、公開發布或 Framer canvas 修改。視覺須由使用者在實際網站確認。

## 本次主要路徑

`web/app/[locale]/` 頁面與 CSS；`web/components/` 可重用元件與測試；`web/messages/editorial-en.ts` 英文補充；`web/lib/image-loader.ts` 尺寸修正；`design/testing/local-site.test.mjs` HTTP 檢查。跨界變更已登記於 `COORDINATION.md`。
