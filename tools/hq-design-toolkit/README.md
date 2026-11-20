# HQ Design Toolkit

HQ Design 官網的內部 Framer Canvas Plugin。此版本先建立安全的開發基底與圖層選取狀態，不會自動修改或發佈網站。

## 環境

- Node.js `>=18.18.0`（建立時使用 `v22.22.3`）
- npm `10.9.8`
- Framer Plugin mode：`canvas`

## 開發

```bash
npm run dev
```

Framer 內需先啟用 **Developer Tools**，再從 Plugin 選單執行 **Open Development Plugin**。開發伺服器啟動後，修改檔案會自動更新。

## 品質檢查

```bash
npm run check
```

此指令依序執行 ESLint、TypeScript typecheck 與 production build。

## 邊界

- 不建立或保存 Framer API Key。
- 不自動 Publish、刪除頁面或修改 CMS。
- 後續寫入功能必須加入明確按鈕、權限檢查與結果提示。
- Hero 與案例圖片在授權和來源清除前，只能作內部版面測試。

官方文件：[Plugins Quick Start](https://www.framer.com/developers/plugins-quick-start)

## Claude、Codex 與 MCP

- Claude 與 Codex 可直接共用此目錄的 Plugin 原始碼與 npm 指令。
- Framer Plugin 是在 Framer 內執行的 UI／功能；Framer MCP 是外部 Agent 呼叫 Framer 的橋接介面，兩者不是同一套執行環境。
- Framer Agent 是 Framer 編輯器內建的對話助手，亦不等同於 Plugin 或 MCP。
- 共用規則與畫布寫入邊界請見 [`CLAUDE.md`](./CLAUDE.md)。
- MCP endpoint 含 session key，不得提交到 Git 或寫入任何專案文件。
