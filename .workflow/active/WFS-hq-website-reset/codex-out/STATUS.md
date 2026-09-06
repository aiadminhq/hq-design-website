# Codex 任務狀態

格式：`[任務ID] [完成/阻塞/需裁決] [時間] [一句話結果] [產出路徑]`

FRAMER-LOCK: free
接手時間：2026-09-03｜目標時限：20:10

## Codex 已完成
- [x] **T-1 版控搶救已完成** — commit `f3b7eb1`（cms/ docs/ scripts/ robots.txt sitemap.xml llms.txt）、`e1b3692`（舊站 SEO metadata）、`46e2954`（Framer toolkit）。cms/ 35/36、docs/ 4/5、scripts/ 13/13 已納入版控
- [x] Framer Plugin 原始碼建立並通過 check → `tools/hq-design-toolkit/`
- [x] Framer 連線檢查（查明被 reload 提示阻塞）→ `FRAMER-CONNECTION.md`
- [x] repo 歸屬盤點（兩 repo 同源同 commit）→ `REPO-OWNERSHIP.md`
- [x] Unframer 專案讀回（13 頁、密鑰遮罩處理）→ `UNFRAMER-PROJECT-READBACK.md`
- [x] Framer Agent 六項工作技能規劃 → `FRAMER-AGENT-SKILL-PLAN.md`

## ⚠️ Claude 交接前最後兩個修復，尚未 commit

兩者皆為**既有損壞**（git HEAD 版本亦有問題），非本次改動造成：

| 檔案 | 修復內容 | 證據 |
|---|---|---|
| `about.html` | 移除尾端 **25 個 NUL byte**（`0x00`）。修復前 `file` 判為 `data` 而非 HTML、`grep` 視為 binary 無法讀取 | `git show HEAD:about.html` 亦含 25 個 NUL |
| `index.html` | `<html lang="en">` → `<html lang="zh-TW">`。原本是 27 頁中唯一的 `en`，與已改為中文的 title／description／JSON-LD 及其餘 26 頁不一致；SEO 與 GEO 分析皆判定為最嚴重單點問題之一。已在檔內加註解說明 body 仍為英文文案、重建時應改中文為主並以局部 `lang="en"` 標記英文段落 | GEO 分析 §4.6 實測 |

**請 Codex 一併 commit**（訊息建議：`fix: remove NUL bytes in about.html and align index lang to zh-TW`）。

## 方向轉變（使用者 2026-09-03）
> 「我想越快看到整個全新網站設計，而不是在糾結這些素材。」
> **素材整理告一段落，轉向設計產出。** 已裁定：SECOM 南港總部面積 = **5,940 sqm**（cms 已更新為 1,797 坪）。

### 已發布 Artifact（自建站 site/ 打包版）
- 首頁 v2：https://claude.ai/code/artifact/80c164ef-ab24-4bbd-98f7-f4abc9202a10
- 流程總覽：https://claude.ai/code/artifact/beaddfc7-8820-49cf-9ecd-154f755d34af
- 02 參數化階段頁（SEO M4 落地）：https://claude.ai/code/artifact/fb1745e5-5dda-4a14-92f6-2e4a4ac4e582
- 實績列表 **v2（33 案）**：https://claude.ai/code/artifact/44938974-8f24-49bf-b010-2137614e54c9
- 中保科技展示廳（示範 AI 重製標示）：https://claude.ai/code/artifact/b33c20d9-ae7d-455e-8420-f01b424e1413
- SECOM 旗艦案例頁：https://claude.ai/code/artifact/264f2a2b-d0c8-48e9-89a0-b93b962b88b3
- 打包工具：scratchpad `build_artifact.py <site> <page> <out>`（內嵌 hq.css／woff2／該頁圖片）
- ⚠️ Artifact 內的站內連結（/work/…）不會跳轉，僅供單頁審閱；完整導覽需 Vercel preview
- **原始檔**：scratchpad `hq-home.html`（853KB，純 HTML/CSS，Level A——Framer 必可承載）
- 內容：Token 3.0 色彩／字級、Satoshi（內嵌 woff2）× Noto Sans TC × Geist Mono、七段流程、AI 對照表、三項優勢、6 個真實實拍案例（含 AS-BUILT 來源標示）、雙主題、reduced-motion
- **這份原型是 Framer 重建的視覉規格參考**：Codex 在 Framer 內套版時，以此為 hero／對照表／流程列／案例格的結構與間距依據
- ⚠️ 原型中的 Satoshi 是內嵌 woff2（Artifact CSP 限制）；**Framer 端直接用內建 `FS;Satoshi`，不要上傳字檔**

## /goal 宣告（2026-09-03）：全站自建
- 路線：**自建靜態站 `hq-design-website/site/`**（Framer 受阻，使用者授權自建；ADR-001 保留不阻塞）
- 共用系統：`site/assets/css/hq.css`（Token 3.0）——**所有頁面只引用此檔**
- 照片：`site/assets/img/work/<slug>/`（93 張）；字體：`site/assets/fonts/`（Satoshi 官方 woff2，不 subset）
- 步驟：①site/ 與 hq.css ✅ → ②流程區 ✅（8 頁）／案例區 ✅（20 頁）→ ③about/services/contact/404 ✅ → ④驗證 ✅（34 頁 0 阻斷）＋Artifact ✅（5 頁）＋Vercel preview **待使用者同意**
- 檢查工具：`.process/check-site.py <site>`（斷鏈／hq.css 唯一性／襯線／emoji／佔位文案／canonical／h1）
- **Codex 的 Framer 任務（T-3／T-5）降為 P2**：等自建站定案後，再以 `site/` 為視覺規格套 Framer

## 待辦（依價值／時間比）
- [ ] T-2  磁碟急救（僅剩 1.0 GiB；Danelec/PDF 518MB 需使用者確認）⛔ 10 分鐘
- [ ] T-3  Framer 專案裁決（Nyro copy vs 新建）→ MCP 重連 → array 欄位實測 ⛔ 需裁決後才能動
- [ ] T-3.5 ⛔ **U-G1 數字矛盾裁定**（阻擋 llms.txt 發布與 GEO 內容）：SECOM 2,500 vs 5,940 sqm／志聖 700 vs 560 sqm／惠強室內「裝修」vs「設計」／年資 30 vs 31
- [ ] T-3.6 ⛔ **部署驗證**：live 站 `/robots.txt`、`/sitemap.xml`、`/llms.txt` 目前**三者皆 404**（`/` 回 200）。repo 有檔 ≠ 已上線
- [ ] T-4  GEO 基線記錄（15 題 × 4 介面；自動化與否請先問使用者）
- [ ] T-5  Framer template 候選蒐集
- [ ] T-6  P1：Figma P02 匯出／shader 實機量測／Unframer spike（⛔ 原列的「2 條 JSX 路徑 bug」與「token 斷鏈修復」已撤銷，實測證明兩者皆不存在，見交接書 §3.5）

## 阻塞中（需使用者操作）
- Plugin dev：`mkcert -install` 需管理員密碼（Codex 未代填，正確）
- Claude CLI 的 `framer` MCP 待核准
- Framer 專案歸屬未裁決 → MCP 無法連

## 已解除（不必做）
- [x] Satoshi 授權 — Framer 內建字體（`FS;` 前綴 12 變體），疑慮不成立
- [x] 影像授權 — 使用者確認已簽甲方照片協議
- [x] AI 爬蟲政策 — 使用者明確要求完全不封鎖，robots.txt 已 24 個具名 Allow、零 Disallow
- [x] 13 個純渲染案的實拍搜尋 — 已確定 NAS 沒有，只能重拍

---

（Codex 續寫於此）

## 待辦追加（自建站）
- [ ] **SEO slug 對映**：SEO 分析用 `/process/validation`、`/documentation`、`/delivery-ai-pm`；實作以 `stages.json` 為準（`technical-validation`／`construction-docs`／`delivery`）。上線時對 SEO 版路徑設 301，或更新 SEO 文件。
- [ ] **og:image**：流程頁除 07 外無圖；待 F-005 圖解或案例圖補上
- [ ] **hreflang**：`/en/` 尚不存在，暫不加
- [x] `HQdesign/.claude/launch.json` 已清除

## 案例區 agent 的發現（需使用者確認，已列入裁決清單）
- **Diptych 歸屬疑慮**：`cms/data/projects/zhongbao-showroom.json` 的 17 張渲染圖（智慧共桿、2005–2025 時間軸牆、電梯廳）看起來是 **zhongbao-smart-facility（中國科大訓練基地）** 的設計圖，不是大安店。若屬實，真正「同時有渲染＋實拍」可做對照的是智慧基地，Diptych 應移過去。
- **zhongbao-smart-facility 地點**：先前建議「新北市」有誤（中國科大校區在台北文山或新竹湖口），頁面已移除地點列，待填。
- **起家雞英文品牌名**：首頁原寫 bb.q Chicken（Claude 誤植）；cms `client` 欄為空，「Chicken Up」出處待查證。
- **17 張直幅原圖**被 CSS 中央裁成 3:2（kimpton 5、guochan-showroom 5、popeyes 2…），`?review` 模式可見標記；正式版可能需人工指定裁切焦點。
- **後台修圖標註已實作**：任何案例頁網址加 `?review` 即顯示每張圖的 RETOUCH 等級與註記（heavy 為品牌色）。
- payload `local_path` 錯位（Claude 的 bug）已修正並驗證 19 案 0 缺檔。

## 建置工具已入 repo
`scripts/site/`：check-site.py／gen_work.py／build_process.py／build_artifact.py／photo_select.py + README。**未 commit**，請 Codex 一併納入。

## 2026-09-04：AI 重製視覺併入網站（14 案）

**來源**：`_EXCHANGE/website-asset-manifest.md`（前一 session 依 Figma 公司簡介實際採用照片回推）＋ `_EXCHANGE/ai-renders/v3/*.png` 33 個母檔。

- **匯入 33 張 2560px** 至 `site/assets/img/work/`，涵蓋 14 個先前判定「無實拍、只能重拍」的案例：polytron／aiontech／csun／liwei／xinlan／zhongbao-tianhe／zhongbao-jingzhen／zhongbao-baojing／epicstech-10f／lijie／ledaojia／baohua／zhongbao-showroom／hq-office
- **面積與年份由 manifest 補齊**（50–850 sqm、2024–2026），英文正式名亦以 manifest 為準（如 CHING DIAN TECH、LOTS HOME ENTERTAINMENT）
- **新增兩種來源標示**：`設計提案視覺 · DESIGN VISUALISATION`（12 案）與 `實拍 · AI 光影強化 · AI-ENHANCED`（hq-office）。四種標示現皆有獨立 `data-provenance`
- **列表頁新增獨立分區**「設計提案視覺」，與完工實景**分區呈現不混排**；hero 文案已改為「每張影像都標示來源」，不再宣稱全為完工實景
- 全站 **48 頁、0 阻斷**

### 已解決的既有待決事項
- **Diptych 歸屬**：`zhongbao-showroom` 的 17 張渲染圖確認屬「**中保科技展示廳 SECOM TECHNOLOGY HALL**」（南港，331 sqm，2025），非大安店。案例區 agent 的懷疑成立
- **中保保經名稱**：manifest 用「中保保經 ZHONG BAO INSURANCE」，與 cms 一致；PDF 的「眾寶保經」為異常值

### 新增待確認
1. **`zhongbao-showroom`（中保科技展示廳，南港 331 sqm）與 `zhongbao-smart-facility`（中國科大訓練基地，5 張 A 級實拍）是否為兩個不同案子？** 兩者都是中保集團的展示／訓練空間，命名易混淆
2. **33 張 AI 圖的 alt 待人工判讀**：目前為「〈案名〉｜室內空間設計提案視覺」這類準確但不具體的描述（僅展示廳與 hq-office 兩案有具體 alt）。SEO/GEO 分析指出 alt 需有資訊量
3. **2K 批次（10 張）做 2560 hero 解析度不足**（manifest §4-2 已列），目前已放大至 2560 但實際細節僅 2752px 級
4. **SECOM 子頁面積**：manifest 第 13、16 頁沿用母案 5,940 sqm，若拆獨立頁需補各自面積
