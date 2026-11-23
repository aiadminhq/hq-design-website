# 專案照片替換清單（靜態升級）

- 日期：2026-11-21（2026-11-22 更新：baohua 補齊、ledaojia hero 替換、實拍最低尺寸）　分支：`feat/integrate-rebuild-web`
- 原則：專案文字與規格（面積、年份、地點、類別）**不動**，維持目前靜態版；只換照片。
- 採用標準：**完整超擬真效果圖或實拍**；不接受「內嵌平面圖」「logo／簡報頁截圖」「角落浮水印」。
- 平面圖檔案（`floorplan.jpg`）保留於 repo；2026-11-23 起全站相簿統一不顯示平面圖（PR #90）。

## 為什麼舊圖不能用

`render-NN.jpg`（1626×1125）是簡報頁截圖：左下角疊有縮小的平面圖，底部留白，左上有浮水印圖示；`page-01.jpg` 是 DESIGN AND BUILD logo 頁；`floorplan.jpg` 是平面圖。P0 的舊效果圖待合格素材補齊後替換，見 B 表。

## A. 已有乾淨圖的專案

| 專案 | slug | 狀態 | 目前張數 | 解析度 | 還缺什麼 |
|---|---|---|---|---|---|
| AIONTECH | `aiontech` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 20 張效果圖，僅 2 張乾淨 |
| Epic Tech | `epicstech-10f` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 6 張效果圖，僅 2 張乾淨 |
| HQ Design Office & Material Library | `hq-office` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 16 張效果圖，僅 2 張乾淨 |
| Lots Home Entertainment | `ledaojia` | hero 改為 `selected-20261122-01.webp`（OpenAI 重生；原 hero 招牌為 AI 亂碼，已停用） | 2 | 2400–2560px | 補圖：原有約 8 張效果圖，僅 2 張乾淨 |
| Lijie International | `lijie` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 6 張效果圖，僅 2 張乾淨 |
| Liwei Electronics | `liwei` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 13 張效果圖，僅 2 張乾淨 |
| Brightron Technology | `polytron` | 已換（AI 強化／實拍乾淨圖） | 1 | 2560–2560px | 補圖：原有約 17 張效果圖，僅 1 張乾淨 |
| Cheogajip, Taichung | `qijia` | 已從原始實拍重出 WebP，EN／ZH 詳頁與作品列表已更新 | 8 | 2400px | 無；保留實景招牌與地坪圖樣 |
| Xinlan Enterprise | `xinlan` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 8 張效果圖，僅 2 張乾淨 |
| Zhong Bao Insurance Services | `zhongbao-baojing` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 13 張效果圖，僅 2 張乾淨 |
| Ching Dian TECH | `zhongbao-jingzhen` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 15 張效果圖，僅 2 張乾淨 |
| SECOM Technology Hall | `zhongbao-showroom` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 17 張效果圖，僅 2 張乾淨 |
| eSkylink | `zhongbao-tianhe` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 13 張效果圖，僅 2 張乾淨 |
| Kimpton Da An Hotel | `kimpton` | 同檔名換成優化版（實拍） | 10 | 1600–2400px | 無（原檔 2000–8688px、多為 1.5–32 MB，已壓成 2400px 內） |
| Popeyes Xuchang Street | `popeyes` | 同檔名換成優化版（實拍） | 5 | 1500–2000px | 無（原檔 2000–8688px、多為 1.5–32 MB，已壓成 2400px 內） |
| The Soup Spoon, Taipei 101 | `soup-spoon-101` | 同檔名換成優化版（實拍） | 3 | 2000–2000px | 無（原檔 2000–8688px、多為 1.5–32 MB，已壓成 2400px 內） |
| The Soup Spoon, Taipei Main Station | `soup-spoon-station` | 同檔名換成優化版（實拍） | 11 | 2000–2000px | 無（原檔 2000–8688px、多為 1.5–32 MB，已壓成 2400px 內） |
| SECOM Nangang HQ | `secom-nangang-complex` | 同檔名換成優化版（實拍） | 1 | 2000–2000px | 無（原檔 2000–8688px、多為 1.5–32 MB，已壓成 2400px 內） |

## B. P0 優先替換 Baohua

**2026-11-22 已完成**：以 OpenAI `gpt-image-2` edits 從裁切後舊稿重生 6 張（`selected-20261122-01…06.webp`，2400×1600），EN／ZH 詳頁、列表、`zh/taipei-office-renovation.html`、`zh/office-relocation.html` 均已替換，舊 `render-NN.jpg` 保留不引用。P1 其餘 12 案（49 張）亦於同日完成：一般空間走 `images/edits` medium，入口／招牌／展示類依 `photo-enhance-render` skill 以 `gpt-image-2.6-sunburst` high 生成，逐張目視並放大檢查招牌文字。**13 案皆已達 6 張，缺口 0。**原規劃：本輪最低需補 **55 張、共 13 案**。先補 Baohua 的入口主圖與 5 張相簿圖，再補 Brightron 的 5 張，最後補其餘 11 案各 4 張。B、C 表按各案建議交件順序列出視角，括號內編號對應各案目錄的 `render-NN.jpg`，供設計端找回原始構圖。

| 專案 | slug | 目前狀態 | 需要 |
|---|---|---|---|
| Baohua Cybersecurity | `baohua` | ✅ 6 張合格（2026-11-22 重生成） | **6 張** · 入口 hero（01）、開放辦公區（03）、長桌會議室（04）、投影會議室（05）、茶水櫃區（06）、獨立辦公室（09） |

## C. P1 補齊相簿至每案 6–8 張

| 專案 | slug | 乾淨張數 | 舊簡報素材張數 | 建議補圖數 | 待補視角 |
|---|---|---|---|---|---|
| Brightron Technology | `polytron` | 1 | 17 | 5 | 開放工位全景（06）、收納走道（05）、主管室（14）、大會議室（15）、茶水區（17） |
| AIONTECH | `aiontech` | 2 | 20 | 4 | 開放工位（11）、投影會議室（07）、黃色協作區（04）、休憩區（15） |
| Epic Tech | `epicstech-10f` | 2 | 6 | 4 | 木牆走廊（02）、長桌會議室縱向（04）、會議區側景（05）、獨立辦公室（06） |
| HQ Design Office & Material Library | `hq-office` | 2 | 16 | 4 | 入口看向材料圖書館（01）、材料展示架（05）、茶水區（07）、開放工位（11） |
| Lots Home Entertainment | `ledaojia` | 2 | 8 | 4 | 入口門廳（03）、辦公工位（05）、展示櫃（07）、獨立辦公室側景（08） |
| Lijie International | `lijie` | 2 | 6 | 4 | 入口門廳（01）、玻璃隔間走道（02）、開放工位（04）、訪客沙發側景（06） |
| Liwei Electronics | `liwei` | 2 | 13 | 4 | 入口門廳（01）、協作吧檯（02）、獨立辦公室（09）、窗邊會議區（10） |
| Xinlan Enterprise | `xinlan` | 2 | 8 | 4 | 入口走廊（01）、開放工位反向（03）、窗邊長桌會議室（05）、小會議室（08） |
| Zhong Bao Insurance Services | `zhongbao-baojing` | 2 | 13 | 4 | 入口（03）、開放工位側景（05）、展示公告櫃（06）、茶水區（07） |
| Ching Dian TECH | `zhongbao-jingzhen` | 2 | 15 | 4 | 開放工位（05）、獨立辦公室（09）、投影會議室（10）、茶水區（12） |
| SECOM Technology Hall | `zhongbao-showroom` | 2 | 17 | 4 | 入口展區（01）、圓形互動牆（03）、設備展示區（06）、接待廳（08） |
| eSkylink | `zhongbao-tianhe` | 2 | 13 | 4 | 入口門廳（03）、開放工位（06）、小會議室（13）、茶水區（12） |

P0、P1 均待原始素材。已檢查靜態站與 `web/public`，現有額外素材只供構圖參考。Brightron 的第二張爭議照片排除，見 `web/README.md`。

## D. 不處理（未在 main 公開）

| 項目 | 原因 |
|---|---|
| `csun`（志聖） | main 已下架（PR #70）；`web/` 內有 4 張圖，待客戶核可 |
| 8 個 `web/` 新專案（`guochan-office`、`guochan-showroom`、`secom-reception`、`longteng-travel`、`transasia-bakery-dayuan`、`transasia-bakery-chunri`、`budaejjigae`、`burger-ray`） | 照片已優化並看過皆乾淨（實拍），但 main 沒有這些專案頁、文字資料也未核可，故不加入 |
| `zhongbao-nangang` | 孤兒頁（115 張簡報截圖），不在列表與 sitemap，未動 |

## E. 補件與驗收

1. **交件**　每張附專案 slug、對應視角、原始檔或可下載連結、素材類型（實拍／效果圖）及公開核可狀態。效果圖從原始場景直接輸出；實拍提供原始照片。
2. **驗收**　逐張確認畫面完整、長邊至少 2400 px（實拍最低 2000 px，不足以 `scripts/photo-audit/upscale_real_photos.py` 放大）、16:9 或 3:2、WebP，品質約 85，單張建議小於 600 KB。新增效果圖使用 `selected-YYYYMMDD-NN.webp`。畫面須無內嵌平面圖、logo、浮水印及簡報留白。只收到簡報截圖或公開核可未確認時，保留該視角的待補狀態。
3. **換圖**　Baohua 的入口主圖用於 hero 及現有首頁、列表縮圖，到齊至少 6 張後同步換掉中英詳頁的整組舊圖。P1 既有 hero 可沿用；新增相簿圖從未使用的編號接續，避免覆蓋現有圖檔。
4. **結案**　同步中英詳頁及所有受影響的列表與首頁縮圖。檢查引用檔案存在、兩語相簿張數一致，並以 390 px 寬度確認沒有水平溢出。回填實收張數、解析度及仍缺視角。
