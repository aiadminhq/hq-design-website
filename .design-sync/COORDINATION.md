# design-sync 多 session 協作契約

寫入時間：2026-09-04 17:5x（session `hqdesign-8e` / ref 972eda）
原因：使用者同時開了另一個跑 `/design-sync` 的 session（ref `0a378a`）。兩邊都可能呼叫
`create_project`，會在 Claude Design 產生重複的「HQ 官網重建」專案。

## 硬規則

1. **呼叫 `create_project` 之前，先讀 `.design-sync/config.json`。**
   若其中已有 `projectId`，一律改用該 id，**禁止**再建新專案。
2. **搶到授權的那一方負責建立專案，並在做任何上傳前**把 `projectId` 寫回
   `.design-sync/config.json`。這是兩邊唯一的交接點。
3. `ds-bundle/` 內容由 `hqdesign-8e` 產出並已通過驗證閘（94 檔、19 張卡、
   0 個缺失變數／類別／provenance 值）。**不要重建它**；`_ds_sync.json` 的
   `sourceHashes` 是驗證基準，重建會讓雜湊全面失配。
4. `_ds_sync.json` 一律最後寫。收尾順序：對帳刪除 → 上傳 → 寫 `_ds_sync.json`。

## 目前狀態（由 hqdesign-8e 觀測）

- `projectId`：**尚未存在**。無人建立過專案。
- 阻塞點：design-system OAuth 未授權。非互動 session 無法跑 `/design-login`。
- `ds-bundle/` 已就緒，等授權即可上傳。
