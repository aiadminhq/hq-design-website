# 專案照片替換清單（靜態升級）

- 日期：2026-11-21　分支：`feat/integrate-rebuild-web`
- 原則：專案文字與規格（面積、年份、地點、類別）**不動**，維持目前靜態版；只換照片。
- 採用標準：**完整超擬真效果圖或實拍**；不接受「內嵌平面圖」「logo／簡報頁截圖」「角落浮水印」。
- 平面圖：本次**一律不顯示**。檔案（`floorplan.jpg`）保留在 repo，日後新增獨立的平面圖 section／grid 再放入。

## 為什麼舊圖不能用

`render-NN.jpg`（1626×1125）是簡報頁截圖：左下角疊有縮小的平面圖，底部留白，左上有浮水印圖示；`page-01.jpg` 是 DESIGN AND BUILD logo 頁；`floorplan.jpg` 是平面圖。這三類皆不再顯示。

## A. 已替換完成（乾淨圖已上線）

| 專案 | slug | 狀態 | 目前張數 | 解析度 | 還缺什麼 |
|---|---|---|---|---|---|
| AIONTECH | `aiontech` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 20 張效果圖，僅 2 張乾淨 |
| Epic Tech | `epicstech-10f` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 6 張效果圖，僅 2 張乾淨 |
| HQ Design Office & Material Library | `hq-office` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 16 張效果圖，僅 2 張乾淨 |
| Lots Home Entertainment | `ledaojia` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 8 張效果圖，僅 2 張乾淨 |
| Lijie International | `lijie` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 6 張效果圖，僅 2 張乾淨 |
| Liwei Electronics | `liwei` | 已換（AI 強化／實拍乾淨圖） | 2 | 2560–2560px | 補圖：原有約 13 張效果圖，僅 2 張乾淨 |
| Brightron Technology | `polytron` | 已換（AI 強化／實拍乾淨圖） | 1 | 2560–2560px | 補圖：原有約 17 張效果圖，僅 1 張乾淨 |
| Cheogajip, Taichung | `qijia` | 已換（AI 強化／實拍乾淨圖） | 8 | 1024–1536px | 解析度偏低（≤1536px），建議重新輸出 2400px 版；原始實拍 8400px 已存在 `photo-NN.jpg`（未引用） |
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

## B. 尚未有乾淨圖，仍使用舊圖（優先補）

| 專案 | slug | 目前狀態 | 需要 |
|---|---|---|---|
| Baohua Cybersecurity | `baohua` | 已移除平面圖與 logo 頁；仍顯示 10 張內嵌平面圖的舊 `render-NN` | **全部 10 張**需乾淨的完整效果圖（優先：hero） |

## C. 張數不足（目前只有 1–2 張乾淨圖，建議補到 6–8 張）

| 專案 | slug | 乾淨張數 | 舊稿張數（皆含內嵌平面圖） | 建議補圖數 |
|---|---|---|---|---|
| AIONTECH | `aiontech` | 2 | 20 | 4 |
| Epic Tech | `epicstech-10f` | 2 | 6 | 4 |
| HQ Design Office & Material Library | `hq-office` | 2 | 16 | 4 |
| Lots Home Entertainment | `ledaojia` | 2 | 8 | 4 |
| Lijie International | `lijie` | 2 | 6 | 4 |
| Liwei Electronics | `liwei` | 2 | 13 | 4 |
| Brightron Technology | `polytron` | 1 | 17 | 5 |
| Xinlan Enterprise | `xinlan` | 2 | 8 | 4 |
| Zhong Bao Insurance Services | `zhongbao-baojing` | 2 | 13 | 4 |
| Ching Dian TECH | `zhongbao-jingzhen` | 2 | 15 | 4 |
| SECOM Technology Hall | `zhongbao-showroom` | 2 | 17 | 4 |
| eSkylink | `zhongbao-tianhe` | 2 | 13 | 4 |

## D. 不處理（未在 main 公開）

| 項目 | 原因 |
|---|---|
| `csun`（志聖） | main 已下架（PR #70）；`web/` 內有 4 張圖，待客戶核可 |
| 8 個 `web/` 新專案（`guochan-office`、`guochan-showroom`、`secom-reception`、`longteng-travel`、`transasia-bakery-dayuan`、`transasia-bakery-chunri`、`budaejjigae`、`burger-ray`） | 照片已優化並看過皆乾淨（實拍），但 main 沒有這些專案頁、文字資料也未核可，故不加入 |
| `zhongbao-nangang` | 孤兒頁（115 張簡報截圖），不在列表與 sitemap，未動 |

## E. 後續建議

1. 補 B、C 的乾淨效果圖（建議規格：≥2400px 長邊、16:9 或 3:2、無浮水印、無內嵌圖、`.webp`，檔名 `selected-YYYYMMDD-NN.webp`）。
2. 補圖後把檔案放進 `assets/images/projects/<slug>/`，重跑 `scratchpad` 式替換或手動更新 gallery。
3. 平面圖 section：建議在 gallery 下方新增 `.proj-plans`（獨立 grid），資料來源沿用現有 `floorplan.jpg`；等設計確認版型再做。
4. 舊的 `render-NN.jpg`、`page-NN.jpg`、`photo-NN.jpg`（原始大圖，kimpton 約 260 MB、qijia 約 80 MB）已不被頁面引用，確認無需保留後可移出 repo 減重。
5. 圖片來源標示（完工實景／AI 強化）政策尚未導入，見 `docs/legacy-assets-review.md`。
