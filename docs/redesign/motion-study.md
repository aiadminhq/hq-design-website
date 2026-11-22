# LPAS 首頁 loader 動態研究（awwwards-motion-study）

- 對象：https://lpas.com/ （Awwwards 元素「Homepage loader」示範影片，11.03s、1600×1200、30fps）
- 方法：`record_site_motion`（desktop 1440×900，25.6s，35 phases）+ 下載元素影片，以 `ffmpeg fps=3 tile=5x4` 切成單張 tile 逐格檢視（tile 與影片僅存於暫存區，**未進 repo**，避免收錄第三方素材）
- `analyze_scroll_map`：未執行（`record_site_motion` 已成功，不需 fallback）。
- 說明：LPAS 的 loader 實作細節（GSAP 與否、確切 easing）本次**未取得原始碼層證據**，下表時間與緩動為由影格估計的「觀察值」，easing 為「推測」。

## Loader 時間軸（觀察值，約）

| 時間 | 畫面 | 觀察 |
| ---- | ---- | ---- |
| 0.0–0.7s | 純炭灰底（≈#222） | 空白停頓，建立「開機」感 |
| 0.7–1.7s | 縮寫字母 L / P / A / S 由上而下**逐字**出現，直排置中 | 每字約 0.3s 間隔，淡入 |
| ~2.0–2.7s | 每個字母**展開**成一個流程詞（Listen / Plan / Analyze / Shape） | 字母→詞，左對齊，用「流程」直接講品牌定位 |
| 2.7–4.2s | 靜止停留 | 給閱讀時間（約 1.5s） |
| ~4.2–4.8s | 詞組被推向兩側（左 2 詞、右 2 詞），中間開出一個小影像視窗 | 版面「裂開」讓出影像 |
| 4.8–5.7s | 影像視窗擴張為**全幅**，文字消失 | clip／scale 擴張，影像略帶縮放 |
| 5.7–11s | Logo、Menu 淡入；影像緩慢位移；左下標題逐行浮現 | 內容接手，loader 自然消失，沒有硬切 |

## 可借鏡的「節奏與結構」（不複製文字、logo、素材）

1. 三幕：**開機空白 → 縮寫變流程 → 視窗展開成 hero**。
2. 文字承載品牌定位（流程），不是純 logo 動畫。
3. 轉場以「視窗擴張」連接 loader 與 hero，沒有淡出再淡入的斷點。
4. 總長 ≈ 5.5s，偏長；HQ 版縮到 ≈ 3.6s，且提供 Skip。

## HQ 版動態規格（交給 motion-authoring）

- 內容：`H` `Q` 兩字母 → 展開成 HQ 自己的一份合約流程詞 **Brief / Design / Permit / Build**（中文：需求／設計／申辦／施工）。文字與 LPAS 不同。
- 影像：視窗擴張後露出 hero 的**自繪線稿 SVG**（非照片）。
- 時間軸（目標）：0.0 空白 → 0.3 字母 → 1.0 展開 → 2.0 停留 → 2.4 視窗開出 → 3.2 全幅 → 3.6 loader 移除。
- 緩動：沿用 `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` 與 `--ease-standard`。
- 無障礙：`prefers-reduced-motion: reduce` 時完全不播放；任何時候可按 Skip 或 `Esc`；同一 session 只播放一次（sessionStorage）；無 JS 時不出現；loader 期間 `inert` 主內容並以 `aria-live` 簡述；3 秒內載入失敗有 fail-safe 逾時。
