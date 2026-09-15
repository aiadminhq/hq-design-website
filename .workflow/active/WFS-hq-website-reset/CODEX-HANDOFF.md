# Codex 接手交接書 — HQ Design 官網重置

**版本**：r3（2026-09-03，取代 r1/r2）
**交接原因**：Claude Code 額度將滿，由 Codex 接手至 **20:10**
**授權**：使用者已明確授權 Codex 以 computer_use／GUI 操作協作

---

## 0. 一分鐘進入狀況

HQ Design（惠強室內裝修）官網**整體重建**。已確認方向不需再討論：

| 項目 | 已確認決定 |
|---|---|
| 主軸 | AI 深度整合設計流程的差異化敘事（**不是**「AI 當渲染工具」） |
| 發佈層 | Framer（模板專案已連過，13 頁／29 元件／3 個 CMS collection） |
| 視覺 | Design Token 3.0；保留主色 `#D64518` 與視覺 DNA；英文 Satoshi、中文 Noto Sans TC；**絕不用襯線體** |
| 字體 | **Satoshi 與 Noto Sans TC 都是 Framer 內建**（`FS;` 與 `GF;` 前綴），不需上傳字檔 |
| 雙語 | 中英完整雙語，欄位層並存 |
| 影像授權 | **已解除**——使用者確認已與甲方簽署照片協議 |
| AI 爬蟲 | **完全不封鎖**，使用者明確要求讓 AI 查得到公司 |
| 優先序 | **趕快先上線**。每案照片最多 10 張，能不修圖的先放，修圖建議寫進後台標註 |
| 時程 | 無硬期限，品質優先，舊站可持續服務 |

**權威文件**：`.brainstorming/guidance-specification.md`（365 行，含 19 條決策追蹤）
**六份角色分析**：`.brainstorming/{system-architect,ux-expert,product-manager,data-architect,ui-designer,seo}/analysis.md`

---

## 1. 你的任務（依價值／時間比排序，請照順序做）

### ⛔ T-1｜commit 未版控的核心資產（約 5 分鐘，最高優先）

**問題**：`hq-design-website` repo 中，以下目錄**完全未納入版控**：

```
cms/     → 版控 0 個｜實際 36 個檔案  （6 個 JSON Schema + 21 個專案資料 JSON）
docs/    → 版控 0 個｜實際  5 個檔案  （ADR-001 決策紀錄 + Framer 遷移計畫）
scripts/ → 版控 0 個｜實際 13 個檔案  （TypeScript 抽取／驗證／Notion 匯入腳本 + 測試）
```

`package.json`、`tsconfig.json`、`.gitignore` 也未納入。**本機磁碟只剩 1 GiB、Dropbox 同步不穩**，這批是最脆弱且最有價值的資產。

**動作**：
1. 先檢查 `.gitignore` 內容是否合理（它自己也未 commit）
2. **`.workflow/` 內的 `web-assets/` 與 `.process/photo-index.json` 不要進 git**（前者是圖檔、後者含大量路徑），請加入 `.gitignore`
3. commit `cms/`、`docs/`、`scripts/`、`package.json`、`tsconfig.json`、`robots.txt`、`sitemap.xml`、`llms.txt`
4. 另外 commit 我已完成的 SEO 修復（27 個 HTML 檔，見 §2）
5. **不要 push**——使用者未授權推送，且 repo 歸屬待釐清（見 §5）

---

### ⛔ T-2｜磁碟空間急救（約 10 分鐘）

**現況**：`/dev/disk3s5  926Gi  854Gi  1.0Gi  100%` — 這已是系統風險等級。

**可回收（依大小）**：
1. `HQ Design - Design System/Danelec/PDF/` — **518 MB**，73 張逐頁 PNG，是同目錄那份 50 MB PDF 的轉檔，**確認可用 `pdftoppm` 重生**。這是單筆最大回收。
2. 垃圾檔 **12 MB**：33 個 `.DS_Store` + 54 個 `Thumbs.db` + 4 個 Office `~$` lock。已備好 dry-run 腳本：
   ```
   .process/ds-folder-cleanup.sh          # 預設 dry-run，加 --execute 才刪
   ```
3. `LOGO.zip` — 158 KB，已用 `shasum -a 256` 確認與 `LOGO/` **20/20 檔案位元完全一致**，可安全刪。

**⚠️ 限制**：`Untitled*`、`Copy of...`、`新增資料夾`／`新增包含項目的檔案夾` **不得自動刪除**——其中 `新增包含項目的檔案夾/` 內含 4 份重要文件、`作品集-更新版/新增資料夾/` 內含 101 MB 攝影素材。

**⚠️ 刪除前請向使用者確認 `Danelec/PDF/`**，那是 518 MB 的不可逆操作。垃圾檔（12 MB）風險低，可直接執行。

---

### ⛔ T-3｜Framer 專案裁決 + MCP 重連 + `array` 欄位實測（解除關鍵路徑）

**Codex 已查明的現況**（見 `codex-out/FRAMER-CONNECTION.md`）：
- 目前開啟的專案是 **`Nyro Portfolio website (copy)`**，大部分內容仍是 Nyro demo；HQ DESIGN wordmark 已放入，三個 breakpoint（Desktop 1200／Tablet 1199–810／Phone 809）都存在
- **MCP plugin 尚未連上**：`cmd-K` 搜 MCP 後介面持續 loading，沒有可點選結果
- **阻塞原因**：Framer 顯示 `A new version is available. Please reload to continue.`
- Codex 已安全處置：未 reload、未 publish、未改內容，FRAMER-LOCK 已釋放

**⚠️ 這一項需使用者先裁決（見 §5-9）**：沿用 Nyro copy 並 reload 後接 MCP，或新建 Framer project？
Codex 建議**新建**，因為規格要求 template 重新選型，保留 Nyro copy 作為可回溯參考，不把既有實驗當正式新站基底。**我同意這個判斷。**

**裁決後的第一步（GUI）**：在目標專案內 reload → `cmd-K` → 搜 `MCP` → 開啟 MCP plugin → **保持該視窗開著**。

**第二步：這是擋住一切的問題**

Framer CMS 有 `array` 型別（`Articles.Gallery`、`Projects.Gallery` 都是），但**三方說法互相矛盾**：
- Framer 官方文件：array「僅支援單一 image field」
- MCP 工具契約註解：複數「Array of objects with **nested field data**」
- 模板實例：只有一個 image 巢狀欄位

而且有兩個**不可逆**的限制：
- `createCMSCollection` 的型別 enum **不含 array** → array 只能在 UI 手動建
- 工具契約明載「**You cannot update or add fields to existing user-managed collections**」，模板三個 collection 都是 `managedBy: "user"` → MCP 連加一個 string 欄位都不行
- **沒有 `deleteCMSCollection` 工具** → 建了就無法用 MCP 刪

**所以 schema 只能一次性手建、不可回滾。必須先測再建。**

**實測步驟**：
1. 在 UI 建實驗性 collection，命名 `_TEST_ARRAY_DELETE_ME`
2. 加一個 array 欄位，嘗試在其巢狀結構內加入：`image`、`altZh`(string)、`altEn`(string)、`role`(enum: hero/gallery/detail)
3. **回報：array 是否接受多個不同型別的巢狀欄位？** 若只接受單一 image，回報實際限制
4. 建一筆測試 item 填入資料，確認可寫入
5. **在 UI 手動刪除該實驗 collection**
6. 把結果寫入 `codex-out/STATUS.md`

**為什麼這件事擋住一切**：它決定 gallery 的雙語 alt 能否存在，也決定整個 CMS schema 的形狀。schema 不定案，148 張照片無法匯入。

**已知可用的欄位預算**：實算平攤中英雙語只需約 **23 欄**，低於 Framer 的 30 欄上限，還有 7 欄餘裕。所以 30 欄不是問題。

---

### T-4｜GEO 基線記錄（約 30 分鐘，不做就永久補不回來）

**為什麼緊急**：GEO 沒有 Search Console 這種歷史資料可回溯。不先記錄現況，之後無法判斷任何優化是否有效。

**清單已備好**：`.process/geo-baseline-test.md`（15 個測試問題，分四層：品牌實體／差異化定位／服務採購／飯店餐飲）

**動作**：在 ChatGPT、Claude、Perplexity、Google AI Overviews 各介面貼上問題，記錄三件事：
1. 有沒有提到惠強／HQ Design
2. **提到了誰**（這就是 AI 眼中的競品名單，比任何競品調查都精準）
3. **引用了哪些來源網址**（揭露 AI 認可哪些網站為權威）

**⚠️ 請先問使用者**：是要你用 computer_use 自動操作那些 AI 介面，或由使用者手動進行。自動化操作第三方 AI 服務可能觸及其使用條款，這個決定屬使用者。

**已知的預期結果**（SEO 分析實測）：官網目前**排不進自家品牌詞 SERP 前 10 筆**，前 10 全是公司登記站、104、FB。所以第一層很可能全部「AI 不知道惠強」，那正是基線。

---

### T-5｜Framer marketplace template 候選蒐集（約 30 分鐘）

**篩選條件**（UI 設計角色已定，可直接照做）：

必要：
- 有**流程型／時間軸型**區塊（承載七段流程）
- 有**對照表／比較型**區塊（承載「一般設計流程 vs HQ AI-Integrated」對照）
- 有**案例網格 + 案例詳情**完整組合，支援 CMS collection 綁定
- **3:2 影像友善**：現有專業攝影全為 3:2。實算 **9 欄配置得 984/1.5 = 656px = 8×82，完全貼合** 8px 節奏；8 欄配置得 581.3px 會脫離節奏。**優先找 9／6／4 欄配置**
- 版面尺度大、留白充足

應避免：
- 高飽和／霓虹／玻璃擬態（`DESIGN.md` 明文禁止）
- 任何襯線體為主的排版
- hero 強制 16:9 硬裁（會切掉天花板與地坪收邊——那正是工法的證據）
- 強依賴特定第三方 plugin

**產出**：3–5 個候選，各附名稱、URL、價格、截圖、逐項符合度評註 → `codex-out/framer-templates/`

---

### T-6｜其餘 P1 任務（時間有餘再做）

| 任務 | 說明 | 產出 |
|---|---|---|
| Figma P02 匯出 | MCP 對 P02 整頁 `get_metadata` **硬失敗**（傳輸層截斷 `EOF at column 48436`），取不到子節點 id。需你截圖 + **列出主要 frame／component 名稱與 node id**。檔案 `3viWBkQGZAEQnJntysBxZ7`，P02 = `590:276`。另 Figma team library 已有 published tokens（`HQ Primitives`、`HQ Semantic` 共 14 個色彩變數），但 `get_variable_defs` 只對「Figma 內當前選取」有效 → 需在 UI 選取後匯出實際色值 | `codex-out/figma-p02/` |
| shader 行動端實機量測 | 四套 shader（mesh／beams／grid-scan／pattern）**至今零量測**。UI 角色已設硬上限：全站 canvas ≤3、單一高度 ≤60vh、禁止出現在案例頁照片區。需中階 Android + iPhone 實機量 FPS／CPU／GPU／電池溫度 | `codex-out/shader-perf/` |
| Unframer 備援 spike | MCP 端點 `mcp.unframer.co` 是**社群專案非 Framer 第一方**，主線自動化與逃生路徑（`unframer` CLI）同屬一個第三方，會同時失效。需驗證 CLI 能匯出元件並在本地 Next.js SSR、pin 版號、確認訂閱歸屬 | `codex-out/unframer-spike/` |
| ~~修 2 條 JSX 路徑 bug~~ | ⛔ **已撤銷——此 bug 不存在**。見 §3.5 | 不要做 |
| ~~修 v2.0 token 斷鏈~~ | ⛔ **已撤銷——斷鏈不存在**。見 §3.5 | 不要做 |

---

## 2. Claude Code 這一輪已完成的工作（不要重做）

### 舊站 SEO 修復（已改檔，未 commit、未 push）

`hq-design-website` 內 **27 個 HTML 檔已修改**，diff 乾淨：**359 insertions / 4 deletions**。

| 修復項 | 內容 |
|---|---|
| 首頁 title | 改為「惠強室內裝修 HQ Design｜AI Parametric × Construction Execution｜商業空間設計施工統包 台北」。**原本是全英文、不含「惠強」二字**，這是品牌詞搜不到的直接原因 |
| 結構化資料 | 首頁注入 `Organization` + `GeneralContractor` JSON-LD，含 **7 組 alternateName**，用來合併 SEO 診斷發現的「品牌實體分裂成四組」 |
| canonical | 27 頁全補（原本 0 個） |
| OG + Twitter Card | 27 頁全補（原本 0 個） |
| `robots.txt` | **24 個具名 AI 爬蟲明確 Allow、零 Disallow**。依使用者明確指示「完全不封鎖任何 AI 爬蟲」，檔內已加註解說明這是刻意決定，請勿改為封鎖 |
| `sitemap.xml` | 27 個 URL |
| `llms.txt` | 83 行事實摘要（公司基本事實、AI 整合流程差異化、服務範圍、七段流程、代表實績、里程碑），供 LLM 與 AI agent 讀取 |

**順手修掉兩個既有 bug**：`projects/kimpton.html` 與 `projects/secom-nangang-complex.html` **在 commit 時就已被截斷**（結尾停在版權文字中間，缺 `</p></div></div></footer>`、`</body></html>` 與 `main.js` script 引用）。已補齊並統一 CRLF 行尾。

### 照片選片（148 張，已完成）

六組 agent 逐張評估 **538 張唯一影像**，產出：

- `.process/photo-selection.md` — 人類可讀清單，**19 個案例、148 張**，分四波，每張含 `none`／`light`／`heavy` 修圖等級、具體修法、注意事項
- `.process/photo-selection.json` — 結構化，供 CMS 匯入
- `.process/photo-review/*.json` — 六組原始評級（A-secom、B-kimpton、C-fb、D-retail-aviation、E-office、F-unsorted，另有 A-secom-tenant-split）
- `.process/web-assets/` — **第一波 25 張 A 級已轉檔**（2560px 長邊、JPEG q88、已剝除含攝影師個資的原檔名，改為 `slug-role-序號`）

**第二波 62 張未轉檔**——磁碟不足時暫停。轉檔指令範式：
```
magick <src> -auto-orient -strip -resize 2560x2560\> -colorspace sRGB \
  -sampling-factor 4:2:0 -quality 88 -interlace JPEG <dst>
```
（永不 upscale；原檔未達 2560 者不加 `-resize`）

### 其他產出

| 檔案 | 內容 |
|---|---|
| `.process/nas-portfolio-inventory.md` | NAS 作品集盤點與對應表 |
| `.process/photo-index.json` | 538 張影像索引（尺寸／EXIF／相機／tier） |
| `.process/seo-meta-rescue.json` | **搶救舊站 SEO 文案**——21 個案例頁的 title/description 在舊 HTML 是 21/21 有值，但 `cms/data` 是 0/21，不搶救會隨舊站廢棄永久遺失 |
| `.process/geo-baseline-test.md` | GEO 基線測試清單（15 題） |
| `.process/ds-folder-inventory.md` | Design System 8.1 GB 資料夾盤點 |
| `.process/ds-folder-restructure-plan.md` | 重組計畫 |
| `.process/ds-folder-cleanup.sh` | 垃圾清理（dry-run） |
| `.process/ds-folder-move-plan.sh` | 搬移計畫（dry-run） |

---

## 2.5 Codex 已完成的工作（不要重做）

| 產出 | 內容 |
|---|---|
| `tools/hq-design-toolkit/` | **Framer Plugin 原始碼**，已通過 ESLint／TypeScript／production build，`npm audit` 0 vulnerabilities。含 `CLAUDE.md`（載明 Plugin／MCP／Agent 三者差異、畫布鎖、品牌規範、禁存密鑰）。scripts：`dev`／`build`／`lint`／`typecheck`／`check`／`preview`／`pack` |
| `codex-out/FRAMER-CONNECTION.md` | Framer 專案現況與 MCP 阻塞原因 |
| `codex-out/REPO-OWNERSHIP.md` | 兩個 repo 的同源證據與歸屬建議 |
| `codex-out/UNFRAMER-PROJECT-READBACK.md` | Unframer MCP 讀回（13 頁、focused page `/hq-home` node `GcRr7rS33`、production 與 staging URL 皆 `null`）。**密鑰僅以遮罩形式記錄，未存完整 URL**（正確處置） |
| `codex-out/FRAMER-AGENT-SKILL-PLAN.md` | 六項 Framer 工作技能規劃：Responsive Layout Audit／Hero Art Direction／Brand Token Alignment／Component Cleanup／Template Residue Sweep／QA Read-back。指令已填入 Framer Agent 但**尚未送出、未改畫布** |

**三者層級區分（使用者澄清，請維持）**：
- **Framer Plugin** — 在 Framer 編輯器內執行的 UI 與功能
- **Framer MCP** — 讓 Claude／Codex 從外部讀寫專案
- **Framer Agent** — Framer 右側的對話式設計助手

**Codex 另發現一項內容不一致**：`31 Years` 與 `EST. 1995 / 30+` 並存。這與資料架構角色的發現一致（`about.json` 記 31+ vs 簡介 P01 記 30+），已列入 §5-4 的面積／數字矛盾裁決。

**Plugin 啟動剩餘步驟**：① `mkcert -install`（需使用者輸入 macOS 密碼）② `npm run dev` ③ 在 Claude 核准 `framer` MCP ④ 在 Framer 開啟 **Open Development Plugin**（只載入開發版，不會 Publish）

---

## 3. 已確定的關鍵事實（不要再查）

### 影像素材

- NAS 作品集 **7.3 GB、898 個 JPEG，但只有 391 個唯一 basename**（約 56% 是多尺寸副本）。`中保總部 2026` 的「154 張」實為 **77 張唯一照片 × 2 尺寸**。任何以 898 為基數的估算都是錯的。
- **739/898 含 EXIF**，相機為 Canon 646／SONY 31／Panasonic 25／Apple 7。**DJI 為 0**——先前「有空拍素材」是偽陽性（整檔字串搜尋命中壓縮資料內）。EXIF 比對 MUST 限 APP1 區段。
- **那 13 個純渲染案的實拍缺口，確定只能靠重新拍攝**。中保總部 77 張已按租戶拆分，六個目標案例（博訊／立偉／樂到家／保創／天河／欣蘭）**沒有一家湊得出 6 張 A/B**（AION 最多，也只有 2 張 B）。這件事已有定論，不必再找。
- `secom-nangang-complex` 可獲 **36 張、21 張 A/B**，足以撐旗艦案。
- 大量重複目錄已用 MD5 實證排除：`許昌街POPEYES`、`餐廳`、`起家雞`＋`起家雞台中`、`展示間`、`新增資料夾`、`金普頓拍照` 全是既有目錄的位元組複本。

### Framer

- 模板已有 `/projects/:slug` 動態路由與 `card - process` 元件——流程敘事與 CMS 綁定都有現成骨架。
- 既有 `Projects` collection 11 欄：Hero Image、Gallery(**array**)、Project name、Short text、Heading、Text、Year、Location、Scope、Size、Category。
- UI 角色評估：**只需新增 3 個欄位**（各文字欄位 `_en` 對偶、`heroProvenance`、`diptychReady`）即可承載全部視覺元件。**MUST NOT 為 gallery 新增固定 slot 欄位**——有 array 之後那是反模式。
- ADR-001 記載的 Framer **Basic 方案僅 30 pages／50 GB／無 static files** → 13 頁 + 案例動態頁可能超限，且**無 static files 可能直接擋住 `llms.txt`**。建議升 Pro，需使用者決定。

### SEO（已完成分析，結論勿推翻）

使用者指定的四個關鍵字，**三個不建議投入**：
- 「台灣室內設計」❌ SERP 全是住宅排行榜，要排上去得寫評比同業的排行榜，與機構客戶形象衝突（HQ 21 案中 16 案辦公室、0 案住宅）
- 「ai 設計」❌ Google 自己都解析不了（回日文製造業文章 + Wikipedia 消歧義）
- 「ai interior design」❌ 100% 英文免費工具評測榜，搜尋者是消費者不是發包企業
- 「ai 室內設計」⚠️ 可主攻但**主導意圖是「找工具」不是「找廠商」**，只能做定位不能衡量詢價

**建議第一個開工**：「參數化設計 室內」／「BIM 室內裝修」——唯一難度低，SERP 全是學術論文與課程、**無任何商業供應商佔位**，搜尋者全是專業買方。英文改投 `office fit out Taipei`／`design and build contractor Taiwan`（該 SERP 只有 M Moser Associates 一個真實競品）。

**最緊急且無法事後補救**：在舊站還在線上時建立 Google Search Console 與 GA4 基線（約 30 分鐘，需使用者驗證網域所有權）。

---

## 3.5 ⛔ 更正：兩項「斷鏈 bug」不存在（r3 修訂）

`ds-folder-inventory.md` 報告的兩項斷鏈，經 Claude Code 逐一實測**皆為誤判**。交接書 r3 初版曾將其列為待修任務，**已撤銷**。請勿依該報告修改檔案。

| agent 的判斷 | 實測結果 |
|---|---|
| `colors_and_type.css` 被上移一層，`@import` 與 `@font-face` 全部斷鏈，「135 個 token 從未被載入」 | **無斷鏈**。該檔全系統只有一份（`Claude Design/colors_and_type.css`，13,578 bytes、378 行）；`styles.css` 的 `@import url("./colors_and_type.css")` ✅ 可解析；其 `./fonts/Aeonik-Regular.ttf` ✅ 可解析 |
| `TopNav.jsx:41`／`FooterAndCTA.jsx:56` 的 logo 路徑「少算一層」會破圖 | **路徑正確**。實際寫的是 `../../../assets/`（三層），從 `ui_kits/website/components/` 解析為 `Claude Design/assets/HQ-logo.png` ✅ 存在。agent 誤讀成兩層，而兩層才是不存在的那個 |

### v2.0「從未落地」的真正原因：網站與設計系統零交集

| 關鍵字 | 在 `hq-design-website/` 的出現次數 |
|---|---|
| `colors_and_type` | **0** |
| `Claude Design` | **0** |
| `Aeonik` | **0** |
| `_ds_bundle` / `_ds_manifest` | **0** |

網站只引用 `assets/css/style.css`（獨立一套：Inter + Noto Sans TC 走 Google Fonts、deep navy `#1C2B3A`、accent `#C8410F`）。設計系統的 `styles.css` 在 `Claude Design/` 內也**沒有任何 HTML 引用**。

**這不是技術故障，是流程斷裂**——設計系統與網站從一開始就是兩條平行線。路徑一直正常，只是沒有任何供給管線把 token 接進網站。

**對 F-001 的意義**：Token 3.0 的核心任務**不是修路徑，而是建立「設計系統 → 網站」的實際供給管線**（system-architect §5 的三端同步機制）。若只是把 token 檔整理漂亮而不建管線，會重演同一次失敗。

---

## 4. GEO 分析已完成 — 三項結論會改變做法

產出：`.brainstorming/geo/analysis.md`（672 行）

### 4.1 ⚠️ schema.org 對 LLM 引用**沒有**顯著增益

受控測試的相關係數介於 **−0.106 至 +0.039**；帶 FAQ schema 的頁平均 ChatGPT 引用 **3.6 次 vs 不帶 4.2 次**（負向）。Google 官方亦明言出現在 AI Overviews／AI Mode「不需要建立新的 machine readable 檔案、AI 文字檔或標記」。

**這不代表我加的 JSON-LD 白做** — 它對**傳統 SEO** 的品牌實體識別、rich results、以及合併「品牌名分裂成四組」仍然有效。但 **MUST NOT** 為了 GEO 而擴充 schema.org 標記，那是行銷話術。

### 4.2 真正有實證的 GEO 手法只有五項

來源：`GEO: Generative Engine Optimization`（KDD 2024, arXiv 2311.09735）九手法對照實驗 + 2026 兩篇 arXiv 補強（602 prompts／21,143 引用）：

| 手法 | 增益 | 對 HQ 的適用性 |
|---|---|---|
| **Statistics Addition**（量化數據取代定性描述） | +24–26% | **最高** — 1,600+ 件、30 年、5,940 sqm 本身就是數字 |
| **Cite Sources**（引用可信來源） | +22–28% | 高 — 法規、工法標準可引 |
| Quotation Addition | +41%（全體最高） | 低 — 需外部可引語來源 |
| Fluency／Easy-to-Understand | +15–30% | 高 — 正好對映「業主看得懂」要求 |
| 可抽取證據 + 語意對齊 | — | 高吸收頁的共同特徵：結構清楚、與問句語意對齊、含定義／數值／比較／步驟 |

**反向證據**：Keyword Stuffing 趨近零或負向。

### 4.3 最重要的一句：官網做到滿也只覆蓋引用池的一小部分

廠商大規模觀測一致指向 **68–84% 的 AI 引用來自第三方／earned media**，跨平台網域重疊僅約 **11%**。

**因此 GEO 分析提議修正 SEO 的優先序**：把「媒體投稿與外部連結」從 P2 **提前到 P1 起跑**——刊出前置期 1–3 個月，P2 起跑等於半年後才有第一篇。

**90 天的合理目標是「AI 被問到惠強是誰時答得正確且連到官網」，不是「AI 主動推薦惠強」。** 檢索型（Perplexity／ChatGPT search／AI Overviews）反應與 SEO 同級，數週至數月；訓練型（模型權重裡的品牌先驗）以年計且無法驗證。

使用者的品牌一致性論點**成立，但它是品牌風險不是通路風險**：年詢價增量合理預期是個位數。惟其所需素材與 SEO 主攻群 M4（參數化／BIM，唯一難度「低」）完全相同，**建議列為對外一致性驗收項，不要為 GEO 單獨編預算**。

### 4.4 `llms.txt`：做，但理由不是 GEO

Google 的 John Mueller **明確否認任何 AI 系統使用它**；截至 2026 Q1 無任何主要供應商承諾在開放網路抓取；伺服器日誌顯示只有 GPTBot 偶爾抓。**若有人說加了它 ChatGPT 就會引用你，那是行銷話術。**

仍值得做的三個理由：成本約 1 小時零風險；對「會自行瀏覽的 AI agent」確有價值（Anthropic agent 寫作指引推薦、Lighthouse 13.3 新增 Agentic Browsing 稽核）；**撰寫過程會強迫把事實整理成單一權威清單——那份整理的價值高於檔案本身**。

⛔ **MUST NOT 為了 `llms.txt` 升級 Framer 方案**：Framer 的 `llms.txt` 與自訂 `robots.txt` **都是 Pro 限定**。升 Pro 的正當理由是 pages 上限、頻寬與 robots.txt，不是 llms.txt。

### 4.5 robots.txt：全部 Allow（與已實作一致）

核心判斷：媒體業封鎖訓練爬蟲是因為**內容就是商品**；HQ 的網站內容是**招牌**，進入模型權重正是「AI 被問起時提到惠強」最深層那條路徑。真正該保密的東西本來就不該在公開網站上——robots.txt 不是保密機制。

兩個容易誤判的官方事實：
- 封鎖 `Google-Extended` **不會**讓你退出 AI Overviews（那由 Googlebot 驅動），只會退出 Gemini 訓練。Apple 同構。
- **MUST NOT 封鎖 `facebookexternalhit`**，否則 OG 分享卡直接失效。

唯一條件式例外：若專業攝影授權不允許 AI 訓練使用，則對**影像路徑**針對訓練爬蟲加 `Disallow`，且 MUST NOT 影響三個 SearchBot。

### 4.6 GEO 實測發現的三項落差

1. ~~`index.html` 為 `lang="en"`（27 頁中唯一）~~ → **已修為 `zh-TW`**
2. ~~`about.html` 尾端有 25 個 NUL byte，`file` 判為 `data` 而非 HTML~~ → **已修復（屬既有損壞，git HEAD 亦有）**
3. ⛔ **live 站 `/robots.txt`、`/sitemap.xml`、`/llms.txt` 三者皆 404**（`/` 回 200）。**repo 有檔 ≠ 已上線** — 需部署才生效

### 4.7 ⛔ 最高優先阻擋（U-G1）：公司簡介自身數字矛盾

這會讓 LLM **傾向不引用**（矛盾來源降低可信度權重）：

| 項目 | 衝突值 |
|---|---|
| SECOM 南港總部面積 | 2,500 vs 5,940 sqm |
| 志聖 C.SUN 面積 | 700 vs 560 sqm |
| 公司名 | 惠強室內**裝修** vs 內文惠強室內**設計** |
| 年資 | 30 vs 31（`about.html` 寫「31+ 年」與簡介 PDF 不符） |

**此項阻擋 GEO §4 全部內容與 `llms.txt` 發布。** 需使用者以合約與竣工文件裁定權威值。

---

## 4.9 仍在背景執行、結果會晚於本交接書

**GEO（Generative Engine Optimization）專家分析** — 正在查證：哪些 GEO 手法有實證支持、AI 爬蟲的實際 user-agent 字串、`llms.txt` 的真實採用狀況、內容可引用性設計、Wikidata 實體建立門檻、Framer 的 GEO 限制。

產出將寫入 `.brainstorming/geo/analysis.md`。**若該檔案已存在，請先讀它再動 `robots.txt` 或 `llms.txt`**——我目前寫的版本是基於廣為記載的 user-agent，GEO 分析可能有更新的查證結果。

---

## 5. 需使用者裁決（Codex 不得自行決定）

| # | 事項 | 卡住什麼 |
|---|---|---|
| 1 | **金普頓 FINCH 是否含在承攬範圍** | 90 張最高畫質素材。`kimpton.json` 明載範圍為「公共區域、客房走廊」100 坪；FINCH 餐飲場域 90 張全部標 `uncertain`。飯店合約慣例「Public Areas」通常涵蓋 F&B，但也可能僅指動線空間。**這與授權無關，是「這區域是不是我們做的」** |
| 2 | **repo 歸屬** | Codex 已查明（`codex-out/REPO-OWNERSHIP.md`）：**兩個 repo 都是 public，都 forked from `ormachang-git/hq-design-website`，HEAD 都指向同一 commit `94e8e25`**，公開頁面皆顯示 33 commits。無法由唯讀證據判定哪個是正式 ownership authority，也無法確認 Vercel／Framer／domain 綁定哪一個。Codex 建議指定 `aiadminhq` 為公司正式 repo、`chr1st1anw0w` 留個人副本，但**未修改 remote、未推送** |
| 3 | **`secom-nangang-complex` 與 `zhongbao-nangang` 是否同一標的** | 77 張歸屬與案例是否併案。UX 角色建議**併案**（9F–11F 完全包含在 7F–14F 內，同址同業主同年），理由：一個 756 坪／8 層／零停業的旗艦案說服力高於兩個中型案，且併案可逆、拆案不可逆 |
| 4 | **面積數字矛盾** | SECOM 記 2,500／5,940 sqm／756 坪；C.SUN 記 700／560 sqm／215 坪。機構客戶與政府標案會核對 |
| 5 | **Framer 方案是否升級 Pro** | Basic 的 30 pages／無 static files 限制 |
| 6 | **`Danelec/PDF/` 518 MB 是否刪除** | 磁碟急救的最大單筆 |
| 7 | **宜蘭員訓 KTV 是否為實拍** | 6 張 EXIF 0%、光線異常均勻、無 LED 溢光，疑為渲染圖或提案圖翻拍 |
| 9 | **Framer 專案：沿用 Nyro copy 或新建** | 擋住 MCP 連線與所有後續 Framer 工作。Codex 與我都建議**新建**（規格要求 template 重新選型） |
| 10 | **Plugin 開發環境**：`npm run dev` 停在 macOS `mkcert` 憑證授權 | 需使用者親自 `mkcert -install` 並輸入管理員密碼。Codex 未代填（正確處置） |
| 8 | **13 個純渲染案要保留幾個** | 產品角色建議降為選錄 **4–6 案**並明確標註來源。全保留會讓純渲染案佔案例庫 43%，降到 4–6 案為 19–26%，且渲染圖性質從「沒照片只好用」變成「刻意選來論證參數化能力」 |

---

## 6. 硬性約束

### 目錄協定
```
.workflow/active/WFS-hq-website-reset/
├── guidance-specification.md   ← 權威規格，只讀
├── CODEX-HANDOFF.md            ← 本文件
├── .brainstorming/{role}/      ← 六份角色分析，只讀
├── .process/                   ← Claude Code 產出，只讀（web-assets/ 可續寫轉檔）
└── codex-out/                  ← Codex 專屬寫入區
    └── STATUS.md               ← 每完成一項就更新
```

**規則**：
1. 每項任務完成後在 `codex-out/STATUS.md` 追加：`[任務ID] [完成/阻塞/需裁決] [時間] [一句話結果] [產出路徑]`
2. Framer 專案同時只有一方操作。開始前標 `FRAMER-LOCK: codex`，結束改 `FRAMER-LOCK: free`
3. **T-3 的 schema 操作不可逆**：建立正式 collection 前 MUST 先回報欄位清單給使用者確認。實驗性 collection MUST 自行清理
4. **不要 push**（repo 歸屬待釐清）
5. **不要修改 `hq-design-website/` 的既有頁面內容或樣式**——本次為整體重建，改舊碼只製造雜訊。例外：§1 T-6 明確指定的 2 條 JSX 路徑 bug 與 token 斷鏈修復

### 品牌約束
產生任何視覺素材前 MUST 讀 `HQ Design - Design System/Claude Design/DESIGN.md`（第 0 節 AI 操作說明、第 3 節色票、第 10 節提示詞庫與 negative prompts）。

明文禁止：新增彩色、霓虹、玻璃擬態、高飽和科技色、任何襯線體、重新發明 LOGO。

已知自家規範被自家程式違反：`pattern-shader.js` 預設角度 `-18`，實際用 `-18/-20/-30`，**全部不在 DESIGN.md §5.1.6 允許的 60/120/30/150 角度族內**。

### 影像使用
- 授權已解除（使用者確認已簽甲方照片協議）
- 但標記「承攬範圍待確認」者（金普頓 FINCH 90 張）**MUST NOT** 在確認前作為自家實績呈現
- 渲染圖與 AI 影像 MUST 依產品角色的 14 條紅線標註來源

### 保密（組織政策，不可違反）
產出中 MUST NOT 出現：客戶個人資料（姓名、聯絡方式、身分證號）、未簽約報價與合約金額、員工薪資與績效資料。

**已知具體風險**：
- NAS **逾 150 個檔名內嵌第三方攝影師姓名與行動電話**（`中保總部 2026/`、`匙碗湯/`、`金普頓/` 等），且 **EXIF `Artist` 欄位同樣含具名**。上網站前 MUST 改檔名並剝除 EXIF 個資欄位。已轉檔的 25 張已改為 `slug-role-序號` 格式
- `作品集-更新版/台北市林宅/` 為住宅案，目錄名含客戶姓氏，已建議排除（定位不符 + 品質不足 + 2 張含可識別住戶物件）
- 選片已標出 7 張含需移除資訊：白板手寫內部工作內容、電腦螢幕、商品標價牌、徵才海報含聯絡資訊
