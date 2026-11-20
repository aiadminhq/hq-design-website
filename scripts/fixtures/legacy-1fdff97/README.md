# 歷史 HTML 解析器測試資料

來源為 Git commit `1fdff976f6a7cddf432512be8771329484db4c6a` 的原始 HTML。這些 fixtures 僅測試 rebuild 分支原有的中文模板解析器，不是現行官網文案、客戶事實、認證或面積的資料來源。

原測試直接讀取儲存庫根目錄的 HTML；整合最新英文 main 後，輸入模板改變，因此產生 14 項失敗。保留原本所有斷言並將輸入固定到其支援的歷史模板。新官網另由 `web/tests/`、`web/scripts/check-content.ts` 及 `web/scripts/check-routes.ts` 驗證最新 main 的內容與功能。

舊 `npm run extract` 現在需要明確設定 `HQ_LEGACY_HTML_ROOT`，以避免把新版英文頁誤寫進舊中文 CMS 欄位。不要使用這些 fixture 匯入正式 Notion。
