# design-sync 筆記 — HQ Design

## 這個 repo 不適用 converter

design-sync 的 converter（`package-build.mjs`）需要可 esbuild bundle 的 React 元件庫。HQ 的實況：

- `site/` 是**純靜態 HTML/CSS**（34 頁），無 React、無 `dist/`、無 Storybook
- `package.json` 只有 notion client／cheerio／tsx，不是元件庫
- `HQ Design - Design System/Claude Design/ui_kits/website/components/*.jsx` 有 9 個 JSX，但屬 **Aeonik 舊版**且非 npm package

因此 layout 為**手動產出**（skill 允許：「For a repo genuinely outside the converter's envelope, produce the layout by whatever means the repo allows」）。結果差異：design agent 拿到 **CSS token + HTML 預覽卡**，不是可程式組合的 React 元件——這對純 HTML/CSS 的 HQ 網站是正確的形態。

## 重建方式

`ds-bundle/` 由這一輪對話中的腳本產生，來源：

| 產出 | 來源 |
|---|---|
| `tokens/hq.css` | `site/assets/css/hq.css` 的 `@font-face` + `:root` 三個主題區塊 |
| `tokens/components.css` | 同檔案的其餘規則 **＋ 從 `scripts/site/gen_work.py` 補入的 `.fig`／`data-provenance` 來源標示樣式** |
| `fonts/` | `site/assets/fonts/*.woff2`（Satoshi 官方原檔，**不得 subset 或轉檔**） |
| `components/Foundations/*`、`components/Components/*` | 手寫，示範 token 與元件用法 |
| `components/Pages/*` | `site/` 的 10 個代表頁面，樣式改指 `../../../styles.css`、影像改指 640px 縮圖、站內連結改 `#` |
| `guidelines/facts.md` | 公司簡介 PDF、`cms/data`、`_EXCHANGE/website-asset-manifest.md` |

## 已修的驗證缺陷（勿再犯）

1. **`.fig` 與 `data-provenance` 樣式原本只存在於各案例頁的頁面級 `<style>`**，不在 `hq.css`。若不補進 `tokens/components.css`，design agent 拿到 `styles.css` 後寫 `.fig` 會**完全沒有樣式**——而來源標示是內容政策硬要求。已補 2.7KB 規則。
2. `--brand-pressed`、`--radius-control`、`--radius-mark`、`--hq-ratio-brand-max` 原本只在分析文件提案中，`hq.css` 未定義。已補。
3. `conventions.md` 曾寫「`--radius` 不存在」——驗證器會把它當引用。措辭已改為「系統刻意不提供通用圓角變數」。

## 頁面卡只收 10 頁（非全部 34 頁）

skill 警告 README body 有約 32k 窗口，卡片索引過長會被截斷尾端。10 頁已涵蓋全部版面模式（hero／流程列／對照表／案例卡／名冊列／來源標示／規格表）。要擴充時同步檢查 README 大小。

## 舊專案不動

使用者裁定（2026-09-04）：既有的 HQ Design System 專案（Aeonik + 舊 navy、30 張卡、135 token）**保留不動**，Token 3.0 進新專案。兩套以專案名區隔。

## 待辦

- [ ] 授權：需在互動式 Claude Code session 執行一次 `/design-login`，之後 headless 沿用
- [ ] 授權後：建立新專案 →「HQ 官網重建」→ 記錄 `projectId` 進 `config.json` → `finalize_plan` → 上傳
- [ ] 若要納入全部 34 頁，先評估 README body 的 32k 窗口
