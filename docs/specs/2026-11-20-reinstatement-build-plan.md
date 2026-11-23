# 退租復原工程｜中文頁實作計畫

- 文件狀態：實作計畫（對應規格 `2026-11-20-reinstatement-service-spec.md` v0.2，加上規格之後的最新決定）
- 建立日期：2026-11-20
- 範圍：只做中文頁的新檔案。**不修改任何既有檔案、不 commit、不 push、不部署**。

---

## 0. 以最新決定為準的差異（覆蓋規格）

| 項目                | 規格寫法         | 本次實作                                                |
| ------------------- | ---------------- | ------------------------------------------------------- |
| AI 照片標示（§6.1） | 要標示           | **取消**，頁面不放任何 AI 標示                          |
| LINE                | 不用 LINE 收資料 | 新頁面任何地方都不出現 LINE                             |
| 照片上傳            | 第二階段         | 不做；表單只寫「聯絡時再跟你索取」                      |
| Hero after 圖       | 待決定           | 先用真實還原照（暫時圖），HTML 註解標「暫時圖，待替換」 |
| 表單                | 兩步             | 兩步，各送一次 Formspree，用同一個 `ref_id` 串接        |

---

## 1. 檔案清單

新建（全部是新檔，不動既有檔）：

| 檔案                                                                 | 用途                                                        |
| -------------------------------------------------------------------- | ----------------------------------------------------------- |
| `services/reinstatement.html`                                        | 服務頁（8 個區塊 + FAQ）                                    |
| `reinstatement-request.html`                                         | 兩步需求表單                                                |
| `reinstatement-thanks.html`                                          | 感謝頁（`noindex`）                                         |
| `assets/css/reinstatement.css`                                       | 三頁共用的新增樣式，class 一律 `rs-` 開頭，不覆蓋既有 class |
| `assets/js/reinstatement-compare.js`                                 | 前後對照滑桿與場景切換                                      |
| `assets/js/reinstatement-form.js`                                    | 兩步表單：`ref_id`、驗證、fetch 送出、條件欄位、多據點      |
| `assets/js/reinstatement-thanks.js`                                  | 感謝頁顯示參考編號                                          |
| `assets/images/reinstatement/secom7f-0N-before.webp` / `-after.webp` | 4 組前後對照圖（1600×1067）                                 |

`services/` 是新資料夾，頁面內的路徑一律用 `../`（做法同 `projects/*.html`）。

---

## 2. 沿用的既有樣式與結構

三頁都載入 `assets/css/style.css` 與 `assets/js/main.js`，再加 `reinstatement.css`。

- **Nav／Footer**：整段照 `services.html` 的 HTML（logo、四個連結、`聯繫我們 Contact` 按鈕、hamburger、四欄 footer）。服務頁的 nav 把「服務項目 Services」標成 `active`。
- **色彩與字體**：只用 `style.css` 的 `:root` 變數（`--brand`、`--accent`、`--bg`、`--border`、`--mid`、`--font-zh`、`--font-en`、`--radius`）。不新增顏色。
- **直接沿用的元件**：`.container`、`.section`、`.section-sm`、`.section-title`、`.label`、`.btn`／`.btn-primary`／`.btn-outline`／`.btn-outline-dark`、`.page-hero`（表單頁、感謝頁）、`.process-steps`／`.step`／`.step-circle`（流程 5 步）、`.cta-banner`（結尾 CTA）、`.form-group`／`.form-row`／`.contact-form`（表單欄位）。
- **新增的 `rs-` 元件**：Hero 兩欄版面、對照滑桿、場景切換鈕、痛點卡片、做／不動兩欄、清單、交付卡片、FAQ（`<details>`）、進度條、單選膠囊、拆除項目列、提示與錯誤訊息。外觀比照既有卡片：白底、1px `--border`、4px 圓角、13–14px 內文。
- **無障礙補強（只作用在新頁面）**：既有樣式的次要文字色 `--light`（#9A9A9A）在白底對比不足，新頁面的內文一律用 `--mid` 以上；所有可互動元件加 `:focus-visible` 外框；所有欄位都有 `<label for>`；錯誤訊息用 `role="alert"`。

---

## 3. 服務頁 `services/reinstatement.html`

### 3.1 SEO／結構化資料

- `<title>`：退租復原工程｜辦公室退租拆除、原狀回復、陪同點交 — 惠強室內裝修 HQ Design
- description：辦公室租約到期要搬離？惠強室內裝修提供退租復原工程：拆除、還原、合法清運、清潔、陪同房東點交。先留下聯絡方式，我們會聯絡你。
- canonical：`https://www.hqdesign.tw/services/reinstatement.html`
- JSON-LD：`WebPage`、`BreadcrumbList`（首頁 → 服務項目 → 退租復原工程）、`Service`（provider 指向既有 `#organization`）、`FAQPage`（8 題）。
- 關鍵字自然寫進內文：退租復原、辦公室退租復原、原狀回復、辦公室拆除還原、押金、點交。

### 3.2 區塊與文案草稿

**① Hero：前後對照**

- label：Office Reinstatement
- H1：租約到期前，幫你把辦公室還給房東
- 副標：拆除、還原、清運、陪同點交，一次處理。你不需要懂工程，告訴我們什麼時候要搬就好。
- CTA：留下聯絡方式 →　／　次要連結：先看流程
- 右側（手機在下方）：對照滑桿，左邊「完工時」、右邊「復原後」；下方 4 個場景切換鈕；圖說「實際案例：中興保全南港總部 7 樓」。

**② 你是不是遇到這些問題**（4 張卡）

1. 租約快到期，不知道從哪裡開始 —— 要找誰、要多久、要先做什麼，沒有人說得清楚。
2. 不確定哪些要拆、哪些是房東的 —— 天花板、燈具、冷氣，有些是你裝的，有些本來就在。拆錯要賠。
3. 擔心押金被扣 —— 房東點交時才說「這裡沒還原」，押金就卡住了。
4. 大樓只准晚上或假日施工 —— 施工時段、噪音、垃圾怎麼運，每棟大樓規定都不一樣。

**③ 我們做什麼／不動什麼**

- 我們做：拆除隔間與裝修／還原房東指定的項目／廢棄物合法清運／完工清潔／陪同點交（各附一句白話說明）
- 我們不動：房東財產。常見的有天花板、燈具、冷氣風機、窗簾。施工前先在現場標記，跟你確認後才動工。
- 補一句：任何辦公室都接，不限我們裝修過的。

**④ 流程（5 步）**

1. 留下聯絡方式 —— 填姓名、公司、電話或 Email。
2. 現場勘查 —— 到現場量尺寸、拍照，確認要拆什麼、要留什麼。
3. 報價與工期 —— 依坪數與項目報價，告訴你要做幾天。
4. 施工 —— 照大樓規定的時段施工與清運。
5. 陪同點交 —— 跟你一起和房東逐項檢查。

**⑤ 你需要準備什麼**（有就給，沒有我們幫你找）

現況照片（手機拍即可）／當初承租時的照片或點交紀錄／房東還原清單、租約的還原條款／原始圖面（竣工圖、室裝圖）／大樓施工規範。
結尾：一樣都沒有也沒關係，現勘時我們會現場丈量，也可以幫你跟房東或大樓管理單位確認。

**⑥ 你會拿到什麼**

施工前後對照照片／廢棄物清運證明／點交紀錄（各一句用途說明：留底、交差、給總公司）。

**⑦ FAQ**（規格 §9 的 8 題，完整回答寫在 HTML，並同步到 `FAQPage`）

**⑧ 結尾 CTA**

- 標題：離租約到期還有多久？
- 內文：先留下聯絡方式，我們會聯絡你。
- 按鈕：留下聯絡方式 →；下方電話與 Email。

文案規則：不寫價格、不寫現勘費、不承諾回覆時效（規格 §12 第 2 題未定）、不寫服務區域（§12 第 3 題未定）、不寫保固承諾（§12 第 4 題未定）。

### 3.3 前後對照滑桿做法

- HTML：每個場景一個 `<figure class="rs-compare">`，裡面兩張 `<img>`（都寫 `width="1600" height="1067"`，容器用 `aspect-ratio: 3/2`，不會跳版）。下層是 after，上層 before 用 `clip-path: inset(0 calc(100% - var(--pos)) 0 0)` 裁切。
- 操作：
  - 滑鼠／觸控：容器上用 Pointer Events（`setPointerCapture`），`touch-action: pan-y`，手機上下捲動不受影響。
  - 鍵盤：每個滑桿有一個 `<input type="range">`（視覺上隱藏但可聚焦），左右鍵每次 2%，Home／End 到底；聚焦時把手顯示外框。`aria-label` 與 `aria-valuetext` 寫明「完工時 xx%」。
- 場景切換：4 顆按鈕（`aria-pressed`），一次只顯示一組；其他組的圖片 `loading="lazy"`。
- 沒有 JavaScript 時：4 組都顯示，固定各一半。
- `prefers-reduced-motion`：不做過場動畫。

### 3.4 照片

| 組  | 場景       | before（完工照）                 | after（**暫時圖**，真實還原照） |
| --- | ---------- | -------------------------------- | ------------------------------- |
| 01  | 接待櫃檯   | `賴壽山攝影0936 936 119-006.jpg` | `IMG_0493.heic`                 |
| 02  | 大會議室   | `…119-026.jpg`                   | `IMG_0485.heic`                 |
| 03  | 窗邊休憩區 | `…119-022.jpg`                   | `IMG_0492.heic`                 |
| 04  | 玻璃會議室 | `…119-023.jpg`                   | `IMG_0499.heic`                 |

- 處理：轉正、等比縮放後置中裁成 1600×1067（3:2）、去除 EXIF（含 GPS）、WebP 品質 80。after 原圖是 16:9，左右各裁掉一些。
- 檔名：`assets/images/reinstatement/secom7f-0N-before.webp`、`secom7f-0N-after.webp`。
- **替換方式**：AI 對齊版完成後，用同檔名、同尺寸（1600×1067）覆蓋 `-after.webp` 即可，HTML 不用改；改完把 HTML 裡的「暫時圖，待替換」註解刪掉。若要換場景，改 `<figure>` 內的檔名、`alt` 與切換鈕文字。
- 注意：暫時圖與完工照**不是同一個機位**，滑桿拉動時看得出來不是同一個角度。這是已知狀況，等對齊版。

---

## 4. 表單頁 `reinstatement-request.html`

### 4.1 版面

- `.page-hero`：標題「退租復原｜留下聯絡方式」，副標「只要一分鐘。先留聯絡方式，其他資料可以之後再補。」
- 進度條：`1 聯絡方式` → `2 補充需求（選填）`，目前步驟用 `aria-current="step"`。
- 兩個 `<form>`：`#rs-step1`、`#rs-step2`，都是 `action="https://formspree.io/f/xeendgkz" method="POST"`（沿用 `contact.html` 的表單）。

### 4.2 第 1 步（必填）

| 欄位     | name                                                                                    | 規則                       |
| -------- | --------------------------------------------------------------------------------------- | -------------------------- |
| 聯絡人   | `name`                                                                                  | 必填                       |
| 公司名稱 | `company`                                                                               | 必填                       |
| 電話     | `phone`                                                                                 | 與 Email 擇一              |
| Email    | `email`                                                                                 | 與電話擇一；有填就檢查格式 |
| 個資同意 | `privacy_consent`                                                                       | 必勾                       |
| （隱藏） | `ref_id`、`form_step`=`1 聯絡方式`、`_subject`、`_language`=`zh`、`_gotcha`（防機器人） |                            |

- 按鈕：送出，我們會聯絡你 →
- 個資告知文字（既有網站**沒有**隱私權說明頁，所以這裡新寫一段，需使用者確認）：
  「惠強室內裝修股份有限公司蒐集你的姓名、公司、電話與 Email，只用來聯絡你、安排現勘與報價，不會提供給與本案無關的第三方。你可以隨時來信 info@hqdesign.tw 要求查詢、更正或刪除。」
- 送出主旨：`【HQ 退租復原｜新聯絡】{公司名稱}｜{ref_id}`

### 4.3 第 2 步（全部選填，可整步跳過）

開頭：「多告訴我們一點，報價會更快更準。不想填可以直接跳過。」上方綠色提示「已收到你的聯絡方式」＋參考編號。

- **A 你是誰** `role`：我是租客，要搬走／我是房東或物管／我要搬家（舊的還、新的裝）
- **B 場地與時間**：`site_address`、`building_name`、`area_ping`、`lease_end`＋`lease_end_unsure`（還不確定）。選房東時，日期標題改成「租客搬離日」。「＋再加一個地點」最多加到 5 個，欄位名 `site_2_address`、`site_2_area_ping`、`site_2_lease_end`…，可移除。
- **C 拆除項目**：總開關 `demo_all_unsure`（全部不確定，請現勘時幫我判斷）；11 項各三選一（要拆／保留（房東的）／不確定）：`demo_partition`、`demo_glass`、`demo_ceiling`、`demo_floor`、`demo_lighting`、`demo_hvac`、`demo_cabling`、`demo_security`、`demo_signage`、`demo_furniture`、`demo_plumbing`；其他 `demo_other`（文字）。勾總開關時，11 項停用不送出。
- **D 手上的資料**：`landlord_list`（有／沒有／不知道）、`docs_available`（複選，送出時合併成一個欄位，用「、」分隔）、`docs_note`。提示：「有這些資料的話，我們聯絡你時會再跟你索取。」
- **E 其他**：`landlord_service`（只在房東時顯示）、`new_site_address`／`new_site_area`（只在搬家時顯示）、`contact_time`（上午／下午／都可以）、`note`。
- 按鈕：`補充送出`、`先跳過`。
- 送出主旨：`【HQ 退租復原｜補充資料】{公司名稱}｜{地址}｜到期 {日期}｜{ref_id}`（沒填的段落顯示「未填」）。第 2 封信也會帶上第 1 步的公司、聯絡人、電話、Email，單看一封也知道是誰。

### 4.4 JavaScript 行為（`reinstatement-form.js`）

1. 進頁面產生 `ref_id`：`RS-YYYYMMDD-XXXX`（4 碼，去掉 0／O／1／I 等容易看錯的字）。存在 `sessionStorage`，重新整理不會變。
2. 第 1 步送出：前端驗證 → `fetch`（`Accept: application/json`）→ 成功後隱藏第 1 步、顯示第 2 步、焦點移到第 2 步標題。失敗時顯示錯誤並提供電話與 Email，按鈕恢復可按。
3. 第 2 步送出：沒填任何東西就等同跳過（不送空信）；有填才 `fetch`，成功後前往感謝頁。失敗時顯示錯誤，仍可按「先跳過」（聯絡方式已經收到）。
4. 空欄位不送，讓通知信只有填過的內容。
5. `lease_end` 早於今天：顯示「日期已過，確定嗎？」，不擋送出。
6. 驗證錯誤：欄位下方顯示文字、`aria-invalid`、焦點移到第一個錯誤欄位。
7. **沒有 JavaScript 時**：只看得到第 1 步，照一般表單 POST 到 Formspree，`ref_id` 固定是 `NOJS`，用 `_next` 導到感謝頁。必填欄位另有 HTML `required`（電話與 Email 的「擇一」只能靠 JS 檢查，無 JS 時兩個都不擋）。

### 4.5 需要到 Formspree 後台確認的事（程式無法代為確認）

- `_next` 自訂導回頁在 Formspree 可能需要付費方案；免費方案會停在 Formspree 自己的感謝畫面（只影響沒有 JS 的訪客）。
- 這個表單 ID 與 `contact.html` 共用，通知信會進同一個信箱，靠主旨的「HQ 退租復原」分辨。若要分開信箱或分開統計，需另開一個 Formspree 表單並換掉兩個 `action`。
- 免費方案每月送出數量有上限；兩步表單一位客人最多算 2 次。

---

## 5. 感謝頁 `reinstatement-thanks.html`

- `noindex`。
- 內容：
  1. 收到了！我們會盡快聯絡你。
  2. 你的參考編號（從 `sessionStorage` 或網址 `?ref=` 讀，格式不符就不顯示）。
  3. 接下來會發生什麼：電話聯絡 → 安排現勘 → 報價與工期。
  4. 可以先準備的資料（同服務頁第 5 區塊）。
  5. 連到服務頁 FAQ、回首頁；急件可直接打電話。
- 不承諾回覆時效（規格 §12 第 2 題未定）。

---

## 6. 檢查計畫

- 本機起靜態伺服器，用瀏覽器看三頁：桌機寬度與手機寬度（375px），確認沒有橫向捲動。
- 滑桿：滑鼠拖曳、鍵盤左右鍵、場景切換。
- 表單：必填與擇一驗證、條件欄位、多據點新增與移除、總開關。
- **不會真的送出到 Formspree**（會寄信到公司信箱）。兩步流程用瀏覽器內暫時替換 `fetch` 的方式驗證。真實送出需要使用者自己測一次。
- 全站搜尋新檔案確認沒有「LINE」「AI」標示、價格、現勘費字樣。

---

## 7. 待套用到既有頁面（這次**不改**，以下是確切位置與要加的 HTML）

> 這些檔案目前有別人未 commit 的修改，所以只列出來，等使用者決定何時套用。

### 7.1 `services.html`

**(a) 服務卡片**：在 `<div class="services-grid">` 裡，`10 完工保固服務` 那張卡片的 `</div>` 之後、`services-grid` 的 `</div>` 之前，加一張：

```html
<a
  class="service-card"
  href="services/reinstatement.html"
  style="display:block;"
>
  <div class="service-number en">11</div>
  <h3>退租復原工程</h3>
  <span class="en-name en">Office Reinstatement</span>
  <p>
    租約到期要搬離？拆除、還原、合法清運、清潔到陪同房東點交，一次處理。任何辦公室都接，不限惠強裝修過的。<br /><strong
      style="color:var(--brand);"
      >了解退租復原工程 →</strong
    >
  </p>
</a>
```

注意：

- 加了之後是 11 張卡。`style.css` 的 `.service-card:nth-last-child(-n+3) { border-bottom: none; }` 是以最後一排滿 3 張為前提，11 張時最後一排只有 2 張，第 9 張卡的底線會消失、右下角會空一格。建議同時補一張或調整這條 CSS（需另外決定）。
- 同頁 hero 的「10項專業服務」與 meta description 的「十大服務」要不要改成 11，需使用者決定。
- 英文名稱 `Office Reinstatement` 是規格 §12 第 5 題的建議值，尚未確認。

**(b) JSON-LD**：在 `@graph` 最後一個 `Service`（`#warranty`）的 `}` 之後加：

```json
    ,{
      "@type": "Service",
      "@id": "https://www.hqdesign.tw/services/reinstatement.html#service",
      "name": "退租復原工程",
      "description": "辦公室租約到期搬離前，拆除租客自行施作的裝修，還原成房東要求的狀態，並完成廢棄物合法清運、清潔與陪同點交。",
      "serviceType": "退租復原工程",
      "url": "https://www.hqdesign.tw/services/reinstatement.html",
      "provider": { "@id": "https://www.hqdesign.tw/#organization" },
      "areaServed": { "@type": "Country", "name": "Taiwan", "identifier": "TW" }
    }
```

**(c) Footer「Services」清單**（`<li><a href="#">完工保固服務</a></li>` 之後）：

```html
<li><a href="services/reinstatement.html">退租復原工程</a></li>
```

### 7.2 `index.html`

目前首頁服務區塊是英文標題＋中文副標的寫法，照同樣格式。

**(a) 服務區塊**：`06 Post-Handover Warranty` 那張卡片的 `</div>` 之後（約第 624 行）加：

```html
<a
  class="service-card"
  href="services/reinstatement.html"
  style="display:block;"
>
  <div class="service-number en">07</div>
  <h3>Office Reinstatement</h3>
  <span class="en-name en" style="color:var(--mid);">退租復原工程</span>
  <p>
    Moving out? Strip-out, make-good, licensed waste removal and landlord
    handover — handled by one team.
  </p>
</a>
```

注意：首頁目前是 6 張卡（剛好兩排），加第 7 張會多出只有 1 張的第三排，且同樣受 `nth-last-child(-n+3)` 影響。替代做法：不加卡片，只在「All Services →」按鈕旁加一個文字連結：

```html
<a
  class="btn btn-outline-dark"
  href="services/reinstatement.html"
  style="margin-left:12px;"
  >退租復原工程 →</a
>
```

**(b) Footer「Services」清單**：`<li><a href="services.html">Post-Handover Warranty</a></li>` 之後加：

```html
<li><a href="services/reinstatement.html">Office Reinstatement 退租復原</a></li>
```

### 7.3 `contact.html`

在 `<h2 …>填寫需求表單</h2>` 下面那段 `<p>` 之後、`<form class="contact-form" …>` 之前加：

```html
<p
  style="font-size: 14px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 16px; margin-bottom: 24px;"
>
  要退租搬離？請用
  <a
    href="reinstatement-request.html"
    style="color: var(--brand); font-weight: 700; text-decoration: underline;"
    >退租復原專用表單 →</a
  >
</p>
```

（`contact.html` 右欄現有「LINE 官方帳號」區塊，是既有內容，不在這次範圍；是否移除請另外決定。）

### 7.4 `sitemap.xml`

在 `services.html` 那個 `<url>` 之後加（感謝頁不放）：

```xml
  <url>
    <loc>https://www.hqdesign.tw/services/reinstatement.html</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://www.hqdesign.tw/reinstatement-request.html</loc>
    <priority>0.5</priority>
  </url>
```

### 7.5 `llms.txt`

**(a)** 「## 服務範圍」清單最後（`完工保固服務` 之後）加一行：

```
- 退租復原工程（Office Reinstatement）
```

**(b)** 「## 服務範圍」段落之後、「## 設計與交付流程」之前加一段：

```
## 退租復原工程（Office Reinstatement）

辦公室租約到期搬離前，惠強把空間還原成房東要求的狀態，協助租客順利點交。

- 服務內容：拆除隔間與裝修、還原房東指定項目、廢棄物合法清運、完工清潔、陪同房東點交
- 接案範圍：任何辦公室都接，不限惠強裝修過的空間；可處理多個據點
- 不動房東財產（如天花板、燈具、冷氣風機、窗簾），施工前先標記並與客戶確認
- 可配合大樓規定的夜間或假日施工時段
- 交付文件：施工前後對照照片、廢棄物清運證明、點交紀錄
- 流程：留下聯絡方式 → 現場勘查 → 報價與工期 → 施工 → 陪同點交
- 報價方式：依坪數與項目報價
- 服務頁：https://www.hqdesign.tw/services/reinstatement.html
- 需求表單：https://www.hqdesign.tw/reinstatement-request.html
```

### 7.6 其他既有頁面的 footer（`about.html`、`projects.html`、`careers.html`、`projects/*.html`）

各頁 footer「Services」清單內容不一致。要不要每頁都加「退租復原工程」連結，由使用者決定；加的話用 7.1(c) 那一行（`projects/` 底下的頁面路徑改 `../services/reinstatement.html`）。

---

## 8. 需要使用者決定的事

1. 個資告知文字（§4.2）是新寫的，請確認用字。
2. 案例寫出「中興保全南港總部 7 樓」全名是否可以（規格 §12 第 7 題）。目前照指示寫出。
3. Formspree：是否與 `contact.html` 共用同一個表單 ID（§4.5）。
4. 服務卡片變 11 張後的版面與「十大服務」字樣（§7.1）。
5. 規格 §12 仍未定的：回覆時效、服務區域、保固承諾、英文名稱、「只做點交前檢查」是否正式列為服務（表單裡房東可選，但服務頁目前只在 FAQ 之外不特別宣傳）。
