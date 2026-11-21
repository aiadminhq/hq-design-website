# 視覺提案原始碼（可重建）

- `proposal.template.html` — 提案頁原始碼，含 `{{FONT_SATOSHI}}` `{{IMG:slug}}` `{{ISO:x}}` `{{CMP:x}}` `{{PAT:name}}` 佔位。**改提案改這裡。**
- `assemble.py` — 組裝腳本。資源全部取自 repo：Satoshi Variable 原檔（`.workflow/.../codex-out/satoshi/`）、案例縮圖（由 `site/assets/img/work/<slug>/<slug>-hero-01.jpg` 以 macOS `sips` 產生 720×480，快取在 `thumbs/`，已 gitignore 可不提交）、`figma/` 的四張裁切與 pattern 向量。
- `figma/iso-a.png` `iso-b.png` — 等角 BIM 線稿（Figma 簡介 p07／p08 裁切，示範用；正式站應從 Figma 匯出原檔）。
- `figma/cmp-line.png` `cmp-render.png` — 同一辦公區的線稿與渲染（p32），對照 wipe 示範用。
- `figma/pattern-cc.svg` — 品牌 pattern（Figma node 1073-100220 Variant2），fill=currentColor、已去 id。

```bash
python3 design/proposal/src/assemble.py                    # → design/proposal/hq-design-visual-proposal.html
python3 design/proposal/src/assemble.py design/proposal/hq-design-visual-proposal-v0.4.html
```

組裝後自檢（都應為 0 或只有允許值）：`grep -o "border-radius:[^;}]*" <out> | sort | uniq -c`（只該有 `0`、`var(--radius-control)`、`var(--radius-mark)`）、無 `100vh` 於 CSS、無 emoji、漸層只有 HQ Mesh 四組。
