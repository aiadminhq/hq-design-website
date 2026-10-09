# GEO 分析 — 讓 AI 引擎與 AI agent 找得到並正確引用 HQ Design

**主責**：AI 可見度與可引用性｜**協力**：F-003 技術層、F-002 主題權威、F-005 影像標註
**唯一前提**：`guidance-specification.md`。IA 沿用 ux-expert 定案七段；關鍵字與技術 SEO 沿用 `seo/analysis.md`（本文 MUST NOT 重做或推翻，唯一提議修正見 §9）。Framer 能力沿用 system-architect §1。

---

## 0. 證據分級（本文全部主張皆標級）

| 級 | 定義 | 可否作為投入理由 |
|---|---|---|
| `[A]` | 同儕審閱或 arXiv 學術研究，有可複現方法與對照 | 可 |
| `[B]` | 供應商第一方官方文件或政策聲明 | 可（僅限其宣告範圍） |
| `[C]` | 廠商大規模觀測／相關性研究。無因果控制、無同儕審閱、發布者有商業動機 | 僅可作方向參考，MUST NOT 作為唯一投入理由 |
| `[D]` | 業界推測或行銷話術，無公開資料 | **MUST NOT** |
| `[L]` | 本文於本機／live 站實測 | 可 |

---

## 1. GEO 與 SEO 的實際差異（誠實版）

### 1.1 真正有證據的只有一組研究

GEO 的學術基礎目前實質上只有一篇：Aggarwal 等人 `GEO: Generative Engine Optimization`（KDD 2024，arXiv 2311.09735）`[A]`。作者建 GEO-bench（10,000 查詢／25 領域），對同一批網頁做九種改寫並量測其在生成答案中被使用的顯著程度。

| 改寫手法 | 實測效果（Position-Adjusted Word Count 等指標） | 對 HQ 的可操作性 |
|---|---|---|
| **Quotation Addition** 加入權威引語 | **+41%**（主觀印象 +28%），全體最高 | 中（需外部可引語來源） |
| **Cite Sources** 引用可信來源 | 約 +22–28%，在事實／法規類問題最強 | 高（法規、公會、標準可引） |
| **Statistics Addition** 以量化數據取代定性描述 | 約 +24–26%，在法律／政府／意見類最強 | **最高**（HQ 核心資產就是可驗證數字） |
| Fluency Optimization／Easy-to-Understand | 約 +15–30% | 中 |
| Authoritative 語氣權威化 | 領域差異大（辯論／歷史類較強） | 低（與可稽核形象衝突） |
| Unique Words／Technical Terms | 效果不穩定 | 低 |
| **Keyword Stuffing** | **趨近零或負向** | **MUST NOT** |

作者自陳限制 `[A]`：僅測自建引擎與 Perplexity；手法會隨引擎演進失效；查詢分佈會變。**故 40% 是「單一手法在單一領域的上限」，不是平均值，也不是對 ChatGPT／Gemini 的預期值。**

兩篇 2026 年 arXiv 補上兩個關鍵事實 `[A]`：

- `Don't Measure Once`（arXiv 2604.07585）：AI 可見度是**分布**而非單點，答案隨 run／prompt／時間變動，單次觀測不可靠。→ 直接決定 §7 的量測方法。
- `From Citation Selection to Citation Absorption`（arXiv 2604.25707；602 prompts／3 平台／21,143 引用／18,151 頁／72 特徵）：**「被引用」與「內容真的被吸收進答案」是兩件事**。高吸收頁的共同特徵是篇幅較長且結構清楚、與問句語意對齊、含可抽取證據（定義、數值、比較、步驟）。ChatGPT 引用少但每來源吸收深，Perplexity 與 Google 引用廣。

### 1.2 缺乏證據或有反向證據的常見主張

| 主張 | 實際證據 | 判定 |
|---|---|---|
| 「加 `llms.txt` 會提升 AI 可見度」 | Google 明確否認使用；無任何主要供應商宣告在開放網路抓取 `[B]`。詳 §3 | **`[D]`，MUST NOT 作為投入理由** |
| 「加 schema.org 會提升 AI 引用」 | Ahrefs 600 萬 URL 掃描顯示被引用頁帶 JSON-LD 約 3 倍，但受控測試中增益消失；schema 型別與引用數相關係數介於 −0.106 至 +0.039（實質為零）`[C]` | **相關而非因果。schema 是基礎設施，不是引用槓桿** |
| 「`FAQPage` schema 提升 AI 引用」 | 對照觀測：帶 FAQ schema 的頁平均 ChatGPT 引用 3.6 次，不帶者 4.2 次 `[C]`；且 Google 已下架 FAQ rich result | **有反向證據。與 SEO §5.1 判斷一致** |
| 「要為 AI 另做一套內容格式／AI 專頁」 | Google 官方 AI features 文件明言：出現在 AI Overviews／AI Mode「不需要建立新的 machine readable 檔案、AI 文字檔或標記」`[B]` | **`[D]`** |
| 「GEO score／AI 可見度分數」 | 各工具自訂算法，無公開驗證 | **`[D]`，MUST NOT 作為 KPI** |
| 「引用主要來自品牌自有網站」 | 廠商大規模觀測一致指向 68–84% 引用來自第三方／earned media `[C]` | **反向。本文最重要的期望管理事實，見 §5.2** |

### 1.3 結論：GEO 對 HQ 的實際份量

把 GEO 拆開後只有三塊：

1. **與 SEO 完全重疊**（約六成）：可索引、canonical、實體宣告、事實正確、內部連結。SEO 分析已完整覆蓋。
2. **SEO 做了但強度不同**（約三成）：把事實寫成**可抽取、段落自足**的形式。SEO 在意「這頁排第幾」，GEO 在意「這一段話單獨被搬走後還看不看得懂」。這是 §4，也是本文唯一真正的新增工作。
3. **GEO 專屬且證據薄弱**（約一成）：`llms.txt`、AI 專屬格式、監測工具。

**故 GEO MUST NOT 另立預算或另排工期。** 它應作為 SEO M4（參數化／BIM，SEO 判定為唯一難度「低」的主攻群）內容的**驗收條件**，而非平行專案。

### 1.4 品牌一致性論點的份量評估

使用者的論點是：主標語為 `AI parametric × Construction EXECUTION`，若 AI 回答「台灣有哪些把 AI 與參數化設計整合進施工流程的室內裝修公司」時提不到惠強，這本身就是品牌矛盾。

**論點成立，但它是品牌風險，不是通路風險。** 校準三點：

- **好消息**：這類問句目前答案品質極差。SEO §2.1 實測「AI 室內設計」SERP 全為工具評測，無任何有實績的執行方佔位；AI 介面的同類問句同理。**只要被引用一次，相對優勢極高。**
- **壞消息**：會這樣問的人極少。合理預期年詢價增量是**個位數**。把它當營收管道會失望。
- **決定性的好消息**：這件事所需素材與 SEO M4 完全相同——可驗證數值加段落自足的技術論述。**兩者是同一筆投入的兩種驗收方式。**

建議措辭：列為**對外一致性驗收項**（「我們說自己做 AI × Parametric，機器被問起時答案裡有我們」），而非成長指標。它值得被量測（§7），不值得被單獨投資。

---

## 2. AI 爬蟲存取盤點與建議

### 2.1 當前 user-agent 實況（2026-09 查證）

| 供應商 | User-agent | 用途 | 遵守 robots.txt | 官方文件 |
|---|---|---|---|---|
| OpenAI | `GPTBot/1.4` | 基礎模型訓練 | 是 | [developers.openai.com/api/docs/bots](https://developers.openai.com/api/docs/bots) |
| OpenAI | `OAI-SearchBot/1.4` | ChatGPT search 索引 | 是 | 同上 |
| OpenAI | `OAI-AdsBot/1.0` | 廣告落地頁安全查核 | 是 | 同上 |
| OpenAI | `ChatGPT-User/1.0` | 使用者觸發的即時取用 | **不適用**（非自動爬取） | 同上 |
| Anthropic | `ClaudeBot` | 訓練語料收集 | 是 | [support.claude.com/…/8896518](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| Anthropic | `Claude-User` | 使用者提問時的即時取用 | **是**（與 OpenAI／Perplexity 同類 bot 不同） | 同上 |
| Anthropic | `Claude-SearchBot` | 搜尋結果品質 | 是 | 同上 |
| Perplexity | `PerplexityBot/1.0` | Perplexity 搜尋索引與連結呈現；**官方明言不用於基礎模型訓練** | 是 | [docs.perplexity.ai/guides/bots](https://docs.perplexity.ai/guides/bots) |
| Perplexity | `Perplexity-User/1.0` | 使用者觸發取用 | **否** | 同上 |
| Google | `Google-Extended` | robots.txt token（**無獨立 UA 字串**），控制 Gemini Apps／Vertex AI／grounding 的訓練使用 | 是 | [Google common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) |
| Google | `Googlebot` | Google Search，**含 AI Overviews 與 AI Mode** | 是 | 同上 |
| Google | `Google-CloudVertexBot` | Vertex AI Agents | 是 | 同上 |
| Apple | `Applebot` | Spotlight／Siri／Safari 搜尋＋基礎模型 | 是 | [support.apple.com/119829](https://support.apple.com/en-us/119829) |
| Apple | `Applebot-Extended` | **僅**控制 Apple Intelligence 基礎模型訓練 | 是 | 同上 |
| Common Crawl | `CCBot/2.0` | 開放語料庫，多數 LLM 訓練語料的上游 | 是 | [commoncrawl.org/ccbot](https://commoncrawl.org/ccbot) |
| Meta | `meta-externalagent` | 訓練＋直接索引 | 是 | [Meta web crawlers](https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/) |
| Meta | `meta-externalfetcher` | 使用者請求的單連結取用（agentic AI） | **可能繞過** | 同上 |
| Meta | `facebookexternalhit` | 分享預覽卡（OG） | 一般遵守，安全查核時可能繞過 | 同上 |
| Microsoft | `bingbot` | Bing Search＋**Copilot grounding**。控制方式不是 robots.txt 而是 `NOARCHIVE`／`NOCACHE` meta | 是 | Bing Webmaster Guidelines `[B]`／`[C]` |
| 其他 | `Amazonbot`、`Bytespider`、`cohere-training-data-crawler` | 訓練／產品索引。`Bytespider` 有忽略 robots.txt 的觀測報告 | 不一 | 第三方彙整，證據等級 `[C]` |

**兩個容易誤判的官方事實 `[B]`，MUST 記錄：**

- `Google-Extended`「不影響網站在 Google Search 的收錄，也不是排名訊號」。AI Overviews／AI Mode 屬 Search 的一部分、由 `Googlebot` 驅動。**故封鎖 `Google-Extended` 不會讓你退出 AI Overviews，只會退出 Gemini 訓練。**
- Apple 同構：「Disallow `Applebot-Extended` 的網頁仍可出現在搜尋結果中」。

### 2.2 關鍵取捨：允許訓練爬蟲對 HQ 是利還是損

媒體業封鎖訓練爬蟲的邏輯是**內容本身就是商品**，被模型吸收等於被無償替代。HQ 不是這個結構。

| 面向 | 對媒體業 | 對 HQ |
|---|---|---|
| 網站內容的角色 | 商品 | 招牌 |
| 進入模型權重的意義 | 收入流失 | **品牌名與「參數化／BIM／設計施工統包」的關聯被寫進模型先驗**——這正是 §1.4 那條路徑最深層的一段 |
| 可撤回性 | 不可撤回 | 不可撤回（**唯一實質風險**） |
| 競品可摘要我方論述 | 高影響 | 低影響：論述不是護城河，1,600 件實績與自有施工團隊才是 |
| 影像被用於訓練 | 高影響 | **中影響，且是唯一需條件式處理的部分** |

**建議：全部 `Allow`，不對任何 AI 爬蟲設 `Disallow`。** 三個理由：

1. HQ 的目標是被找到，不是被保護。封鎖訓練爬蟲會直接關閉 §1.4 的路徑，換來的是無可驗證收益。
2. 組織保密範圍的內容**本來就不該存在於公開網站**。robots.txt 不是保密機制，MUST NOT 被當成一層防護。
3. `PerplexityBot` 與 `OAI-SearchBot` 是即時檢索索引——封鎖它們等於自願退出 AI 搜尋，純損失。

**唯一的條件式例外**：739 張專業攝影的網站使用授權尚未確認（SEO §S-5、data-architect §4.7）。若授權裁定不允許用於 AI 訓練，則 MUST 對**影像路徑**（而非全站）針對訓練爬蟲設 `Disallow`，且 MUST NOT 影響 `OAI-SearchBot`／`PerplexityBot`／`Claude-SearchBot`。此處 robots.txt 是**契約義務的記錄**，不是防護——實際保護手段是 `ImageObject.creditText`／`copyrightNotice`／`license`（SEO §6.3 已規劃）。

**MUST NOT 封鎖 `facebookexternalhit`**：它是 OG 分享卡的取用者，封鎖會直接使 ux-expert §6-J1「可轉發 deep link 與 OG 卡」失效。

**誠實補一句**：`User-agent: *` + `Allow: /` 技術上已足夠。逐一列名各 AI 爬蟲的價值是**文件化意圖**（讓後手知道這是決定而非疏漏）與**未來條件式收緊的掛點**，不是技術必要。

### 2.3 建議的 `robots.txt` 完整內容

上線版（Framer，雙 locale。MUST 以 Static Files 上傳，見 §6）：

```
# https://www.hqdesign.tw/robots.txt
# 惠強室內裝修 HQ Design
# 政策：允許所有搜尋與 AI 爬蟲全站取用。
# 依據 geo/analysis.md §2.2。變更前 MUST 重讀該節。

User-agent: *
Allow: /

# --- AI 訓練爬蟲：明示允許（決定，非疏漏） ---
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: cohere-training-data-crawler
Allow: /

# --- AI 檢索／搜尋索引：明示允許（封鎖等於退出 AI 搜尋） ---
User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

# --- 使用者觸發取用與分享預覽 ---
User-agent: ChatGPT-User
Allow: /

User-agent: Claude-User
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: facebookexternalhit
Allow: /

Sitemap: https://www.hqdesign.tw/sitemap.xml
Sitemap: https://www.hqdesign.tw/en/sitemap.xml
```

若 S-5 授權裁定禁止 AI 訓練使用影像，則對 `GPTBot`／`ClaudeBot`／`CCBot`／`meta-externalagent`／`Applebot-Extended`／`Google-Extended` 各追加一行 `Disallow: /i/`（影像路徑依 data-architect 最終命名），**MUST NOT 對三個 SearchBot 追加**。

過渡期（目前的靜態站，檔案已在 repo 根目錄但 live 仍 404，見 §8）SHOULD 追加：

```
Disallow: /cms/
Disallow: /scripts/
Disallow: /tools/
Disallow: /logs/
Disallow: /_archive/
Disallow: /node_modules/
```

---

## 3. `llms.txt` 評估

### 3.1 實際採用狀況（查證結果）

| 事實 | 級 |
|---|---|
| Google 的 John Mueller（2025-06-17）：「FWIW no AI system currently uses llms.txt」；後續補充「Google 不使用 llms.txt 或 llms-author.txt，也不知道除 SEO 工具外有任何 crawler 或 LLM 確認在用」 | `[B]` |
| Google 官方 AI features 文件：出現在 AI Overviews／AI Mode「不需要建立新的 machine readable 檔案、AI 文字檔或標記」 | `[B]` |
| 截至 2026 Q1，OpenAI／Google／Anthropic／Meta／Mistral **皆未**公開承諾在生產系統讀取開放網路上的 llms.txt | `[C]` |
| OpenAI 與 Anthropic 為**自家文件站**發布 llms.txt；Anthropic 的 agent 寫作指引推薦此檔；Chrome Lighthouse 13.3（2026-05）新增 Agentic Browsing 稽核會檢查此檔 | `[C]` |
| 伺服器日誌觀測：`GPTBot` 偶爾抓取但頻率極低；`ClaudeBot`／`Google-Extended`／`PerplexityBot` 實質不抓 | `[C]` |
| 網域採用率約 10% | `[C]` |

**最常被混淆的區分**：「AI agent 讀某站的文件」與「AI 搜尋引擎索引行銷網站」是兩件事。前者確有實際使用，後者沒有證據。

### 3.2 判斷：建議做，但理由不是 GEO

**SHOULD 做，列 P1，MUST NOT 進 P0。**

支持理由（三項，都不是「提升 AI 搜尋可見度」）：

1. 成本約 1 小時、零維護風險、零負面效應。
2. 對「會自行瀏覽網頁的 AI agent」——本專案明確關切的對象——有實際價值，且此行為有第一方指引背書 `[C]`。
3. 撰寫過程會強迫把 §4 的事實表整理成單一權威清單。**那份整理本身的價值高於檔案本身。**

反對把它當 GEO 手段：**如果有人說加 llms.txt 會讓 ChatGPT 開始引用你，那是行銷話術。** 沒有主要供應商說會讀它。

**MUST NOT 為了 llms.txt 升級 Framer 方案**（升 Pro 的理由是 pages 上限、頻寬與自訂 robots.txt，見 §6 與 system-architect §8）。

### 3.3 `llms.txt` 完整草案

事實全部取自公司簡介。**含 `[待裁定]` 標記者 MUST 於 §4.1 事實裁定後才可發布。**

```markdown
# 惠強室內裝修股份有限公司（HQ Design Co., Ltd.）

> 惠強室內裝修（HQ Design）是台灣台北的商業空間設計施工統包（design & build）公司，
> 1995 年創立，累積 1,600+ 件商業空間案件，設計與施工由同一團隊在單一合約下負責。
> 自 2026 年 4 月起將 AI 識圖丈量、CAD→BIM 轉換、參數化多方案比較與 BIM 報價整合
> 導入設計流程。

## 基本事實

- 公司登記名稱：惠強室內裝修股份有限公司
- 對外名稱：惠強室內裝修 HQ Design
- 英文名稱：HQ Design Co., Ltd.
- 創立年份：1995
- 所在地：台灣台北市
- 服務地區：台灣
- 累計商業空間案件：1,600+ 件
- 設計施工一體化比例：100%（設計、專案管理、技術協調與現場施工由同一團隊承擔）
- 主要客戶類型：外商在台據點、國際飯店與餐飲連鎖品牌、上市櫃公司總部、企業辦公室
- 標語：AI Parametric × Construction Execution

## 服務項目（10 項）

辦公空間設計｜商業空間設計｜設計施工統包（Design & Build / Turnkey）｜
空間規劃顧問｜機電消防整合｜品牌空間識別｜軟裝設計規劃（FF&E）｜
智慧空間應用（Smart Office & AIoT）｜裝修工程管理｜完工保固服務

## 交付流程（七階段）

1. 現況掃描 — AI 識圖丈量、CAD→BIM
2. 參數化方案 — 一個條件改變，整套空間同步更新
3. 設計意圖定案 — Design Intent Review
4. 技術驗證 — 尺度、材料、法規與施工可行性
5. BIM 協調 — 衝突在模型裡被找到，不在工地被找到
6. 施工圖說 — 技術詳圖、施工文件、材料協調、樣板確認
7. 交付與 AI 專案管理 — 分區施工、品質管控、竣工文件與保固

## 代表案件

- 中興保全 SECOM 南港總部｜台北南港｜[待裁定] sqm｜全案設計施工｜2025
- 博訊科技 AIONTECH｜台北南港｜825 sqm｜全案設計施工｜2025
- 志聖 C.SUN INDUSTRIAL｜新北林口｜[待裁定] sqm｜全案設計施工｜2026
- DXC Technology｜台北｜590 sqm｜全案設計施工｜2025
- 利威電子 LIWEI｜台北南港｜350 sqm｜全案設計施工｜2025
- 金普頓大安酒店 Kimpton｜台北｜330 sqm｜公共區域與客房走廊施工｜2022
- 大力水手 Popeyes 許昌店｜台北｜國際餐飲品牌｜2024
- 匙碗湯 Soup Spoon 台北 101、台北車站｜新加坡品牌在台拓點｜2023

## 主要頁面

- 首頁：https://www.hqdesign.tw/
- 流程總覽（七階段）：https://www.hqdesign.tw/process/
- 參數化設計：https://www.hqdesign.tw/process/parametric
- BIM 協調：https://www.hqdesign.tw/process/bim
- 服務項目：https://www.hqdesign.tw/services/
- 委任模式：https://www.hqdesign.tw/engagement/
- 案例庫：https://www.hqdesign.tw/work/
- 關於惠強：https://www.hqdesign.tw/about/
- 聯絡：https://www.hqdesign.tw/contact/

## 使用說明

本檔案內容為公開資訊，可自由引用。引用時請標示來源為
「惠強室內裝修 HQ Design（hqdesign.tw）」。
案件影像有分級標註政策（實拍／視覺化），引用影像前請參閱
https://www.hqdesign.tw/image-policy
```

---

## 4. 內容可引用性設計（本節最實用）

### 4.1 阻擋問題：簡介 PDF 自身的事實矛盾 `[L]`

在談任何可引用性之前 MUST 先解決這個。權威來源（公司簡介）內部數字互相矛盾：

| 項目 | 版本 A | 版本 B | 第三來源 |
|---|---|---|---|
| SECOM 南港總部面積 | Milestones「2,500 sqm」 | Case Study 01「5,940 sqm」 | SEO §2.4「756 坪」（≈2,500 sqm） |
| 志聖 C.SUN 面積 | Portfolio 格「700 sqm」 | Case Study 02「560 sqm」 | — |
| 公司名稱 | 封面「惠強室內裝修股份有限公司」 | ABOUT US 內文「惠強室內**設計**股份有限公司」 | 公司登記為「室內裝修」 |
| 年資 | 封面「30+」／內文「30 年」 | EST. 1995（至 2026 為 31 年） | `about.html` 已寫「31+ 年」 |

**這是 GEO 的首要阻擋，不是細節。** LLM 抽到互相矛盾的數字時，最可能的結果是**不引用**（無法判斷哪個對），次可能是引用錯的那個且無法更正。三個要求：

- **U-G1 MUST 由使用者裁定每項的唯一權威值**（本文無權裁定）。
- 裁定後每個事實 MUST 以四元組存在：`(值, 單位, 時點, 權威頁面)`。
- 每個事實 MUST 於 CMS 唯一定義一次、由各頁引用；**MUST NOT 在多頁手寫**。手寫是矛盾的來源。

### 4.2 事實密度的組織方式

依據 KDD 2024 的 Statistics Addition（約 +24–26%）與 Cite Sources（約 +22–28%）`[A]`：

| # | 要求 |
|---|---|
| 4.2-1 | 每個階段頁 MUST 至少含 3 個帶單位與時點的數值，其中至少 1 個為 HQ 專屬（衝突數、改版工時、分區數、面積） |
| 4.2-2 | 數值 MUST 以**文字節點**存在於 DOM。**MUST NOT 僅存在於圖片、canvas 或 WebGL** |
| 4.2-3 | `/process/parametric` 互動滑桿的輸出 MUST 有文字等價物（座位數／會議室數／面積使用率的預設值 MUST 以純文字渲染於初始 HTML）。此為 SEO §5.2 CWV 要求之外的**新增**約束 |
| 4.2-4 | 可引用主張 MUST 於有外部可驗證依據時附之（法規條號、公會、標準編號）；MUST NOT 虛構出處 |
| 4.2-5 | 摺疊內容（accordion／tab）MUST 存在於 SSR 後的 HTML。Framer SSR 通常滿足，但 MUST 以 `curl` 驗證，MUST NOT 假設 |
| 4.2-6 | MUST NOT 堆疊關鍵字。KDD 2024 實測 Keyword Stuffing 效果趨近零或負向 `[A]` |

### 4.3 段落自足性（LLM 常只抽走一段）

**文法（MUST）**：`{主體全名} + {動作或事實} + {帶單位與時點的數值} + {地點或範圍}。`

| # | 規則 |
|---|---|
| 4.3-1 | 每個可引用段落 MUST 於**首句**寫出主體全名「惠強室內裝修（HQ Design）」。**MUST NOT 以「我們」「本公司」「該團隊」開頭** |
| 4.3-2 | MUST NOT 依賴前文指代：「如上表」「前述」「這個階段」皆禁用；改寫為「BIM 協調階段」等具名詞 |
| 4.3-3 | 每段 SHOULD ≤ 120 中文字元且 SHOULD 只承載一個主張 |
| 4.3-4 | 時間表述 MUST 為絕對值：「2026 年 4 月起」，**MUST NOT** 用「近期」「今年」 |
| 4.3-5 | 標題 SHOULD 為問句或完整陳述句，**SHOULD NOT** 為單詞標籤（「BIM」→「BIM 協調在室內裝修解決什麼問題」） |

**反例／正例**：

- 反例：「我們在這個階段導入 BIM，大幅減少現場問題。」（無主體、無數值、依賴前文、不可驗證）
- 正例：「惠強室內裝修（HQ Design）在 BIM 協調階段將建築、機電、設備與現場條件整合於同一套模型，使跨專業衝突在進場前被辨識，而非在工地被發現。此階段自 2026 年 4 月納入標準流程。」

### 4.4 問答式結構：15 組問題與應存在的答案段落

**理由 MUST 為「問句與答案段落的語意對齊」（arXiv 2604.25707 `[A]`），MUST NOT 為「FAQ rich result」或「FAQPage schema」**——後者已有反向證據（§1.2）。實作為頁內具名 `h2`／`h3` 問句加緊接其後的自足段落，**MUST NOT** 做成純 JS accordion。

| # | 問題（潛在客戶或 AI 會問的） | 落地頁 | 答案段落 MUST 含的可引用事實 |
|---|---|---|---|
| Q01 | 台灣有哪些做 AI 參數化設計的商業空間裝修公司？ | `/process/` | 主體全名＋1995 創立＋1,600+ 件＋100% 設計施工一體＋2026.4 導入項目清單 |
| Q02 | 參數化設計用在室內裝修有什麼實際差別？ | `/process/parametric` | 「條件改變同步更新」＋一個具名案的方案比較數與節省工時 |
| Q03 | BIM 協調在室內裝修能減少什麼問題？ | `/process/bim` | 具名案的衝突計數＋發現階段＋若在現場才發現的後果 |
| Q04 | 設計施工統包（design & build）和設計、施工分開發包差在哪？ | `/services/` | 單一合約、單一窗口、100% 一體化＋責任界面說明 |
| Q05 | 設計已經定案了，只想找施工執行夥伴，可以嗎？ | `/engagement/` | 兩種委任模式定義＋Kimpton（承攬公共區域與客房走廊）為第二模式實證 |
| Q06 | 辦公室裝修期間可以不停業嗎？ | `/process/delivery-ai-pm` | SECOM 分層分區同步施工＋航空貴賓室（管制區）＋零重大缺失驗收 |
| Q07 | 外商要在台灣設辦公室，找誰做裝修統包？ | `/engagement/` | 外商實績具名清單（Kimpton／Popeyes／Soup Spoon／DXC）＋各自面積年份 |
| Q08 | AI 用在室內設計是只是出圖比較快嗎？ | `/process/` | 「AI 負責加速運算，專業團隊負責判斷與落地」＋七階段中 AI 實際介入的階段 |
| Q09 | 室內裝修的現況丈量流程是什麼，業主要準備什麼？ | `/process/site-survey` | AI 識圖丈量＋CAD→BIM＋業主端輸入清單 |
| Q10 | 完工時業主會拿到哪些文件？ | `/process/documentation` | 竣工圖、操作手冊、保固書、驗收記錄＋六步流程 |
| Q11 | 惠強室內裝修是什麼公司？ | `/about/` | 一句話定義（與 `llms.txt` 首段字字相同）＋登記名＋別名 |
| Q12 | 南港有哪些辦公室裝修的實績？ | `/work/`（南港篩選） | 南港案件數與具名清單（AIONTECH 825 sqm、LIWEI 350 sqm 等） |
| Q13 | 商業空間裝修一般要多久？ | `/process/` | **MUST 依 ux-expert §8.5 標示區間與前提，MUST NOT 給單一數字** |
| Q14 | Which contractors in Taipei do design-and-build office fit-out for foreign companies? | `/en/engagement/` | 英文版 Q07。對映 SEO §3.3-2 英文 B2B 詞 |
| Q15 | What is HQ Design (惠強室內裝修)? | `/en/about/` | 英文版 Q11。**MUST 含中文名以建立雙語實體連結** |

Q01、Q08、Q11、Q15 是 §1.4 品牌一致性論點的直接驗收題，MUST 進 §7 基線清單。

### 4.5 對映七段流程 IA 的可引用事實陳述

| 階段頁 | MUST 存在的可引用陳述（各 2–4 條，皆符合 §4.3 文法） |
|---|---|
| `/process/`（樞紐） | 七階段具名清單；2026.4 導入的四個 AI 項目；100% 設計施工一體化；「AI 負責加速運算，專業團隊負責判斷與落地」 |
| 01 `/site-survey` | AI 識圖丈量與 CAD→BIM 的輸入與產出；業主端需提供的清單 |
| 02 `/parametric` | 「一個條件改變，整套空間同步更新」；平立剖與數據同步的範圍；一個具名案的方案數 |
| 03 `/design-intent` | Design Intent Review 的四項確認對象（設計目標、品牌語彙、關鍵視覺、使用情境） |
| 04 `/validation` | Technical Validation 的五項確認對象（尺度、材料、法規、預算、施工可行性） |
| 05 `/bim` | 整合對象（建築、MEP、設備、專業界面）；具名案衝突計數與發現階段 |
| 06 `/documentation` | 六步具名清單；業主最終收到的四類文件 |
| 07 `/delivery-ai-pm` | SECOM 分層分區＋面積；航空貴賓室管制區；零重大缺失驗收；**AI PM 成熟度標示（ux-expert §8.5，MUST NOT 用完成式）** |

---

## 5. 實體建立（Entity Establishment）

### 5.1 Wikidata：建議現在不做

Wikidata 準則 2 要求「可用嚴謹且公開可得的來源描述的、可清楚辨識的實體」，準則 3 為結構性需求；官方自陳準則「刻意保留模糊」，爭議走社群刪除討論 `[B]`。

| 判斷 | 理由 |
|---|---|
| HQ 目前是否符合？ | **邊緣**。現有外部來源是公司登記資料站（twincn／findcompany／technews／iyp／twfile）＋104＋FB——這些是**資料庫抓取**，非獨立報導。技術上可能過準則 2，實務上刪除風險高 |
| 效益是否確定？ | **不確定。「Wikidata 項目 → LLM 引用」的因果鏈無任何實證。** ChatGPT 引用池中 Wikipedia 佔比高是 `[C]` 觀測，但那是 **Wikipedia 條目**不是 **Wikidata 項目**，兩者不同 |
| 建議 | **P2，且先做前置**：取得 2–3 篇獨立產業媒體報導後再評估。**被刪除比沒有更糟**（留下爭議紀錄且短期無法重建） |

### 5.2 第三方提及：這是 GEO 真正的主要槓桿

廠商大規模觀測一致指向：68–84% 的 AI 引用來自第三方／earned media，品牌自有內容結構性偏低；ChatGPT 引用池由 Wikipedia、LinkedIn、Reddit 與權威編輯型網域主導；跨平台網域重疊僅約 11% `[C]`。

**對 HQ 的意涵，這是本文最重要的一句：官網做到滿，也只能覆蓋引用池的一小部分。** 這直接支持 SEO §P2 的「媒體投稿與外部連結」，且該項優先序 SHOULD 被提升（§9）。

| 標的 | 類型 | 為何選它 | 前置期 |
|---|---|---|---|
| i室設圈漂亮家居 | 產業媒體 | SEO §2.5 已判定為「非對手、應投稿或受訪」；已有 AI 導入選題紀錄 | 1–3 月 |
| 映 CG InCG Media | 產業媒體 | SEO §9 實測其有 BIM 選題紀錄，且是 M4 的 SERP 佔位者 | 1–3 月 |
| 工商時報／經濟日報產業版 | 財經媒體 | 權威編輯型網域，`[C]` 觀測中此類佔比高 | 2–6 月 |
| Google Business Profile | 本地實體 | **P1 且成本最低**。本地實體資料是 AI 回答「台北的裝修公司」時的常見依據，且與 `Organization` JSON-LD 交互驗證 | 2 週 |
| LinkedIn 公司頁 | 專業平台 | `[C]` 觀測顯示 LinkedIn 在 ChatGPT 引用池佔比高；同時服務外商客戶取信 | 2 週 |
| 公會（TAID／CSID）、BIM 研討會講者 | 產業組織 | 可稽核第三方背書，且是 Wikidata 前置條件 | 3–12 月 |

**誠實**：這些都慢、需要人做關係經營，Claude 無法代做（U-G6），且效果不保證。但它是唯一能突破「官網天花板」的路徑。

### 5.3 schema.org：補哪些、為什麼，以及不要用什麼理由

已完成 `[L]`：首頁有 `["Organization","GeneralContractor"]`，含 7 組 `alternateName`、`foundingDate 1995`、`areaServed`、`knowsAbout`、`slogan`。

| 型別 | 頁面 | 建議 | **正確的投入理由** |
|---|---|---|---|
| `sameAs` 補進現有 `Organization` | `/` | **MUST，且是缺項 `[L]`**（現行 JSON-LD 有 `alternateName` 但**無 `sameAs`**） | 實體消歧義。本節最高價值的單一動作 |
| `Service` ×10 | `/services` | SHOULD | SEO rich result 與服務對映（SEO §5.1） |
| `CreativeWork` | `/work/<slug>` | SHOULD | 同上 |
| `ItemList` | `/work` | SHOULD | 同上 |
| `BreadcrumbList` | `/process/*`、`/work/*` | SHOULD | 麵包屑 rich result（SEO §T13） |
| `ImageObject` | 全站影像 | **SHOULD，且對 GEO 有實質意義** | `creditText`／`copyrightNotice` 使標註**隨圖片出現在搜尋結果**（SEO §6.3）——「機器確定這張圖的來源與性質」 |
| `FAQPage` | Q&A 區塊 | **MAY，但 MUST NOT 以「提升 AI 引用」為理由** | 僅語意完整性。Google 已下架此 rich result（SEO §5.1），且 GEO 側有反向證據（§1.2） |

**MUST 記錄的原則**：LLM 讀 HTML 時把 JSON-LD 當**純文字 token** 讀，不解析為結構化資料 `[C]`；受控測試中增益消失 `[C]`。**故 schema 是基礎設施不是引用槓桿。** 對 GEO 真正有意義的只有兩類：`alternateName`／`sameAs`（我是誰）與 `ImageObject` 授權欄位（這張圖是什麼）。

### 5.4 品牌名稱分裂：`alternateName` 是必要但不充分

SEO §2.5 發現品牌實體分裂為四組名稱，已用 `alternateName` 處理。**評估：正確且必要，但不足夠。**

理由：LLM 的實體解析主要依靠**跨來源共現**，不是單一頁面的 JSON-LD 宣告。一個頁面說「A 就是 B」，權重遠低於五個獨立平台都用同一個名字。

**跨平台統一規則（MUST）**：

| 層級 | 值 | 可否更改 |
|---|---|---|
| 法定登記名 | 惠強室內裝修股份有限公司 | 不可（登記事實） |
| 對外主要展示名 | **惠強室內裝修 HQ Design** | 這是要被統一到各平台的那一個 |
| 英文名 | HQ Design Co., Ltd. | 固定 |

| 平台 | 現況 | 處置 |
|---|---|---|
| Facebook | 「惠強設計 HuiCiang Design」（SEO §9） | **MUST 改為對外主要展示名**。`HuiCiang` 是唯一一組完全孤立的羅馬拼音，為實體分裂最大單一來源 |
| 104 | 依登記名 | 保持；MUST 於簡介欄補對外展示名與官網連結 |
| Google Business Profile | 未建立（推定） | **MUST 建立並驗證**，名稱、地址、電話與 `Organization` JSON-LD 逐字一致 |
| LinkedIn | 未建立（推定） | SHOULD 建立 |
| 公司登記／黃頁站 | 不可控 | 不處置。它們佔品牌 SERP 的問題由 SEO §P0-8／P0-9 解 |
| 官網 `Organization.sameAs` | **缺** `[L]` | **MUST 補上以上全部 URL** |

**每個平台的簡介欄 MUST 使用同一句一句話定義**（即 `llms.txt` 首段），逐字相同。跨平台逐字重複是實體解析最有效的訊號，也是零成本的。

---

## 6. Framer 平台的 GEO 限制

| 能力 | 結論 | 級 | 出處 |
|---|---|---|---|
| `robots.txt` | Framer 為每個已發布站**自動產生**一份；**介面內無法編輯**；只能以 Static Files 上傳整份覆蓋 | `[B]` | [Framer Help: robots.txt](https://www.framer.com/help/articles/how-can-i-access-the-robots-txt-file/) |
| Static Files（含自訂 robots.txt、llms.txt、任意根目錄檔案） | **Pro／Enterprise 限定**。上傳位置 Site Settings → Hosting → Files，path 設 `/`；接受 TXT 與 JSON | `[B]` | 同上＋[Framer Help: llms.txt](https://www.framer.com/help/articles/llms-txt-framer/) |
| Static Files 額度 | Pro 5 個 | system-architect §8 記載，**MUST 於升級後實測確認** | system-architect |
| `sitemap.xml` | Framer 自動產生已發布頁面 | `[B]` | Framer Help |
| 自訂 JSON-LD | **支援**。Custom Code 可注入 `<head>`；CMS 詳情頁可用 `{{Field}}` 與 `{{Field \| json}}` 產生逐頁 schema | `[B]` | [Framer Help: JSON-LD](https://www.framer.com/help/articles/structured-data-through-json-ld/) |
| SSR | Server-side rendered React；高流量頁發佈時 pre-render | `[B]` | system-architect §1.1 |

**三個結論**：

1. **Basic 確實擋住 `llms.txt`**（使用者的假設正確），但**同時擋住自訂 `robots.txt`**——後者影響更大，因為 robots.txt 是唯一能宣告**雙 locale sitemap** 的位置（SEO §T01／T02）。故 system-architect §8 的「SHOULD 升 Pro」在 GEO 面向**提升為 MUST**，理由 MUST 記為 pages 上限、頻寬與 robots.txt，**MUST NOT 記為「為了 llms.txt」**。
2. **JSON-LD 不是限制**。`{{Field | json}}` 直接解掉「21+ 案例頁各自 `CreativeWork` 與 `ImageObject`」的擴充性問題，不需要 Tier 3。
3. **Static Files 5 個額度 MUST 規劃**：`robots.txt`（1）、`llms.txt`（1），保留 3 給日後（如 `ads.txt`、`.well-known/`）。**MUST NOT 隨意消耗。**

**逃生路徑**：Tier 3（Unframer → Next.js，system-architect §3）可完全控制根目錄與 `<head>`。但 `llms.txt` 與自訂 `robots.txt` **MUST NOT 作為選 Tier 3 的理由**——前者價值低，後者升 Pro 即可得。

**未解（U-G3）**：Framer 預設 `robots.txt` 的內容為何、是否已含 localized sitemap？MUST 以 `curl` 實測 staging 站，實測後才知道覆蓋的必要性。MUST NOT 憑文件假設。

---

## 7. 量測：GEO 效果怎麼驗證

### 7.1 誠實開場

**GEO 目前沒有 GSC 等價物。** 沒有任何 AI 供應商提供「你被引用了幾次」的第一方報表。這是 GEO 與 SEO 最大的實務落差，也是本領域行銷話術最多的原因。

方法上的學術約束（arXiv 2604.07585 `[A]`）：可見度是**分布**不是單點，答案隨 run／prompt／時間變動。直接推導出三條硬要求：

| # | 要求 |
|---|---|
| 7.1-1 | 每題 MUST 重複查詢 ≥ 3 次，MUST 以**命中率**（3 次中幾次提及）記錄，**MUST NOT 以「有／無」二值記錄** |
| 7.1-2 | 每次 MUST 記錄日期、介面、模型版本（若可見）、是否開啟搜尋模式 |
| 7.1-3 | MUST 附截圖。答案不可重現，純文字紀錄無法事後複核 |

### 7.2 三層量測，建議只做第一層

| 層 | 方法 | 成本 | 建議 |
|---|---|---|---|
| 1 | **手動基線與定期複查**（§7.3） | 每輪約 2–3 小時 | **MUST 做，本週開始** |
| 2 | 伺服器日誌／AI 爬蟲命中統計 | 取決於平台 | **U-G4：Framer 是否提供 raw access log？** 若否則此層不可得，MUST 誠實標為缺口而非假裝有 |
| 3 | 商用 AI 可見度工具（Otterly 約 US$29/月起、Peec 約 €89–199/月、Profound 約 US$499/月起、Semrush／Ahrefs 附加約 US$99–699）`[C]`（來源為比較文非官方價目，MUST 於採購前向廠商複驗） | 每月數十至數百美元 | **上線後 3 個月內不買。** 題目只有 15–20 題、手動可覆蓋；工具本質也是重複查詢再彙總，付費買的是自動化與歷史曲線，在還沒有新內容可測時價值低 |

### 7.3 基線建立方法（現在就做，否則無法判斷改善）

**MUST 在新內容上線前完成，理由與 SEO §7.1 同且更強**：AI 答案無歷史可回溯，且會隨模型更新改變，**過了就永久失去對照組**。

| 步驟 | 動作 |
|---|---|
| 1 | 介面：ChatGPT（一般＋搜尋模式）、Claude、Perplexity、Google AI Overviews／AI Mode、Gemini。SHOULD 加 Copilot |
| 2 | 題目：§4.4 的 Q01–Q15，加 SEO 品牌詞「惠強室內裝修」「HQ Design 台北」 |
| 3 | 每題 × 每介面 × 3 次 |
| 4 | 每次記錄六欄：**① 是否提及惠強 ② 是否給連結 ③ 連到哪個網域**（官網／登記站／FB／104）**④ 同時被提及的競品 ⑤ 答案中關於 HQ 的事實是否正確 ⑥ 截圖** |
| 5 | 存 `.brainstorming/geo/baseline/YYYY-MM-DD-<engine>.md` |

**第 ④ 欄的用法**：AI 現在推薦誰，就是真正的競爭集合——這比 SERP 佔位者更接近買方實際看到的選項。

**第 ⑤ 欄最容易被忽略但最有價值。** 若 AI 現在說錯（公司名、年資，或把 HQ 當住宅設計公司），**修正一個錯誤事實遠比從零建立可見度容易**——錯誤通常源自可指認且可處置的來源（登記站、FB 舊資料，見 §5.4）。

### 7.4 判準與節奏

| 期程 | 合理目標 |
|---|---|
| 90 天 | 品牌詞問句（Q11／Q15）中 AI 能正確說出惠強是什麼公司**且連到官網而非登記站**；事實錯誤數降為 0 |
| 180 天 | Q01／Q08（AI × 參數化類問句，即 §1.4 的驗收題）在 5 個介面中至少 2 個出現惠強 |
| 全期 | **MUST NOT 在 8 週內下結論**（比 SEO 的 4 週更長，因為變異更大且新內容需先被檢索索引收錄） |

### 7.5 我們控制不了的

| 因素 | 影響 |
|---|---|
| 模型訓練週期 | 新內容進入模型權重可能需一整個訓練週期，**以年計，且無法驗證** |
| 檢索索引更新頻率 | `OAI-SearchBot`／`Claude-SearchBot`／`PerplexityBot` 的重抓頻率未公布 |
| 供應商引用策略變更 | 隨時可能改變，無通知義務 |
| 引用池結構 | 68–84% 在第三方 `[C]`。官網優化的天花板結構性偏低 |
| 跨平台碎裂 | ChatGPT 與 Perplexity 引用網域重疊僅約 11% `[C]`。**五個平台要各自打，沒有一次做完的方法** |

---

## 8. 優先序與現實期望

### P0 — 上線前，成本極低

| # | 項目 | 成本 | 現況 `[L]` |
|---|---|---|---|
| G0-1 | **`index.html` 的 `<html lang="en">` 改為 `zh-TW`** | 1 行 | **尚未修**。27 頁中僅此頁為 `en`。SEO §1.3 判定為最嚴重單點問題之一、§P0-5 已列，但實測仍在 |
| G0-2 | **`about.html` 尾端 25 個 NUL byte（`0x00`）MUST 移除** | 1 分鐘 | `file` 將該檔判為 `data` 而非 HTML；`grep` 已視其為 binary 無法讀取。瀏覽器容忍，但解析器與爬蟲行為不可預期 |
| G0-3 | **部署 `robots.txt` 與 `sitemap.xml`** | 已建 | **repo 有檔，但 live 三者皆 404**（`/robots.txt`、`/sitemap.xml`、`/llms.txt`）。「已建立」≠「已生效」 |
| G0-4 | **事實矛盾裁定（U-G1）** | 需使用者 | SECOM 面積、C.SUN 面積、公司名、年資四項。**阻擋 §4 全部與 `llms.txt` 發布** |
| G0-5 | **`Organization.sameAs` 補齊** | 10 分鐘 | 現行 JSON-LD 有 7 組 `alternateName` 但**無 `sameAs`**。實體消歧義最高 CP 值的單一動作 |
| G0-6 | **段落自足性規則（§4.3）納入內容撰寫規範** | 文件 | 未有 |
| G0-7 | **手動 GEO 基線（§7.3）** | 2–3 小時 | 未有。**過了就永久失去對照組** |
| G0-8 | **確認 `facebookexternalhit` 未被封** | 檢查 | 現行 `robots.txt` 為 `Allow: /`，成立 |

### P1 — 上線後 2–8 週

| 項目 | 依據 |
|---|---|
| `llms.txt`（Framer 升 Pro 後） | §3.3 |
| Google Business Profile 建立並驗證 | §5.2 |
| Facebook 名稱改為對外主要展示名 | §5.4 |
| 逐頁 JSON-LD（Framer Custom Code＋CMS 變數） | §5.3、§6 |
| `ImageObject` 授權欄位與 `/image-policy` | §5.3、SEO §6.3 |
| §4.4 的 15 組問答段落落地 | §4.4 |
| LinkedIn 公司頁 | §5.2 |
| **媒體投稿起跑**（原 SEO P2，本文建議提前） | §9-1 |

### P2 — 上線後 2–6 個月

| 項目 | 依據 |
|---|---|
| 第三方媒體刊出與追蹤 | §5.2 |
| 公會（TAID／CSID）與研討會講者 | §5.2 |
| Wikidata 重新評估（取得 2–3 篇獨立報導後） | §5.1 |
| 商用監測工具評估（不早於 3 個月） | §7.2 |
| 依基線資料調整題目清單 | §7.3 |

### 明確不做

| 項目 | 理由 |
|---|---|
| 付費「GEO 優化服務」 | §1.2。可驗證的部分 SEO 已覆蓋，不可驗證的部分無人能保證 |
| 以「提升 AI 引用」為理由加 `FAQPage`／大量 schema | §1.2、§5.3 有反向或零效證據 |
| 為 `llms.txt` 升級 Framer 方案 | §3.2。升 Pro 的理由是 robots.txt 與 pages 上限 |
| 現在建立 Wikidata 項目 | §5.1。被刪除比沒有更糟 |
| 封鎖任何 AI 訓練爬蟲 | §2.2。除影像授權條件式例外 |
| AI 問答頁量產／內容農場式 Q&A | 與 SEO §3.2 紅線同源。每個問答 MUST 有 HQ 專屬量化錨點，否則 MUST NOT 發布 |
| 用「GEO score」當 KPI | §1.2 `[D]` |

### 8.1 誠實的期望管理

| 問題 | 誠實答案 |
|---|---|
| 效果週期多長？ | **檢索型**（Perplexity、ChatGPT search、AI Overviews）與 SEO 同級，數週至數月。**訓練型**（模型權重裡的品牌先驗）以年計且無法驗證 |
| 不確定性有多大？ | 高。§7.5 的五個因素中，只有第一個（爬蟲可存取）在我方控制內 |
| 90 天內合理的成功長相？ | 「AI 被問到惠強是誰時答得正確且連到官網」。**不是**「AI 主動推薦惠強」——後者需要第三方提及，屬 P2 且不保證 |
| 若什麼都不做會怎樣？ | 目前的實體訊號（登記站佔品牌 SERP、FB 用不同英文名、無 `sameAs`、live 無 robots／sitemap）會讓 AI 繼續用第三方資料庫的版本描述惠強。**這是現在正在發生的事，不是未來風險** |
| 最該記住的一句 | GEO 目前值得投入的部分，幾乎全部是「本來就該做好的 SEO」加「本來就該寫清楚的事實」。真正 GEO 專屬的增量投入證據薄弱，MUST NOT 排擠 P0 |

---

## 9. 與已完成 SEO 分析的關係

**不衝突。** M1–M4 關鍵字判斷、不投入詞判斷、`/blog` 六篇規模、雙語 URL 與 hreflang 規則、CWV 預算、alt 文法、P0 清單——全部沿用。

| # | 對 SEO 分析的處置 | 理由 |
|---|---|---|
| 9-1 | **提議修正一項**：SEO §P2 的「媒體投稿與外部連結」**SHOULD 從 P2 提升為 P1 起跑** | 兩個理由：(a) §5.2 的引用池結構（68–84% 第三方 `[C]`）使它成為 GEO 的**主要**槓桿而非次要項；(b) 媒體投稿前置期長（投稿到刊出常 1–3 個月），P2 起跑等於 6 個月後才有第一篇。**只需提前「起跑」，工作量與內容規劃不變**，故不與「先上線」衝突 |
| 9-2 | **強化一項**：SEO §5.1 對 `FAQPage`／`HowTo` 的判斷正確，本文補上 GEO 側的反向證據（§1.2） | 使該結論更強，非修正 |
| 9-3 | **新增一項約束**：SEO §5.2 的 shader／滑桿 CWV 要求之外，GEO 增加**文字等價物**要求（§4.2-3） | LLM 抽不走 canvas 與 WebGL 裡的數字 |
| 9-4 | **升級一項**：system-architect §8「SHOULD 升 Framer Pro」在 GEO 面向為 **MUST** | §6。自訂 `robots.txt` 是唯一能宣告雙 locale sitemap 的位置 |
| 9-5 | **回報三個實測落差**：`index.html` 仍 `lang="en"`；`about.html` 尾端 25 個 NUL byte；live 站 `robots.txt`／`sitemap.xml` 仍 404 | 皆屬 SEO 已列的 P0，但實測顯示尚未生效。「repo 有檔」≠「已上線」 |

---

## 10. 未解事項

| # | 事項 | 阻擋什麼 | 需要誰 | 建議 |
|---|---|---|---|---|
| U-G1 | **事實矛盾裁定**：SECOM 面積（2,500 vs 5,940 sqm）、C.SUN 面積（700 vs 560 sqm）、公司名（室內裝修 vs 室內設計）、年資（30 vs 31） | §4 全部、`llms.txt`、`Organization` JSON-LD | **使用者** | 最高優先。矛盾的數字使 LLM 傾向不引用 |
| U-G2 | Framer 是否升 Pro | 自訂 `robots.txt`、`llms.txt`、雙 locale sitemap 宣告 | 使用者（費用） | 建議升；理由為 pages／頻寬／robots.txt |
| U-G3 | Framer **預設** `robots.txt` 的實際內容與是否含 localized sitemap | 決定覆蓋的必要性 | system-architect 實測 | `curl` staging 站，MUST NOT 憑文件假設 |
| U-G4 | Framer 是否提供伺服器 raw access log | §7.2 第 2 層量測能否成立 | system-architect 實測 | 若否則誠實標為缺口 |
| U-G5 | 專業攝影授權（SEO §S-5）是否允許 AI 訓練使用 | 是否對影像路徑條件式 `Disallow` | 使用者 | 上線前確認 |
| U-G6 | 第三方媒體關係由誰負責 | §5.2 全部（GEO 主要槓桿） | 使用者指派 | Claude 無法代做關係經營 |

---

## 11. 查證出處

| 主題 | 來源 | 級 |
|---|---|---|
| GEO 學術基礎與九種手法效果 | [arXiv 2311.09735 `GEO: Generative Engine Optimization`（KDD 2024）](https://arxiv.org/abs/2311.09735) | `[A]` |
| 可見度是分布、需重複量測 | [arXiv 2604.07585 `Don't Measure Once: Measuring Visibility in AI Search (GEO)`](https://arxiv.org/pdf/2604.07585) | `[A]` |
| 引用選擇 vs 引用吸收；高吸收頁特徵 | [arXiv 2604.25707 `From Citation Selection to Citation Absorption`](https://arxiv.org/pdf/2604.25707) | `[A]` |
| OpenAI 爬蟲 UA 與 robots.txt 遵守 | [developers.openai.com/api/docs/bots](https://developers.openai.com/api/docs/bots) | `[B]` |
| Anthropic 爬蟲 UA 與遵守 | [support.claude.com/…/8896518](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) | `[B]` |
| Perplexity 爬蟲 UA 與遵守 | [docs.perplexity.ai/guides/bots](https://docs.perplexity.ai/guides/bots) | `[B]` |
| `Google-Extended` 用途與「不影響 Search 收錄與排名」 | [Google common crawlers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) | `[B]` |
| Google AI features：不需新檔案或標記；`nosnippet`／`max-snippet`／`data-nosnippet`／`noindex` 為控制手段 | [developers.google.com/search/docs/appearance/ai-features](https://developers.google.com/search/docs/appearance/ai-features) | `[B]` |
| `Applebot-Extended`；disallow 後仍可出現在搜尋結果 | [support.apple.com/en-us/119829](https://support.apple.com/en-us/119829) | `[B]` |
| `CCBot/2.0` 用途與封鎖語法 | [commoncrawl.org/ccbot](https://commoncrawl.org/ccbot) | `[B]` |
| Meta 三隻爬蟲用途與遵守差異 | [Meta web crawlers](https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/) | `[B]` |
| Bing／Copilot 以 `NOARCHIVE`／`NOCACHE` 控制；帶標籤仍出現在搜尋結果 | [Bing Webmaster Blog（2023-09）](https://blogs.bing.com/webmaster/september-2023/Announcing-new-options-for-webmasters-to-control-usage-of-their-content-in-Bing-Chat)｜[Search Engine Journal（2026 指引更新）](https://www.searchenginejournal.com/bing-adds-geo-to-official-guidelines-expands-ai-abuse-definitions/568442/) | `[B]`／`[C]` |
| Google 否認使用 `llms.txt` | [Search Engine Land](https://searchengineland.com/google-says-normal-seo-works-for-ranking-in-ai-overviews-and-llms-txt-wont-be-used-459422)｜[Search Engine Roundtable](https://www.seroundtable.com/google-ai-llms-txt-39607.html) | `[B]`（轉述第一方發言） |
| `llms.txt` 採用率、爬蟲實際抓取行為 | [Presenc AI: State of llms.txt 2026](https://presenc.ai/research/state-of-llms-txt-2026)｜[codersera 誠實指南](https://codersera.com/blog/llms-txt-complete-guide-2026/) | `[C]` |
| schema 與 LLM 引用：相關性接近零、受控測試增益消失、FAQ schema 反向 | [Search Engine Journal: Schema, LLMs & The Low Bar For 'Evidence' In GEO](https://www.searchenginejournal.com/schema-llms-the-low-bar-for-evidence-in-geo/576090/)｜[Schema Markup for LLM Citation: Infrastructure, Not a Growth Hack](https://roiandshine.com/blog-ai/geo-seo/schema-markup-for-llm-citation/) | `[C]` |
| 引用池 68–84% 為第三方；跨平台網域重疊約 11%；ChatGPT 平均 15 來源／Gemini 3 | [Semrush 2026 AI Visibility Index](https://www.semrush.com/news/463141-semrush-releases-expanded-2026-ai-visibility-index-analyzing-126-million-ai-search-prompts/)｜[The State of AI Citations 2026](https://www.5wpr.com/research/state-of-ai-citations-2026/) | `[C]` |
| Wikidata 通用性準則 | [Wikidata:Notability](https://www.wikidata.org/wiki/Wikidata:Notability) | `[B]` |
| Framer `robots.txt`（自動產生、不可編輯、Pro 才可覆蓋） | [Framer Help](https://www.framer.com/help/articles/how-can-i-access-the-robots-txt-file/) | `[B]` |
| Framer `llms.txt`（Static Files、Pro／Enterprise、TXT 或 JSON） | [Framer Help](https://www.framer.com/help/articles/llms-txt-framer/) | `[B]` |
| Framer JSON-LD（Custom Code、CMS 變數） | [Framer Help](https://www.framer.com/help/articles/structured-data-through-json-ld/) | `[B]` |
| AI 可見度工具價位帶 | [AI Visibility Tools Compared 2026](https://uxcontinuum.com/blog/ai-engineering/ai-visibility-tools-compared-2026)｜[Best AI Visibility Tools 2026](https://www.surmado.com/blog/best-ai-visibility-tools-2026) | `[C]`，採購前 MUST 向廠商複驗 |
| live 站與 repo 實測 | `curl -L https://www.hqdesign.tw{/robots.txt,/sitemap.xml,/llms.txt}` → 全 404、`/` → 200；27 頁中 canonical 27、OG 27、JSON-LD 1、`lang="en"` 1（`index.html`）；`about.html` 尾端 25 個 `0x00` | `[L]` |
