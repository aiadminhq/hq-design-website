# Framer 網站擷取與元件治理報告

日期：2026-09-06（Asia/Taipei）
対象 staging：`https://gracious-successes-409813.framer.app`
報告狀態：擷取、技術驗證與 live Framer project XML 唯讀盤點已完成；Fable 交接包已建立。

## 結論摘要

- FramerExport 已從 GitHub source 以 local pinned 方式安裝：tag `v5.0.0`、commit `dc023e74467bd73869aabd45fb55778b0e754059`。
- staging 已完整擷取首頁與 crawler 發現的 4 個 subpages：共 5 條可讀回路由、380 個 unique asset requests、406 個落盤資產、44 個 lazy-loaded chunks、0 個下載失敗。
- local `serve.js` read-back 與 headless browser runtime 均通過；4 個 failed request 都是 Framer editor bar 對 `framer.com/edit` 的預期阻擋，不是 local asset failure。
- 既有 Full Site Export `personal-website-now-exact-next` 已唯讀檢查：1,174 個檔案、130,211,970 bytes（約 127 MB）；README 宣告的 route 是 `/`、`/old-home`、`/projects/Spatial-Design`。
- exact copy 與本次 export 都是 static/runtime mirror，不等於可編輯的 Framer component source。live `getProjectXml`、`getNodeXml`、`readCodeFile` 已用於確認部分 nodeId、variants、props、page references 與 code content。
- 本次 MCP endpoint 成功完成 `initialize`、`tools/list`、`getProjectWebsiteUrl` 與 `getProjectXml`（Framer MCP 1.8.0）。部分 page/component XML 仍受 `Node is not a text node` 限制，已在交接包中標示為 readback-limited。

## Authority chain

| 層級 | 本次使用方式 | 可確認內容 | 不可取代的內容 |
|---|---|---|---|
| Framer canvas / live MCP XML | read-only call attempted; currently disconnected | 應作為 component、variant、props、page reference 的 authority | 本次未成功取得 live XML |
| staging public URL | browser export source | published route、SSR、hydrated runtime、實際資產請求 | 不提供 editable component source |
| FramerExport output | `/tmp/framer-staging-export.ztMCD8` | static mirror、runtime bundles、local asset rewrite、serve behavior | 不等於 Framer source |
| existing exact copy | `framer reference/personal-website-now-exact-next` | byte-for-byte reference folder 的既有範圍 | 不等於 source/component editor |

## 報告檔案

- `route-inventory.md` / `route-inventory.json`：路由、檔案、crawl 與 browser read-back。
- `component-inventory.md` / `component-inventory.json`：live XML 欄位契約、專案數量與 static runtime hints。
- `duplicate-groups.md` / `duplicate-groups.json`：Counter exact duplicate 與其他 near-duplicate 的 evidence。
- `fable-handoff/`：可直接交給 Fable 的元件目錄、JSON mapping 與可複製工作提示。
- `keep-merge-retire.md`：保留／合併／淘汰建議與人工確認閘門；所有 retire 都只是建議。
- `extraction-validation.md`：工具版本、命令、checksum、輸出差異與驗證結果。

## HQ Design reuse boundary

可供 HQ Design 後續研究的結構模式包括 navigation、hero、project card、gallery、timeline/process、FAQ/accordion、theme toggle、motion/interactions、glass/WebGL/experimental runtime hints。這些只能作為結構參考；個人 portfolio 的姓名、聯絡資訊、個人履歷內容與未授權素材不得直接升格為 HQ Design 正式內容。

本報告沒有修改 Framer canvas、沒有 publish、沒有建立／更新／刪除任何 Framer node 或 CMS item，也沒有修改既有 Full Site Export。實際內容、圖片、授權與正式交付仍以 HQ Design workspace source of truth 為準。
