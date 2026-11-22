# 首頁改版：設計參考整理（awwwards-inspiration）

- 整理日期：2026-11-22
- 工具：Awwwards MCP（`search_sites`、`get_site_details`、`get_site_elements`、`record_site_motion`）
- 縮圖總覽：[`refs/contact-sheet.jpg`](refs/contact-sheet.jpg)（僅供內部研究，縮圖版權屬原站，不用於網站）
- 風格提案來源：`/workspace/hq-website/claude-prompt-styles.md`（深色科技玻璃、淺色 editorial、流程導向服務卡）

## 參考清單（Awwwards 頁面皆已確認 HTTP 200）

| # | 站名 | 借鏡點（只學結構與節奏，不複製素材） |
| - | ---- | ------------------------------------ |
| 1 | [LPAS](https://www.awwwards.com/sites/lpas)（SOTD 7.24，2026-10-10） | 首頁 loader：字母直排 → 展開成流程詞 → 影像視窗展開成滿版；五張全寬色塊服務卡；「Clear Process」敘事 |
| 2 | [SANTAL](https://www.awwwards.com/sites/santal)（SOTD 7.25） | 細線格線、超大字標、導覽直接列 Philosophy／Works／Services／Process |
| 3 | [Heron AI](https://www.awwwards.com/sites/heron-ai)（SOTD 7.70） | 米白底線稿建築、mono 小字標籤、單一橘紅 accent（與 HQ 品牌橘同調） |
| 4 | [Shed](https://www.awwwards.com/sites/shed)（SOTD 7.64） | 超大字標；年資寫在文案裡而不是獨立徽章 |
| 5 | [House of Honey](https://www.awwwards.com/sites/house-of-honey-1)（SOTD 7.33） | Editorial 留白與柔和互動 |
| 6 | [IN56](https://www.awwwards.com/sites/in56)（SOTD 7.33） | 滿版空間影像 + 細 serif 案名 |
| 7 | [Studio Mærtens](https://www.awwwards.com/sites/studio-maertens)（SOTD 7.87） | 深色舞台、大字標題與極簡導覽 |
| 8 | [Houses Of](https://www.awwwards.com/sites/houses-of)（SOTD 7.33） | 色塊索引、超大 display 字 |

風格提案文件另列 Belgrade Arbor、Springs、Archivio Garonzi、ORVAE、Fratelli Simonetti：本輪未在 MCP 索引確認 slug，**未驗證連結，故不列入上表**。

## 對 HQ 的取捨

1. **不靠產品照也要講清楚服務**：服務用「編號 + 一句話 + 流程三步」表達（LPAS、Fratelli 模式）。
2. **年資輕輕帶過**：以 hero 角標與一條 metrics，不做大徽章（Shed 模式）。
3. **清楚度優先於炫技**：loader 必須可跳過、可關閉動態、單次 session 只出現一次。
4. **圖像限制（硬性）**：首頁不使用任何客戶照片、圖面、名稱、logo；視覺全部用 HQ 自繪的 SVG／CSS（線稿風格，見 DESIGN.md「Hero 視覺」）。
5. **方向決策**：以風格 3（流程導向服務卡）為骨架，hero 取風格 1（深色玻璃 + 細線格線），文字節奏取風格 2（大字、留白）。
