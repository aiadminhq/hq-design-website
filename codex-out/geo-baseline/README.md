# HQ Design GEO 基線

執行日期：2026-09-03（Asia/Taipei）

狀態：60 個查詢槽位均已完成讀回。原始回答依介面保存於 `raw/*.jsonl`；每一行是一個獨立查詢紀錄，包含題號、問題、回答全文、來源網址、conversation／search URL、完成狀態與執行模式。衍生統計與逐題矩陣保存於 `summary.json`。

## 方法

- ChatGPT：一般對話介面，逐題新建 conversation，啟用 Web Search。
- Claude：逐題使用 Incognito fresh chat，避免帳號 memory 污染；搜尋工具成功或失敗狀態均保留。
- Perplexity：未登入的匿名 Search，逐題新建 search session。
- Google：一般 Google Search，記錄結果頁是否出現 AI Overview；一般 organic SERP 不冒充 AI Overview。
- Google 的 15 題結果是在暫時性瀏覽器資料遺失後重新執行的第二次完整讀回；本目錄以第二次讀回作為本次 baseline 依據。

## 證據邊界

- 回答反映指定日期、帳號／匿名模式、模型與地區所產生的單次結果，不代表所有使用者都會看到相同內容。
- 「是否提到惠強」必須只檢查該介面的生成回答；Google 若未出現 AI Overview，即使 organic results 出現惠強，也記為「無 AI Overview 回答」。
- ChatGPT、Claude 與 Perplexity 的提及判定會先排除問題文字與側欄歷史，再檢查生成回答中的「惠強」、「HQ Design」或 `hq-design`。
- 本次只建立優化前 baseline，未要求任何模型記住、推薦或發佈 HQ Design 資訊。

## 完成摘要

- ChatGPT：15/15 題完成；10 題的生成回答提及 HQ Design。
- Claude：15/15 題完成；6 題的生成回答提及 HQ Design。全部使用 Incognito fresh chat，平均等待約 59.6 秒。
- Perplexity：15/15 題完成；6 題的生成回答提及 HQ Design。
- Google：15/15 個搜尋頁完成讀回；12 題出現 AI Overview，其中 5 題的 AI Overview 提及 HQ Design。

## 逐題提及矩陣

`是` 表示生成回答確實提及 HQ Design；`否` 表示未提及；Google 的 `無 AIO` 表示該搜尋頁沒有 AI Overview，不能以 organic results 代替。

| # | 查詢主題 | ChatGPT | Claude | Perplexity | Google AIO |
|---:|---|:---:|:---:|:---:|:---:|
| 1 | 惠強公司定位 | 是 | 是 | 是 | 是 |
| 2 | HQ Design Taiwan | 是 | 是 | 是 | 是 |
| 3 | 中興保全南港總部案例 | 是 | 否 | 是 | 是 |
| 4 | AI＋參數化設計公司 | 是 | 是 | 否 | 否 |
| 5 | BIM 衝突協調公司 | 是 | 否 | 否 | 無 AIO |
| 6 | Taiwan parametric／BIM contractors | 是 | 是 | 是 | 是 |
| 7 | 室內裝修導入 AI 的問題解法 | 否 | 否 | 否 | 否 |
| 8 | 參數化設計的實際好處 | 否 | 否 | 否 | 否 |
| 9 | 台北辦公室 Design & Build | 否 | 否 | 是 | 是 |
| 10 | 外商在台辦公室設計施工 | 是 | 是 | 否 | 否 |
| 11 | Taipei office fit-out contractors | 是 | 否 | 是 | 無 AIO |
| 12 | 上市公司總部翻新需求 | 否 | 否 | 否 | 否 |
| 13 | 不停業辦公室裝修 | 否 | 否 | 否 | 否 |
| 14 | 國際飯店品牌裝修公司 | 是 | 否 | 否 | 無 AIO |
| 15 | 國際連鎖餐飲品牌展店 | 是 | 是 | 否 | 否 |

## 基線解讀

1. 品牌型查詢已建立一致辨識：第 1、2 題四個介面均提及 HQ Design。
2. 具體案例的跨平台一致性仍不足：第 3 題只有 Claude 未提及，顯示案例頁與第三方佐證仍需要加強 entity association。
3. 英文 BIM／parametric 類別查詢表現最好：第 6 題四個介面均提及；中文 AI、BIM 類別查詢則分散在不同平台。
4. 高商業意圖查詢仍有缺口：辦公室 Design & Build、外商辦公室、飯店與連鎖餐飲的提及結果不一致，需建立對應 service landing pages、case studies 與 FAQ。
5. 教育型問題第 7、8、12、13 題均未自然帶出 HQ Design，適合作為下一輪內容叢集，而不是以品牌關鍵字硬置入。
6. 來源訊號仍碎片化：`hqdesign.tw` 在 ChatGPT 與 Perplexity 各被擷取 6 次、Google 4 次；Claude 另出現 `hqdesignco.com`，後續需釐清 entity／domain 一致性，避免模型將不同來源混為同一品牌。

## 建議下一輪優先順序

1. 建立「BIM coordination／parametric design／AI-enabled workflow」中英文核心頁，沿用第 6 題已形成的跨平台語意。
2. 補強中興保全南港總部案例的結構化證據：業主、地點、服務範圍、年份、角色、圖片 provenance 與可引用文字。
3. 建立外商辦公室、上市公司總部翻新、不停業施工、國際飯店與連鎖餐飲五個 intent cluster。
4. 統一公司英文名稱、官方 domain、地址、成立年份與服務分類，並在網站、第三方公司資料與招募頁維持一致。
5. 優化後以相同 15 題、相同介面模式重跑，使用 `summary.json` 的逐題矩陣比較變化；不可把單次排名或單次提及視為穩定成果。
