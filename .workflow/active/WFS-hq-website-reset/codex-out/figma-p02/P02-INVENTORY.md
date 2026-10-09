# Figma P02 視覺盤點

來源：`HQ Design`，fileKey `3viWBkQGZAEQnJntysBxZ7`，page node `590:276`  
讀取日期：2026-09-03

## 整頁概觀

- 已輸出 `P02-overview-4096.png`，尺寸 4096 × 3924；Figma 原始 page canvas 約 49898 × 47798。
- 畫面顯示 P02 並非單一簡報，而是多套公司簡介、圖面、component library、diagram library 與草稿並置的大型工作頁。
- 因縮圖尺度極大，整頁圖適合判斷群組位置，不適合直接審核單頁文字；後續應依下列 node id 分層截圖。

## 主要 top-level frame／section

| Node ID | 名稱 | 用途判讀 |
|---|---|---|
| `593:1356` | Company Profile — DXC — EN | DXC 英文公司簡介長版 |
| `767:49975` | HQ Design Drawing Sheet | HQ drawing sheet 群組 |
| `777:49454` / `777:49561` / `777:49668` / `777:49775` | A3 — HQ Design Drawing Sheet (TrueSize) | A3 圖框版本 |
| `879:99483` | 08 | Parametric Tools／Rhino 頁面 |
| `881:101675` | Company Profile — Pulsar Bilingual ZH-TW/EN — DRAFT V01 | Pulsar 中英雙語簡介草稿 |
| `881:102669` | Company Profile | HQ 公司簡介主群組 |
| `881:102694` | 02 | 獨立第二頁 |
| `881:103026`–`881:103192` | R01–R07 | render／案例頁群組 |
| `896:49620` | ADATA — Local Components | ADATA 本地 component library |
| `913:49620` | ADATA — Generated Diagram Library | AI／Parametric／BIM 圖解資產庫 |
| `925:103995` | Frame 457 | 另一套 portfolio deck 草稿 |

## 與 AI／Parametric／BIM 最相關節點

- `879:99483`：Parametric Tools — Grasshopper / Rhino。
- `881:102008`：Parametric Design Methodology；內含 `881:102013` Design Workflow。
- `890:49633`、`890:49648`、`890:49663`：三列設計流程；其中 `890:49649` 為 BIM Coordination。
- `949:49948`：APPENDIX — AI Technical Workflow。
- `949:50002`：APPENDIX — Parametric Technical Workflow。
- `949:50068`：APPENDIX — BIM Technical Coordination。
- `898:49632`：ADATA/Diagram/Workflow Step component。
- `913:49620`：Generated Diagram Library；其中 `911:49620` 為 Open Office / AI × Parametric，`912:49620` 為 Executive Office / BIM & Delivery。
- `949:50155`：Diagram — Scenario Simulation。
- `949:50186`：Diagram — Parametric Workplace。
- `949:50208`：Diagram — BIM Coordination。

## Variables／design tokens

`get_variable_defs` 對 P02 page node 回報目前 Figma 選取的是 `925:103707`（Frame 457 內的 Slide 16:9 - 6），而不是 P02 容器，因此沒有回傳 P02 variables。此結果不能解讀為 P02 沒有 variables。後續需在 Figma desktop 選取具 variable binding 的實際 frame，再逐節點讀取；不得以目前錯誤選取狀態覆蓋既有內容。

## 驗收界線

已完成：整頁概觀輸出、top-level node inventory、AI／Parametric／BIM 節點定位。  
尚未完成：逐節點高解析截圖、variables 完整匯出、人工確認哪些資產可成為網站 Token 3.0 權威。
