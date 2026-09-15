# Route inventory

## 本次 staging export

| Route | 輸出檔案 | Title | HTTP | Browser read-back |
|---|---|---|---:|---|
| `/` | `index.html` | `Christian's Portfolio` | 200 | body 1,153 chars；0 page error；0 failed request |
| `/old-home` | `subpages/old-home.html` | `Christian Wu` | 200 | body 571 chars；1 canvas；0 page error |
| `/projects/Spatial-Design` | `subpages/projects_Spatial-Design.html` | `Christian Wu - Spatial Design Portfolio` | 200 | body 2,294 chars；0 page error |
| `/404-1` | `subpages/404-1.html` | `Christian's Spatial Design Portfolio` | 200 | body 24 chars；0 page error |
| `/ravenel` | `subpages/ravenel.html` | `Christian Wu` | 200 | body 11,182 chars；0 page error |

`/404-1` 在本次 crawler 與 local server 都是可讀回的 published route，報告不把它改稱為 HTTP 404。`/ravenel` 是 crawler 從 staging 內部連結發現的額外 route。總計為首頁 1 條加 subpages 4 條。

## Crawler evidence

- `--subpages` 已啟用。
- `export.log` 記錄 `Sub-pages crawled: 4`。
- 首頁 capture 記錄 312 個 network resources；下載階段收集 380 個 unique asset requests。
- 4 個 subpage HTML 均已寫入，並記錄 `Sub-pages linked to local assets: 4/4`。
- 本機 server 由產出的 `serve.js` 提供，使用 SPA fallback 對應 `subpages/<slug>.html`。

## Existing Full Site Export comparison

唯讀檢查的 `framer reference/personal-website-now-exact-next` 共 1,174 個檔案、130,211,970 bytes（約 127 MB）；其 README 宣告的 route 只有 `/`、`/old-home`、`/projects/Spatial-Design`。本次 export 為 432 個 FramerExport 生成檔案，另含本次觀察用的 `run.log` 與 `server.log` 兩個檔案，約 37 MB；它另外包含 crawler 發現的 `/404-1` 與 `/ravenel`，以及 `serve.js`、`export.log`、`scripts/vendor`、`scripts/modules` 等輸出結構。
