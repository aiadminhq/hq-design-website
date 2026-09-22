# HQ Design Framer 官網發布與續作紀錄

檢查日期：2026-09-07，Asia/Taipei。網站已實際 Publish；Framer 發布面板回讀為「No changes」。此紀錄代表已完成內容整合與技術檢查，不代表另一次人工內容定稿。

## 已上線入口

- 中文：https://mobile-empathy-306426.framer.app/
- English：https://mobile-empathy-306426.framer.app/en/
- 作品：https://mobile-empathy-306426.framer.app/projects
- 招募：https://mobile-empathy-306426.framer.app/careers
- Framer：https://framer.com/projects/HQ-Design-Website--iqM3UmTum2Zx9sORaSmy-eIYoV

## 授權與來源

使用者已明確指定以目前 Framer CMS 為續作基準，全部專案不使用 Draft，允許直接 Publish 並回傳 live 網址。此授權取代舊交接文件的全 Draft／Preview-only 限制。

Framer 是此次網站內容與發布的主要來源。Next.js 的中英文資料僅作內容參考；原有 dirty／staged WIP 未由本次任務修改、提交或推送。本次本機產出集中在本資料夾。工作分類為 NO_WORKTREE：雲端網站修改及獨立證據文件，不修改來源程式。

使用者於任務中將舊首頁改名為 `/old-home`，已保留。既有 legacy pages／其他 CMS 沒有刪除。

## 已完成內容

- 首頁、作品索引、公司介紹、服務項目、招募、聯絡等六個主要頁面，以及專案共用內頁與 404 文案。
- Framer 原生中英 Localization 與 Locale Selector；中文主版、英文 `/en/`，共用同一套 Projects CMS。
- Projects CMS 21 筆均為非 Draft；原始 item ID、slug、Year、Size 保留，每案原有兩張 Gallery 圖片保留。
- 專案補入整合敘事、基本資料與媒材說明。7 案為完工實景、13 案為設計視覺化、HQ 辦公室為 AI 視覺增強影像；類型清單見 `media-provenance.json`。
- 起家雞英文品牌改為 CHEOGAJIP。其年份、面積依目前 Framer 值保留，沒有用本機不同年份覆蓋。
- 主要介紹頁的模板素材替換為既有 HQ 專案照片；團隊區改為職能介紹，移除未確認的人名與社群連結。招募頁保留工作方向與職缺待補說明。
- Nav／Footer 使用正式六個路徑；首頁三張精選作品卡片改為各自讀取 CMS 的名稱、位置、簡介與封面。
- 手機首頁標題、選單、語系按鈕、聯絡列、作品卡片封面比例完成修正。Native menu 可展開、關閉並切換語系。
- 保留現有 HQ Logo 與品牌橘色 `#D64518`。中文 Noto Sans TC、英文 Satoshi；透過站台 headEnd 的字體 CSS 補足共用元件字體。
- 主要中英頁面 metadata 已設定，Framer 產生 canonical／hreflang。主要頁面非空字串的未翻譯清單回讀為零；此結果不涵蓋未納入導覽的 legacy 模板頁面。

## 技術檢查與證據

| 檢查 | 結果與限制 |
| --- | --- |
| 公開網址 | 6 個主頁 + 21 個專案 × 中英，54 個網址均 HTTP 200；專案名稱符合各語系 |
| 搜尋引擎頁面 | 54 個網址以 crawler User-Agent 回讀，語系、canonical、hreflang 與標題均存在且符合路徑 |
| 響應式頁面 | 6 個主頁 × 中英 × 390／900／1440 px，共 36 組；均無頁面橫向溢出 |
| 視覺檢查 | 實際檢視手機首頁、手機選單、手機作品卡、英文 Kimpton 內頁、聯絡、招募、服務及公司介紹畫面；不是逐張圖集的人工審美核可 |
| 圖片 | 已載入圖片檢查無破圖；未滾動至的 lazy images 不視為已載入證據。Kimpton EN 內頁兩張圖集已實際載入 |
| CMS 完整性 | 21 筆、0 Draft、ID／slug／Year／Size 保留、每案 Gallery 2 張 |
| 導覽 | 手機選單可開關；原生語系切換由 `/projects` 到 `/en/projects`，兩版均 21 案 |
| 發布 | 原生 Framer Publish 已執行；面板為 No changes。表單收件驗證警示仍存在 |

Framer 使用首次瀏覽後預先渲染與快取的機制。一般第一次 HTTP 請求曾取得較精簡的載入頁，crawler 回讀則取得完整語系頁面；不能用該次載入頁誤判內容未發布。參考：[Framer Traffic-aware Pre-Rendering](https://www.framer.com/help/articles/dynamic-optimization/)。

最後圖集 alt text 已在 public browser 回讀為 `HQ Design project image`，沒有再顯示變數字串。`public-route-audit.json` 的 `galleryAltUpdated` 是 crawler 既有優化快取的字串檢查，不能用其 false 值取代之後的 live browser 回讀。

## 唯一待人工處理項目：聯絡表單收件驗證

Native Form 的 Send To 已設為 `info@hqdesign.tw`，但 Framer 顯示 Unverified Form Recipient。表單在 Desktop／Tablet／Phone 均暫停顯示，公開頁面仍有有效的 `mailto:info@hqdesign.tw` 與電話入口。

本次沒有寄送測試信或代為按下寄發驗證信，也沒有宣稱表單已可收件。使用者已收到待驗證提示，尚未回覆完成。

信箱管理者完成 Framer 驗證後，續作程序如下：

1. 在 Framer 原生 Form 設定確認 `info@hqdesign.tw` 驗證完成。
2. 回讀 `/contact`，確認 form container 與各 breakpoint；不要直接依舊 ID 盲改。
3. 恢復表單顯示，核對手機有 Project brief 欄位及按鈕順序，再 Publish。
4. 實際寄送／測試郵件前取得該動作的授權；以信箱收件證據確認完成。

參考節點：Contact page `C3f3XeUfC`；Form `zFmlS5Q3z`；容器 `W1cEFaOZU`；Tablet replica `NYHcUkaWmW1cEFaOZU`；Phone replica `dPY0eLIijW1cEFaOZU`。目前三者 `visible=false`。

## Proofly 連線續作

Proofly Always-on 已實際用於此次 headless 讀取與修改；不需維持 Unframer 啟用。使用者已在 Proofly 登記 Framer API key。此文件不保存憑證，續作從既有安全設定取得。

Proofly 的 `framer_apply` 回應 `applied=true` 後，可能附帶不支援的 `reviewChangesForAgent` 方法錯誤；實際結果已另以 inspect 與公開網站回讀。這不是人工批准或拒絕紀錄。

Proofly 的直接 deploy 功能曾回覆 Pro 方案限制，因此本次透過原生 Framer UI 發布，沒有升級或付費。

## 證據檔案

- `cms-before.json`／`cms-after.json`：CMS 修改前後快照。
- `cms-integrity.json`：ID、slug、Year、Size、Draft 與 Gallery 完整性。
- `project-before.txt`／`project-after.txt`：專案結構快照。
- `nav-before.xml`：導覽修改前快照。
- `public-route-audit.json`：54 個中英文路徑的回應與 metadata。
- `responsive-audit.json`：36 組頁面／尺寸檢查與限制。
- `seo-after.json`：主要頁面 metadata 設定。
- `media-provenance.json`：21 案媒材分類。

下一輪內容更新由使用者提供實際職缺及新增專案資料後，直接延續目前 Framer CMS；不要重建另一套資料庫或回復全 Draft。
