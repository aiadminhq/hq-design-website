# HQ Design 官網｜專案照片盤點（Photo Audit）

- 盤點日期：2026-11-22　分支：`feat/integrate-rebuild-web`（工作分支 `claude/affectionate-mayer-n3tcva`）
- 驗收標準：`docs/photo-replacement-list.md` §E.2、`docs/codex-handoff-photo-replacement.md` §2
- 本目錄為**唯讀盤點**：未修改任何頁面、原圖或文字。重跑方式見 §7。

## 1. OpenAI API 可用性（前置確認）

| 檢查項目 | 結果 |
|---|---|
| 環境變數 `OPENAI_API_KEY` | 未設定（金鑰改由 Claude Code 環境的 Network secrets 經 proxy 注入，repo 不含任何金鑰） |
| 初始連線 `api.openai.com` | HTTP 403（proxy 未放行）→ 已於環境設定金鑰並放行該 host |
| `GET /v1/models`（驗證金鑰） | **HTTP 200**，共 99 個模型 |
| 可用影像模型 | `gpt-image-2`、`gpt-image-2-2026-04-21`、`gpt-image-2.5-flare`、`gpt-image-2.5-sunburst`、`gpt-image-2.6-flare`、`gpt-image-2.6-sunburst`、`gpt-image-1.5`、`gpt-image-1-mini`、`chatgpt-image-latest` 等 11 個 |
| 實際生成測試（`gpt-image-1-mini`，low，1024×1024） | **HTTP 200**，回傳 1024×1024 PNG |
| 尚未驗證 | `/v1/images/edits`（以舊稿為參考重生）、`gpt-image-2` 系列實際生成與單價；正式批次前需各測 1 張 |

> 腳本若要求變數，可設 `OPENAI_API_KEY=proxy-injected`（proxy 會覆寫 Authorization header）。

## 2. 成果總覽

- 掃描 **257** 個檔案（不含孤兒頁 `zhongbao-nangang`：孤兒頁（115 張簡報截圖），不在列表與 sitemap）。
- **上線中**（被 EN／ZH 頁面引用）的不重複圖片：合格 **40**、規格偏離 **20**、不合格 **11**。
- 距「每案 6 張合格」仍缺 **56 張**，涉及 **13 案**（先前文件回報 55 張；本次多 1 張，原因見 §5 ledaojia）。
- 全部 19 案 EN／ZH 相簿張數一致。

| 優先 | 專案 | slug | 上線 | 合格 | 規格偏離 | 不合格 | 距 6 張缺口 | 照片集 |
|---|---|---|--:|--:|--:|--:|--:|---|
| P0 | Baohua Cybersecurity | `baohua` | 10 | 0 | 0 | 10 | 6 | [不合格集](non-compliant.md#baohua) |
| P1 | Brightron Technology | `polytron` | 1 | 1 | 0 | 0 | 5 | [不合格集](non-compliant.md#polytron) · [成果](#polytron) |
| P1 | AIONTECH | `aiontech` | 2 | 2 | 0 | 0 | 4 | [不合格集](non-compliant.md#aiontech) · [成果](#aiontech) |
| P1 | Epic Tech | `epicstech-10f` | 2 | 2 | 0 | 0 | 4 | [不合格集](non-compliant.md#epicstech-10f) · [成果](#epicstech-10f) |
| P1 | HQ Design Office & Material Library | `hq-office` | 2 | 2 | 0 | 0 | 4 | [不合格集](non-compliant.md#hq-office) · [成果](#hq-office) |
| — | Kimpton Da An Hotel | `kimpton` | 10 | 10 | 0 | 0 | — | [成果](#kimpton) |
| P1 | Lots Home Entertainment | `ledaojia` | 2 | 1 | 0 | 1 | 5 | [不合格集](non-compliant.md#ledaojia) · [成果](#ledaojia) |
| P1 | Lijie International | `lijie` | 2 | 2 | 0 | 0 | 4 | [不合格集](non-compliant.md#lijie) · [成果](#lijie) |
| P1 | Liwei Electronics | `liwei` | 2 | 2 | 0 | 0 | 4 | [不合格集](non-compliant.md#liwei) · [成果](#liwei) |
| — | Popeyes Xuchang Street | `popeyes` | 5 | 0 | 5 | 0 | — | [規格偏離](non-compliant.md#popeyes) |
| — | Cheogajip, Taichung | `qijia` | 8 | 8 | 0 | 0 | — | [成果](#qijia) |
| — | SECOM Nangang HQ | `secom-nangang-complex` | 1 | 0 | 1 | 0 | — | [規格偏離](non-compliant.md#secom-nangang-complex) |
| — | The Soup Spoon, Taipei 101 | `soup-spoon-101` | 3 | 0 | 3 | 0 | — | [規格偏離](non-compliant.md#soup-spoon-101) |
| — | The Soup Spoon, Taipei Main Station | `soup-spoon-station` | 11 | 0 | 11 | 0 | — | [規格偏離](non-compliant.md#soup-spoon-station) |
| P1 | Xinlan Enterprise | `xinlan` | 2 | 2 | 0 | 0 | 4 | [不合格集](non-compliant.md#xinlan) · [成果](#xinlan) |
| P1 | Zhong Bao Insurance Services | `zhongbao-baojing` | 2 | 2 | 0 | 0 | 4 | [不合格集](non-compliant.md#zhongbao-baojing) · [成果](#zhongbao-baojing) |
| P1 | Ching Dian TECH | `zhongbao-jingzhen` | 2 | 2 | 0 | 0 | 4 | [不合格集](non-compliant.md#zhongbao-jingzhen) · [成果](#zhongbao-jingzhen) |
| P1 | SECOM Technology Hall | `zhongbao-showroom` | 2 | 2 | 0 | 0 | 4 | [不合格集](non-compliant.md#zhongbao-showroom) · [成果](#zhongbao-showroom) |
| P1 | eSkylink | `zhongbao-tianhe` | 2 | 2 | 0 | 0 | 4 | [不合格集](non-compliant.md#zhongbao-tianhe) · [成果](#zhongbao-tianhe) |

## 3. 三個照片集

| 照片集 | 內容 | 位置 |
|---|---|---|
| **A. 確認不符合標準** | 簡報截圖（內嵌平面圖／浮水印／留白）、logo 頁、AI 亂碼文字，共 172 個檔案 | [`non-compliant.md`](non-compliant.md)、`sheets/*-noncompliant.jpg` |
| **B. 規格偏離（內容乾淨、解析度／比例不足）** | 實拍專案 popeyes／soup-spoon／secom-nangang，長邊 < 2400 px | [`non-compliant.md`](non-compliant.md#b-規格偏離實拍專案)、`sheets/*-specgap.jpg` |
| **C. 合格成果（GitHub 呈現）** | 規格合格且內容乾淨，可直接作為官網成果 | 本檔 §4、`sheets/*-compliant.jpg` |
| 機器可讀清單 | 逐檔規格與狀態；`decision` 欄供人工填寫 | [`inventory.csv`](inventory.csv)、[`inventory.json`](inventory.json) |
| 重生成佇列 | 待補視角 → 舊稿構圖參考 → 建議路線 | [`regeneration-queue.csv`](regeneration-queue.csv) |

## 4. 合格成果集（GitHub 呈現）

綠框＝規格合格；`LIVE`＝目前被官網頁面引用。

### Brightron Technology · `polytron`
<a id="polytron"></a>

![polytron compliant](sheets/polytron-compliant.jpg)

### AIONTECH · `aiontech`
<a id="aiontech"></a>

![aiontech compliant](sheets/aiontech-compliant.jpg)

### Epic Tech · `epicstech-10f`
<a id="epicstech-10f"></a>

![epicstech-10f compliant](sheets/epicstech-10f-compliant.jpg)

### HQ Design Office & Material Library · `hq-office`
<a id="hq-office"></a>

![hq-office compliant](sheets/hq-office-compliant.jpg)

### Kimpton Da An Hotel · `kimpton`
<a id="kimpton"></a>

![kimpton compliant](sheets/kimpton-compliant.jpg)

### Lots Home Entertainment · `ledaojia`
<a id="ledaojia"></a>

![ledaojia compliant](sheets/ledaojia-compliant.jpg)

### Lijie International · `lijie`
<a id="lijie"></a>

![lijie compliant](sheets/lijie-compliant.jpg)

### Liwei Electronics · `liwei`
<a id="liwei"></a>

![liwei compliant](sheets/liwei-compliant.jpg)

### Cheogajip, Taichung · `qijia`
<a id="qijia"></a>

![qijia compliant](sheets/qijia-compliant.jpg)

### Xinlan Enterprise · `xinlan`
<a id="xinlan"></a>

![xinlan compliant](sheets/xinlan-compliant.jpg)

### Zhong Bao Insurance Services · `zhongbao-baojing`
<a id="zhongbao-baojing"></a>

![zhongbao-baojing compliant](sheets/zhongbao-baojing-compliant.jpg)

### Ching Dian TECH · `zhongbao-jingzhen`
<a id="zhongbao-jingzhen"></a>

![zhongbao-jingzhen compliant](sheets/zhongbao-jingzhen-compliant.jpg)

### SECOM Technology Hall · `zhongbao-showroom`
<a id="zhongbao-showroom"></a>

![zhongbao-showroom compliant](sheets/zhongbao-showroom-compliant.jpg)

### eSkylink · `zhongbao-tianhe`
<a id="zhongbao-tianhe"></a>

![zhongbao-tianhe compliant](sheets/zhongbao-tianhe-compliant.jpg)

## 5. 待人工複核（目視新發現）

| 檔案 | 狀況 | 處理 |
|---|---|---|
| `ledaojia/selected-20260923-01.webp` | 內容瑕疵：招牌文字為 AI 亂碼（NNOVANON／RETHNKNG／VECMNOLOGY／IVE），規格合格但不宜作 hero | 已改列**不合格**，列入重生成佇列 |
| `zhongbao-jingzhen/selected-20260923-01.webp` | 招牌英文 JINGTIAN TECHNOLOGY 與專案名 Ching Dian TECH／京典 拼音不一致，需與業主確認品牌拼寫 | 保留合格；待確認 |
| `zhongbao-showroom/selected-20260923-02.webp` | 展牆時間軸小字（年份以外）可能為 AI 近似文字，需對照實景確認 | 保留合格；待確認 |

> 目視範圍：全部 23 張 selected 圖的總覽；招牌／文字區域僅放大檢查 ledaojia、aiontech、zhongbao-showroom、zhongbao-jingzhen。其餘 selected 圖未逐張放大。

## 6. 後續判斷：換圖 vs 重生成

`inventory.csv`／`regeneration-queue.csv` 的 `decision` 欄填入下列其一：

| 路線 | 適用 | 做法 | 風險 |
|---|---|---|---|
| **search-replace**（搜尋可用照片換圖） | 業主／設計端能提供原始效果圖、實拍，或有公開核可素材 | 依 §E.1 交件與核可流程；轉 WebP、長邊 ≥ 2400 | 需確認公開核可；等待素材 |
| **regenerate**（修正不符區域後以 OpenAI 重生） | 只有簡報截圖：以 `render-NN.jpg` 為構圖參考，去除平面圖、浮水印、留白後輸出 | OpenAI `images/edits`（`gpt-image-2` 系列）＋後製放大至 2400 px；逐張目視驗收 | 招牌／文字亂碼（如 ledaojia）；家具與原設計不一致；需業主認可為『效果圖示意』 |
| **keep** | 已合格 | 不動 | — |
| **drop** | logo 頁、平面圖（暫不顯示） | 不進相簿 | — |

建議順序：先 `baohua`（P0，0 張合格、10 張上線皆不合格）→ `polytron`（缺 5）→ 其餘 11 案各補 4；`ledaojia` 另加重生入口 hero。

## 7. 重跑與檔案

```bash
python3 scripts/photo-audit/audit.py   # 需要 Pillow；重新產生本目錄全部檔案
```

- 自動判定規則：`render-NN.jpg`／`page-NN.jpg` 一律不合格；其餘檢查長邊 ≥ 2400 px、比例 16:9 或 3:2（容差 0.04）。檔案 > 600 KB 僅列 advisory。
- 目視覆核結果存於 `scripts/photo-audit/manual-review.json`（覆蓋自動判定）。
- 「合格」僅代表規格與已目視內容；公開核可狀態需另行確認（§E.1）。
