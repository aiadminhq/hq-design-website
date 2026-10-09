# Extraction and validation

## FramerExport version evidence

GitHub repository：`https://github.com/danbenba/FramerExport`
default branch observed commit：`3b4d7e25332b23609a08b9944bf745016d6e897d`
selected pinned tag：`v5.0.0`
pinned commit：`dc023e74467bd73869aabd45fb55778b0e754059`

GitHub default branch README/package currently advertises `5.0.0-beta.3` and Node `>=20` in its badge, while the selected tag package is `5.0.0`, declares `engines.node >=18`, and builds for Node 20. The run used Node `v22.22.3` and npm `10.9.8`, satisfying both declarations.

Checksum evidence from the pinned source:

```text
package.json      688bb2265499d92dde4961325c6df4dac5fe8ed88e7789dc3c4595a38486d1e2
package-lock.json e5073e17219cf11934d8ecb42c83e4d17376b045fe6cba1743160e3e760d4e03
```

Local installation and checks passed:

```bash
git clone --branch v5.0.0 --depth 1 https://github.com/danbenba/FramerExport.git "$FRAMER_EXPORT_SRC"
cd "$FRAMER_EXPORT_SRC"
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run typecheck
npm test
```

Observed result：`npm ci` passed；build passed；typecheck passed；150 tests passed, 0 failed。

The tool was used from the local checkout, not installed globally. Chromium `127.0.6533.88` was downloaded to a task-specific Puppeteer cache and used through `PUPPETEER_CACHE_DIR`.

## Reproducible export command

```bash
PUPPETEER_CACHE_DIR="$PUPPETEER_CACHE" \
node dist/cli/index.js --subpages \
  https://gracious-successes-409813.framer.app \
  "$FRAMER_EXPORT_OUTPUT"
```

Observed output directory：`/tmp/framer-staging-export.ztMCD8`。FramerExport output contained 432 generated files before adding the two observer logs (`run.log` and `server.log`); the output directory currently contains 434 files total. Main output size is about 37 MB.

## Export result

| Check | Result |
|---|---|
| SSR HTML | 430.7 KB fetched |
| Chromium | launched successfully |
| hydration | complete; SPA rendered |
| resources | 312 captured on homepage; 380 unique asset requests downloaded |
| subpages | 4 crawled and written |
| assets | 406 written; 26 images; 26 fonts; 16 misc |
| scripts | 346 vendor; 8 modules; 44 lazy-loaded chunks resolved |
| downloads | 380 succeeded; 0 failed |
| URL rewrite | 4/4 subpages linked; all URLs rewritten to local paths |
| output | `index.html`, `serve.js`, package.json, `export.log` written |

## Local preview / browser read-back

The generated `serve.js` was started on `http://127.0.0.1:31838`. All five routes returned HTTP 200 with non-empty HTML. Headless browser checks observed a title and body text on all routes, no page errors, and no local asset request failures. The four failed requests were all the expected Framer editor-bar URL beginning with `https://framer.com/edit?framerSiteId=…`, blocked with `net::ERR_BLOCKED_BY_RESPONSE`; they were classified separately and are not download failures.

## Existing exact-copy comparison

唯讀檢查：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/framer reference/personal-website-now-exact-next`。結果為 1,174 files、130,211,970 bytes（約 127 MB），README 明確說明這是 published site 的 exact copy，內容位於 `public/`，route 為 `/`、`/old-home`、`/projects/Spatial-Design`，且不是 editable source。這次 FramerExport 輸出較小，因為它是依 staging runtime/network crawl 收集的 static mirror；它額外發現 `/404-1` 與 `/ravenel`，並生成可本機 preview 的 `serve.js`。

## MCP validation and limits

- `initialize`：成功，protocol `2025-03-26`，server `Framer MCP 1.8.0`。
- `tools/list`：成功，確認 `getProjectWebsiteUrl`、`getProjectXml`、`getNodeXml`、`readCodeFile` 等 read-only tools 可用。
- `getProjectWebsiteUrl`：成功回傳 production `https://christianwu.framer.ai` 與 staging `https://gracious-successes-409813.framer.app`。
- `getProjectXml`：成功回傳 22 pages、231 reusable components、56 Code Components 與 project-level styles sections。
- page XML、selected reusable component XML 與 selected Code Component source 已完成 read-back；部分 dynamic/template nodes 回覆 `Node is not a text node`，因此在 component catalog 中標為 readback-limited。
- `Counter.tsx` 三份 source 已完成 byte-identical 比對；Timeline、Gallery、Clients Card、RetroGrid、Typewriter 與 Blur 系列已取得 near-duplicate evidence，但仍不做 Framer-side merge。
- 本次沒有呼叫任何 update/delete/create/duplicate/CMS mutation/publish tool。

## 未確認項目

1. 部分 dynamic/template pages 與 component nodes 的完整 children XML。
2. 231 reusable components 與 56 Code Components 的逐一 page-reference 對照。
3. near-duplicate groups 是否可由 single semantic component + controlled variants 取代。
4. HQ Design 內容、授權素材、人工 editorial review 與正式交付 approval。
5. static mirror 中 runtime-only behavior 是否可在真正 editable component 中重建。
