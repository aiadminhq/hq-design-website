# 舊版資產評估報告：哪些值得保留或移植到新網站

- 評估日期：2026-11-21
- 評估分支：`feat/integrate-rebuild-web`（draft PR #80）
- 範圍：只做評估，未修改任何程式碼、未 merge、未動 main。唯一新增檔案為本報告。

## 0. 摘要

**結論：四個來源裡，真正值得帶走的是「資料、規則與邏輯」，不是「畫面與程式骨架」。**

1. **`web/`（Next 16）整包不建議併入 main。** 它是 2026-09-24 凍結 main `423df0c` 的快照，使用舊視覺（`#C8410F`／`#1C2B3A`）。main 之後已新增退租復原、FAQ、台北辦公室 GEO 等頁面，並導入 New Design System，兩者已明顯分岔。可帶走的是 28 案資料與 1 份已最佳化的照片集、SEO 產生邏輯、安全標頭、驗收腳本。
2. **`codex/hq-motion-first` 的視覺與 token 全部作廢。** 它依 Token 3.0（`#D64518`），與 New Design System（橘 `#ff4e2a`／藍 `#1f3148`）衝突。可帶走的是動態「概念」（捲動影像場、共享元素轉場）、影像來源標示（provenance）政策、頁面資訊架構與 GEO 基線數據。
3. **`feat/legacy-seo-layer` 已被 main 吸收，沒有東西要移植。** `apply_seo_layer.py` 與 `html-guard.yml` 都已在 main，且 main 版本涵蓋更多頁面。這條分支相對 main 刪減 22,003 行，不應 merge。
4. **有兩項需要先處理的合規風險**（見 §6）：
   - `web/` 資料含 志聖（`csun`）且列為精選，但 main 已於 PR #70 下架並以 `vercel.json` 301 導走。
   - `web/` 新增的 8 個專案不在 main，README 也註明「不是正式官網發布授權」。

### 評估依據與限制

- **New Design System 的依據**：以 main 的 `docs/design-system/tokens.md` 與 `assets/css/tokens.css`、`components.css` 為準。該文件記錄為 Figma「HQ DESIGN – New Design System」（file key `YkQYrRyGsKJEpQj1Lo9kzR`）的逐項對照。**本次沒有即時回查 Figma**，若 Figma 近期有更新，下表「如何改」需再核對。
- **履歷關係**：三條分支與 main 在本機的淺層 clone 中查不到共同祖先，比較以「檔案內容」進行，不是 git 3-way diff。
- **已實測**：`web/` 執行 `npm ci`、`npm test`（13 項全過）、`tsc --noEmit`（無錯誤）。未跑 `next build` 與瀏覽器驗證。
- **工作量**：S ≤ 0.5 天、M 1–2 天、L 3–5 天、XL > 5 天；以單人、含驗證估算。

### 四個來源的狀態速覽

| 來源 | 與 main 的關係 | 使用的設計系統 | 整體判斷 |
|---|---|---|---|
| `feat/integrate-rebuild-web`（`web/`、`design/`、`reports/`） | 基於舊 main（`423df0c`），已分岔 | `web/` 為舊視覺；`design/` 為 Token 3.0 | 取資料與邏輯，不取畫面 |
| `codex/hq-motion-first` | 獨立歷史（42 commits），內含 `site/`、`ds-bundle/`、`cms/`、`prototype/` | Token 3.0（`#D64518`、Satoshi） | 取概念與政策，不取程式與樣式 |
| `feat/legacy-seo-layer` | 基於更舊的 main（PR #14），落後大量內容 | 舊站樣式 | 已被吸收，捨棄 |
| 目前 main | 靜態 HTML + `.hq-*` 元件，Figma 對照文件齊備 | New Design System | 唯一的基準 |

---

## 1. 來源 1：本分支 `web/`、`design/`、`reports/`

### 1.1 `web/`（Next 16.3.6 + React 19）

| 項目 | 來源路徑 | 價值 | 是否符合 New Design System（要怎樣改） | 建議 | 工作量 |
|---|---|---|---|---|---|
| 28 案結構化資料（雙語名稱、說明、地點、客戶、類別、面積、年份、排序、精選、圖片 alt） | `web/content/initial-release.json`、`notion-metadata.json`、`area-confirmed.json`、`project-description-en.json` | **高。** 目前 main 的專案資料散在 20 個 HTML 內；此資料是唯一結構化版本，並含 8 個 main 沒有的新專案 | 與設計無關（純資料）。需先處理 `csun`、8 個新專案的授權（見 §6） | **保留** | M |
| 已最佳化照片集（28 案，JPEG 長邊 ≤ 2400px、q85，約 41 MB） | `web/public/assets/images/projects/**` | **高。** 新增 8 案照片；main 的 `assets/images` 為 522 MB 未最佳化 | 與設計無關。移植時需對照 main 現有路徑與檔名規則，避免重複 | **保留**（僅取 main 缺的案、並先確認授權） | S |
| 面積規則：只存 `areaSqm`，坪數顯示時 `÷3.3` 取一位小數、整數不補 `.0`；缺值省略不補造 | `web/lib/project.ts`（`formatArea` 等）、`web/README.md`「資料權責」 | 中高。把現有人工維護的數字改成單一來源，避免 sqm／坪不一致 | 純邏輯。改寫成 build 時腳本或 Python | **保留**（規則）／**重寫**（實作） | S |
| 暫緩專案清單與 orphan 排除（5 組暫緩 + `zhongbao-nangang`） | `web/lib/project.ts` `deferred`、`web/README.md` | 中。是一份「不得公開」的名單，需與 main 現況比對（main 仍有 `zhongbao-nangang`） | 無 | **保留**（作為待決清單） | S |
| 專案頁 JSON-LD（`CreativeWork`，含 size、dateCreated、creator）與專案列表 `ItemList` | `web/lib/seo.ts` `projectJsonLd`、`app/[[...segments]]/page.tsx` | **高。** main 的 20 個專案頁與 `projects.html` 目前**沒有**任何 JSON-LD（只有首頁、FAQ、退租復原、搬遷頁有） | 無視覺影響。需改成 Python（併入 `apply_seo_layer.py`）。建議評估改用 `Project`／`Place`／`CreativeWork` 何者較適合，不宜直接照搬 | **重寫** | S–M |
| hreflang 型 sitemap（72 網址，每筆含 en／zh-Hant alternates） | `web/app/sitemap.ts` | 中高。main 的 `sitemap.xml` 有 61 筆，無 `xhtml:link` alternates、無 `lastmod` | 無 | **重寫**（改為產生靜態 `sitemap.xml`） | S |
| 標題／canonical／OG／Twitter 產生器 `metadata()` | `web/lib/seo.ts` | 低。`apply_seo_layer.py` 已做同樣的事（main 版更完整） | 無 | **捨棄** | — |
| 安全標頭（`nosniff`、`Referrer-Policy`、`X-Frame-Options`） | `web/next.config.ts` `headers()` | **中高、成本極低。** main 的 `vercel.json` 只有 2 條 redirects，沒有任何 headers | 無 | **保留**（移到 `vercel.json` `headers`） | S |
| `.html` → 乾淨網址 308 轉址 | `web/next.config.ts` `redirects()` | 條件式。main 目前以 `.html` 為正式網址（canonical、sitemap、hreflang 皆是），若不遷到 Next 就用不到 | 無 | **保留**（僅在決定遷移時使用）；現階段不動 | S |
| `robots.ts`（preview 全擋、正式站 `allow: /`） | `web/app/robots.ts` | **負價值。** 會丟掉 main `robots.txt` 對 20+ 個 AI 爬蟲的具名允許宣告；該政策是刻意決定，檔頭明文禁止未確認就改 | 無 | **捨棄** | — |
| Preview 站 `X-Robots-Tag: noindex`（preview 環境或 cookie） | `web/proxy.ts`、`app/layout.tsx` | 中低。main 若用 Vercel Preview，目前沒有 noindex 保護；可用 `vercel.json` 依環境處理 | 無 | **保留**（概念）；視是否使用 Preview 站 | S |
| GA4 僅在 production 載入 | `web/app/layout.tsx` | 低。main 的 `ga4.js` 無條件載入，preview 流量會污染資料 | 無 | **保留**（概念，改為 hostname 判斷） | S |
| Notion → Blob 的草稿／發布／回退管線、簽署預覽連結、`cms` CLI（含 13 項測試） | `web/lib/cms/*`、`web/scripts/cms.ts`、`web/app/api/internal/*`、`web/tests/cms.test.ts` | 高但**目前不可用**：需 `NOTION_TOKEN`、兩組 Blob token、`HQ_CMS_SECRET`，且 Vercel 團隊尚無 Blob store；main 為靜態站，沒有伺服器可跑它 | 無視覺。是否採用取決於「新站是否上 Next + CMS」的決策 | **保留**（封存於分支，不移植），待架構決策 | XL |
| 照片「單張清單」原則（拒絕 Figma 整頁、contact sheet）與其檢查測試 | `web/tests/content.test.ts`、`web/scripts/import-main.ts` | 中。可防止誤放拼貼圖，邏輯簡單 | 無 | **重寫**（改成 Python／Node 檢查腳本） | S |
| 驗收腳本：每頁恰 1 個 `h1`、canonical 正確、`lang`、舊 `.html` 轉址 | `web/scripts/check-routes.ts`、`check-content.ts` | 中高。可補強 main 現有 `html-guard`（只檢查 `</html>` 與檔案大小） | 無 | **重寫**（針對靜態 HTML） | S–M |
| 導覽 a11y 細節：Escape 關閉並回焦、`aria-current`、skip link | `web/components/navigation.tsx`、`layout.tsx` | 中。需對照 main 現有導覽是否已具備 | 樣式一律改用 `.hq-*`／token | **保留**（行為）／**重寫**（實作） | S |
| 專案列表篩選（URL 參數保存、返回時還原分類與捲動位置） | `web/components/projects-browser.tsx` | 中。main 的 `projects.html` 已有 `filter-bar`，但是否保存狀態需確認 | 卡片、篩選按鈕改用 New DS 元件與 token | **重寫**（vanilla JS） | M |
| Gallery（原生 `<dialog>`、方向鍵、回焦、`aria-live` 計數） | `web/components/gallery.tsx` | 低。main 已有 `reinstatement-lightbox.*`，且已走 New DS | — | **捨棄**（改沿用 main 的 lightbox，僅對照鍵盤行為） | — |
| Reveal／PageTransition（Motion `whileInView`） | `web/components/motion.tsx`、`web/lib/motion.ts` | 低。main 已有 `.hq-reveal` + `IntersectionObserver`；`PageTransition` 內夾帶「點職缺帶入表單」的臨時邏輯 | — | **捨棄**（僅取「點職缺預選」行為，若 `careers.html` 尚未有） | S |
| 凍結內容快照 + HTML 轉 React（`html-react-parser`） | `web/content/generated/pages.json`、`scripts/import-main.ts` | **負價值。** 內容停在 `423df0c`，缺退租復原、搬遷、台北辦公室、FAQ 更新；讓 Next 版本「看起來完成」但資料已過期 | — | **捨棄** | — |
| 舊樣式 | `web/public/assets/css/main.css`（1,264 行）、`web/app/globals.css` | 無。使用舊色票與字型變數，不符 New DS | 完全不符，需以 `tokens.css`／`components.css` 取代 | **捨棄** | — |
| 驗證紀錄與資料權責說明 | `web/VALIDATION.md`、`web/README.md` | 中。記錄了哪些事已驗、哪些「尚待雲端啟用與人工確認」 | — | **保留**（歸檔；抽出資料規則） | S |

### 1.2 `design/`

> `design/` 依 **Token 3.0** 撰寫（主色 `#D64518`、`navy #1F2A36`），與 New Design System 不同。其文字內容可當「需求與結構參考」，不可當「樣式規格」。

| 項目 | 來源路徑 | 價值 | 是否符合 New Design System（要怎樣改） | 建議 | 工作量 |
|---|---|---|---|---|---|
| 視覺提案 v0.3（單檔 2 MB，含可操作示範） | `design/proposal/hq-design-visual-proposal-v0.3.html`、`proposal/src/*` | 中。可看六個介面裝置（圖名框、尺寸線、圖層、對照 wipe、圖紙索引、座標讀數）怎麼運作 | **不符。** 色、字級、圓角全為 Token 3.0；不可直接沿用。若要採用，裝置的結構需以 `--color-*`／`--space-*` 重畫 | **重寫**（僅取互動概念；需設計方先決定要不要這些裝置） | L |
| 交接規格（所有權、11 條硬規則、頁面類型、元件契約、7 道閘門、效能預算） | `design/HANDOFF-web-design-fable-to-codex.md`、`design/handoff.md` | 中。頁面類型、元件契約與驗收閘門的**結構**可用；其中「橘紅單頁 ≤ 10%」「logo 色 `#D64518`」等會直接與 New DS 衝突 | token、色比例、logo 色全部要以 New DS 重訂；文內引用的 `web/app/_ds/`、`npm run sync:ds` 在本分支並不存在 | **重寫**（抽出閘門與效能預算，其餘歸檔） | M |
| `HqUnfocusedMesh`（漸進模糊 + 漸層，純 CSS） | `design/framer-port/HqUnfocusedMesh.tsx`（353 行）、`preview/` | 低中。技術是 CSS mask + blur，與 Framer 無關；但是 React client component，且顏色寫死為 Token 3.0（`#D64518`、`#1F2A36`、`#C0C8D2`） | 不符：色票型別鎖在舊色。main 為靜態 HTML，無法直接用 | **捨棄**（若日後要漸進模糊，用 CSS `mask-image` + `backdrop-filter` 在 New DS 色上重做） | M |
| Figma 品牌 pattern 向量（含 `currentColor` 版） | `design/assets/pattern/*.svg` | 中。檔案小、可上色、可直接當背景或裝飾 | **需先確認**：來源 node `1073:100220` 是否屬於「New Design System」檔案。若是，可直接用，並以 `color` 對應 New DS navy／orange；若屬舊檔，改從新檔重匯出 | **保留**（待確認來源後使用） | S |

### 1.3 `reports/framer-component-audit/`

| 項目 | 來源路徑 | 價值 | 是否符合 New Design System | 建議 | 工作量 |
|---|---|---|---|---|---|
| Framer 模板擷取、元件與路由盤點、重複群組、keep/merge/retire 建議 | `reports/framer-component-audit/**`（含 `fable-handoff/`） | 低。分析的是一個**個人作品集的 Framer 模板**，且專案後來選擇了 Next／靜態路線，不走 Framer。報告自己也寫明：個人姓名、聯絡資訊、未授權素材不得升格為 HQ 內容 | 與 New DS 無關 | **捨棄**（保留在 git 歷史，不隨新站發布；若要整理分支可整個移除） | S |

---

## 2. 來源 2：`codex/hq-motion-first`

分支內容分四塊：`prototype/next-motion-site/`（動態原型，21 檔）、`ds-bundle/`（Token 3.0 設計系統包）、`cms/`（Notion CMS schema 與 21 案資料）、`site/`＋`.workflow/`＋`codex-out/`（重建靜態站與工作紀錄）。

### 2.1 `prototype/next-motion-site/`（動態重點）

| 項目 | 來源路徑 | 價值 | 是否符合 New Design System（要怎樣改） | 建議 | 工作量 |
|---|---|---|---|---|---|
| 首頁「捲動影像場」：`useScroll` 驅動整個場景 scale 1→1.34、y 0→-120、opacity 淡出；6 個 tile 以固定座標與微旋轉散置，hover 彈簧放大 | `components/project-mosaic.tsx`、`app/globals.css` | **中高。** 是新站最有辨識度的首頁概念。但實作綁 React／Motion，main 為靜態 HTML | 不符：樣式為舊 token，旋轉拼貼的「寶麗來」感需設計確認是否仍要。文案「WE MAKE SPACE MEANINGFUL.」是原型自擬，**非核准文案**。重寫時以 CSS scroll-driven animation（`animation-timeline: view()`）為主、JS 為輔，並提供 `prefers-reduced-motion` 靜態版 | **重寫** | M |
| 共享元素轉場：同一張圖用 `layoutId` 從 mosaic → 列表卡 → 詳情 hero 連續過渡 | `components/project-detail.tsx`、`projects-browser.tsx` | 中高。體驗好，且靜態站可用 CSS `@view-transition`（跨文件 View Transitions）達成，不必引入 React | 無視覺問題（只是轉場）。需 `view-transition-name` 逐案命名，並確認 Safari 支援版本與降級 | **重寫** | S–M |
| 專案列表篩選與搜尋 + `layout` 動畫 | `components/projects-browser.tsx` | 中。與 `web/` 的 projects-browser 重疊（`web/` 版較新、含 URL 狀態） | 同 §1.1 | **捨棄**（以 `web/` 版為參考） | — |
| 手機版 mosaic 修正：`:nth-of-type` 被 `.mosaic-statement` 干擾，需把 tile 包進獨立容器 | `components/project-mosaic.tsx`、README「Mobile viewport QA」 | 低但實用。是重寫 mosaic 時會踩到的坑，README 已記錄 | — | **保留**（當作重寫時的注意事項） | — |
| 動態 token：duration `0.18/0.45/0.8/1.2s`、stagger `0.05/0.1/0.16`、ease `[0.2,0.7,0.2,1]` | `lib/motion.ts`（`web/lib/motion.ts` 已摘錄） | 中。但與 main 現有 `--duration-fast/base/slow`（150/240/400ms）、`--ease-standard/out` **數值不同**；`tokens.md` 註明 Figma 沒有 motion token，是網頁補的 | 需統一：建議以 main 的 CSS 變數為單一來源；若 JS 需要，從 `getComputedStyle` 讀取，不另存一份 | **捨棄**（改沿用 main，僅把 `1.2s scene` 這類 main 沒有的長時間需求，提案補進 `tokens.css`） | S |
| 導覽（桌機 + 全螢幕手機選單，`AnimatePresence`） | `components/site-navigation.tsx` | 低。導覽項只有 Projects／Process／About，且 `#about` 指向不存在的區塊；main 導覽已有下拉選單 | — | **捨棄** | — |
| `hq-tokens.css`（Token 3.0 同步檔）、Satoshi woff2 | `app/hq-tokens.css`、`public/fonts/` | 無。與 New DS 色票衝突；main 以 Fontshare 載入 Satoshi | 完全不符 | **捨棄** | — |
| 影像來源標示（`data-provenance`）與 `provenanceLabel()` | `lib/projects.ts`、`globals.css`、README #2 | **見 §2.2「Source-Label」** | — | — | — |

### 2.2 `ds-bundle/`、`cms/`、其他

| 項目 | 來源路徑 | 價值 | 是否符合 New Design System（要怎樣改） | 建議 | 工作量 |
|---|---|---|---|---|---|
| **影像來源標示政策 Source-Label**：每張圖必須標示 `photo`（完工實景）／`viz`（設計提案視覺）／`enh`（AI 光影強化）／`drawing`（設計圖面）；**不得把 viz／enh 標成 photo** | `ds-bundle/components/Components/Source-Label/*`、`prototype/.../lib/projects.ts` | **高。** 這是誠信與合規規則：main 的專案頁**完全沒有**來源標示，而 `guidelines/facts.md` 顯示多個旗艦案（POLYTRON、AIONTECH、中保展示廳等）影像為「設計提案視覺」。 | 規則本身中性；標籤樣式需改成 `.hq-tag` 變體（`--outline`），用 `--color-text-muted`、`--text-caption`，並維持 ≥ 4.5:1 對比。四種文字（中英）可直接沿用 | **保留**（政策）／**重寫**（元件） | M |
| 頁面資訊架構與內容骨架：Home、Services、Work-List、Process-Overview（七段流程）、Stage-02／05、Case-Showroom-Viz、Case-SECOM、About、Contact；元件規格 Case-Card、Process-Steps、Comparison-Table、Eyebrow | `ds-bundle/components/Pages/**`、`Components/**`（各含 `*.prompt.md` 與 `index.html`） | 中。可當**新頁面的內容與結構參考**（特別是七段流程頁與案例頁骨架）；視覺不可用 | 不符（Token 3.0）。結構可對應到 main 既有的 `.hq-section`、`.hq-steps`／`.hq-step`、`.hq-card`、`.hq-stats`；缺的（Comparison-Table）需補元件 | **重寫**（只取結構與文案架構） | M–L |
| 內容事實清單（公司基本資料、七段流程命名、代表案例面積與年份） | `ds-bundle/guidelines/facts.md` | 中。可當核對表，但**不可直接當權威**：寫「30+ 年」而 main 寫「31 years」；列有 C.SUN 為代表案例，而 main 已下架 | — | **保留**（逐項與 main 核對後才使用） | S |
| 事實矛盾裁定表（如立偉／利威、中保保經／眾寶保經的公司全名） | `.workflow/.../.process/FACT-CONFLICTS-FOR-DECISION.md` | 中高。若這些矛盾至今未裁定，仍會影響案例頁與 JSON-LD；依 GEO 分析，來源自相矛盾會降低被 LLM 引用的機率 | — | **保留**（需確認是否已有裁定結果） | S |
| GEO 基線（60 個查詢槽：ChatGPT 提及 10/15、Claude 6/15、Perplexity 6/15、Google AIO 5/12） | `codex-out/geo-baseline/{README.md,summary.json,raw/*}` | **高（作為前後對照）。** 2026-09-03 的優化前數據；main 之後新增了 GEO 頁與 FAQ，可用同一題組重測看成效 | 無 | **保留**（複製 `README.md`、`summary.json` 進 `docs/`；`raw/*.jsonl` 可留分支） | S |
| GEO／SEO 分析（證據分級、AI 爬蟲政策、`llms.txt` 評估、關鍵字策略、雙語 SEO 規劃） | `.workflow/.../.brainstorming/{geo,seo}/analysis.md` | 中高。`robots.txt` 與 `llms.txt` 的決策依據在此；關鍵字與七段流程頁規劃可供新頁面使用 | 無 | **保留**（抽出關鍵字策略與長尾詞表；其餘歸檔） | S |
| 舊 SEO 文案搶救檔 | `.workflow/.../.process/seo-meta-rescue.json` | 低。是 2026-09-03 的舊 title／description 備份，main 的文案已多次更新 | 無 | **捨棄** | — |
| Notion CMS 決策與 schema、21 案 `cms/data/*.json`、`notion-manifest.json` | `docs/decisions/001-cms-stack.md`、`cms/**` | 低中。決策（Notion 為編輯端）與 `web/` 的實作一致；資料已被 `web/` 的 28 案版取代（較新、較完整） | 無 | **捨棄**資料；**保留**決策文件於歸檔 | S |
| Framer 工具包、Framer 模板評估、Satoshi 授權筆記 | `tools/hq-design-toolkit/**`、`codex-out/framer-templates/`、`satoshi/` | 低。Framer 路線已不採用；Satoshi 授權：main 改以 Fontshare 載入，不需字檔 | — | **捨棄** | — |
| 重建靜態站（`site/`）與 Token 3.0 的 `hq.css` | `site/**`、`ds-bundle/tokens/*`、`ds-bundle/styles.css` | 無。與 main 內容重複且視覺為舊系統 | 完全不符 | **捨棄** | — |

---

## 3. 來源 3：`feat/legacy-seo-layer`

這條分支的目的（為舊站補 canonical、OG、JSON-LD 與 HTML 守衛）**已在 main 完成**，且 main 版本更廣。

| 項目 | 來源路徑 | 價值 | 是否符合 New Design System | 建議 | 工作量 |
|---|---|---|---|---|---|
| `apply_seo_layer.py` | `scripts/legacy-seo/` | main 已有同檔，差異只有 4 行：**main 版多處理 `zh/projects/*.html` 與其尾段修復路徑**，分支版較舊 | 只改 `<head>`，與視覺無關 | **捨棄**（以 main 版為準） | — |
| `html-guard.yml`（每頁須有 `</html>`、≥ 2 KB，並跑 `--check`） | `.github/workflows/html-guard.yml` | main 已有 | — | **捨棄**（已在 main） | — |
| 頁面內容 | `index.html`、`services.html`、`zh/*`、`projects/*`、`sitemap.xml`、`llms.txt` | **負價值。** 與 main 相比刪除 22,003 行：缺 `faq`、退租復原整組、搬遷與台北辦公室 GEO 頁、全部 `zh/projects/*`；首頁仍含已下架的 C.SUN；專案頁無 hreflang；英文專案頁使用中文標題與 `og:locale=zh_TW` | 舊站樣式 | **捨棄**（不得 merge） | — |

---

## 4. 來源 4：目前 main 的現狀（比較基準）

| 面向 | main 現況 | 與舊版資產的關係 |
|---|---|---|
| 技術 | 純靜態 HTML + 少量原生 JS，Vercel 部署 | `web/`、`prototype/` 的 React 元件無法直接放入 |
| 設計系統 | `assets/css/tokens.css`＋`components.css`（`.hq-*`），`docs/design-system/tokens.md` 對照 Figma；展示頁 `/_ds/`；深色區 `data-theme`、`.hq-reveal` | 判斷「是否符合」的唯一標準；`tokens.md` 自己列出「待確認」：中文字體採 Noto Sans TC 還是 Satoshi |
| 頁面 | 11 個英文頁＋對應 `zh/`（含 FAQ、退租復原三頁、搬遷、台北辦公室）；20 個專案頁（EN）＋19（ZH） | `web/` 缺後者大部分新頁；`web/` 有 8 個 main 沒有的專案 |
| SEO | 全站 canonical、hreflang、OG；JSON-LD 僅 `index`、`faq`、`office-reinstatement*`、`office-relocation`；sitemap 61 筆（`.html`，無 alternates）；`robots.txt` 明示允許 AI 爬蟲；`llms.txt` | 專案頁 JSON-LD、sitemap alternates、安全標頭是最明顯的缺口 |
| 轉址／標頭 | `vercel.json` 僅兩條 `csun` 301；無 headers | 見 §1.1 |
| 動態 | `.hq-reveal` 捲動淡入、導覽捲動樣式、退租復原頁的 before／after、lightbox、流程頁互動 | 動態需求大多已有；缺的是首頁影像場與跨頁轉場 |
| 影像來源標示 | **無** | §2.2 Source-Label 為主要缺口 |
| 驗收 | `html-guard`（結尾與大小）＋`--check` | `web/` 的 route／h1／canonical 檢查可補強 |

---

## 5. 優先順序

### P0：先決定與處理（不寫程式，1–2 天）

1. **確認 志聖（`csun`）狀態**：main 已下架；`web/` 資料仍列為精選。移植任何資料前先排除。
2. **確認 8 個新專案能否公開**（`guochan-office`、`guochan-showroom`、`secom-reception`、`longteng-travel`、`transasia-bakery-dayuan`、`transasia-bakery-chunri`、`budaejjigae`、`burger-ray`）。`web/README.md` 明寫「不是正式官網發布授權」。
3. **決定架構方向**：新站是「維持靜態 HTML + 逐步升級」還是「遷到 Next」。這決定 §1.1 的 Notion/Blob CMS、乾淨網址與 `web/` 其餘部分的命運。**建議先走靜態升級**：main 已有 New DS 元件、SEO 守衛與 AI 爬蟲政策，遷移成本與風險最高，卻沒有 Figma 設計上的收益。
4. **核對事實矛盾裁定表**（立偉／利威、中保保經／眾寶保經）是否已有結果。

### P1：低成本高價值，可直接做（各 S，合計約 2–3 天）

| # | 項目 | 來源 |
|---|---|---|
| 1 | 在 `vercel.json` 加安全標頭 | `web/next.config.ts` |
| 2 | 專案頁與列表頁 JSON-LD（併入 `apply_seo_layer.py`） | `web/lib/seo.ts` |
| 3 | 產生含 hreflang alternates 的 `sitemap.xml` | `web/app/sitemap.ts` |
| 4 | 複製 GEO 基線進 `docs/`，並訂重測時程 | `codex-out/geo-baseline/` |
| 5 | 驗收腳本（每頁 1 個 `h1`、canonical、`lang`、sitemap 與頁面一致） | `web/scripts/check-*.ts` |

### P2：中等工作量，影響最大（約 1–2 週）

1. **影像來源標示（Source-Label）**：先盤點 main 專案頁每張圖的性質，再做 `.hq-tag` 變體與 figcaption。涉及誠信，建議早於新動態。
2. **併入 28 案資料與照片**（排除 P0 未通過者）：先做「資料單一來源 + 面積規則」，再決定是否用腳本批次生成專案頁。
3. **首頁影像場與跨頁轉場**：以 CSS scroll-driven animation 與 `@view-transition` 實作，附 `prefers-reduced-motion` 降級；文案由內容負責人另訂。
4. **七段流程頁與案例頁骨架**：取 `ds-bundle/Pages` 的結構與文案架構，用 `.hq-steps`、`.hq-card` 重做；補 Comparison-Table 元件。

### P3：待條件成熟

- Notion → Blob CMS（需 Blob store、secret 與架構決策）。
- 六個介面裝置（圖名框、尺寸線、圖層、座標讀數等）：需設計方確認是否納入 New DS。
- 乾淨網址遷移（需完整 301 對照）。
- Figma pattern 向量的實際運用（先確認來源檔）。

### 建議整理掉

`reports/framer-component-audit/`、`design/framer-port/`、`web/public/assets/css/main.css`、`web/content/generated/pages.json`、`web/scripts/import-main.ts`，以及整個 `feat/legacy-seo-layer` 分支。

---

## 6. 風險與待確認

| 風險 | 說明 | 建議 |
|---|---|---|
| 志聖下架被繞過 | `web/` 的精選清單與 `sitemap` 含 `csun`；main 已 301 導走 | 移植前先刪除 `csun`，並與 main 的 `vercel.json` 對齊 |
| 新專案未授權 | 8 個專案不在 main | 取得內容負責人確認再放入 |
| 舊色票混入 | `design/`、`prototype/`、`ds-bundle/` 都是 `#D64518` | 禁止直接複製任何 CSS／色碼；一律走 `tokens.css` |
| AI 爬蟲政策被覆蓋 | `web/app/robots.ts` 沒有具名允許 | 不使用 `robots.ts` |
| 事實不一致 | `facts.md`（30+ 年、C.SUN）與 main（31 years、已下架）不同 | 使用前逐項與 main 核對 |
| Motion 值不一致 | codex／`web` 的 duration 與 main 的 token 不同 | 以 main 為準，需要新值先改 `tokens.css` |
| 字體待定 | `tokens.md` 仍列「中文用 Noto Sans TC 或 Satoshi」為待確認 | 與設計方確認後再做任何字體相關移植 |

---

## 7. 下一步

1. 由內容負責人回覆 §5 P0 的 4 項決定。
2. 通過後，於 main 開一條 `chore/legacy-port-p1` 分支，依 P1 清單逐項移植；每項各一個 PR，避免與設計系統工作混在一起。
3. 設計方確認：Figma pattern 來源檔、六個介面裝置是否納入、中文字體；結果回填 `docs/design-system/tokens.md`。
4. P1 完成後，用同一題組重跑 GEO 基線，與 2026-09-03 數據對照。
5. 本分支（`feat/integrate-rebuild-web`）建議維持 draft 作為封存參考，不 merge 進 main；待 P1、P2 完成後再決定是否關閉。
