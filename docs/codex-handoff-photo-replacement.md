# Codex Handoff：專案照片替換與優化

- 日期：2026-11-21
- Repo：`aiadminhq/hq-design-website`　分支：`feat/integrate-rebuild-web`（draft PR #80，請勿 merge、勿動 main）
- 前置文件：`docs/photo-replacement-list.md`（狀態總表）、`docs/legacy-assets-review.md`（背景）

## 1. 任務

main 是靜態 HTML 站（`projects/*.html`、`zh/projects/*.html`，樣式用 `assets/css/tokens.css`＋`components.css`）。專案**文字與規格不可改**，只處理照片。已完成第一輪替換；請完成下列剩餘工作：

1. **P0**：`baohua` 目前沒有任何乾淨圖，仍顯示 10 張含內嵌平面圖的舊 `render-NN.jpg`。需產出乾淨的完整效果圖並替換。
2. **P1**：12 個效果圖專案目前只有 1–2 張乾淨圖，需補到每案 6–8 張（polytron 只有 1 張，最缺）。
3. **P2**：`qijia` 現用的 `retouched-*.webp` 只有 1024–1536px，需重新輸出 ≥2400px 長邊版本。
4. 每補完一案，同步更新 EN 與 ZH 兩份頁面與所有列表／首頁縮圖。

## 2. 圖片驗收標準（缺一不可）

- 完整超擬真效果圖，或實拍。
- **不得有**：內嵌平面圖（舊圖左下角那種）、logo／簡報頁截圖、角落浮水印圖示、底部留白。
- 長邊 ≥2400px，16:9 或 3:2，`.webp`（品質約 85），單檔建議 <600 KB。
- 檔名：`selected-YYYYMMDD-NN.webp`（AI 強化）或 `photo-NN.jpg`（實拍）。NN 從 01 起，**01 是 hero**，請選最具代表性的主視覺（入口／接待／主空間）。
- 平面圖**不放進 gallery**；之後會另開獨立 section，現在別做。

## 3. 路徑

| 用途 | 路徑 |
|---|---|
| 專案圖片（放新圖處） | `assets/images/projects/<slug>/` |
| 英文專案頁 | `projects/<slug>.html`（圖片前綴 `../assets/…`） |
| 中文專案頁 | `zh/projects/<slug>.html`（前綴 `../../assets/…`） |
| 列表與首頁縮圖 | `projects.html`、`index.html`、`zh/projects.html`、`zh/index.html`（`<img src="assets/images/projects/<slug>/…">`） |
| 其他引用處 | `about.html`、`careers.html`、`zh/about.html`、`zh/careers.html`、`zh/taipei-office-renovation.html`、`zh/office-relocation.html`（用 `grep -rn "projects/<slug>/"` 全找） |
| 已優化圖來源參考（不要直接當乾淨圖，除非確認） | `web/public/assets/images/projects/<slug>/` |
| 舊原稿（含內嵌平面圖，只能當構圖參考） | `assets/images/projects/<slug>/render-NN.jpg`（1626×1125） |
| 平面圖（保留，勿刪、勿顯示） | `assets/images/projects/<slug>/floorplan.jpg` |
| 舊 AI 精修作業紀錄（原工作區，不在此 repo） | `codex-out/portfolio-image-refresh-20260923/`、`codex-out/csun-qijia-refresh-20260923/` |

## 4. 各專案待辦

「乾淨圖」＝已在頁面上、符合標準者。

| 優先 | slug | 專案 | 現有乾淨圖 | 需補 | 備註 |
|---|---|---|---|---|---|
| P0 | `baohua` | Baohua Cybersecurity | 0 | 至少 6，含 hero | 頁面目前引用 `render-01…10.jpg`（含內嵌平面圖）；補好後把 gallery 改為只含乾淨圖，hero／縮圖改指向 `-01` |
| P1 | `polytron` | Brightron Technology（保創） | 1 | 5 | 勿使用「第二張爭議照片」（`web/README.md` 有註記） |
| P1 | `aiontech` | AIONTECH | 2 | 4 | 舊稿 20 張，可從構圖參考 |
| P1 | `epicstech-10f` | Epic Tech | 2 | 4 | |
| P1 | `hq-office` | HQ Design Office & Material Library | 2 | 4 | |
| P1 | `ledaojia` | Lots Home Entertainment | 2 | 4 | |
| P1 | `lijie` | Lijie International | 2 | 4 | |
| P1 | `liwei` | Liwei Electronics | 2 | 4 | 公司名稱「立偉／利威」尚待裁定，勿改名稱 |
| P1 | `xinlan` | Xinlan Enterprise | 2 | 4 | |
| P1 | `zhongbao-baojing` | Zhong Bao Insurance Services | 2 | 4 | 名稱「中保／眾寶」待裁定，勿改 |
| P1 | `zhongbao-jingzhen` | Ching Dian TECH | 2 | 4 | |
| P1 | `zhongbao-showroom` | SECOM Technology Hall | 2 | 4 | |
| P1 | `zhongbao-tianhe` | eSkylink | 2 | 4 | |
| P2 | `qijia` | Cheogajip, Taichung | 8（但僅 1024–1536px） | 全部 8 張重出 ≥2400px | 原始實拍在 `assets/images/projects/qijia/photo-01…08.jpg`（8400px 級），可重新精修輸出；現用檔 `retouched-20260923-NN.webp` |

**不要處理**：`csun`（已下架）、`zhongbao-nangang`（孤兒頁）、`web/` 內 8 個新專案（`guochan-*`、`secom-reception`、`longteng-travel`、`transasia-bakery-*`、`budaejjigae`、`burger-ray`）——main 沒有對應頁面且未獲核可。實拍專案 `kimpton`、`popeyes`、`soup-spoon-*`、`secom-nangang-complex` 已完成，不用動。

## 5. 頁面修改方式

每個專案頁的 gallery 結構一致，只換 `<img>`：

```html
<div class="gallery-grid">
  <div class="gallery-item"><img src="../assets/images/projects/<slug>/selected-20261121-01.webp" alt="<專案名> interior render 1" loading="lazy"></div>
  …
</div>
```

- ZH 頁 alt 用「<中文名> 空間效果圖 N」，路徑前綴 `../../`。
- hero：`<img class="proj-hero-img" src="…-01.webp">`。
- 同一張 `-01` 也要更新 `projects.html`／`index.html`／`zh/*` 的卡片縮圖。
- **不要動** 標題、描述、規格、title／meta／JSON-LD。
- 舊 `render-NN.jpg` 等檔案先**保留不刪**，只是不再被引用。

## 6. 完成後檢查

```bash
# 不應再有舊圖被引用（baohua 補完後應為 0）
grep -rnE "projects/[a-z0-9-]+/(render-[0-9]+|floorplan|page-[0-9]+)\.jpg" --include=*.html . | grep -v -E "^./(web|_archive)/|zhongbao-nangang"
# 確認被引用的檔案都存在
python3 scripts/legacy-seo/apply_seo_layer.py --check
```

另請目視：每案 hero、gallery、列表縮圖都沒有內嵌平面圖或浮水印；EN／ZH 兩邊張數一致；手機寬度（390px）無水平溢出。

## 7. 規則與回報

- 只在 `feat/integrate-rebuild-web` 作業；commit 後 push，**不開 PR、不 merge、不動 main**。
- 沒有符合標準的來源就**不要硬湊**：保留現況並回報該案缺哪些視角。
- 完成後更新 `docs/photo-replacement-list.md` 的 A／B／C 表（狀態、張數、解析度），並列出仍缺的專案。
- 不確定來源圖是否已核可公開時，先停下來問。
