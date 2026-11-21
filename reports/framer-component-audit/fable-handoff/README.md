# Fable 元件交接包

日期：2026-09-06（Asia/Taipei）
來源：live Framer MCP read-only read-back
用途：提供 Fable 重建 HQ Design website 時可查閱的元件來源、選用層級與安全邊界。

## 交接狀態

此交接包已完成專案 XML、頁面 XML、指定 reusable component XML 與 Code Component source 的唯讀盤點。沒有修改 Framer canvas，沒有 publish，也沒有建立、刪除、合併或更新任何 Framer node。

目前 live project read-back：22 個頁面、231 個 reusable components、56 個 Code Components；project color/text styles 區段目前沒有回傳可用 style entries，因此 Fable 不得從個人 portfolio 的 runtime bundle 反推 HQ Design tokens。

## Fable 應先讀的檔案

1. `fable-prompt.md`：可直接交給 Fable 的工作提示與限制。
2. `design-component-catalog.json`：機器可讀的元件目錄、來源證據與重用層級。
3. `design-component-catalog.md`：人工審查版目錄。
4. `duplicate-resolution.json`：完全相同與近似 Code Components 的比對結果。

## 建議採用順序

### 第一層：可作為 layout pattern 的來源

- `Navigation`（`ClWUvICnj`）：首頁與多個 project/detail page 可讀回 instance reference。
- `Card-Portfolio-Vertical`（`RMWQkGShv`）：首頁可讀回，應只重建 card structure，替換所有個人內容與圖片。
- `Gallery Section`（`AGUPnwAVB`）：component XML 已成功讀回，可作為作品圖庫結構參考。
- `Timeline`（`HAziGIbgH`）：component XML 已成功讀回；`Timeline Copy` 不應在未完成人工語意比較前合併。
- `Card/Clients Card`（`Tz4ObI3jO`）：component XML 已成功讀回，可作為 client/project metadata card 參考；內容需改由 HQ Design source of truth 提供。

### 第二層：可查閱但先不要直接升格

- `Hero`（`kwZpx_ioN`）、`Footer`（`nMFCaAwuJ`）、FAQ/Accordion 系列與其他 portfolio cards：目前確認存在，但部分 node XML 回讀受 Framer MCP 的 `Node is not a text node` 限制，需再次 read-back 或人工確認後再 port。
- `Counter.tsx`（`K4D4TwM`）：程式碼與另外兩份 Counter source 完全相同，可作為獨立數字動效候選，不屬 HQ Design 核心 layout token。

### 第三層：實驗性來源

`Blur Essence`、`RetroGrid`、`TypewriterEffect`、`GlassSurface`、WebGL/canvas 類元件具有較高效能、accessibility 與品牌一致性風險。除非頁面需求明確，Fable 不應預設採用；不得因元件名稱推定它們是 HQ Design approved component。

## HQ Design 邊界

- 幾何、content、project metadata、圖片授權與正式文案以 HQ Design workspace 的 source of truth 為準；個人 portfolio 的姓名、履歷、聯絡資料、舊作品文字與外部圖片不可直接複製。
- 風格基準：brand orange `#D64518`；英文使用 Satoshi，中文使用 Noto Sans TC；不使用 serif、gradient text、glassmorphism 或 emoji；一般 UI corner radius 為 0，button 為 4px，logo mark 可依既有規範使用 9.8%。
- AI render 僅能作為逐案可追溯的補充視覺，不得取代真實照片或未核准的 project evidence。
- 任何把元件實際寫回 Framer、建立 linked instance、detached instance、更新 style 或 publish 的行動，都必須另行取得明確授權並在 action 前後 read-back。

## 證據限制

動態 template pages 與部分 component node 的 `getNodeXml` 回讀曾回傳 `Node is not a text node`。這些項目已在目錄中標為 `readback_limited`，不是推測成品。`staging` export 可證明 public runtime 與資產下載，不可取代 editable component source。
