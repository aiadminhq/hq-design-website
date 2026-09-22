# PR #20 合併紀錄與給 Alex 的交接

> 日期 2026-09-22 · 撰寫：Claude（session 分支 `feat/geo-seo`）
> PR：https://github.com/aiadminhq/hq-design-website/pull/20（開啟中，未合併，MERGEABLE／CLEAN）
> 目的：把 `feat/geo-seo` 與 `feat/legacy-seo-layer`（PR #15）合併成一個可審閱的整體，交給 Alex 轉給 Grok 挑選要合併進 `main` 的部分。**這份 PR 不是要求直接合併**。

---

## 1. 背景

`feat/geo-seo` 是這個工作目錄長期使用的分支，累積了大量已完成但未提交的工作：依照 [`design/HANDOFF-web-design-fable-to-codex.md`](HANDOFF-web-design-fable-to-codex.md) 實作的完整 Next.js 官網（`web/`）。同時 `main` 由 Alex 持續手動編輯舊站，`feat/legacy-seo-layer`（PR #15）則是專門補強舊站 SEO head 標籤的獨立分支。

使用者要求把這兩條線合併起來，產出一份可以複製貼上給 Alex、再轉給 Grok 審閱的摘要，而不是由我直接合併進 `main`。

---

## 2. 做了什麼（技術摘要）

### 2.1 提交既有的未提交工作

工作目錄在 `feat/geo-seo` 分支上累積了大量已完成但未提交的變更，分成四個邏輯清楚的 commit 提交：

| Commit    | 內容                                                                                                                                                                                                                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `82d6eb2` | Next.js app 骨架與內容管線（i18n routing、content loader、site 常數、legacy-redirects、影像 loader、sync-ds／build-images 腳本、個資閘門）                                                                                                                                                         |
| `5eb9bbf` | 依設計交接文件實作的 UI 元件與頁面：`site-nav`、`title-block`、`scroll-zoom-scene`、`work-browser`、`project-card`、`gallery`、`process-tracks`、`model-space`、`contact-brief`、`page-heading`、`site-footer`、`brand-pattern`、`HqUnfocusedMesh`；以及品牌 logo SVG（首次提交，過去官網零 logo） |
| `4eae1b9` | 內容審核追蹤（`content/NEEDS-REVIEW.json`）、本機一鍵預覽工具（`design/LOCAL-WEBSITE-HANDOFF.md`、`design/deployment/`、`design/testing/`）、Framer 整合稽核紀錄（`codex-out/`）                                                                                                                   |
| `c8c1c7f` | 頁面樣式（`globals.css` 新增 1,611 行）、影像 loader 改讀真實 manifest 寬度、`next.config.ts` 路徑修正                                                                                                                                                                                             |

提交前已掃描 `web/public/`（582 張 webp、logo SVG、字體）確認無 EXIF／XMP 殘留、無第三方姓名或電話號碼樣式的檔名，符合個資排除原則。

### 2.2 合併 `main`（77 個新 commit）

`feat/geo-seo` 的基準（`94e8e25`）已經落後現在的 `main`（`fd5d5e1`）77 個 commit，涵蓋品牌改名為「HQ Design」、英文根層＋`/zh/` 繁中分站、GA4 與 Search Console、國際夥伴頁等。

合併時 10 個舊站頁面衝突（`about.html`、`careers.html`、`contact.html`、`index.html`、`projects.html`、`projects/kimpton.html`、`projects/secom-nangang-complex.html`、`robots.txt`、`services.html`、`sitemap.xml`）**一律採 `main` 的版本**——Alex 手動編輯舊站，`main` 是內容權威，`feat/geo-seo` 的真正貢獻在 `web/`、`content/`、`design/`，不在這些檔案本身。

### 2.3 合併 `feat/legacy-seo-layer`（PR #15）

PR #15 的 HTML 修改是基於較舊的 `main`（`84a6615`），若直接文字合併會覆蓋掉上一步剛採用的 `main` 最新內容。因此**沒有做文字合併**：保留剛合併好的 `main` 最新內容，改為重新執行 PR #15 附的可重跑腳本 `scripts/legacy-seo/apply_seo_layer.py`，針對目前內容重新產生 SEO head 層。結果是每一頁都同時擁有 Alex 的最新文案與完整的 canonical／Open Graph／Twitter／JSON-LD 標籤。也一併帶入 `.github/workflows/html-guard.yml`（防止 9/21 那次「34 頁被清成 11 行殘檔並上線」事故再發生的守衛）。

### 2.4 驗證

在 `web/` 目錄下執行並確認全數通過：

```
npm run build       # 105 個靜態頁全部產出，/zh 與 /en 雙語
npm run typecheck   # 無型別錯誤
npm run gates       # token 同步驗證、個資閘門（721 檔名／84 文字檔／582 張影像）、
                     # 內容閘門（33 案、7 道檢查）全數通過
```

腳本 `apply_seo_layer.py` 的冪等性（重跑第二次應無變化）也已驗證。

### 2.5 推送與開 PR

推送 `feat/geo-seo` 到 `origin`，開 [PR #20](https://github.com/aiadminhq/hq-design-website/pull/20)：22 個 commit、641 個檔案、+73,832 −3 行。GitHub 回報 `MERGEABLE`／`CLEAN`，Vercel 部署、Vercel Preview Comments、HTML guard 三項檢查全過。

本地另留一個 `feat/geo-seo-checkpoint` 分支，是合併前的原始狀態，**未推送**，純粹當作安全備份。

---

## 3. PR #20 的三個獨立部分

| 部分                                             | 內容                                                                                                                                          | 是否影響現有 `main`                                                |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **1. 全新 Next.js 官網**（`web/`）               | 首頁捲動拼貼、實績列表與篩選、案例詳情頁、七段流程頁、模型空間互動、聯絡表單、圖名框／尺寸線等原創介面裝置；品牌 logo／favicon／OG 圖首次補齊 | 否，獨立目錄，未接上網域前不影響現有靜態頁                         |
| **2. 舊站 SEO 層**（來自 PR #15，已跟上 `main`） | 35 頁 `<head>` 補 og／twitter／canonical，兩個首頁加 JSON-LD；`llms.txt` 對齊「31+ 年」；可重跑腳本＋HTML 守衛                                | 是，但**頁面正文、標題、描述、GA4 一個字沒動**，每頁差異在 10 行內 |
| **3. 內容層與設計文件**                          | `content/` 33 案結構化資料與 7 段流程文案、`design/` 視覺提案與交接文件                                                                       | 否，新目錄                                                         |

---

## 4. 待決事項（非本 PR 範圍，列出供裁定）

- **年資寫法不一致**：部分 `content/` 文案仍寫 30+ 年，`llms.txt`／`main` 現在的頁面是 31+ 年。
- **SECOM 南港總部面積**：`content/projects/secom-nangang-complex.json` 記錄 5,940 sqm／1,797 坪（已驗證），`main` 上舊站頁面顯示 6,000 sqm／1,800 坪。
- `projects/zhongbao-nangang.html` 沒有 GA4 追蹤碼（Alex 先前的緊急修復沒有觸及這頁）。

---

## 5. 複製貼上給 Alex 的訊息

```
Fable/Claude 這邊把兩個分支（feat/geo-seo、feat/legacy-seo-layer）合併好了，開在 PR #20：
https://github.com/aiadminhq/hq-design-website/pull/20

這不是要你直接合併，是給 Grok 審閱、挑要的部分。裡面有三塊，彼此獨立：

1. 全新 Next.js 官網（web/ 目錄）：本機已驗證 build、typecheck、內容與個資閘門全過，105 頁靜態產出，品牌 logo/favicon/OG 圖也終於補上了。這塊完全獨立在 web/ 目錄，不會動到現在 main 上的舊站頁面。

2. 舊站的 SEO 補強（scripts/legacy-seo/、.github/workflows/html-guard.yml）：所有 about.html、projects/*.html 這些舊站頁面內容跟現在 main 上一模一樣，只在 <head> 多加了 Open Graph、Twitter 卡片、canonical 標籤。想快速看差異可以跑：
   git diff main...feat/geo-seo -- '*.html' 'projects/*.html' 'zh/*.html'
   每頁改動都在 10 行內。另外加了一個 GitHub Actions 守衛，之後任何 PR 如果把頁面清空（像 9/21 那次 GA4 事故）會直接擋下來。

3. 內容資料與設計文件（content/、design/）：33 個案例的結構化資料、視覺設計提案，給後續開發參考用。

想先看哪一塊都可以，這三塊互不依賴。有兩件事還沒統一，麻煩你們定案：
- 年資寫法：部分內容還是 30+ 年，跟現在 main/llms.txt 的 31+ 年不一致
- SECOM 南港總部面積：內容資料是 5,940 sqm/1,797 坪，main 上舊站頁面寫 6,000 sqm/1,800 坪
```
