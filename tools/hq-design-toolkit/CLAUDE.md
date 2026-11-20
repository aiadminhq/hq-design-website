# HQ Design Toolkit — Claude 協作規則

此目錄為 HQ Design 官網的 Framer Plugin 原始碼。Claude、Codex 與人工開發者共用同一份檔案，但不得同時修改同一檔案或 Framer 畫布。

## 三種能力不可混用

| 能力 | 執行位置 | 用途 | 目前邊界 |
|---|---|---|---|
| Framer Plugin | Framer 內的 Plugin iframe | 提供固定 UI、讀取選取圖層、執行可重複的網站工具 | 原始碼位於本目錄；目前只讀，不會 Publish |
| Framer MCP | Claude／Codex 等外部 Agent | 以工具呼叫讀取或精確修改 Framer 專案 | session endpoint 不得寫入 repo；使用前確認連線與權限 |
| Framer Agent | Framer 編輯器右側 Agent 面板 | 由 Framer 原生 Agent 分析或協助操作畫布 | 每次指令必須限定是否只讀、可修改範圍與禁止 Publish |

Framer Plugin 不會自動提供 MCP；MCP 也不等同於已安裝或正在執行的 Plugin。三者可以協作，但必須分開驗證。

## 開發指令

```bash
npm install
npm run dev
npm run check
```

## 寫入規則

1. 修改前先讀取 `git status --short --branch`，不得覆蓋既有 WIP。
2. Framer 畫布寫入前，先確認工作流狀態檔的 `FRAMER-LOCK` 為 `free`，再標記目前執行者；完成 read-back 後釋放。
3. 不得在 repo、README、log 或畫布文字中保存 MCP endpoint、session key、API key 或 token。
4. 未經明確授權，不得 Publish、Unpublish、建立 API Key、刪除頁面或大量改寫 CMS。
5. 圖片來源與授權未確認前，只能作內部 layout 測試，不得宣稱為 HQ 案例實績。

## 品牌基線

- 品牌橘：`#D64518`，單頁視覺比例以 5–10% 為上限。
- 調性：institutional、精準、冷靜、留白。
- 避免 neon、glassmorphism、過度圓角、彈跳或浮誇動態。
- 中文採 Noto Sans TC；英文規劃採 Satoshi，部署前仍需核對 Framer hosting 與字體設定。

## 完成條件

- `npm run check` 通過。
- Framer 內能開啟 Development Plugin。
- 畫布修改需有 node／頁面範圍、變更前後與 read-back 紀錄。
- 「程式建置成功」「Plugin 可開啟」「畫布已修改」「內容已核可」「網站已發佈」必須分開回報。
