# HQ DESIGN 官網 × New Design System 審查報告（2026-11-20）

> 本輪只讀、只分析。沒有改 code、沒有建分支、沒有 push。
> 比對基準：GitHub `origin/main` @ `56e895b`（PR #70 合併後）＋ Figma `YkQYrRyGsKJEpQj1Lo9kzR`（從 126:22 Components 頁往外讀）＋ PR #71 `feat/reinstatement-service`。

---

## 結論

**結論：Figma 新系統的「顏色、字體、間距、圓角」可以直接搬到網站；但它是為「投影片」做的，網站需要的斷點、網頁字級、導覽列、頁尾、表單都還沒有。建議先留在靜態 HTML、先做一個全站 token 檔，再一組一組頁面換裝；Astro 等 token 穩定後再評估，React／shadcn 只在真的需要互動的地方才加。**

三件最重要的事：

1. **Figma 是投影片系統**：全部畫在 1920×1080 和 A4 上，字級是 18–220px，沒有手機版、沒有 nav／footer／表單。網站要用，必須先補「Web 規則」。
2. **網站跟 Figma 差最大的是**：字體（Inter → Satoshi）、按鈕形狀（方角 4px → 膠囊 999px）、橘色（#C8410F → #ff4e2a／#cc3e22）。這三個一換，整站看起來就不一樣。
3. **這台 Mac 上的 `main` 是舊的**：落後 GitHub 182 個 commit，而且還有志聖（csun）內容。之後動工一定要從 GitHub 的 `origin/main` 重新開一份乾淨的工作區，不能用這份。

---

## 1. Figma 摘要

### 1-1 檔案結構

| 頁面                                         | 用途                                                     |
| -------------------------------------------- | -------------------------------------------------------- |
| Components（126:22）                         | Foundations、元件、Showcase、Appearance Lab、Logo system |
| Slide Templates／Company Profile Deck        | 投影片模板                                               |
| Brand Book／Design Log／Agent Guide（217:2） | 品牌說明、更新紀錄、給 AI 的使用規則                     |
| Popeyes 暫存、\_Lab                          | 個案與實驗，**不應**當成規範                             |

### 1-2 Design token（Variables）

**顏色（Brand Color，41 個）**

| 色系          | 階     | 重點值                                                                          |
| ------------- | ------ | ------------------------------------------------------------------------------- |
| Orange        | 50–120 | 100 = `#ff4e2a`（品牌橘，當底色）；110 = `#cc3e22`（當文字色）；120 = `#992f19` |
| Navy          | 50–120 | 100 = `#1f3148`（品牌藍）；110 `#1c2c41`；120 `#19273a`                         |
| Neutral Light | 50–100 | `#fcfcfc`、`#f9f9f9`、`#f5f5f5`                                                 |
| Neutral Dark  | 25–100 | `#eeeeee`、`#e8e8e8`、`#e2e2e2`、`#d9d9d9`                                      |
| HQ            | —      | black `#0a0a0a`、白 `#ffffff`；主要文字 `#101924`                               |

**語意色（意思是「這顏色拿來做什麼」）**

- Slide Theme：Auto／Orange／Navy 三種主題。
- Color Mode：Light／Dark／Gray／Graphite 四種明暗。
- 例：`mode/text/primary #101924`、`mode/text/secondary #0a0a0ab2`、`mode/accent #ff4e2a`、`mode/accent-text #cc3e22`、`mode/link #1f3148`、`mode/border/muted #e8e8e8`。

**字體（Typography，2 種 mode）**

- 英文／數字：**Satoshi**；中文：**Noto Sans TC**（中文 mode 會自動加字距、加行高）。
- 字級角色（全為投影片尺寸）：Display XL 120／L 116、Headline XL 60／L 56／M 36、Title L 32／M 28／S 24、Body XL 24／L 22／M 20、Label 18、Numeral XL 220。
- 字重：Light／Regular／Medium／Bold／Black 五種可切換。

**其他 token**

| 類別           | 值                                                                                        |
| -------------- | ----------------------------------------------------------------------------------------- |
| 間距 space     | 2xs 4、xs 8、sm 12、md 20、lg 32、xl 50                                                   |
| 圓角 radius    | sm 8、md 16、lg 24、full 999                                                              |
| 線寬 stroke    | divider 1、component 1.5                                                                  |
| 卡片效果 Style | Glass／Glass Dark／Outline／Flat／Tech（Glass = 毛玻璃 blur 32 + 陰影 0 10 32 #0a0a0a33） |
| 圖示           | 28 個線條 icon，線寬 2，尺寸 16–80                                                        |
| 背景           | Mesh 漸層 Shader、Stepped Lines 圖紋                                                      |

### 1-3 元件清單

| 類型       | 元件（variants）                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| 基本       | Button（navy／orange／outline，有無 icon，兩種大小）、Tag（3 種）、Title（大／中，有無 icon）、Divider、Icon Box |
| 卡片       | Card（surface／outline）、Stat Card、Grid Card、Capability Card × 5 種風格、Member Card、Person Box              |
| 作品相關   | **Project Meta**（Stacked／Inline）、**Photo Grid**（1–10 張）、**Project Content**（Side／Top／Photos only）    |
| 資料       | Table、Bar Chart、Gantt Bar、Legend、Delta Chip、Timeline、Process Step、Org Chart                               |
| 品牌       | Logotype、Logo Icon、Wordmark、Corporate Lockup、Clear Space                                                     |
| 投影片專用 | Slide Footer、Agenda、Guide Header、Lead Block                                                                   |

**對網站最有用的**：Button、Tag、Title、Card、Stat Card、Process Step、Project Meta、Photo Grid、Project Content、Logo system。

### 1-4 版型規則（Agent Guide 寫的）

- 顏色、間距、圓角、字級一律綁 Variables，不寫死數字。
- 內容頁預設 Light；封面／強調頁用 Orange 或 Dark；同一份最多「Light + 1 種強調色」。
- 中文一律用 ZH-TW mode；純英數字用 Satoshi。
- 表格欄數 ≤ 6、文字靠左數字靠右；圖表系列 ≤ 6，不能只靠顏色區分。
- 安全邊距只有投影片版（左 50、上 46…）。

### 1-5 Figma 缺少或不一致的地方

| #   | 問題                                                                                                                                                                     | 嚴重 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- |
| 1   | **沒有任何網頁畫面**：沒有 nav、footer、表單、輸入框、語言切換、WhatsApp、FAQ、作品篩選、手機版                                                                          | 高   |
| 2   | **沒有斷點（breakpoint）**：斷點＝畫面寬度到多少就換排版                                                                                                                 | 高   |
| 3   | **沒有網頁字級**：最小 Body 是 20px，網站內文通常 16–17px；也沒有會隨螢幕縮放的字級                                                                                      | 高   |
| 4   | `mode/on-accent` 是白色，白字在 `#ff4e2a` 上對比只有約 3.3:1，**不到無障礙標準 4.5:1**；但 Button 實際用深色字（`slide/action/accent-text #101924`，約 5.3:1）。兩邊打架 | 中   |
| 5   | 色票圖上的字寫 `hq/orange #EE572F`、`orange-deep #D93817`，但變數實際值都是 `#ff4e2a`                                                                                    | 中   |
| 6   | Color Mode「Dark」說明寫 navy/140，但色票只到 navy/120                                                                                                                   | 低   |
| 7   | 主題名稱：Variables 表寫「Auto」，Appearance Legend 寫「Neutral」                                                                                                        | 低   |
| 8   | `weight/display` 叫 Light，實際是 900（Black）                                                                                                                           | 低   |
| 9   | 沒有 motion（動畫時間、曲線）、focus ring（鍵盤選取外框）、z-index、容器最大寬度、表單錯誤／成功文字色（只有很淡的底色）                                                 | 中   |
| 10  | `slide/text/secondary` 和 `slide/text/subtle` 數值相同，重複                                                                                                             | 低   |

---

## 2. 現有網站盤點（origin/main）

### 2-1 頁數

- 共 59 個 `.html`：EN 主頁 8、EN 專案 20（其中 `zhongbao-nangang` 是孤兒頁）、zh 主頁 10、zh 專案 19、`_archive` 2。
- **公開頁面是 56 頁**，不是 57：zh 是 29 頁不是 30（需要確認：Christian 心中的 30 頁是否包含別的頁）。
- 志聖：origin/main **完全乾淨**，只剩 `vercel.json` 兩條 301 轉址。✅

### 2-2 樣式現況

| 項目           | 現況                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| 共用 CSS       | `assets/css/style.css` 1338 行，17 個變數，只有顏色、字體、一個圓角、兩個陰影                         |
| 顏色           | navy `#1C2B3A`、紅橘 `#C8410F`、文字 `#1A1A1A`、背景 `#F8F8F6`、框線 `#E0E0DB`；另外寫死約 30 種 rgba |
| 字體           | Inter + Noto Sans TC，用 `@import` 載入（會拖慢首屏）                                                 |
| 字級           | 約 20 種寫死的大小，最小有 7px                                                                        |
| 斷點           | 1024、900、768、375                                                                                   |
| 圓角           | 2、3、4、8、10、40、50% 混用                                                                          |
| 動畫           | 全部 0.22s ease；`main.js` 加了 `.in-view` 但 CSS 沒寫，**淡入效果其實沒作用**                        |
| 頁內 `<style>` | 約 45 段；每個專案頁各有 175–200 行重複 CSS（4 種版本）                                               |

### 2-3 元件現況

| 元件            | 現況                                                                   |
| --------------- | ---------------------------------------------------------------------- |
| Nav             | 57 份複製貼上，只差 active 和路徑；漢堡選單沒有「X」動畫               |
| Footer          | **已經分裂成 5 種版本**（EN 專案頁少 FAQ 連結、zh/faq 自成一格）       |
| Hero            | 首頁 `hero--int`、內頁 `page-hero`、專案頁 `proj-hero`、careers 沒有   |
| 作品卡          | `.project-card`，2px 圓角，hover 放大                                  |
| 按鈕            | `.btn` 方角 4px，primary／outline／outline-dark                        |
| 表單            | contact（Formspree `xeendgkz`）、careers（另一個 endpoint `xgodqkyn`） |
| 語言切換        | `.lang-toggle`，純連結                                                 |
| WhatsApp        | **只在 `contact.html` 有一顆一般按鈕**，不是浮動按鈕；zh 版沒有        |
| PR #71 新服務頁 | 已用新 token，但只在 `.rs-page` 範圍內生效；字體改 Satoshi             |

### 2-4 不可破壞項目（現在的狀態）

| 項目                 | 現況                                               | 備註                                                            |
| -------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| GA4                  | 56 頁，`ga4.js` 送 2 組 ID + Clarity               | ✅                                                              |
| Formspree            | contact EN/zh                                      | careers 用另一個 endpoint，也要保留                             |
| hreflang             | 56 頁各 3 條                                       | ⚠️ `zh/office-relocation`、`zh/taipei-office-renovation` 不對稱 |
| JSON-LD              | 只有 5 頁（首頁 Organization、FAQ ×2、relocation） | 本機有 27 頁版本，但沒上 GitHub                                 |
| canonical／OG        | 57 頁齊全                                          | og:image 全站都是同一張 logo                                    |
| sitemap.xml          | 56 條，無志聖                                      | ⚠️ PR #71 新頁還沒加進去                                        |
| robots.txt／llms.txt | 正常，無志聖                                       | 沒有 llms-full.txt                                              |
| vercel.json          | 只有 2 條志聖 301                                  | ✅                                                              |
| CI                   | `html-guard.yml`                                   | ⚠️ 沒檢查 `zh/projects/*.html`                                  |

---

## 3. 差異對照表：Figma vs 現有網站

| 項目              | Figma 規範                                            | 現有網站                                        | 嚴重   | 影響頁面                 |
| ----------------- | ----------------------------------------------------- | ----------------------------------------------- | ------ | ------------------------ |
| 字體              | Satoshi + Noto Sans TC                                | Inter + Noto Sans TC                            | **高** | 全站 56 頁               |
| 按鈕形狀          | 膠囊 999px，可帶 icon                                 | 方角 4px，2px 粗框                              | **高** | 全站                     |
| 強調橘            | 底 `#ff4e2a`＋深字；文字 `#cc3e22`                    | `#C8410F` 一色用到底                            | **高** | 全站（按鈕、標籤、數字） |
| 頁內 CSS          | 一律綁 token                                          | 約 45 段 inline style 蓋過共用 CSS              | **高** | 首頁、全部專案頁         |
| Nav／Footer／表單 | **Figma 沒有**                                        | 有，但複製 57 份、footer 5 種                   | **高** | 全站                     |
| 主藍              | `#1f3148`                                             | `#1C2B3A`（很接近）                             | 中     | 全站                     |
| 圓角              | 8／16／24／999                                        | 2–4px 為主                                      | 中     | 卡片、作品卡、輸入框     |
| 間距              | 4／8／12／20／32／50                                  | 寫死 96／64／32                                 | 中     | 全站                     |
| 字級              | 投影片級，沒有網頁級                                  | 20 種寫死，最小 7px                             | 中     | 全站                     |
| 卡片              | 淺灰 surface `#f5f5f5`、圓角 16                       | 白底、細框、2px                                 | 中     | 服務、why、作品卡        |
| 專案頁            | Project Meta／Photo Grid／Project Content（投影片版） | `proj-hero` + specs + gallery，4 種 inline 版本 | 中     | 38 頁專案頁              |
| 斷點              | **沒有**                                              | 1024／900／768／375                             | 中     | 全站                     |
| 陰影              | Glass 毛玻璃                                          | 很淡的平面陰影                                  | 低     | 卡片                     |
| 文字主色          | `#101924`                                             | `#1A1A1A`                                       | 低     | 全站                     |
| 背景／框線        | `#f5f5f5`／`#e8e8e8`                                  | `#F8F8F6`／`#E0E0DB`                            | 低     | 全站                     |
| 動畫              | **沒有**                                              | 0.22s ease，淡入沒作用                          | 低     | 全站                     |

---

## 4. 框架比較

| 比較        | A. 留在靜態 HTML + 套 token                       | B. 轉 Astro（不帶 React）                                              | C. Astro + React islands + shadcn/ui + Tailwind       |
| ----------- | ------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| 是什麼      | 不換工具，只加一個 `tokens.css`，再一頁頁換 class | Astro 會把元件「事先組裝」成一般 HTML 再上線                           | 同 B，再加 React 做互動元件                           |
| 成本        | 低（約 2–3 週做完全站）                           | 中（多 1–2 週架設 + 學習）                                             | 高（再多 2–3 週；shadcn 是 app 用的，官網要大改樣式） |
| 風險        | 低：不動 Vercel 設定                              | 中：要加 `package.json`，Vercel 會開始「建置」，**等於改了上線方式**   | 高：同 B，加上 JS 變多、套件更新負擔                  |
| SEO 影響    | 無                                                | 幾乎無：輸出仍是純 HTML，可保留 `.html` 網址（`build.format: 'file'`） | 輕微：React 互動區要多載 JS，可能拖慢速度             |
| 維護性      | **差**：nav／footer 還是要改 57 次，已經分裂 5 種 | **好**：nav／footer 只寫一次                                           | 好，但工具鏈最重                                      |
| 一頁一個 PR | 可以（用 `.ds-v2` 開關，像 PR #71 的 `.rs-page`） | 可以（舊頁放 `public/` 原封不動，新頁一頁頁搬進來）                    | 同 B                                                  |

**建議：先 A，後 B，C 只局部用。**

- 第一階段（A）：先把 token 和外觀定下來。不碰 Vercel，風險最低。
- 第二階段（B）：外觀穩定後，再轉 Astro，主要目的是解決「nav／footer 複製 57 份」的問題。
- React 只在真的需要時才加，例如 PR #71 的拆除還原表單、比較滑桿。shadcn/ui 不建議整套用在官網。

---

## 5. 重構與遷移計畫

### 5-1 Token 檔結構

一個檔案：`assets/css/tokens.css`。分三層：

| 層               | 意思       | 例子                                         | 對應 Figma              |
| ---------------- | ---------- | -------------------------------------------- | ----------------------- |
| 原始層 primitive | 色票本身   | `--hq-orange-100: #ff4e2a;`                  | Brand Color、Layout     |
| 語意層 semantic  | 顏色的用途 | `--color-accent-fill: var(--hq-orange-100);` | Color Mode／Slide Theme |
| 元件層 component | 某元件專用 | `--btn-radius: var(--radius-full);`          | 元件的 Variant          |

**對應規則**

- 命名：Figma `color/orange/100` → CSS `--hq-color-orange-100`（斜線變連字號）。
- 中英文切換：Figma 的 Typography mode → CSS 用 `:lang(zh-Hant)` 自動換字體、字距、行高。
- 深色區塊：Figma 的 Dark mode → CSS 用 `[data-theme="dark"]` 包住那一區。
- **網頁專用 token**（Figma 沒有，要新增）：斷點、網頁字級（用 `clamp()` 自動縮放）、motion、z-index、容器寬度、focus ring。
- 以後轉 Astro + Tailwind v4 時，Tailwind 直接讀同一份 CSS 變數，**不用重寫**。
- 同步方式：先人工對照表 → 之後用 Figma 外掛匯出 Variables JSON，再用小腳本產生 `tokens.css`（Figma 官方 Variables API 要 Enterprise 方案，需要確認）。

**建議的網頁字級（需拍板）**

| 角色        | Figma（投影片） | 網頁建議                 |
| ----------- | --------------- | ------------------------ |
| Display     | 120             | `clamp(44px, 6vw, 88px)` |
| Headline XL | 60              | `clamp(32px, 4vw, 56px)` |
| Headline M  | 36              | `clamp(26px, 3vw, 36px)` |
| Title       | 24–32           | 20–24                    |
| Body        | 20              | 16–17                    |
| Label       | 18              | 12–13，加字距            |

### 5-2 核心元件建置順序

| 順序 | 元件                                                    | 原因                 |
| ---- | ------------------------------------------------------- | -------------------- |
| 1    | `tokens.css` + 字體載入（自架 Satoshi，取代 `@import`） | 地基                 |
| 2    | Button、Tag、Label、Section Title                       | 最常出現，換了就有感 |
| 3    | Nav（含語言切換、漢堡選單）                             | 每頁都有             |
| 4    | Footer（統一成 1 種，EN／zh 各一份）                    | 順便修好 5 種分裂    |
| 5    | Card、Stat Card、Process Step                           | 服務頁、關於頁用     |
| 6    | 表單（輸入框、錯誤／成功狀態）、WhatsApp 按鈕           | contact、careers 用  |
| 7    | 作品卡、篩選鈕                                          | 作品列表             |
| 8    | 專案頁版型（Project Meta、Photo Grid、Project Content） | 38 頁專案頁共用      |
| 9    | 首頁 Hero                                               | 最複雜，最後做       |

### 5-3 一頁一個 PR 的順序

一個 PR = 一組 EN + zh 頁面（避免 hreflang 兩邊不一致）。

| PR  | 內容                                                             | 為什麼這個順序                                                       |
| --- | ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| 0   | `tokens.css` + 字體 + 元件 CSS（用 `.ds-v2` 開關，**畫面不變**） | 先鋪路，零風險                                                       |
| 1   | `faq`                                                            | 文字為主、版面簡單；有 FAQPage JSON-LD，可以練習「不弄壞結構化資料」 |
| 2   | `services`                                                       | 卡片、按鈕最多，最能驗證元件                                         |
| 3   | `about`                                                          | Stat Card、團隊、Process Step                                        |
| 4   | `careers`                                                        | 第二種表單                                                           |
| 5   | `contact`                                                        | Formspree + WhatsApp + GA4 事件，風險最高的表單頁，等元件穩了再做    |
| 6   | `projects`（列表）                                               | 作品卡 + 篩選                                                        |
| 7   | 專案頁樣板（先做 1 組，例如 aiontech）                           | 定專案頁版型                                                         |
| 8   | 其餘 18 組專案頁（建議一次套，例外不拆）                         | 版型相同，拆 18 個 PR 太慢                                           |
| 9   | `local-partner-international-pm`、zh 專屬兩頁                    | 順便修 hreflang 不對稱                                               |
| 10  | `index` 首頁                                                     | 流量最大、inline CSS 最多，最後做                                    |

PR #71（拆除還原服務頁）建議**先另外審完合併**，再把它的 `.rs-page` token 收進 `tokens.css`，當作第一個參考頁。

### 5-4 每一步的驗收標準

每個 PR 都要過：

1. **不可破壞清單**（可寫成檢查腳本）
   - GA4、`ga4.js` 還在；Formspree action 沒變
   - hreflang 3 條、EN／zh 互相指到對方
   - JSON-LD、canonical、OG 內容和改之前一模一樣
   - 全 repo 搜不到 `csun`／`C.SUN`／`志聖`（`vercel.json` 的轉址除外）
   - `html-guard` CI 通過
2. **畫面**：375／768／1280 三種寬度，改前改後截圖比對；用 Vercel Preview 網址看。
3. **無障礙**：文字對比 ≥ 4.5:1、鍵盤 Tab 看得到外框、有「減少動態」設定時不亂動。
4. **速度**：Lighthouse SEO 分數不降、版面不跳（CLS 不變差）。
5. **人工確認**：Christian 看過 Preview 說 OK 才合併。

---

## 6. 順手發現（不在本次範圍，建議另開任務）

- 本機 `main` 落後 182 個 commit，且含志聖內容、`web/.next` 建置檔也有志聖字串。**絕對不能從這裡 push。**
- PR #71 的 6 個新頁沒加進 `sitemap.xml`、`llms.txt`，也沒有連結進來。
- `html-guard.yml` 沒檢查 `zh/projects/*.html`。
- `projects/zhongbao-nangang.html` 孤兒頁還在 repo 裡。
- JSON-LD 只有 5 頁；本機有 27 頁版本（commit `1fdff97`）沒上 GitHub。
- og:image 全站同一張 logo，分享時看不出是哪個作品。

---

## 7. 需要 Christian 決定的問題

| #   | 問題               | 選項                                                            | 建議                                                                 |
| --- | ------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | 網站規則要放哪？   | (a) 在同一個 Figma 檔加「Web Foundations」頁 (b) 只寫在 code 裡 | **(a)**，Figma 才是唯一正本                                          |
| 2   | 字體               | (a) 全站換 Satoshi (b) 保留 Inter                               | **(a)**，但要先確認 Satoshi 授權（Fontshare 免費授權條款）並自架字體 |
| 3   | 按鈕形狀           | (a) 膠囊（Figma） (b) 方角（現況）                              | **(a)**                                                              |
| 4   | 卡片風格           | Glass／Flat／Outline／Tech                                      | 網站用 **Flat**；Glass 只用在 Hero 這種主視覺                        |
| 5   | 橘色用法           | (a) `#ff4e2a` 只當底色＋深字、文字改 `#cc3e22` (b) 照舊         | **(a)**，才過無障礙                                                  |
| 6   | 框架路線           | A 靜態／B Astro／C Astro+React+shadcn                           | **先 A，後 B**；C 只局部                                             |
| 7   | PR 單位            | (a) EN+zh 一組一個 PR (b) 單頁一個 PR                           | **(a)**                                                              |
| 8   | 專案頁             | (a) 1 組樣板 + 18 組一次套 (b) 19 個 PR                         | **(a)**                                                              |
| 9   | 網站要不要深色模式 | (a) 只做淺色 + 深藍區塊 (b) 跟系統切換                          | **(a)**                                                              |
| 10  | WhatsApp           | (a) 維持現況（只在 contact） (b) 改全站浮動按鈕                 | **(a)**，浮動按鈕另案                                                |
| 11  | PR #71             | (a) 先審完合併，當參考頁 (b) 等全站一起                         | **(a)**                                                              |
| 12  | 本機舊 `main`      | (a) 不動它，之後從 `origin/main` 開新工作區 (b) 現在清理        | **(a)**，裡面有未提交內容，要你先決定要不要留                        |
| 13  | 頁數               | 你說 zh 30 頁，GitHub 上是 29 頁                                | 需要確認                                                             |

---

## 下一步

1. 把這份報告存成 `docs/reviews/2026-11-20-figma-design-system-audit.md`（只新增這一個檔，**不 commit、不 push**），並傳給 Christian。
2. 依 AGENTS.md 寫一筆 worklog（`worklog.py append`，狀態「待確認」）。
3. 停在這裡，等 Christian 回覆第 7 節的問題，再開下一輪（建 token 檔）。
