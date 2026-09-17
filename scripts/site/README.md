# site/ 建置與檢查工具

`site/` 為 2026-09 整體重建的靜態站根（Level A 純 HTML/CSS），所有頁面只引用 `site/assets/css/hq.css`（Design Token 3.0）。

| 腳本 | 用途 |
|---|---|
| `check-site.py <site-root>` | 全站檢查：內部斷鏈、hq.css 唯一性、襯線體、emoji、佔位文案、canonical、h1 數量。非零 exit 代表有阻斷項 |
| `gen_work.py` | 從 `.workflow/.../cms-import-payload.json` 重建 `site/work/` 20 頁（案例區 agent 產生器） |
| `build_process.py` | 從 `site/_partials/stages.json` 重建 `site/process/` 8 頁（流程區 agent 產生器） |
| `build_artifact.py <site> <page> <out>` | 將單頁打包為自足 HTML（內嵌 hq.css、Satoshi woff2、該頁圖片）供 Artifact 審閱 |
| `photo_select.py` | 從六組選片 JSON 產生 `photo-selection.json/.md`（每案 ≤10 張、A>B>C、排除 MD5 重複） |

共用片段：`site/_partials/{head,nav,footer}.html` 與 `stages.json`。改片段後以正則整批回寫各頁（見 STATUS.md）。

後台修圖標註：任何案例頁網址加 `?review` 顯示每張圖的 RETOUCH 等級與註記。
