# Claude Code 續作交接 — HQ Design GEO 基線

交接日期：2026-09-03（Asia/Taipei）

## 交接目的

Codex 已完成 HQ Design 官網重置工作中的 GEO 優化前基線。Claude Code 後續可直接從本文件與引用產物續作內容架構、schema 與網站實作；不需重跑本次四平台查詢。

## 已完成工作

- ChatGPT：15/15 題完成，逐題使用新 conversation 並啟用 Web Search。
- Claude：15/15 題完成，逐題使用 Incognito fresh chat，排除帳號 memory 污染。
- Perplexity：15/15 題完成，逐題使用匿名 Search session。
- Google Search：15/15 個搜尋頁完成讀回，12 題出現 AI Overview。
- 排除問題文字與側欄歷史後，HQ Design 的生成回答提及數為：
  - ChatGPT：10/15
  - Claude：6/15
  - Perplexity：6/15
  - Google AI Overview：5/15；若只以有 AI Overview 的 12 題為分母，則為 5/12。

## 權威產物

1. 人類可讀報告：`codex-out/geo-baseline/README.md`
2. 逐題衍生矩陣：`codex-out/geo-baseline/summary.json`
3. 原始介面讀回：
   - `codex-out/geo-baseline/raw/chatgpt.jsonl`
   - `codex-out/geo-baseline/raw/claude.jsonl`
   - `codex-out/geo-baseline/raw/perplexity.jsonl`
   - `codex-out/geo-baseline/raw/google-ai-overviews.jsonl`
4. 專案總狀態：`codex-out/STATUS.md`

## 證據與解讀邊界

- 原始 JSONL 保存單次介面 DOM snapshot、查詢 URL、執行模式與完成狀態。
- `summary.json` 的提及判定已排除問題文字與側欄歷史，避免品牌詞因 UI chrome 而產生偽陽性。
- Google 若沒有 AI Overview，organic SERP 即使出現 HQ Design，也不得記為 AI Overview 提及。
- Google 的 15 題資料為暫時性瀏覽器資料遺失後的第二次完整讀回，第二次結果是本次 baseline 依據。
- 結果只代表 2026-09-03、當時帳號／匿名狀態、地區與模型的一次輸出，不代表穩定排名。
- 本次沒有要求模型記憶品牌、沒有修改 Framer、沒有 Publish、沒有 push。

## 主要結論

1. 第 1、2 題品牌查詢已達四平台一致辨識。
2. 第 6 題英文 `parametric design or BIM coordination` 已達四平台一致提及，是最強的差異化語意入口。
3. 中興保全南港總部案例在 ChatGPT、Perplexity 與 Google AI Overview 出現，但 Claude 未提及，案例 entity association 仍不完整。
4. 辦公室 Design & Build、外商辦公室、上市公司翻新、不停業施工、國際飯店與連鎖餐飲等高商業意圖查詢，跨平台提及分散。
5. `hqdesign.tw` 在 ChatGPT、Perplexity 與 Google 被引用；Claude 另出現 `hqdesignco.com`，需先做 domain／entity reconciliation，再將其視為品牌來源。

## 建議 Claude Code 下一步

1. 先讀 `codex-out/geo-baseline/README.md` 與 `summary.json`，將第 6 題的成功語意拆成中英文 service landing page、case proof 與 FAQ。
2. 補強中興保全南港總部案例的可引用事實：業主、地點、年份、面積、服務範圍、HQ Design 角色、施工方法與圖片 provenance。
3. 依五個商業 intent cluster 建立 CMS／Framer 內容映射：外商辦公室、上市公司總部、不停業施工、國際飯店、連鎖餐飲。
4. 統一公司英文名稱、官方 domain、地址、成立年份與服務分類；不得在 authority 未解決前自行把 `hqdesignco.com` 併入官方來源。
5. 網站內容更新後，用完全相同的 15 題與介面模式重跑，產生可比較的新版本；不得覆寫本 baseline。

## Git 與 owner boundary

- 工作 checkout：`main`
- 既有未提交 WIP：`about.html`、`index.html`、`.workflow/`
- 上述 WIP 不屬於本次 GEO 工作，Claude Code 不得 reset、checkout、stash、覆寫、stage 或 commit。
- 本次可續作範圍限於 `codex-out/geo-baseline/**` 與 `codex-out/STATUS.md`，除非使用者另行授權網站實作。
- 不得 push 或 Publish。
