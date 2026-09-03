# HQ Design 官網接手狀態

更新時間：2026-09-03 17:45（Asia/Taipei）

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
- 未 push、未 Publish。

## 清理狀態

- 已清除 91 個 `.DS_Store`、`Thumbs.db` 與 Office lock stub，共約 11.99 MiB。
- 重新 dry-run 為 0 個目標檔。
- 未刪除 `Danelec/PDF`、`LOGO.zip`、`Untitled*` 或任何設計／照片資產。
