# GEO／SEO 策略落地報告

**分支**：`feat/geo-seo`（自 `feat/site-rebuild` 開出）
**日期**：2026-09-07
**依據**：`.workflow/active/WFS-hq-website-reset/.brainstorming/seo/analysis.md`（499 行）
與 `geo/analysis.md`（672 行）。本報告不重做那兩份分析的任何判斷。
**驗證**：`npm run seo:verify` → **293/293 通過**；`npm run verify` → typecheck、7 tests、
token 守衛、個資閘門、內容閘門 33/33、`next build` 全綠。

---

## 0. 一句話

兩份分析裡「寫在網站程式碼裡就能完成」的部分**已全部完成並可驗證**；
剩下的全部是「需要人去做」的部分——帳號、翻譯、關係經營——Claude 代不了。

一個要先講清楚的觀念，取自 `geo/analysis.md` §1.3：
**GEO 對惠強真正值得投入的部分，約九成與 SEO 重疊。**
所以本次不是做了兩件事，是把同一批基礎建設做對，並在兩種標準下驗收。

---

## 1. 起點：舊站的實測數字

`seo/analysis.md` §1.1 對 27 個可索引 URL 的實測，作為對照基準。

> **這一欄要看清楚**：下表「舊站」是分析文件當時對 **live 站**的實測。
> `main` 分支的 repo 後來已被 `e1b3692` 補過一輪（canonical 27/28、OG 27/28、
> robots.txt 的 AI 允許清單皆已存在），並非全面 0。`main` 的實際剩餘缺口見 §8。


| 檢查項 | 舊站 | 本次交付後 |
|---|---|---|
| `rel="canonical"` | **0 / 27** | 全頁，絕對且自我指向 |
| `hreflang` | **0 / 27** | 全頁，雙向對稱 + `x-default` |
| JSON-LD | **1 / 27** | 全頁 `Organization` + `GeneralContractor`，逐頁再加對應型別 |
| `og:*` / `twitter:card` | **0 / 27** | 全頁，階段頁與案例頁有專屬 `og:image` |
| `robots.txt`（live） | **HTTP 404** | 存在，含 15 個 AI 爬蟲的明示允許 |
| `sitemap.xml`（live） | **HTTP 404** | 存在，58 條 URL，含 `xhtml:link` 雙語 alternates |
| `Organization.sameAs` | **缺** | 已補（`geo` §G0-5 判定為 P0 中 CP 值最高的單一動作） |
| `<html lang>` 錯誤 | 首頁 `en` | 兩語系皆正確（新站本來就對，非本次修復） |

---

## 2. 已完成項目（逐條對照原分析編號）

### SEO §8 P0

| 編號 | 項目 | 狀態 | 落點 |
|---|---|---|---|
| P0-5 | canonical + hreflang + `<html lang>` 全站正確 | ✅ | `web/lib/seo/metadata.ts` |
| P0-7 | `robots.txt` + `sitemap.xml` | ✅ | `web/app/robots.ts`、`web/app/sitemap.ts` |
| P0-8 | 首頁 title 含「惠強室內裝修」；全站 title／description 依 §3.1 | ✅ | `web/lib/seo/page-copy.ts` |
| P0-9 | `Organization` + `GeneralContractor` JSON-LD（含全部 `alternateName` 與 `sameAs`） | ✅ | `web/lib/seo/identity.ts`、`json-ld.tsx` |
| P0-10 | OG／Twitter Card 全頁，階段頁與案例頁專屬 `og:image` | ✅ | `web/scripts/build-og.mjs`（41 張） |
| P0-13 | `parity != full` 的 `/en/` 頁 `noindex,follow` 且排除於 sitemap | ✅ | `web/lib/seo/parity.ts` |

`P0-2`（URL 結構）、`P0-3`（27 條 301）在新站原本就已完成，非本次工作。

### SEO §8 P1（本次一併提前完成）

| 項目 | 狀態 |
|---|---|
| `BreadcrumbList`／`ItemList`／`CreativeWork`／`Service` 結構化資料 | ✅ |
| `ImageObject` 授權欄位（§6.3）與 `/image-policy` 頁 | ✅ |

### GEO §8 P0／P1

| 編號 | 項目 | 狀態 | 備註 |
|---|---|---|---|
| G0-1 | 首頁 `lang` | ✅ | 新站本來就是 `zh-Hant-TW` |
| G0-3 | robots／sitemap 實際生效 | ✅ | 已驗證 HTTP 200，不是「repo 有檔」 |
| G0-5 | `Organization.sameAs` 補齊 | ✅ | 目前 2 筆（FB、104）；GBP／LinkedIn 待建立 |
| G0-8 | `facebookexternalhit` 未被封 | ✅ | 明示 Allow，並有自動檢查 |
| P1 | `llms.txt` | ✅ | 由內容層即時產生，非手寫靜態檔 |
| P1 | 逐頁 JSON-LD | ✅ | |
| P1 | `ImageObject` 授權欄位與 `/image-policy` | ✅ | |

---

## 3. 幾個實作上的判斷，需要你知道

### 3.1 所有 `/en/` 深層頁目前是 `noindex, follow`

實測 **33 個案件的英文名稱與英文簡介皆為空（0/33）**，七段流程的英文主體文案同樣缺席。
換句話說 `/en/work/<slug>` 與 `/en/process/<slug>` 現在渲染出來的主體是中文。

`seo/analysis.md` §3.3-4／P0-13 對這種情況的規定是明確的：這屬薄內容訊號，
MUST `noindex,follow` 且 MUST NOT 進 sitemap。所以本次照做。

**這不是永久設定，也不需要有人記得回來改。** 判定寫成資料驅動：
翻譯補進 `content/projects/*.json` 的 `name.en`／`lede.en`／各張影像 `alt.en` 之後，
該頁的索引與 sitemap 收錄**自動開啟**。階段頁同理，在 `Stage` schema 補
`titleEn`／`descEn`／`ledeEn`／`inpEn`／`outEn` 五個欄位即可（欄位已預留）。

`/en`、`/en/about`、`/en/services`、`/en/careers`、`/en/contact` 這幾頁有實際撰寫的
英文文案（`web/messages/editorial-en.ts`），所以維持可索引。

### 3.2 `llms.txt` 做了，但理由不是「提升 AI 可見度」

這點在程式碼註解裡也寫了一次，因為它很容易被誤傳。
`geo/analysis.md` §3.1／§3.2 的查證結論：Google 明確否認使用 `llms.txt`，
截至 2026 Q1 沒有任何主要供應商公開承諾在開放網路讀取它。
**若有人說加了它 ChatGPT 就會開始引用你，那是行銷話術。**

做它的實際理由是成本近零、對會自行瀏覽網頁的 AI agent 有實際價值，
以及撰寫過程強迫把事實整理成單一權威清單。

實作上刻意**從內容層即時組出**而非手寫：`geo` §4.1 已證實公司簡介內部數字互相矛盾
（SECOM 面積 2,500 vs 5,940、C.SUN 700 vs 560），而 LLM 抽到矛盾數字時
最可能的結果是**不引用**。即時產生保證每個數值只有一個出處。

同一個理由讓 `llms.txt` 的「代表案件」只列 **15 件**而非全部 33 件——
只有面積與年份都已核實的案件才進得去。這是 `COORDINATION.md` §4 的硬性資料政策：
`verified: false` 的數值不得進入機器可讀宣稱。

### 3.3 一項對原規劃的偏離：單一 sitemap 而非兩份

`geo` §2.3 的 robots.txt 草案宣告兩份 sitemap（`/sitemap.xml` 與 `/en/sitemap.xml`）。
那是為 Framer 平台寫的——Framer 自動產生 sitemap，控制權有限。
目前是自管的 Next.js，可以在單一 sitemap 內用 `xhtml:link` 表達雙語對應，
這是 Google 建議的作法，也讓 parity 排除規則只需維護一處。**若日後改回 Framer，這段要重看。**

### 3.4 順帶發現一個既有缺陷（未修，已另開任務）

七段流程的製圖 SVG 用 `.ln`／`.tx`／`.tc`／`.fx` 等 class 取樣式，
但那組規則只存在於**舊站**的 `.dia` 範圍，沒有被移植到新站的 `globals.css`。
沒有樣式時 SVG polygon 落到預設 `fill:black`——
**所以七張製圖在目前網站上是黑塊。**

這不是 SEO 問題（`geo` §4.2-2 本來就要求數值以文字節點存在，不能只在圖裡），
而且 `globals.css` 屬 Fable／Codex 所有，所以本次沒有動它，只在
`COORDINATION.md`「已知缺陷」登記，並把深底版的等效配色寫進 `build-og.mjs` 供對照。

---

## 4. 尚未完成，且 Claude 做不了的部分

這一節請當成待辦清單看。`geo/analysis.md` §5.2 的判斷值得重述：
**官網做到滿，也只能覆蓋 AI 引用池的一小部分**（廠商觀測顯示 68–84% 的 AI 引用來自
第三方／earned media，`[C]` 級證據）。下面這些才是天花板之外的路徑。

| # | 項目 | 為什麼 Claude 做不了 | 時間敏感度 |
|---|---|---|---|
| 1 | **GSC／Bing／GA4 基線建立**（SEO P0-1） | 需要你的 Google／Bing 帳號權限 | **最高。舊站一旦下線，其查詢資料無法回溯，是唯一無法事後補救的項目** |
| 2 | **GEO 手動基線**（GEO G0-7） | 需人工在 ChatGPT／Claude／Perplexity／Google AI Overviews 逐題記錄 15 組問句的答案 | **高。上線後才做就永久失去對照組** |
| 3 | **Google Business Profile 建立並驗證** | 需要你的帳號與地址驗證信 | 中。建立後我可以把 URL 補進 `sameAs` |
| 4 | **LinkedIn 公司頁** | 同上 | 中 |
| 5 | **Facebook 改名**為「惠強室內裝修 HQ Design」 | 需要粉專管理權 | 中。`HuiCiang Design` 是實體分裂最大的單一來源 |
| 6 | **英文翻譯**（33 案 + 7 階段） | 可代做，但需先確認語氣與專名，且量大 | 中。翻完 `/en` 索引自動開啟 |
| 7 | **媒體投稿**（i室設圈、映 CG InCG Media 等） | 關係經營 | 高（前置期 1–3 個月，`geo` §9-1 建議由 P2 提前到 P1 起跑） |
| 8 | **攝影授權裁定**（739 張，`geo` U-G5） | 需查合約 | 中。若禁止 AI 訓練使用，要對影像路徑條件式 `Disallow` |

第 3、4 項完成後只要把 URL 給我，`web/lib/seo/identity.ts` 的 `SAME_AS` 加兩行即可。
**在建立之前刻意不先寫進去**——`sameAs` 指向不存在的頁面會反過來損害實體可信度。

---

## 5. 明確不做的事（沿用原分析，並記錄理由）

| 項目 | 理由 |
|---|---|
| 以「提升 AI 引用」為由加 `FAQPage` | 有反向證據；Google 也已下架該 rich result |
| `HowTo` 結構化資料 | 同上，已下架 |
| 封鎖任何 AI 訓練爬蟲 | 惠強的內容是招牌不是商品；封鎖只換來無可驗證的收益 |
| 用「GEO score」當 KPI | 無證據支持的行銷指標 |
| 現在建立 Wikidata 項目 | 被刪除比沒有更糟；先取得 2–3 篇獨立報導 |
| 為了 `llms.txt` 升級任何方案 | 該檔案價值不足以構成付費理由 |

---

## 6. 檔案清單

### 新增（Claude 所有）

```
web/lib/seo/identity.ts        實體識別：一句話定義、別名、sameAs、@id
web/lib/seo/metadata.ts        全站唯一的 metadata 產生器
web/lib/seo/page-copy.ts       固定頁的 title／description（依 §3.1 模式）
web/lib/seo/parity.ts          英文覆蓋率判定，驅動 noindex 與 sitemap 排除
web/lib/seo/json-ld.tsx        JSON-LD 元件與各型別建構器
web/app/robots.ts              15 個 AI 爬蟲的明示允許
web/app/sitemap.ts             雙語 sitemap，含 parity 排除
web/app/llms.txt/route.ts      由內容層即時產生
web/app/[locale]/image-policy/page.tsx   ImageObject.license 的指向頁
web/scripts/build-og.mjs       41 張 og:image
web/scripts/verify-seo.mjs     283 項檢查的品質閘門
```

### 修改（Claude 所有）

```
web/lib/content/process-schema.ts   預留五個英文欄位供 parity 判定
web/package.json                    prebuild 加入 build-og；新增 og／seo:verify
.gitignore                          web/public/og/ 比照影像管線視為產出
COORDINATION.md                     §6 跨界登記、§7 現況與已知缺陷
```

### 修改（跨界，已於 §6 登記）

`web/app/[locale]/` 之下的 7 個 page／layout 檔。
**每個檔只動 `generateMetadata` 與在 `<main>` 內加一個 `<JsonLd>`**，
版面、CSS、文案結構完全未動。Fable／Codex 日後整份取代版面時，
把那幾行搬過去即可，不需要重寫任何 SEO 邏輯。

---

## 7. 怎麼驗

```bash
cd web
npm run build && npm start          # 一個終端
BASE=http://localhost:3000 npm run seo:verify   # 另一個終端
```

輸出末行應為 `PASS — 283/283 項通過`。上線後把 `BASE` 換成正式網域再跑一次，
即可驗證「發佈後的 HTML」而非只信任本機建置——這是 `seo/analysis.md` §4.3 的硬性要求。

---

## 8. 後續補做（2026-09-07 同日）

### 8.1 英文內容補齊 — 33 案 + 7 段流程

§3.1 記錄的「所有 `/en/` 深層頁 noindex」的成因已解除。

| 項目 | 數量 |
|---|---|
| 案件 `name.en`／`lede.en` | 33 / 33 |
| 案件影像 `alt.en` | 126 / 126 |
| 影像性質聲明 `note.en` | 15 / 15 |
| 含中文的 `spec` 值 → `valueEn` | 全數 |
| 七段流程：標題、說明、h1、lede、輸入、輸出、how／why 標題與內文、證據註腳、製圖無障礙標題 | 7 / 7 |

翻譯忠於中文原文，**未新增原文沒有的主張或數字**。原文只有「坪」而無 sqm 者
一律不自行換算——那會產生一個原始資料裡不存在的數字。

`parity` 判定同步加嚴，涵蓋頁面上實際會渲染的每一段（含影像性質聲明、
規格值、how／why、證據註腳、製圖標題），避免宣稱 full 卻仍有段落掉回中文。

**結果**：40 個 `/en/` 深層頁自動轉為可索引，sitemap 由 58 條增為 98 條。
沒有任何人工開關——這正是 §3.1 設計成資料驅動的目的。

`verify-seo` 新增 i18n 閘門：實際抓 11 個英文頁，斷言 `<main>` 內零中文殘留。
唯一放行的是雙語技術製圖 SVG——圖內標籤本來就是中英並列（EQUIPMENT／設備），
而它的無障礙 `<title>`（螢幕閱讀器唸出的名稱）已在英文頁替換為英文。

### 8.2 移植到 `main` 的舊靜態站 — 分支 `feat/geo-seo-legacy`

**merge 與 cherry-pick 都不適用**：`main` 是舊靜態站，沒有 `web/` 目錄。
merge 會把整個網站重建推進 main；cherry-pick 會把 `web/lib/seo/**` 丟進一個
沒有 Next.js 的 repo。所以移植的是**決策與設定**，不是程式碼。

在 `../hq-design-website-legacy-seo` 獨立 worktree 進行，未觸碰主工作區裡
其他 agent 的未提交檔案。分支自 `main` 開出，單一 commit，可直接 fast-forward。

`main` 的實際剩餘缺口與處置：

| 缺陷 | 處置 |
|---|---|
| `index.html` 為 `<html lang="en">`（全站僅此頁，內容是中文） | 改為 `zh-TW` |
| `about.html` 檔尾 25 個 NUL byte | 移除。原本 `file(1)` 判為 data、`grep` 視為 binary |
| `og:image` 0 / 27 | 補齊 27 / 27，新增 22 張 1200×630 JPEG |
| JSON-LD 1 / 27，且無 `sameAs`、`alternateName` 缺 HuiCiang Design | 27 / 27，值與新站 `identity.ts` 逐字一致 |
| `llms.txt` 首段與官網宣告不同句 | 改為逐字相同，並補別名清單與官方帳號 |

OG 圖刻意跳過 `floorplan.jpg`：資料夾裡字母序第一個檔常是平面圖，
拿它當分享卡等於把一張圖說分享出去。改取各頁實際顯示的第一張照片。

`CreativeWork` 的面積、年份與地點**只從新站內容層取已核實值**。
舊 cms 沒有 `verified` 旗標，把未核實數字寫進 JSON-LD 會被搜尋引擎與 AI
當事實引用。結果 21 案中 12 案帶數值，其餘只有名稱、描述與影像。

**刻意不做 hreflang**：舊站是單語站，沒有第二個語言版本可指。
自我指向的單一 hreflang 不傳達任何資訊，`§4.2` 的雙向對稱前提不存在。

驗證：`python3 tools/seo/verify.py` → **619 / 619 通過**。

### 8.3 仍未解決：`30 年` 與 `1995` 的矛盾（U-G1）

`main` 的 `index.html` meta description 寫「30 年」、`llms.txt` 寫「營運年數：30 年以上」，
而 `about.html` 寫「31+ 年」，`foundingDate` 是 1995（至 2026 為 31 年）。

我把 `llms.txt` 與所有 JSON-LD 的首段改為只陳述「1995 年創立」，
迴避了機器可讀層的矛盾；但**行銷文案裡的「30 年」沒有動**——
那是對外主張，該由你裁定，不是我該片面改的。

`geo/analysis.md` §4.1 對這件事的判斷值得重述：LLM 抽到互相矛盾的數字時，
最可能的結果是**不引用**，次可能是引用錯的那個且無法更正。
這是 U-G1 清單上最高優先的一項。

