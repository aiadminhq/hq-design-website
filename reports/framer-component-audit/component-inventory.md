# Component inventory

## Current status

本次已完成 MCP `initialize`、`tools/list`、`getProjectWebsiteUrl` 與 `getProjectXml` 的 live read-only chain。project XML 確認 22 pages、231 reusable components 與 56 Code Components。指定 page/component XML 與 code source 已進行 read-back；部分節點因 Framer 回覆 `Node is not a text node`，仍標為 `readback_limited`，不以名稱推論其 props 或 children。

正式 inventory 必須以以下欄位逐列回填：`nodeId`、`name`、`type`、`variants`、`props`、`referencedPages`、`codeFile`、`sourceEvidence`。其中 source evidence 應包含 XML path／hash、component reference、code file ID 或 readCodeFile 摘要。

## Static/runtime observations

FramerExport 落盤了 8 個具名 JS modules：`ArrowCircleUp.js`、`ArrowDown.js`、`ArrowElbowDownRight.js`、`Browsers.js`、`Envelope.js`、`LinkedinLogo.js`、`MapPin.js`、`PhoneCall.js`。DOM/runtime 中也可見 `Motion`、`Theme`、`Gallery`、`FAQ`、`Timeline`、`WEBGL` 與 `canvas-sandbox` 等 signals。這些只證明 published runtime 中有可辨識的 module 或 layer name，不能證明它們是 reusable component、Code Component 或可編輯 Framer source。

`/old-home` 的 browser read-back 出現 1 個 canvas；其他本次路由未出現 canvas。這只能作為 experimental/WebGL runtime hint，不能作為 component ownership 或 source editability 證據。

## 已完成的 read-only sequence

1. Framer 端開啟 MCP plugin，確認同一個 project。
2. 只讀呼叫 `getProjectXml`，保存 pages、components、code files、styles 與 focused node。
3. 先讀 page XML，再針對頁面實際引用與選定的 component IDs 呼叫 `getNodeXml`。
4. 讀取指定 Code Components，比較 exports、property controls、import path 與 normalized code hash。
5. 以 XML tree、variants/props、page references、code content 和 exported runtime evidence 共同分類；名稱只作索引，不作結論。

## Fable 交接索引

可直接交給 Fable 的清單位於 `fable-handoff/`。優先重建 `Navigation`、`Card-Portfolio-Vertical`、`Gallery Section`、`Timeline` 與 `Card/Clients Card` 的結構；`Hero`、`Footer`、FAQ 與部分 cards 維持 reference-only。Counter 三份 source 已確認完全相同，其餘近似元件不得未經語意比較直接合併。
