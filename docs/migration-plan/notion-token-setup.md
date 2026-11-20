# Notion Token Setup（importer 環境設定）

> Phase 2.2 push-to-notion.ts importer 需要 Notion API integration token。
> 本文件說明如何取得 token、設定環境變數、並授權 14 個 DB 給 integration。

---

## 1. 建立 Notion Internal Integration

1. 打開 https://www.notion.so/profile/integrations
2. 點 **+ New integration**
3. 名稱：`HQ Website CMS Importer`
4. Associated workspace：選擇 HQ Design 所在的 workspace
5. Type：**Internal**（不需要 OAuth）
6. Capabilities：勾選 `Read content` / `Update content` / `Insert content`
7. 點 **Save**
8. 複製 **Internal Integration Secret**（格式：`ntn_...` 或舊版 `secret_...`）

⚠️ 此 token 只會顯示一次，遺失需重新生成。

## 2. 授權 14 個 DB 給 integration

最簡單做法：授權給父頁面 **「🌐 HQ Website CMS」**，所有子 DB 自動繼承。

1. 打開父頁面 https://www.notion.so/36bf7e03243c812ba005fcd1abe389e3
2. 右上 `...` → **Connections** → **Add connections**
3. 搜尋 `HQ Website CMS Importer` 並勾選
4. 確認 14 個 DB 都已繼承授權

驗證：對每個 DB URL 用 `notion-fetch` 或瀏覽器打開，若 integration 已連接會看到 ✓ icon。

## 3. 設定本地環境變數

於專案根目錄建立 `.env`（已 gitignore，不會進版控）：

```bash
# 於專案根目錄執行：
touch .env
echo "NOTION_TOKEN=ntn_PASTE_YOUR_TOKEN_HERE" >> .env
```

或手動編輯 `.env`：

```
NOTION_TOKEN=ntn_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional — override rate limit (ms between API calls), default 350
# NOTION_RATE_LIMIT_MS=350
```

## 4. 驗證設定

```bash
# Dry-run（不會寫入 Notion）
npm run push:notion:dry

# 預期輸出：
# [push-to-notion] manifest loaded: 14 databases
# [push-to-notion] DRY-RUN mode — no Notion API writes
# [push-to-notion] Pass 1 (primitives)
#   - globals       : 1 row  → would upsert "HQ Design"
#   - certifications: 6 rows → ...
#   ...
```

確認 dry-run 全綠後，再執行實際匯入（**會寫入 Notion**）：

```bash
npm run push:notion
```

## 5. Token 輪換

若 token 外洩或團隊成員離職：

1. https://www.notion.so/profile/integrations → 進入 integration
2. **Secrets** → **Revoke and regenerate**
3. 更新本地 `.env`

## 安全規則

- ❌ 不要把 `.env` commit 進 git（`.gitignore` 已排除）
- ❌ 不要在 PR / issue / Slack 貼 token
- ❌ 不要 echo token 到 log / stdout
- ✅ Token 一律存於環境變數，importer 從 `process.env.NOTION_TOKEN` 讀取
