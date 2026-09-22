# 舊站 SEO 層（legacy static site）

`apply_seo_layer.py` 只改 `<head>`：補 canonical、依目前的 `<title>` 與 description 重新產生 Open Graph／Twitter meta、在兩個首頁維護 JSON-LD Organization、修補被截斷的檔尾。**不會動頁面正文、標題、描述、hreflang 或 GA4。**

手動改完任何頁面的標題或描述之後，重跑一次即可同步：

```bash
python3 scripts/legacy-seo/apply_seo_layer.py          # 套用
python3 scripts/legacy-seo/apply_seo_layer.py --check  # CI 用：有未同步的頁面就 exit 1
```

`.github/workflows/html-guard.yml` 會在每次 push／PR 檢查所有頁面都有 `</html>` 且不小於 2 KB，並跑 `--check`。2026-09-21 PR #13 曾把 34 頁覆寫成 11 行殘檔並上線約一小時，這個守衛就是為了不再發生。
