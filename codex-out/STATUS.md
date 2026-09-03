# HQ Design 官網接手狀態

更新時間：2026-09-03 18:10（Asia/Taipei）

## Framer 連線與專案讀回

- 目前專案：`Archiste (copy)`
- Framer MCP：握手成功，server `Framer MCP 1.8.0`
- 專案結構：13 個 web pages、1 個 design page、27 個 reusable components
- CMS：3 個 user-managed collections（`Articles`、`Categories`、`Projects`）
- `Articles.Gallery` 與 `Projects.Gallery` 均為 `array`

## Gallery array 欄位結論

結論：Framer Gallery 的 `array` 目前只能包含單一 `image` nested field，不能加入 `altZh`、`altEn`、`role` 或其他不同型別的 nested fields。

證據：

1. Framer 官方 CMS 文件：`array` 目前只支援單一 image field，並以此建立 Gallery。
   - https://www.framer.com/developers/cms
2. 目前 Toolkit 使用的 `@framer/plugin 4.1.0` 型別契約：
   - `ArrayField.fields` 為單元素 tuple。
   - `ArrayItemField = ImageField`。
   - `ArrayItemFieldDataEntry = ImageFieldDataEntry`。
3. Live Framer MCP 讀回兩個既有 Gallery 欄位的型別均為 `array`，但 MCP 不公開 nested field schema；SDK 型別與官方文件提供了必要限制資訊。

基於上述三項一致證據，未建立 `_TEST_ARRAY_DELETE_ME`。這避免產生無法由 MCP 刪除的實驗 collection，也避免為已確定的限制引入額外不可逆 UI 操作。

## Schema 影響

- Gallery 僅保存圖片。
- 雙語 alt、圖片角色與 provenance 不可放進 Gallery nested fields。
- 若每張圖都需要獨立 metadata，應改採獨立 Media collection 加 reference；若以快速上線為優先，則保留 Gallery 圖片陣列，將案例層級 provenance／說明放在 Projects 的一般欄位。

## 本機 repo

- 核心 CMS／migration／parser 資產已建立本機 commit：`f3b7eb1`
- 舊站 SEO metadata 修復已建立本機 commit：`e1b3692`
- Internal Framer Toolkit 與 handoff 狀態已建立本機 commit：`46e2954`
- Root 測試 17/17 通過、26 份 CMS schema data 驗證通過、TypeScript typecheck 通過。
- Toolkit 的 lint、typecheck 與 Vite production build 通過。
- 未 push、未 Publish。

## 清理狀態

- 已清除 91 個 `.DS_Store`、`Thumbs.db` 與 Office lock stub，共約 11.99 MiB。
- 重新 dry-run 為 0 個目標檔。
- 未刪除 `Danelec/PDF`、`LOGO.zip`、`Untitled*` 或任何設計／照片資產。

## Design System 修正與讀回

- `colors_and_type.css` 已移至 `Claude Design/colors_and_type.css`，並同步更新 `CLAUDE.md` 的來源路徑。
- `TopNav.jsx` 與 `FooterAndCTA.jsx` 的 HQ logo 相對路徑已由 `../../assets/HQ-logo.png` 修正為 `../../../assets/HQ-logo.png`。
- 本機 browser read-back 已確認 Design System 首頁、stylesheet、HQ logo、shader assets 與 fonts 均回傳 HTTP 200；`--vermillion-400` 讀回為 `#D64518`，三張頁面圖片均無 broken image。
- Design System 目錄不是 Git repo，因此上述修改目前是本機檔案狀態，未建立 commit。

## Framer template 評估

- 已完成 5 個候選的 live Marketplace 比較與截圖：Archiste、ARCHTER、ASHLAR、Nave、Forja。
- 建議延續現有 Archiste，不購買新 template；ARCHTER 作免費 fallback，ASHLAR／Forja 僅作 Process 與 Comparison section 參考。
- 報告：`codex-out/framer-templates/README.md`

## 尚待明確確認

- GEO baseline 需要操作 ChatGPT、Claude、Perplexity 與 Google AI Overviews；尚未取得「自動操作第三方 AI UI」或「使用者手動測試」的方式選擇，因此未執行。
- `Danelec/PDF` 約 518 MiB；目前磁碟空間約 41 GiB，沒有緊急刪除需求，且尚未取得刪除授權，因此保留。
