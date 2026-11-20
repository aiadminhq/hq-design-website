# Satoshi 字體授權與網站使用筆記

核對日期：2026-09-03  
發行方：Indian Type Foundry（透過 Fontshare）  
字體頁：https://www.fontshare.com/fonts/satoshi  
授權頁：https://www.fontshare.com/licenses/itf-ffl  
官方下載：https://api.fontshare.com/v2/fonts/download/satoshi

## 結論

Satoshi 在 Fontshare 標示為 Closed Source，適用 **ITF Free Font License (FFL) Version 2.0 — 17 Aug 2026**。授權明確允許免費的個人與商業用途，也明確允許 licensee 為自己的網站／應用自行託管，並以 CSS `@font-face` 使用。Fontshare API 為選用而非必要。

因此，HQ Design 自有官網的商業使用與 webfont embedding 原則上允許；但尚未把字檔上傳或部署到任何對外網站。

## 必須遵守的限制

- 不得修改、subsetting、format conversion、改 glyph／metrics／font name 或 metadata，除非取得 ITF 書面同意。
- 不得把字體作為 font library、marketplace、下載服務或第三方可選字體提供。
- 外部設計師、agency、contractor 或印刷服務商若需要字體本體，必須自行從 Fontshare 下載並受同一授權約束。
- Framer custom font upload 會把字體交由第三方 SaaS 儲存與服務。雖然網站自用的 self-hosting 明確允許，但「提供字體給外部 service provider」另有禁止條款；正式上傳前建議向 ITF／Fontshare 取得 Framer hosting 情境的書面確認，或評估使用 Fontshare API 避免交付字體檔給第三方平台。

## 可用 styles 與數字特性

- 10 static styles：Light、Light Italic、Regular、Italic、Medium、Medium Italic、Bold、Bold Italic、Black、Black Italic。
- 2 variable fonts：Variable、Variable Italic。
- 504 glyphs、135 languages。
- 預設為 proportional lining figures；另含 **tabular lining figures**，可透過 OpenType `tnum` 用於數據與技術標籤。

## 已取得檔案

- `Satoshi.zip`：Fontshare 官方完整下載包。
- 12 個 WOFF2：10 static＋2 variable。
- `FFL.txt`：官方下載包內附 Version 2.0 授權全文。

建議網站先以 `Satoshi-Variable.woff2` 與 `Satoshi-VariableItalic.woff2` 做 prototype，正式發佈前再依實測決定 variable 或 static 子集；不得自行裁切或轉檔。
