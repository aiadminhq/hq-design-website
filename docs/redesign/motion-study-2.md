# 後續互動與動畫參考：STILL / FORM 與 Heron AI

- 研究日期：2026-11-22（接續 `motion-study.md`；這份是「第二階段互動／動畫」的參考，不是這次 PR 的實作）
- 工具：Awwwards MCP（`get_site_elements`、`get_motion_dna`、`record_site_motion`）＋下載 Awwwards 元素示範影片，以 `ffmpeg fps=2–3 tile` 逐格檢視（影片與 tile 只放暫存區，**未進 repo**）
- 使用者指定：
  - https://www.awwwards.com/inspiration/architectural-hologram-showcase-still-form （3D 風格呈現、動畫）
  - https://heronaiapp.com （動畫絲滑）
- 證據等級：**observed** = 逐格影片／MCP 回傳；**inferred** = 由 observed 推論；**proposed** = 給 HQ 的建議。時間為依 2–3fps 影格估計，easing 無原始碼證據者一律標「推測」。

## 1. 參考站比較矩陣

| 站名（來源） | 技術棧（observed） | 核心動態語彙 | 絲滑的來源（inferred） | 對 HQ 的價值 |
| ------------ | ------------------ | ------------ | ---------------------- | ------------ |
| [STILL / FORM](https://stillform.homes/)（Awwwards [Nominee](https://www.awwwards.com/sites/still-form)，元素「Architectural Hologram Showcase」） | Lenis（scrollModel: lenis）、three.js／WebGL；**無 GSAP／ScrollTrigger**（census 0 個 trigger） | 暗色計數 loader → 簾幕上掀；3D 透明「全息」模型分層導覽；霧氣轉場；圓角卡片展開成全幅 | Lenis 慣性捲動 + 單一 WebGL 場景內的連續鏡頭，而非切換頁面 | 「看穿空間」的 3D 呈現，與 HQ 的 MEP／結構／裝修分層服務高度吻合 |
| [Heron AI](https://heronaiapp.com/)（Awwwards [SOTD 7.70](https://www.awwwards.com/sites/heron-ai)） | GSAP + ScrollTrigger + Swiper、WebGL；原生捲動；41 個 trigger、僅 1 個 scrub、0 個 pin | 線稿逐筆繪製 → 渲染圖交叉淡入；十字準星座標讀數；紅色標註框滑入；等寬小字 + 細線格；roller 式文字遮罩入場 | 幾乎全為「一次性觸發」（進入視窗 45–65% 才播）+ 長尾 ease-out；少量 scrub；元素彼此重疊接續，沒有硬切 | 與 HQ 現有 hero 線稿同一語言，可直接延伸；技術上不需要 WebGL |

## 2. STILL / FORM（重點：3D 全息呈現）

### 2.1 Loader（約 3.5s，observed）
暖炭灰底（≈`#2a2726`）→ 左下 wordmark、右上計數 `00→100`，一條貫穿全寬的細線隨百分比生長；小字 caption（PREPARING YOUR TOUR EXPERIENCE／ARCHITECTURE · INTERIORS · DETAILS）。計數到 100 後深色面板**上掀（簾幕）**露出 hero，標題（serif）→ 連結 → 四角小標 → 底部標語依序入場。

### 2.2 「Architectural Hologram Showcase」（元素影片 4.65s，observed）
- 一棟住宅的**透明線框／玻璃質感 3D 模型**，漸層藍底（深藍 → 近地平線的淡霧）。
- 以「層」為單位導覽：`02 Walls — Reinforced concrete shell` → `03 Floor — Marble carrara white finish`，右下大字編號 + `OF 07`、底部**帶刻度的進度軌**、右側垂直圓點、`DRAG TO ROTATE` 提示。
- 換層時相機環繞並**淡出前一層幾何、淡入下一層**（牆 → 地板），鏡頭從側視拉到俯視；整體是同一個場景連續運鏡，不是換圖。
- inferred：資料驅動（每層一組標題／材料／編號），scroll 或 drag 控制相機；three.js 場景。

### 2.3 其他轉場（observed）
- **霧氣轉場**：區塊之間以白色霧氣由下往上漫過（取代硬切）。
- **Tour CTA 轉場**：奶油底頁面上的圓角影像卡**放大成全幅**（圓角 → 0），標題 `Step inside.` 與 WASD／E／Q 操作提示隨後入場。
- **Residence 捲動**：影像卡以視差方式錯位上升，編號 `03 / 03`。

### 2.4 限制（誠實揭露）
census 只量到 1 個 CSS keyframe；Lenis + three.js 的動畫不走 CSS／GSAP，因此**沒有 easing 與 duration 的原始碼證據**。上列時間皆為影格估計。

## 3. Heron AI（重點：絲滑）

### 3.1 Preloader（8.0s，observed）
1. 0–0.5s：空白紙面 + 外框；左側一條紅色地平線，旁邊百分比計數（如 `17%`），中央有 `WELCOME TO HERON AI` 虛線小標。
2. 0.5–4.5s：建築**以線稿逐筆繪製**（樓梯 → 柱 → 樓板 → 窗框），左下標題**逐行遮罩上升**，右下一塊等寬小字規格表淡入。
3. ~4.5–5.5s：線稿 **交叉淡入成完整渲染圖**（線框 → 實體），紅點熱點出現。
4. 5.5–7s：導覽列、真正的 H1（逐行遮罩）、說明文、底部**無限跑馬燈**（FEWER MISTAKES · LESS BUSYWORK · …）依序入場。

### 3.2 Hero 互動（observed）
- 滑鼠位置顯示**十字準星 + `X:…PX / Y:…PX` 座標讀數**，頁面外有虛線座標標記（`[86,197]` 等）。
- 紅色標註框（AI 偵測到的問題）**滑入建築並帶紅色光暈**，說明 `CLICK AND DRAG YOUR MODEL TO SEE VIOLATIONS`。
- 往下捲：H1 往上推出，下一區塊**重疊上滑接續**；大橘圓與線稿塔樓做視差；下方四格等角線框圖示**進入視窗時逐筆繪製**。

### 3.3 Motion DNA（observed，`get_motion_dna`）
- GSAP + ScrollTrigger + Swiper、WebGL、原生捲動（**沒有 Lenis**）。
- ScrollTrigger 41 個；`scrub` 僅 1 個；`pin` 0 個。
- 典型觸發：`start: "top+=45% bottom"`（元素頂端進到視窗 55% 處才播），長度 1.6–2.1s；少數 `clamp(top bottom+=50%) → bottom top-=50%` 為視差。
- easing：`steps(19)` ×33、`circ.in` ×33；時長 p25 150ms／中位 580ms／p75 1700ms。
- inferred：`steps(19)` 是「數位／機械」感的計數與文字；`circ.in` 多半用於遮罩收合。**絲滑 ≠ 平滑捲動套件**，而是「少量、一次性、長尾、彼此接續」。

## 4. 對 HQ 的建議（proposed，依 CP 值排序）

| # | 建議 | 取自 | 做法（不需 WebGL） | 工作量 | 風險／注意 |
| - | ---- | ---- | ------------------ | ------ | ---------- |
| 1 | **線稿 → 實體交叉淡入** hero | Heron 3.1 | 現有 hero 樓層平面已有 `stroke-dashoffset` 繪製；加第二層「填色版」在繪製完成後淡入（牆體實心、分區上色） | 小 | 全部用自繪 SVG；reduced-motion 直接顯示完成態 |
| 2 | **等角分層「全息」區塊** | STILL/FORM 2.2 | 自繪**虛構樓層**的等角（isometric）SVG，4 層：結構 → 地板 → 機電 → 裝修；以 CSS 3D／SVG transform 做「爆炸圖」展開，捲動或「上一層／下一層」按鈕切換，左下大字編號 + 刻度進度軌（對應 HQ 的設計／許可／機電／施工流程） | 中 | 鍵盤可操作（按鈕＋`aria-live` 標題）；觸控提供按鈕而非只靠拖曳；reduced-motion 顯示四層靜態並排 |
| 3 | **卡片展開成全幅**（作品入口／CTA） | STILL/FORM 2.3 | 作品分類卡以 View Transitions API 或 FLIP 技巧展開到 Projects 頁；不支援時直接導頁 | 中 | 需確保返回與焦點管理；僅同源導頁 |
| 4 | **十字準星座標讀數** | Heron 3.2 | 僅 `pointer: fine` 的裝置；hero 內跟隨滑鼠，顯示 `X / Y` 與最近的標註 | 小 | 純裝飾，`aria-hidden`；觸控與 reduced-motion 關閉 |
| 5 | **紅色標註框滑入** | Heron 3.2 | hero 線稿上的 `OPEN DURING WORKS` 改為標註框，hover／聚焦展開說明「分區施工、營運不中斷」 | 小 | 文字需有對比 ≥ 4.5:1，且可用鍵盤聚焦 |
| 6 | **等寬跑馬燈** | Heron 3.1 | `Design & build · Permits · MEP · Handback` 無限橫移 | 小 | 必須有暫停機制並尊重 reduced-motion（WCAG 2.2.2） |
| 7 | **loader 計數 + 全寬進度線 + 簾幕上掀** | STILL/FORM 2.1 | 現有 loader 已有進度線；改為右上 `00→100` 計數，結尾由「視窗展開」換成「簾幕上掀」可 A/B | 小 | 不增加總長（維持 ≈3.3s） |
| 8 | 區塊間「霧氣」轉場 | STILL/FORM 2.3 | 以 `mask-image` 漸層 + 位移做白色霧帶 | 小 | 淺色區塊間才有效；深色區塊間不建議 |
| 9 | 平滑捲動（Lenis） | STILL/FORM | **暫不建議**：與 `scroll-padding`、錨點、鍵盤與輔助科技互動風險高；Heron 證明原生捲動也能很絲滑 | — | 若要加，需關閉 reduced-motion、保留原生焦點行為 |

### 關於「3D 全息」要用 three.js 還是 CSS／SVG？
- **建議先走 CSS／SVG 等角爆炸圖（#2）**：與現有靜態網站相容（無 build、無額外 bundle）、可存取性可控、載入量近 0。
- three.js（STILL/FORM 做法）需要自建**虛構** 3D 模型（不得使用客戶圖面或第三方模型）、約數百 KB 的程式與模型、行動裝置效能與 WebGL 降級方案。建議在 #2 驗證成效後，再評估是否升級。

## 5. 硬性規則與合規提醒

- 不複製任何一站的文字、logo、素材、模型或程式碼，只學「節奏與結構」。
- 全息模型與線稿一律**虛構或 HQ 自繪**；不使用客戶圖面。
- 所有新動態必須：`prefers-reduced-motion: reduce` 下關閉或改靜態、可鍵盤操作、不依賴滑鼠；不使影像／裝飾承載必要資訊。
- 效能預算：新增互動腳本 ≤ 20 KB（未壓縮）、不新增阻塞渲染的外部請求；動畫僅用 `transform`／`opacity`／`clip-path`。

## 6. 需要您決定

1. 第二階段優先做哪幾項？（我建議 #1 + #2 + #5，一個 PR）
2. 全息區塊要走 CSS／SVG（建議）還是 three.js？
3. 是否要把「卡片展開」（#3）放進作品入口？
