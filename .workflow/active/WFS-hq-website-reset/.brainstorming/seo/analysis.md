# SEO 策略與關鍵字規劃 — HQ Design 官網重置

**主責**：F-003 雙語 SEO 技術層、F-008 轉址與切換｜**協力**：F-002 主題權威、F-005 alt 與來源標註
**唯一前提**：`guidance-specification.md`。IA 沿用 ux-expert 定案七段流程；URL 與轉址沿用 data-architect §6.4。本文 MUST NOT 另創站點結構。

## 0. 方法與證據限制

| # | 限制 | 影響 |
|---|---|---|
| 0-1 | 競爭判斷來自 2026-09 實際 WebSearch 的 **SERP 組成**（誰佔位、內容型態），出處見 §9 | 可稽核 |
| 0-2 | **本環境無關鍵字量能工具**（無 Ahrefs／Semrush／Keyword Planner） | 本文 MUST NOT 被解讀為附帶搜尋量或 KD 數值；難度為「由 SERP 組成推導的序數等級」：`低`=無商業型供應商頁佔位；`中`=1–2 個直接競品或目錄站佔位；`高`=由排行榜／媒體／工具站佔滿且內容型態 HQ 無法生產 |
| 0-3 | **WebSearch 為 US 地理定位**。已出現偏斜證據：「南港 辦公室裝修」前 8 筆有 6 筆為**香港**業者 | 地區詞 MUST 於預算定案前以台灣定位工具與 GSC 複驗 |
| 0-4 | 標為「查不到」者即為查不到 | MUST NOT 視為「競爭低」 |

---

## 1. 現況 SEO 診斷（實測）

範圍 **27 個可索引 URL**（6 頁 + 21 案例頁，與 data-architect §6.4 一致）。live `https://www.hqdesign.tw/` 回 200。

### 1.1 頭部標記與結構化資料

| 檢查項 | 27 頁命中 | 判定 |
|---|---|---|
| `<title>` / `meta description` | 27 / 27 | 有，模式與長度有問題（§1.2） |
| `rel="canonical"` | **0** | 缺 → `/` 與 `/index.html`、www／非 www 的正規版本由 Google 自行猜測 |
| `hreflang` | **0** | 缺 → 無語言配對 |
| JSON-LD | **0** | 缺 → 無實體宣告 |
| `property="og:*"` / `twitter:card` | **0** | 缺 → **ux-expert §6-J1「可轉發 deep link 與 OG 卡」目前完全不成立** |
| `meta name="robots"` | 0 | 缺 → 無法做 noindex 控制 |
| `meta name="keywords"` | 0 | 正確（該標記已無作用） |
| `robots.txt`（live） | **HTTP 404** | 缺 |
| `sitemap.xml`（live） | **HTTP 404** | 缺 → 21 個深層頁全靠內部連結被發現 |

### 1.2 title／description 模式

| 頁面 | 模式 | 長度 | 問題 |
|---|---|---|---|
| `index.html` | `HQ Interior & Space Design \| Commercial Fit-Out for International Brands · Taipei` | 82 字元 | **全英文、無「惠強」、無任何中文關鍵字**——最嚴重單點問題 |
| 其餘 5 頁 | `<中文> <English> — 惠強室內裝修 HQ Interior & Space Design` | 68–71 | 品牌後綴約 38 字元，吃掉可見標題預算 |
| 21 案例頁 | `<案名> — 惠強室內裝修 HQ Interior & Space Design` | — | 案名外**無空間型別、無地點、無服務詞** |
| 21 案例 description | 完整中文句 | **180–224 字元**（最長 `zhongbao-nangang` 224） | 遠超摘要可見長度，尾段必截斷 |

### 1.3 語言標記不一致的實際後果

已複驗：`index.html` 為 `lang="en"`，其餘 26 頁為 `lang="zh-TW"`，且**無獨立中文版首頁檔案**。

| # | 後果 | 說明 |
|---|---|---|
| 1 | 首頁與子頁被歸為不同語言，卻無 hreflang 配對 | Google 收到的訊號是「一個英文首頁 + 26 個中文子頁」，非「一個雙語網站」；zh 使用者的入口是一個宣告為英文的頁面 |
| 2 | 英文流量沒有落點 | `lang="en"` 僅首頁一頁，點入任何子頁即為中文；且英文覆蓋率實測為 **0**（`nameEn` 21/21 空、`titleEn` 10/10 空） |
| 3 | SERP 呈現失控 | 宣告語言與內容不符時，Google MAY 覆寫語言判定並提供機器翻譯摘要 |
| 4 | 結論 | 這不是「兩個語言版本」，而是**一個語言標記錯誤的單語網站**；英文 SEO MUST 視為 0 |

此推論已被品牌 SERP 直接印證（§2.5）。

### 1.4 標題層級

| 項 | 實測 | 判定 |
|---|---|---|
| h1 數量 | 27/27 各 1 個 | 合理 |
| h2 分佈 | 1–5 個／頁 | 合理 |
| h1 用法 | `index.html` h1 為英文 hero headline；`careers.html` h1 為含 inline `clamp()` 的長句 | h1 被當視覺元件而非語意標題 |
| 案例頁 h1 | 與 title 完全同字串 | 浪費了補充面積／型別／服務模式的位置 |

### 1.5 21 案例頁的 title／description：HTML 有值，CMS 沒有（事實修正）

| 端 | 實測 | 後果 |
|---|---|---|
| 靜態 HTML | 21/21 皆有 title 與 description，且為人寫的可用中文（例：kimpton 連「承攬公共區域與客房走廊」的範圍都寫對） | — |
| `cms/data/projects/*.json` | 含 `metaTitle` 者 **0/21**、`metaDescription` **0/21**（與 data-architect 一致） | **這 21 段文案的唯一副本存在於即將廢棄的 HTML 裡** |

**要求**：切換前 MUST 以腳本自 21 個 HTML 抽出 title／description 寫入新 CMS `pageSeo` 作**遷移種子**，再依 §3.1 改寫並補 en。一次性、可自動化，MUST NOT 略過。

### 1.6 alt 文字

| 類型 | 數量 | 佔比 |
|---|---|---|
| 「空間效果圖 NN」 | 222 | — |
| 「完工實景 NN」 | 37 | — |
| logo（`HQ Logo`／`HQ Interior Design Logo`） | 50 | — |
| **零資訊量樣板合計** | **259 / 383** | **約 68%** |

---

## 2. 關鍵字策略

### 2.1 使用者指定四組關鍵字的逐一判斷

| 關鍵字 | 實測 SERP 佔位者 | 主導內容型態 | 意圖 | 與 HQ 相符 | 難度 | 判斷 |
|---|---|---|---|---|---|---|
| **台灣室內設計** | mybest 十大排行榜、拾境／近境制作／ldesign 的「PTT&Dcard 推薦清單」、DCT（系統櫃）、張馨瀚（美式豪宅）、歐德傢俱 | **排行榜／推薦清單**，全為住宅 | 商業型但**住宅**採購 | **不符** | **高** | **不建議投入**（§2.2） |
| **ai 設計** | monoist.itmedia、ai-market.jp、cad-kenkyujo（皆日文）、Wikipedia「Aiello (company)」、Wikipedia「Ai (chimpanzee)」 | 日文製造業設計 AI + 消歧義條目 | **無法判定** | 不符 | **高（無意義）** | **明確不投入**：Google 自身無法解析此字串的語言與意圖，且與 Adobe Illustrator `.ai` 檔、AI 繪圖高度碰撞 |
| **ai 室內設計** | Adobe Firefly、CyberLink MyEdit、Feel Design AI、Reroom、App Store app；100室內設計、i室設圈調查；artgate 課程；秦創科技「未來裝修圖說」；奇尚室內設計（住宅） | **AI 工具評測／教學**，無任何商用 design & build 業者 | 資訊型／工具型 | **高度契合（定位層）** | **中** | **主攻，但 MUST 分兩層（§2.3 M1／M2）** |
| **ai interior design** | mnml.ai、Apartment Therapy、Remodel AI、Home Design AI、Dehome、MeltFlex、dressmycrib、AlternativeTo | 英文免費工具評測榜 | 消費者／設計師找**免費工具** | **不符**（非發包者） | **高** | **不建議作為英文主攻**（§3.3 提替代） |

| 觀察 | 事實 | 意涵 |
|---|---|---|
| 四組 SERP 中有企業級 design & build 業者佔位嗎？ | **沒有，一個也沒有** | 同時是機會與警訊：「無人競爭」常因**搜尋者不是買家** |
| 加商業修飾詞查「AI 室內設計 公司 導入 設計流程 台灣 業者」 | 出現的供應商是 **AI 工具商**（秦創科技）與**住宅設計公司科普文**（奇尚） | 空位正在被填，但填的人不是 HQ 的競品——時間窗口存在但在關閉 |

### 2.2 「台灣室內設計」：不建議投入

**直說：這個詞 MUST NOT 列為主攻詞。**

| # | 理由 | 依據 |
|---|---|---|
| 1 | **內容型態 HQ 無法生產**。首頁被「十大推薦排行榜」佔滿；要排上去得寫評比同業的排行榜，與機構型客戶要的可稽核形象衝突，且 PM R-09 不允許無憑據比較 | 實測 SERP |
| 2 | **意圖不符**。佔位者為系統櫃、美式豪宅、家具連鎖——住宅。HQ 21 案中 16 案 office、0 案住宅 | 實測 SERP + `cms/data` |
| 3 | **與媒體平台正面對撞**。100室內設計、i室設圈的優勢來自數萬筆使用者生成案例，非內容品質可追平 | 實測 SERP |
| 4 | 投報率結構性為負：最高難度 × 最低意圖匹配。即使排上第一，來的是住宅詢價，消耗業務量能 | 推導 |

| 使用者原詞 | 替代詞組 | 為何更好 |
|---|---|---|
| 台灣室內設計 | **台灣商業空間設計**／**商業空間設計施工統包**／**辦公室設計施工統包**／**外商 台灣辦公室 裝修** | 保留「台灣」地理訊號，把「室內設計」換成 HQ 真正在賣的「商業空間＋設計施工統包」，意圖從住宅轉為 B2B 發包 |

實測支持：「辦公室設計 施工統包 商業空間 台北」的 SERP 為 PRO360 目錄 + 谷思空間／意力設計／墨瑪等**真實同業**——僅 3–4 個直接競品、無媒體壟斷，難度「中」且**意圖完全相符**。
**折衷**：若仍要保留該詞，MAY 於 `/about` 以「台灣商業空間室內設計」自然語句承接；MUST NOT 為它產製內容或設落地頁。

### 2.3 主攻詞（4 個）

| # | 主攻詞 | 意圖 | 目標頁 | 難度 | HQ 為何有機會贏 |
|---|---|---|---|---|---|
| M1 | **AI 室內設計**（頭部／定位層） | 資訊型 | `/process/`（樞紐） | 中 | SERP 全為工具評測與教學，**無任何有實績的執行方**。HQ 是唯一能講「AI 進到施工交付」而非「AI 出圖」的角色（P06「AI 不只畫圖，而是提升整個交付」）。**限制：轉換率低，其價值是定位與品牌可見度，MUST NOT 以它衡量詢價成效** |
| M2 | **AI 室內設計流程**／**AI 導入 室內設計** | 資訊型→商業型 | `/process/` + `/blog` 支柱文 | 中 | M1 的商業意圖切片，搜尋者已在問「怎麼導入」。P03（2026.4 導入項目）與 P06 對照表可直接回答，同業無此素材 |
| M3 | **辦公室設計施工統包**／**商業空間設計施工** | 商業型／交易型 | `/services/` + `/engagement/` | 中 | **真正的營收詞**。勝出點是 ux-expert §2.1 的「輸入／產出對照表」——同業頁面只有服務清單，沒有可當合約範圍對照的結構 |
| M4 | **參數化設計 室內**／**BIM 室內裝修** | 資訊型 | `/process/parametric`、`/process/bim` | **低** | 實測 SERP 全為學術與教育（Airiti 期刊、博碩士論文系統、gemhorn 課程、tyarchistudiobim 指南、InCG Media），**無任何商業供應商頁佔位**。一個有 1,600 件實績的執行方寫「BIM 抓到的實際衝突數」，在此 SERP 中無對手 |

**M4 是最被低估的機會，建議排在 M1 之前開工**：量必然低於 M1，但每個搜尋者都是專業買方或決策影響者（評估 BIM 導入的總務、廠務、建築師、標案承辦），且是唯一難度「低」的主攻群。

### 2.4 長尾詞（15 個，對映七段流程 IA）

IA 沿用 ux-expert 定案七段。data-architect §6.4 曾列 `/ai-advantage`／`/parametric`／`/bim` 為新增 URL；本文以 **`/process/*` 為 canonical**，那三個扁平路徑 SHOULD 僅作 301 別名，MUST NOT 同時上線兩份可索引內容。

| # | 長尾詞 | 意圖 | 目標頁（七段 IA） | 難度 | 勝出理由 |
|---|---|---|---|---|---|
| L01 | AI 識圖丈量／現況掃描 CAD 轉 BIM | 資訊型 | `/process/site-survey`（01） | 低 | P03 2026.4 明列，同業無對外論述 |
| L02 | 室內設計 現場丈量 流程 | 資訊型 | `/process/site-survey`（01） | 中 | 以業主視角寫「你要準備什麼」 |
| L03 | 參數化設計 室內 案例 | 資訊型 | `/process/parametric`（02） | 低 | P07 + 互動滑桿為唯一可操作證據 |
| L04 | 辦公室 座位配置 多方案比較 | 商業型 | `/process/parametric`（02） | 低 | 「人數 40→60 同步更新」可示範 |
| L05 | 設計意圖 定案 流程 | 資訊型 | `/process/design-intent`（03） | 低 | P05 為唯一已發佈英文措辭 |
| L06 | 室內設計 施工可行性 評估 | 商業型 | `/process/validation`（04） | 中 | 對映 P05-02 Technical Validation |
| L07 | BIM 室內裝修 衝突檢討 | 資訊型 | `/process/bim`（05） | **低** | 可給具名案件的衝突計數 |
| L08 | 機電 界面整合 室內裝修 | 資訊型 | `/process/bim`（05） | 低 | P04-04 技術協調 |
| L09 | 施工圖說 深化設計 交付 | 資訊型 | `/process/documentation`（06） | 低 | P09 六步改寫為「你會拿到什麼」 |
| L10 | 竣工圖 保固 操作手冊 交付 | 商業型 | `/process/documentation`（06） | 低 | 採購最在意的交付清單 |
| L11 | 營運不中斷 分區施工 辦公室 | 商業型 | `/process/delivery-ai-pm`（07） | 低 | SECOM 756 坪分層分區 + 航空貴賓室（管制區）雙證據 |
| L12 | AI 專案管理 室內裝修 工程 | 資訊型 | `/process/delivery-ai-pm`（07） | 低 | **MUST 依 ux-expert §8.5 標示成熟度，MUST NOT 用完成式** |
| L13 | 辦公室設計施工統包 台北 | 交易型 | `/services/` | 中 | 真實同業競爭，靠實績深度勝出 |
| L14 | 外商 台灣辦公室 裝修 統包 | 交易型 | `/engagement/` | 中 | `homepage.json` 已鎖 foreign-HQ；Kimpton／Popeyes／Soup Spoon／DXC 為外商實績 |
| L15 | 南港 辦公室 裝修 設計 | 交易型（地區） | `/work/`（篩選：南港） | **低** | 13 件南港案為區域壟斷級證據。**US 定位下 6/8 為香港業者，台灣 SERP MUST 複驗** |

### 2.5 品牌詞與競品詞

**品牌詞是已證實的失分項。** 查「惠強室內裝修 HQ Design 台北」，前 10 筆全為公司登記站（twincn、findcompany、technews、iyp、twfile ×2、alltwcompany）、104 與 FB——**官網 `www.hqdesign.tw` 未出現於前 10 筆**。

| # | 發現 | 處置 |
|---|---|---|
| 1 | 公司登記資料站佔滿自家品牌 SERP，原因與 §1.2／§1.3 一致（首頁 title 無「惠強」、`lang="en"`、無 Organization JSON-LD、無 sitemap） | **最低成本、最高確定性的修復項**，全落在 P0 |
| 2 | 品牌實體名稱分裂為四組：惠強室內裝修股份有限公司／惠強設計工程股份有限公司（twfile 別名）／HQ Design CO., LTD./ HuiCiang Design（FB） | MUST 於 `Organization.name` 與 `alternateName` 一次固定全部別名，並與 ux-expert §8-8 專名表對齊 |
| 3 | 官方社群與官網未互相宣告，FB 用不同英文名 | MUST 於 `Organization.sameAs` 列出 FB、104 與任何官方 IG／LinkedIn |

| 類別 | 詞 | 目標頁 | 處置 |
|---|---|---|---|
| 品牌 | 惠強室內裝修、惠強設計、HQ Design、HQ Interior & Space Design、惠強設計工程 | `/`、`/about` | 全數進 `alternateName`；首頁 title MUST 含「惠強室內裝修」 |
| 品牌＋意圖 | 惠強室內裝修 評價／案例／徵才 | `/work`、`/careers` | 建內部連結，避免 104／黃頁攔截 |
| 競品（本地商用） | 意力設計、谷思空間、墨瑪 | 內部觀測，**不做頁面** | 內容缺口分析 |
| 競品（英文 B2B） | **M Moser Associates** | 內部觀測 | 實測為「office fit out Taipei」英文 SERP 主要佔位者；HQ 差異點為**自有施工團隊**與 AI／參數化流程，M Moser 主打 workplace strategy |
| 媒體（非對手） | 100室內設計、i室設圈漂亮家居 | — | MUST NOT 正面競爭；SHOULD 投稿或受訪以取得外部連結 |

---

## 3. 內容規劃：如何讓「AI 室內設計」真的排上去

### 3.1 七段流程頁的目標關鍵字與標記模式

| 項 | 模式（MUST） |
|---|---|
| title | `{階段中文名}｜{目標關鍵字}｜惠強 HQ Design`。品牌後綴 MUST 由現行 38 字元縮為「｜惠強 HQ Design」（約 12 字元），釋出約 26 字元給描述性關鍵字 |
| description | `{業主決策問題}。{HQ 做法}，{可驗證數值}。{行動}。` 長度 MUST 為 **60–80 個中文字元**（現行 180–224 必被截斷） |
| h1 | MUST 與 title 不同字串，MUST 承接 ux-expert §2.1 的第二人稱決策問題 |

| 階段頁 | 目標詞 | title | h1 |
|---|---|---|---|
| `/process/`（樞紐） | M1、M2 | `AI 室內設計流程｜從現況掃描到交付的七個階段｜惠強 HQ Design` | 你的案子會走過哪七個階段？ |
| 01 `/site-survey` | L01、L02 | `現況掃描｜AI 識圖丈量與 CAD 轉 BIM｜惠強 HQ Design` | 進場前，我們先量清楚什麼？ |
| 02 `/parametric` | M4、L03、L04 | `參數化設計 室內｜一個條件改變，整套空間同步更新｜惠強 HQ Design` | 改一次條件，要重畫幾次圖？ |
| 03 `/design-intent` | L05 | `設計意圖定案｜Design Intent Review｜惠強 HQ Design` | 這個階段你要決定什麼？ |
| 04 `/validation` | L06 | `技術驗證｜尺度、材料、法規與施工可行性｜惠強 HQ Design` | 方案能不能蓋，什麼時候知道？ |
| 05 `/bim` | M4、L07、L08 | `BIM 室內裝修協調｜衝突在模型裡被找到，不在工地｜惠強 HQ Design` | 撞管誰付錢？何時發現？ |
| 06 `/documentation` | L09、L10 | `施工圖說與深化設計｜你會拿到的完整文件｜惠強 HQ Design` | 完工時你手上會有什麼？ |
| 07 `/delivery-ai-pm` | L11、L12 | `交付與 AI 專案管理｜營運不中斷的分區施工｜惠強 HQ Design` | 施工期間營運會停嗎？ |

### 3.2 `/blog` 的必要性與最小可行規模

**判斷：`/blog` 對 M1 是必要的，對 M3 不是。** M1 的 SERP 被**資訊型內容**佔滿，Google 已判定使用者要文章——服務頁無法滿足此意圖，無論怎麼優化 `/process/` 都難進前段。M3 的 SERP 是服務頁與目錄站，`/services/` 本身即正確頁型。

**最小可行規模：6 篇、12 週內，然後停下評估。** 採樞紐輻射：`/process/` 為樞紐，每篇 MUST 連回一個階段頁。

| # | 主題 | 支撐詞 | 素材 | 連回 |
|---|---|---|---|---|
| B1 | AI 進到室內設計的哪一段？從畫圖到交付的實際分工 | M1、M2 | P06 對照表 + 量化欄位 | `/process/` |
| B2 | 一個條件改變要重畫幾張圖：參數化在辦公空間的實際節省 | M4、L03、L04 | P07 + 互動滑桿 | `/process/parametric` |
| B3 | BIM 在室內裝修抓到的衝突長什麼樣：一件具名案件的衝突清單 | M4、L07 | P08 + 衝突計數 | `/process/bim` |
| B4 | 營運不中斷怎麼做到：756 坪分層分區同步施工的排程 | L11 | SECOM + 航空貴賓室（管制區） | `/process/delivery-ai-pm` |
| B5 | 設計圖到施工圖之間發生了什麼：業主會拿到的六份文件 | L09、L10 | P09 六步改寫 | `/process/documentation` |
| B6 | 設計已定案，只找執行夥伴：兩種委任模式怎麼選 | L14、M3 | P05 協作流程 | `/engagement/` |

**紅線：MUST NOT 寫「10 大 AI 室內設計工具推薦」類清單文**——與 100室內設計、CyberLink、Feel Design AI 正面對撞（實測皆已佔位），且吸引找免費工具的人而非發包者。HQ 唯一不可複製的內容是 1,600 件實績中的可驗證數字；每篇 MUST 至少含一個 HQ 專屬量化錨點（衝突數、改版工時、分區數、面積），否則 MUST NOT 發佈。

### 3.3 英文 SEO 優先序（覆蓋率 0 的直接後果）

英文不是補強，是從零建立。

| # | 要求 | 理由 |
|---|---|---|
| 1 | **MUST 把英文預算從「ai interior design」移走** | SERP 100% 為英文免費工具評測，搜尋者是消費者與設計師而非發包企業。以 0 覆蓋率打一個高難度、低意圖的詞是最差配置 |
| 2 | 英文主攻改為 B2B 採購詞：`office fit out Taipei`、`design and build contractor Taiwan`、`workplace fit-out Taiwan`、`interior fit-out Taipei office` | 實測僅 **M Moser Associates** 一個真實競品，其餘為 Houzz、Kompass 目錄站 |
| 3 | 上線最小英文集合：`/en/`、`/en/process/*`（7）、`/en/engagement`、`/en/about`、`/en/contact`，加 **6 個有實拍且正交性最高的英文案例頁**（依 ux-expert §2.2 選案原則） | 39 案全譯不可能在「先上線」前提下完成 |
| 4 | **`locale.parity != full` 的 `/en/` 頁 MUST 加 `noindex,follow` 且 MUST NOT 進 en sitemap；`parity == full` 時自動解除** | ux-expert §5.1 要求 en 缺值顯示 zh 並標註 `(ZH)` 且頁面可存取（轉發要能開）；但 `/en/` 下承載未譯 zh 內容屬薄內容訊號。此規則由 data-architect §6.3 已存在的 `locale.parity` 欄位驅動，可自動化，不需人工維護開關 |

---

## 4. 雙語 SEO 技術規劃

### 4.1 URL 結構：確認 data-architect 建議

**確認採用 `/work/<slug>` 與 `/en/work/<slug>`，不提替代方案。** zh 無前綴符合 ux-expert §5.1 的 zh 權威定位；`/en/` 子目錄優於子網域與 query；21 個既有 slug MUST 保留（`cms/schemas/README.md` Mapping rule 2 已明訂）。新增三項約束：

| # | 約束 |
|---|---|
| 4.1-1 | `/projects/<slug>.html` → `/work/<slug>` 為 **301 直達**，MUST NOT 產生轉址鏈 |
| 4.1-2 | 主機與尾斜線 MUST 單一化：`www.hqdesign.tw` 為保留主機，非 www 與 `http` 皆 301；尾斜線二選一並全站一致 |
| 4.1-3 | ux-expert §2.2 新增的「流程階段」「影像類型」篩選 MUST NOT 產生可索引 query URL；SHOULD 純前端實作，若必須進 URL 則該 URL MUST canonical 指向 `/work` 並 `noindex` |

### 4.2 hreflang 與 canonical

```html
<!-- /work/secom-nangang-complex -->
<link rel="canonical" href="https://www.hqdesign.tw/work/secom-nangang-complex">
<link rel="alternate" hreflang="zh-Hant-TW" href="https://www.hqdesign.tw/work/secom-nangang-complex">
<link rel="alternate" hreflang="en"         href="https://www.hqdesign.tw/en/work/secom-nangang-complex">
<link rel="alternate" hreflang="x-default"  href="https://www.hqdesign.tw/work/secom-nangang-complex">

<!-- /en/work/secom-nangang-complex ：canonical 改為自身，三組 alternate 完全相同 -->
<link rel="canonical" href="https://www.hqdesign.tw/en/work/secom-nangang-complex">
```

| # | 規則 |
|---|---|
| 4.2-1 | canonical MUST 為**自我指向的絕對 URL**，每個 locale 各自指向自己。**跨語言 canonical（en 指向 zh）會使英文版直接退出索引——這是雙語站最常見的致命錯誤** |
| 4.2-2 | hreflang MUST **雙向對稱**：zh 頁列 en，en 頁也 MUST 列 zh，否則 Google 忽略整組宣告 |
| 4.2-3 | 值用 `zh-Hant-TW` 與 `en`；`x-default` 指向 zh（依 ux-expert §5.2，業務與法人客戶皆在台灣）。若 GSC 顯示國際曝光佔比 > 30%，MAY 改指 `/en/` |
| 4.2-4 | 語言切換 MUST 為真實 `<a href>`，MUST NOT 為 JS 切換或 query string |
| 4.2-5 | `<html lang>` MUST 與 locale 一致，**MUST NOT 重演 §1.3 的首頁 `lang="en"`** |

### 4.3 Framer 平台限制的實際影響與可行實作

**已查證前提（system-architect）**：Framer 的 localization 是**頁面級**機制——以 locale 產生頁面變體與 localized page paths，由平台代為輸出語言關聯標記。規格 §5.3 CONFIRMED 的「欄位層雙語」則是**單一 CMS 記錄同時持有 zh/en 欄位**。兩者不是同一模型。

| 若採 | URL 數 | 英文可否被索引 | hreflang 可否成立 | 判定 |
|---|---|---|---|---|
| 單一 CMS 記錄 + 前端依語言讀不同欄位（同一 URL） | 1 | **否** | **否**（無第二 URL 可指） | **MUST NOT**——等於英文 SEO 永久為 0 |
| Framer Localization 頁面級 + CMS 按 locale 拆分 | 2 | 是 | 是 | **建議** |

| 方案 | 做法 | 代價／效益 | 判定 |
|---|---|---|---|
| **A** | git JSON 維持 `{zh, en}` 為 SSOT；同步腳本**扇出**為兩個 Framer CMS collection（`work_zh`／`work_en`，欄位名相同、值為單語），各由對應 locale 的模板頁消費 | 代價：模板維護兩份。效益：兩個真實可索引 URL，hreflang 由平台頁面級機制正常運作 | **建議** |
| B | 單一 collection 保留雙語欄位，建 locale 專屬模板頁分別讀 `nameZh`／`nameEn` | MUST 實測「Framer 是否允許同一 collection 對應兩個 locale 路徑的模板頁」 | **MUST NOT 在實測前納入計畫** |
| C | 單一 URL + JS 切換 | 英文永久不可索引 | **MUST NOT** |

**關鍵觀念：欄位層雙語仍成立——它成立於 SSOT 層而非 Framer 層。** Framer 是消費端，不是資料模型的權威（與 data-architect §3.4「Framer CMS 是最脆弱的一端」一致）。無論採哪案，MUST 於切換前驗證發佈後的 HTML，不得僅信任平台自動輸出：

```bash
for u in / /en/ /work/secom-nangang-complex /en/work/secom-nangang-complex; do
  echo "== $u"; curl -sL "https://www.hqdesign.tw$u" \
    | grep -oE '<(html lang="[^"]*"|link rel="(canonical|alternate)"[^>]*)>'
done
```

---

## 5. 技術 SEO 檢核表（Framer 發佈環境）

| # | 項目 | 要求 | 現況 |
|---|---|---|---|
| T01 | `robots.txt` | MUST 存在，MUST 宣告兩個 locale 的 sitemap | live **404** |
| T02 | `sitemap.xml` | MUST 涵蓋全部 zh 與 en 可索引 URL；`parity != full` 的 en 頁 MUST 排除；**MUST 實測 Framer 自動 sitemap 是否含 localized paths**，不足則自建 | live **404** |
| T03 | canonical | 自我指向絕對 URL，per locale（§4.2-1） | 0/27 |
| T04 | hreflang | 雙向對稱 + `x-default` | 0/27 |
| T05 | `<html lang>` | 與 locale 一致 | 首頁錯誤 |
| T06 | title／description | 依 §3.1；**21 案例 MUST 先抽舊 HTML 文案作種子（§1.5）** | 模式待改；CMS 值 0/21 |
| T07 | OG／Twitter Card | 全頁 MUST 具 `og:title`／`og:description`／`og:image`／`og:locale`（`zh_TW`／`en`）／`og:url`；階段頁與案例頁 MUST 有專屬 `og:image` | 0/27（阻斷 ux-expert §6-J1） |
| T08 | 結構化資料 | 見 §5.1 | 0/27 |
| T09 | 轉址 | 27 個舊 URL 全覆蓋、目標回 200、無鏈、無 404（data-architect §6.3 檢查 8） | 未建 |
| T10 | 併案轉址 | 若 U4 裁定 SECOM／`zhongbao-nangang` 同標的，被併者 301 指向保留案 | 未決 |
| T11 | Core Web Vitals | 見 §5.2 | 未量測 |
| T12 | 圖片 SEO | 見 §6 | 68% alt 無資訊 |
| T13 | 麵包屑 | `/process/*` 與 `/work/<slug>` MUST 有可見麵包屑 + `BreadcrumbList` | 無 |
| T14 | 內部連結 | 每階段頁 MUST 被 `/process/` 樞紐與至少一篇文章連結；每案例頁 MUST 自至少一個階段頁證據卡連入 | 部分 |

### 5.1 建議的 schema.org 型別

| 頁面 | 型別 | 說明 |
|---|---|---|
| 全站（於 `/` 定義一次，以 `@id` 引用） | `Organization` **且** `GeneralContractor` | 用 `"@type": ["Organization","GeneralContractor"]`。`GeneralContractor` 是 `LocalBusiness`→`HomeAndConstructionBusiness` 的子型，比裸用 `LocalBusiness` 精確。MUST 含 `name`、`alternateName`（§2.5 全部別名）、`url`、`logo`、`address`、`telephone`、`foundingDate` `1995`、`sameAs`、`areaServed` `TW` |
| `/work/<slug>` | `CreativeWork` | schema.org 無 `Project` 型別。用 `CreativeWork` + `creator`（`@id`）、`locationCreated`（`Place`）、`dateCreated`、`image`、`about`。MUST NOT 用 `Product`（非販售商品） |
| `/work`（列表） | `ItemList` | 案例 URL 與順序 |
| `/services` | `Service` ×10（`provider` → `@id`） | 對映 `services.json` 十項 |
| `/process/*` | `WebPage` + `BreadcrumbList` | **MUST NOT 期待 `HowTo` 或 `FAQPage` 產生複合式搜尋結果**（Google 已下架此兩類 rich result）。MAY 為語意完整性加註，但 MUST NOT 作為投入理由 |
| 全站圖片 | `ImageObject` | 見 §6.3：同時服務攝影授權（data-architect §4.7）與來源標註（PM §2.6） |

### 5.2 Core Web Vitals 風險（大量高解析攝影）

前提：`assets/` **525MB** 未經最佳化；NAS 有 234 張 ≥40MP 母檔；PM §2.5 要求 hero 優先採 A 類實拍。

| 指標 | 風險來源 | 要求 |
|---|---|---|
| **LCP** | hero 為 40MP 母檔；Framer 自動最佳化上限未知 | hero LCP 影像 MUST ≤ 200KB（AVIF 優先、WebP 回退）、長邊 ≤ 1920px、MUST 加 `fetchpriority="high"`、MUST NOT lazy-load。目標 p75 < 2.5s |
| **LCP／INP** | 四套 WebGL shader（mesh／beams／grid-scan／pattern） | 首屏 MUST NOT 有 shader 佔 LCP 元素；shader canvas MUST 於 LCP 後才初始化；行動端 MUST 有靜態回退 |
| **INP** | `/process/parametric` 單參數滑桿 | 每次輸入的主執行緒工作 MUST < 50ms；MUST 節流／防抖；重算 MUST NOT 同步觸發版面重排。目標 p75 < 200ms |
| **CLS** | Satoshi + **Noto Sans TC**（中文字檔體積極大） | Noto Sans TC MUST 以 `unicode-range` 分片並僅子集化實際使用字元；MUST `font-display: swap` 並以 `size-adjust` 對齊回退字體度量；所有 `<img>` MUST 有 `width`／`height` 或 `aspect-ratio`。目標 p75 < 0.1 |
| 全體 | gallery 動輒數十張（SECOM 77 張唯一） | MUST 分段載入，首屏 MUST NOT 超過 6 張，其餘 `loading="lazy"` |

---

## 6. 影像 SEO 與來源標註的交互作用

### 6.1 張力的準確描述

PM §2.6 要求 C1／C2／D 類的 `alt`「開頭即標示」，R-02 禁止以互動方式作為唯一標註。若把完整雙語標註塞進 alt 開頭，約 25 字元的前段全為免責聲明，空間描述被推到後面。但張力的實際大小要說清楚：

| # | 事實 |
|---|---|
| 1 | `alt` 對排名權重有限，主要作用是圖片搜尋與無障礙 |
| 2 | **現況真正的損失不是「被標註擠掉關鍵字」，而是 68% 的 alt 是「空間效果圖 05」這種零資訊樣板**——那是純粹浪費，與標註政策無關。修正 alt 的收益遠大於前綴的代價 |
| 3 | **R-02 禁止的是「需互動才可見」的標註**（hover／tooltip／燈箱／頁尾聲明）。`alt` 不是互動才可見；且燒入像素標註（PM §2.6 規格 1）已獨立滿足視覺標註義務 |
| 4 | 故 alt 的職責是**輔助**標註而非唯一標註，**MUST NOT 為追求政策完整性把 alt 當成法律聲明欄位** |

### 6.2 兼顧兩者的 alt 撰寫規則

**文法（MUST）**：`[來源短標記｜]{案名} {空間／區域} {關鍵設計或工法特徵}，{地點或樓層}`

| # | 規則 |
|---|---|
| 6.2-1 | 來源短標記僅 A／B 類免除；C1／C2／D 類 MUST 有，且 MUST 為下表**固定短字串**（≤ 8 個中文字元），MUST NOT 使用燒入標註的完整雙語長句 |
| 6.2-2 | 標記後 MUST 立即接描述性子句，使關鍵字落在前 12 個字元內 |
| 6.2-3 | alt MUST 為單語（zh 頁中文、en 頁英文），MUST NOT 中英並列（並列屬燒入標註與圖說的職責） |
| 6.2-4 | alt MUST ≤ 100 字元，MUST NOT 堆疊關鍵字，MUST NOT 重複案名超過一次 |

| 類型 | alt 前綴（zh） | alt 前綴（en） | 範例 |
|---|---|---|---|
| A 實拍 | 無 | 無 | `中興保全南港總部接待大廳完工實景，天然石材櫃體與間接照明，台北南港` |
| B 實拍修復 | 無 | 無 | 同 A 文法 |
| C1 完工視覺化 | `設計視覺化（依完工）｜` | `Design visualisation (as built)｜` | `設計視覺化（依完工）｜中保科技展示廳沉浸式展區，弧形金屬格柵，台北南港` |
| C2 設計方案視覺化 | `設計方案視覺化｜` | `Design option (not as-built)｜` | `設計方案視覺化｜天河電訊 9F 開放辦公區座位配置方案，台北南港` |
| D 無對應案件 | `設計視覺化｜` | `Design visualisation｜` | `設計視覺化｜開放辦公區座位配置示意`（MUST NOT 含客戶／面積／年份，依 PM §2.5） |
| E 品牌圖形 | 無（區塊標籤已標示） | 無 | `參數化設計條件變動示意圖` |

**檔名規則**：檔名 MUST 由 CMS 於匯出時衍生，格式 `{slug}-{區域}-{特徵}-{序號}.{ext}`（例 `secom-nangang-complex-reception-stone-counter-01.avif`），MUST NOT 沿用 `photo-01.jpg`／`page-115.jpg`。**MUST NOT 由人工輸入檔名前綴**——data-architect §4.3 已證實前綴與內容不一致（38 張 `page-*` 實為渲染內容），檔名只能是衍生值，MUST NOT 作為來源判定依據。

### 6.3 把標註移進結構化資料（解除 alt 的壓力）

```json
{
  "@type": "ImageObject",
  "contentUrl": "https://www.hqdesign.tw/i/zhongbao-showroom-immersive-01.avif",
  "creditText": "HQ Design 設計視覺化（非完工紀錄）／Design option — not as-built",
  "copyrightNotice": "© HQ Design Co., Ltd.",
  "creator": { "@id": "https://www.hqdesign.tw/#org" },
  "license": "https://www.hqdesign.tw/image-policy",
  "caption": "中保科技展示廳沉浸式展區設計方案"
}
```

| # | 效益 |
|---|---|
| 1 | `creditText`／`copyrightNotice` 是 Google 圖片會顯示的授權欄位，標註因此**跟著圖片出現在搜尋結果**，比頁內文字更符合 PM「標註隨檔案傳遞」的意圖 |
| 2 | 同時滿足 data-architect §4.7 的攝影著作權與授權範圍欄位需求 |
| 3 | alt 得以回歸描述空間，張力實質消解 |
| 4 | `/image-policy` MUST 為公開頁面，說明 A–E 分層與標註規則；該頁本身也是「AI 室內設計」主題權威的可信度資產 |

---

## 7. 成效量測

### 7.1 基線：現在沒有，且時間敏感

**MUST 立即（本週）在舊站建立基線，並在切換前累積 ≥28 天（建議 8 週，與 PM 表單三欄同步）。** 舊站一旦下線其查詢資料無法回溯，是唯一無法事後補救的項目。成本約 30 分鐘。

| 步驟 | 動作 | 為何在切換前 |
|---|---|---|
| 1 | GSC 建立 **Domain property**（`hqdesign.tw`）＋ URL-prefix property（`https://www.hqdesign.tw/`） | Domain property 涵蓋切換後所有主機與 locale；URL-prefix 可比對舊站 |
| 2 | Bing Webmaster Tools 匯入 GSC 設定 | 台灣仍有可觀 Bing／Edge 流量 |
| 3 | GA4 安裝於**舊站**（含 `page_location` 與表單事件） | 無舊站流量分佈則無法判定新站是升是降 |
| 4 | 匯出舊站 GSC 的 query／page／country／device 全量 CSV 至 `.../seo/baseline/` | 舊 property 資料保留期有限 |
| 5 | 舊站表單加「案件類型／面積級距／來源頁面」三欄（PM 已列） | 詢價**品質**基線，非數量 |
| 6 | 以台灣定位手動記錄並截圖 M1–M4 + 15 長尾 + 品牌詞的基線位置 | §0-3 的定位偏斜使自動工具不可單獨採信 |

### 7.2 指標與工具

| 層級 | 指標 | 工具 | 目標 |
|---|---|---|---|
| 索引健康 | 兩 locale 各自已索引頁數；`/en/` 索引數 > 0 | GSC 頁面索引報表 | 30 天內 zh ≥ 目標頁數 90%、en ≥ 12 頁 |
| 轉址正確性 | 27 個舊 URL 的 404 數、轉址鏈數 | 切換後 24h 內 `curl` 全掃 + GSC 涵蓋範圍 | **404 = 0、鏈 = 0** |
| **品牌 SERP 所有權** | 「惠強室內裝修」查詢中官網是否第 1 位、有無 sitelinks | 手動 + GSC | 90 天內為第 1 位（現況：**未進前 10**） |
| 主攻詞 | M1–M4 曝光、平均排名、點擊 | GSC 查詢報表（對 §7.1-6 基線） | 90 天 M4 進前 20；180 天 M2、M3 進前 20 |
| 長尾詞 | 15 詞中有曝光的詞數與平均排名 | GSC | 90 天 ≥ 10 詞有曝光 |
| 非品牌流量 | 非品牌自然點擊佔比 | GSC（排除品牌詞清單） | 180 天 > 50% |
| 雙語成效 | `/en/` 自然點擊佔比、en 曝光國家分佈 | GSC 依頁面與國家切分 | 作為 §4.2-3 `x-default` 是否改指的決策依據 |
| CWV | p75 LCP／INP／CLS | GSC 網站體驗核心指標（CrUX 實地資料）＋ PageSpeed Insights | LCP < 2.5s、INP < 200ms、CLS < 0.1 |
| 圖片搜尋 | 圖片曝光與點擊 | GSC 搜尋類型＝圖片 | 驗證 §6 alt 與檔名改寫是否有效 |
| **商業成效（最終判準）** | 附面積與時程之詢價件數與佔比 | 表單三欄 + GA4 | 合格佔比高於基線且絕對數不低於基線（沿用 PM 判準） |

**節奏**：切換後第 1–4 週每週檢查索引與轉址；第 2–6 個月每月一次；第 90 與 180 天各一次完整評估。**MUST NOT 在切換後 4 週內以排名變動判斷成敗**——重構後排名重排期常橫跨數週至數月，過早結論會導致錯誤的回滾決策。

---

## 8. 優先序建議（使用者要求「先上線」）

原則：**只有「上線後補救成本高於上線前」的項目進 P0。** 內容深度可迭代，URL 與語言標記不行。

### P0 — 上線前 MUST 完成

| # | 項目 | 不做的後果 | 依據 |
|---|---|---|---|
| P0-1 | **立即在舊站建立 SEO 基線**（GSC／Bing／GA4／CSV／表單三欄／手動 SERP 記錄） | 舊站下線後永久失去比較基準 | §7.1 |
| P0-2 | **URL 結構定案並凍結**：`/work/<slug>`、`/en/work/<slug>`、`/process/*` 為 canonical，扁平別名僅作 301 | 上線後改 URL 需二次轉址並重置索引 | §4.1、§2.4 |
| P0-3 | **21 個 slug 保留** ＋ **27 個舊 URL 的 301 對映表**，目標回 200、無鏈、無 404 | 深層案例頁的既有外部連結與品牌搜尋流量全部斷線 | data-architect §6.4／§6.3-8 |
| P0-4 | **U4 併案裁決落實於轉址**（SECOM／`zhongbao-nangang`） | 已索引 URL 事後再併需第二次遷移 | T10 |
| P0-5 | **canonical + hreflang + `<html lang>` 全站正確**，並以 `curl` 驗證發佈後 HTML | 錯誤 canonical 會使英文版退出索引；重演 §1.3 首頁 `lang="en"` | §4.2 |
| P0-6 | **Framer 雙語實作定案（方案 A）並實測 sitemap 是否含 localized paths** | 若落入方案 C，英文 SEO 永久為 0 | §4.3 |
| P0-7 | **`robots.txt` + `sitemap.xml`（雙 locale）** | 目前皆 404；深層頁依賴內部連結被發現 | T01／T02 |
| P0-8 | **首頁 title MUST 含「惠強室內裝修」**；全站 title／description 依 §3.1；**21 案例文案自舊 HTML 抽取為種子** | 品牌 SERP 繼續被登記資料站佔據；21 段可用文案永久遺失 | §1.2／§1.5／§2.5 |
| P0-9 | **Organization + GeneralContractor JSON-LD**（含全部 `alternateName` 與 `sameAs`） | 品牌實體持續分裂為四個名稱 | §2.5／§5.1 |
| P0-10 | **OG／Twitter Card 全頁**（階段頁與案例頁專屬 `og:image`） | 直接阻斷 ux-expert §6-J1「可轉發材料」旅程 | T07 |
| P0-11 | **實際上線頁面的 alt 依 §6.2 改寫 + 檔名由 CMS 衍生**（僅上線頁，非全部 383 個） | 上線即帶 68% 零資訊 alt；事後改寫需重跑資產管線 | §6.2 |
| P0-12 | **hero LCP 影像預算（≤200KB／≤1920px／`fetchpriority`）與字體子集化** | 首發即拿到差的 CWV 實地資料，該資料以 28 天滾動視窗計，修好後仍需數週才反映 | §5.2 |
| P0-13 | **`locale.parity != full` 的 `/en/` 頁 `noindex,follow` 且排除於 sitemap** | 英文覆蓋率 0 的現實下會有大量薄內容頁被索引 | §3.3-4 |

### P1 — 上線後 2–8 週

| 項目 |
|---|
| `BreadcrumbList`／`ItemList`／`CreativeWork`／`Service` 結構化資料 |
| `ImageObject` 授權欄位（§6.3）與 `/image-policy` 頁 |
| 剩餘案例頁的 alt 與檔名 |
| `/process/parametric` 互動滑桿（先以靜態三幀回退上線） |
| 英文 6 個案例頁翻譯完成後解除 `noindex` |
| `/credentials` 頁 |

### P2 — 上線後 2–6 個月

| 項目 |
|---|
| `/blog` 六篇（B1–B6，每 2 週一篇） |
| 英文 B2B 詞落地內容（`office fit out Taipei` 等） |
| 媒體投稿與外部連結（i室設圈、InCG Media 等有 BIM／參數化選題紀錄的媒體） |
| `/x/{event}` 展會 landing |
| 依 GSC 資料決定 `x-default` 是否改指 `/en/` |

### 明確不做

| 項目 | 理由 |
|---|---|
| 「台灣室內設計」專屬落地頁 | §2.2 |
| 「ai 設計」任何投入 | §2.1 |
| AI 工具評測／推薦清單文 | §3.2 紅線 |
| 以「ai interior design」為英文主攻 | §3.3-1 |

---

## 9. WebSearch 查證出處（2026-09，US 定位，見 §0-3）

| 查詢 | 實測佔位者與連結 |
|---|---|
| AI 室內設計 台灣 | [Adobe Firefly](https://www.adobe.com/tw/products/firefly/features/ai-room-design.html)｜[100室內設計](https://www.100.com.tw/article/8009)｜[CyberLink](https://tw.cyberlink.com/blog/photo-editing-tips/2466/best-interior-design)｜[MyEdit](https://myedit.online/en/photo-editor/ai-room-design)｜[i 室設圈 AI 導入大調查](http://iecosyst.com/news/1311)｜[Feel Design AI](https://www.feeldesign.ai/zh/post/ai-interior-design-tools-online-2025) |
| 台灣室內設計 公司推薦 | [mybest 十大排行榜](https://tw.my-best.com/117195)｜[DCT Design](https://dctdesign.tw/)｜[拾境（PTT&Dcard 11 間）](https://serenedesign.tw/archives/1749)｜[近境制作（PTT 10 間）](https://da-interior.com/top-3-interior-design-company/)｜[ldesign 推薦大全](https://www.ldesign.com.tw/post/interior-design-companies-ranking) |
| ai 設計 | [Panasonic 設計 AI（monoist，日文）](https://monoist.itmedia.co.jp/mn/articles/2507/08/news027.html)｜[AI Market（日文）](https://ai-market.jp/purpose/what-generative-ai-design/)｜[キャド研（日文）](https://cad-kenkyujo.com/sekkei-ai/)｜[Wikipedia: Aiello (company)](https://en.wikipedia.org/wiki/Aiello_(company))｜[Wikipedia: Ai (chimpanzee)](https://en.wikipedia.org/wiki/Ai_(chimpanzee)) |
| ai interior design | [mnml.ai](https://mnml.ai/app/interior-ai)｜[Apartment Therapy](https://www.apartmenttherapy.com/ai-interior-design-37304209)｜[Remodel AI](https://www.remodelai.io/blog/best-free-ai-interior-design-apps)｜[Home Design AI](https://home-design.ai/)｜[Dehome](https://dehome.ai/interior-design)｜[MeltFlex](https://www.meltflexai.com/blog/best-ai-interior-design-tools-compared)｜[dressmycrib](https://dressmycrib.com/blog/ai-interior-design) |
| 參數化設計 室內設計 BIM 室內裝修 台灣 | [Airiti 期刊](https://www.airitilibrary.com/Article/Detail/P20130903002-202106-202109220006-202109220006-155-159)｜[映 CG InCG Media](https://www.incgmedia.com/spotlight/how-you-can-use-bim-for-interior-design)｜[gemhorn BIM 全修班](https://www.gemhorn.com/products/tyarchistudiobim-onlinecourse-bim-revit-1)｜[BIM-REVIT Design Guide](https://tyarchistudiobim.com/product/BIMREVITDesignGuide)｜[臺灣博碩士論文系統](https://ndltd.ncl.edu.tw/handle/5km6za) |
| AI 室內設計 公司 導入 設計流程 台灣 業者 | [artgate 實戰班](https://artgate.com.tw/interior-design-ai/)｜[奇尚室內設計](https://chisun-design.com/ai-interior-design-redefining-home-creativity-efficiency/)｜[秦創科技 3D](https://cct.aigc-space.ai/ai-interior-design-3d/)｜[秦創科技 工具清單](https://cct.aigc-space.ai/aiinterior-design-tools/) |
| 辦公室設計 施工統包 商業空間 台北 | [PRO360 目錄](https://www.pro360.com.tw/nearme/office_design/%E5%8F%B0%E5%8C%97%E5%B8%82)｜[谷思空間](https://goothid.com.tw/)｜[意力設計](https://www.anglespace.com.tw/)｜[狸樂聚](https://www.fastoffice.com.tw/services)｜[創意室內裝修設計](https://www.ciddcs.com/) |
| office fit out contractor Taiwan Taipei design and build | [M Moser Associates Taipei](https://www.mmoser.com/offices/taipei/)｜[Houzz Design-Build Taipei](https://www.houzz.com/professionals/design-build/taipei-03-tw-probr0-bo~t_11793~r_1668341)｜[Kompass](https://tw.kompass.com/a/building-contractors/71100/) |
| 惠強室內裝修 HQ Design 台北 | [台灣公司網](https://www.twincn.com/item.aspx?no=89956251)｜[FindCompany](https://www.findcompany.com.tw/%E6%83%A0%E5%BC%B7%E5%AE%A4%E5%85%A7%E8%A3%9D%E4%BF%AE%E8%82%A1%E4%BB%BD%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8)｜[TechNews](https://info.technews.tw/company/89956251-%E6%83%A0%E5%BC%B7%E5%AE%A4%E5%85%A7%E8%A3%9D%E4%BF%AE%E8%82%A1%E4%BB%BD%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8)｜[中華黃頁](https://www.iyp.com.tw/0225577448-1)｜[台灣公司情報網](https://www.twfile.com/%E6%83%A0%E5%BC%B7%E5%AE%A4%E5%85%A7%E8%A3%9D%E4%BF%AE%E8%82%A1%E4%BB%BD%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8/89956251)｜[FB 惠強設計 HuiCiang Design](https://www.facebook.com/HuiCiangDesign/)｜[104](https://www.104.com.tw/company/15bpmni0)｜**官網未出現於前 10 筆** |
| 南港 辦公室裝修 設計 公司 | [PRO360 南港](https://www.pro360.com.tw/nearme/interior_design/%E5%8F%B0%E5%8C%97%E5%B8%82/%E5%8D%97%E6%B8%AF%E5%8D%80)（其餘 6/8 為香港業者，US 定位偏斜證據） |
| live 站實測 | `robots.txt` → **HTTP 404**｜`sitemap.xml` → **HTTP 404**｜`/` → HTTP 200 |

---

## 10. 未解事項（需使用者或其他角色決定）

| # | 事項 | 阻擋什麼 | 建議 |
|---|---|---|---|
| S-1 | 使用者是否接受「台灣室內設計」不投入 | §2.2 與 P2 內容排程 | 建議接受，改投 §2.2 替代詞組 |
| S-2 | Framer sitemap 是否含 localized paths；方案 B 是否可行 | P0-6／P0-7 | MUST 由 system-architect 於 Framer 實測，MUST NOT 憑文件假設 |
| S-3 | U4 併案裁決（SECOM／`zhongbao-nangang`） | P0-4 轉址表 | 依 ux-expert §8-3 先併為單一 Project |
| S-4 | 舊站可否在新站上線前保留 ≥28 天以累積基線 | P0-1 | 舊站 MAY 持續服務（規格 §1.4）；基線收集與新站開發**可並行**，與「先上線」不衝突 |
| S-5 | 739 張專業攝影的網站使用授權 | §6.3 `ImageObject.license`、hero A 類選圖 | 上線前 MUST 確認（data-architect §4.7 已列） |
