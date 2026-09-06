# HQ Design 官網重建 · 設計交接（Fable 5.1 → Codex）

> 版本 v0.3 · 2026-09-06 · 撰寫：Fable 5.1（session `hq-design-website-a4`）
> 執行者：Codex。內容層與基礎建設：Claude `hqdesign-8d`。協作契約：repo 根 `COORDINATION.md`。
> 這份文件是自足的。讀完它、`COORDINATION.md` 與 `design/proposal/hq-design-visual-proposal-v0.3.html`，不需要本次對話的任何脈絡就能動工。

---

## 0. 一頁摘要

**要做什麼**：在 `web/`（Next 15 App Router + Motion for React + next-intl + Zod，已可建置）實作全站頁面與元件。視覺語言是「一套會動的施工圖說」：白紙、墨線、mono 標註、60° 剖面線；影像是版面上唯一的顏色。**首頁是 Powerhouse Company 式的捲動影像場**（影像場、捲動縮放、點圖放大成案例 hero），其餘全部用施工圖說自己的慣例當介面。

**六個原創介面裝置**（提案頁 A-00 有可操作示範）：圖名框 Title block、尺寸線 Dimension string、圖層 Layers、對照 wipe、圖紙索引 Sheet rail、座標讀數 Model space。

**不做什麼**：不改資料介面（`web/lib/**` 是 `hqdesign-8d` 的）；不搬 motion prototype 的資料與樣式；不 `git push`；不 `git add -A`；不動任何人的未提交修改。

**開工前**：

```bash
git status --short --branch        # 看清楚誰在動什麼
cat COORDINATION.md                # §2 所有權、§6 跨界登記、§7 現況
cd web && npm run verify           # typecheck + gates + build 必須是綠燈再開始
```

---

## 1. 工作區與所有權

| 你可以直接寫                            | 說明                                                             |
| --------------------------------------- | ---------------------------------------------------------------- |
| `web/app/**`（**除了** `web/app/_ds/`） | 頁面與版面。目前四個檔是最小骨架，檔頭標了所有權，整份取代不用問 |
| `web/components/**`                     | 全部視覺元件                                                     |
| `web/app/globals.css` 及所有 CSS        | 開頭兩行 `@import` 接 `_ds/`，**不要在這裡手寫 token 值**        |
| `web/messages/**`                       | UI 字串（zh 權威，en 缺則 fallback）                             |
| `design/**`                             | 設計文件、變體、moodboard                                        |

| 不要碰                                                                              | 為什麼                                                                                                                             |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `web/app/_ds/**`                                                                    | 由 `npm run sync:ds` 從 `ds-bundle/tokens/` 產生，有 checksum 守衛，手改會讓 build 失敗。要改 token 改 `ds-bundle/tokens/` 再 sync |
| `web/lib/**`、`web/next.config.ts`、`web/middleware.ts`、`web/package.json`         | `hqdesign-8d` 擁有。要改先在 `COORDINATION.md` §6 追加一行登記，然後就可以動，不用等回覆                                           |
| `content/**`、`scripts/**`                                                          | 內容層與管線，同上                                                                                                                 |
| `site/**`、`assets/**`、`cms/**`、`.workflow/**`、`hq-design-website-exact-next/**` | 唯讀                                                                                                                               |
| `hq-design-website-motion/prototype/**`                                             | 你自己的 prototype worktree，只當互動參考，資料與樣式不移植                                                                        |

指令（在 `web/`）：`npm run dev`｜`npm run sync:ds`｜`npm run images`｜`npm run gates`｜`npm run verify`。`prebuild` 已串「token 守衛 → 影像管線 → 個資閘門」。

---

## 2. 硬規則（違反即退回）

1. **絕無襯線體**。英文 Satoshi（`--f-en`，Variable 自架、不 subset、不轉檔）、中文 Noto Sans TC（`--f-cjk`）、數字與標籤 Geist Mono（`--f-mono`，`tabular-nums`）。
2. **零圓角**。唯二例外：`.btn` 4px（`--radius-control`）、logo 印記 9.8%（`--radius-mark`）。range thumb、checkbox 也要 `border-radius:0`。
3. **`--brand`（#D64518）單頁像素 ≤10%**（`--hq-ratio-brand-max`）。橘紅只出現在：CTA、eyebrow 編號、60° tick／slash、focus ring、圖層衝突標記、mesh 裡的一條色帶。
4. **影像 3:2，走 9／6／4 欄，避免 8 欄**（581.3px 脫離 8px 節奏）。**修正（D7，見 §12）**：卡片、拼貼、hero 一律 3:2 用 `focal` 定位；案例頁圖集允許直式 2:3 框、成對放進 4 欄位。
5. **漸層**：只允許 HQ Mesh 四組配對（verm→white、verm→deep red、navy→cool gray、verm→navy）+ 3–8% grain，只作大面積底層、不放在長段文字後方。**漸層文字、玻璃擬態、霓虹、外光暈、blur-glow 仍禁止**。
6. **不得用 `100vh`／`h-screen`**。**唯一例外**：首頁 `ScrollZoomScene` 的 sticky 舞台可用 `100svh`（`svh` 不是 `vh`），其他任何地方不可。
7. **無 emoji**（`cms/data/careers.json` 的 12 個 icon 全是 emoji，改成 mono 編號 + 60° 短線）。
8. **角度只用 0／90／60／120／30／150°**。60° slash 是簽名（CSS 上是 1px 線 `rotate(-60deg)` 或 `rotate(30deg)`）。**tile 不旋轉**（prototype 的 -3°～3° rotate 要移除）。
9. **每張影像都要來源標示，且只能從 `sourceLabel(prov, locale, variant?)` 取得，不得手寫字串。** 把 viz／enh 標成 photo 是內容政策紅線。含 viz／enh 的案子要有影像性質區塊；同案不得混排 viz 與 photo；列表頁 viz 與 photo 分成兩帶。
10. facts.md 禁用詞：賦能、無縫、次世代、顛覆性創新、Elevate、Seamless、Unleash、「Scroll to explore」。prototype 的「WE MAKE SPACE MEANINGFUL」不進正式站。
11. 公司事實只用 `ORG`／`BRAND`（`web/lib/site.ts`）與 `content/**`：30+ 年、1,600+ 案、info@hqdesign.tw、+886-2-2557-3003。

---

## 3. Token、字體、網格

Token 全部來自 `web/app/_ds/hq.css`（Token 3.0）。用變數，不寫死色碼。

| 用途     | 變數                                                                       |
| -------- | -------------------------------------------------------------------------- |
| 背景     | `--bg` `--bg-sunken` `--bg-inverse` `--bg-immersive`                       |
| 前景三階 | `--fg`（標題）`--fg-2`（正文）`--fg-3`（註記、mono 標籤）                  |
| 線       | `--line`（髮絲）`--line-strong` `--line-ink`（區塊上緣墨線）               |
| 品牌     | `--brand` `--brand-hover` `--brand-pressed` `--brand-subtle`               |
| 字體     | `--f-en` `--f-cjk` `--f-sans` `--f-mono`                                   |
| 間距     | `--s1`(4) … `--s10`(128)，`--gutter` 24，`--container` 1320，`--section-y` |
| 動態     | `--ease: cubic-bezier(.2,.7,.2,1)`                                         |

沉浸章節（模型空間、footer）在兩個主題都固定深藍：自訂 `--imm-bg:#0A1118 --imm-fg:#fff --imm-fg-2:#C0C8D2 --imm-fg-3:#6B7785 --imm-line:#1C2733 --imm-line-ink:#C0C8D2 --imm-brand:#ED6D45`。

**字級**（px，fluid）：Display EN `clamp(44,7.2vw,112)` 行高 1.02 字距 -0.03em；Display CJK `clamp(34,4.4vw,64)` 行高 1.22；H3 `clamp(19,1.7vw,26)` 500；Body 17／1.75／最寬 34em；Stat 48→34 700 tnum；Eyebrow mono 12 / 0.14em caps；Dimension mono 11 / 0.04em；Source label mono 11 / 0.06em caps。

**字重對比是原創點**：英文 statement 用 Satoshi **300**，中文用 Noto Sans TC **700**；標題裡的「×」用 60° slash 字形（`display:inline-block;width:2px;height:.72em;background:var(--brand);transform:rotate(30deg)`）。直排（`writing-mode:vertical-rl;text-orientation:mixed`）只用在圖紙索引與圖名框。

**網格**：`.wrap` 1320 + 24 gutter；`.grid` 12 欄；影像欄位 9+3、6+6、4+4+4；三等分只准純文字；桌機 ≥1180px 左緣保留 44px 給圖紙索引（`body{padding-left:44px}`）；`body{padding-bottom:72px}` 給圖名框。

**配色預算**：55 白／冷灰、25 深藍、10 圖紋、≤10 橘紅。

---

## 4. 資料介面（已就緒，直接 import）

```ts
import {
  getAllProjects,
  getProject,
  sourceLabel,
  verifiedFacts,
} from "@/lib/content/loader";
import { resolve } from "@/lib/content/locale";
import {
  toCardData,
  SOURCE_LABEL,
  type Project,
  type ProjectImage,
  type Locale,
} from "@/lib/content/schema";
import { ORG, BRAND } from "@/lib/site";
import images from "@/lib/content/generated/images.json";
```

- `Project`：`slug category weight name{zh,en} gloss lede{zh,en} specs[] cardMeta[2] note images[] facts dataQuality relatedSlugs pairs[]`。`weight`：`lead|w6|w4|reg|other`。
- `ProjectImage`：`role hero|gallery|detail|context`、`prov photo|viz|enh|drawing`、`stem`、`width height`、`alt{zh,en}`、`focal?{x,y}`（0–1）、`labelVariant?`（drawing 家族有 `bim`）。
- `sourceLabel(prov, locale, variant?)` → 四類標示字串；`drawing` + `"bim"` → 「設計圖面 · BIM VIEW」。
- `Project.pairs: {intent: string|null, asBuilt: string, note: string}[]`。**`intent` 可為 null**（目前只有 `zhongbao-store-daan` 一組，intent=null）。對照 wipe 要處理空狀態，不拿別角度的圖湊對。
- `resolve(field, locale)` → `{value, lang, isFallback}`；英文缺席時 fallback 中文並給 `lang="zh-Hant"`。
- `verifiedFacts(p)` 只回傳已驗證事實：JSON-LD／OG 只能用它。
- `toCardData(p)` 濾掉內部欄位再給 client component。
- 影像：`<Image src={`/media/work/${slug}/${im.stem}`} width height placeholder="blur" blurDataURL={images.images[`${slug}/${im.stem}`].blurDataURL} sizes="…" />`。loader 會補 `-<w>.webp`，`/_next/image` 應為 0 次。**管線不裁切**：3:2 ×64、1.79 ×29、2:3 ×14、4:3 ×6，比例由 CSS `aspect-ratio` + `object-position`（吃 `focal`）處理。
- 流程七段：`content/process/*.json` + `content/process/figures/*.svg`。目前 `web/lib` 沒有 process loader，需要時在 `COORDINATION.md` §6 登記後自行加 `web/lib/content/process.ts`，或請 `hqdesign-8d` 加。
- careers：`cms/data/careers.json`（唯讀）。四職缺、六價值、六福利。
- nav 字串：`web/messages/zh.json` 的 `nav.*`（實績／設計流程／服務項目／關於惠強／加入我們／聯絡）。

---

## 5. 全站常駐元件

### 5.1 `SiteNav`（Powerhouse 式浮動導航，但零圓角）

- 桌機：`position:fixed; top:16px; left:50%; translateX(-50%)`，48px 高，**矩形**、1px `--line` 邊框、`background: color-mix(in srgb, var(--bg) 88%, transparent)`、`backdrop-filter: blur(12px)`。內容：印記 + `HQ DESIGN`（Satoshi 700 caps 0.14em） · 五個連結 · 一個 `.btn`（洽詢專案）。捲動 >120px 後高度縮 44px。
- 手機：印記 + `Menu`。開啟後全屏深藍幕自左以 60° 斜邊掃入（`clip-path` 動畫），連結直排 Noto 700，`aria-expanded`、Esc 關閉、focus trap。
- 語言切換不在這裡，在圖名框。

### 5.2 `TitleBlock`（圖名框）

- `position:fixed; right:0; bottom:0`，56px 高，grid 橫排五格：圖號 Sheet／圖名 Title／版次 Rev／語言 Lang／頁 Page。格：上標 mono 9px caps `--fg-3`，值 mono 12.5px 500 `--fg`。上緣與左緣 1px `--line-ink`，格間 1px `--line`。
- 圖號 = 目前 section 的 `data-sheet`（首頁 A-00 拼貼 … 見各頁）；捲動用 IntersectionObserver 同步。語言格是真的 `<a>` 切到 `/en` 對應路徑。
- 手機（<700px）：`left:0`，四格等寬，隱藏版次；同時是選單入口。

### 5.3 `SheetRail`（圖紙索引，≥1180px）

- `position:fixed; left:0; top:64px; bottom:56px; width:44px`，右緣 1px `--line`。每項 `<a>` 直排：圖號 mono 10px 0.12em 橫躺 + 中文 Noto 10.5px 0.3em 直立。目前位置左側一條 60° 短線（1px×10px `rotate(30deg)`）`--brand`。

### 5.4 `DimensionString`（尺寸線）— 取代所有圖說

```tsx
<DimensionString
  prov={im.prov}
  variant={im.labelVariant}
  locale={l}
  label="5,940 SQM · 1,797 坪 · 2025"
/>
```

- 26px 高；13px 處 1px `--line-ink` 橫線；兩端 1px×13px tick `rotate(30deg)`，photo 用 `--brand`，viz／enh／drawing 用 `--fg-3`；中央 `label` mono 11px 500 `--fg`，背景 `--bg` 遮線；右端 `sourceLabel()` 結果 mono 10px caps，前綴 10px 60° 線。
- 進場：線 `scaleX 0→1` 450ms `--ease`，再 stagger 0.1s 進標籤。hover 卡片時同樣重畫。reduced-motion 直接顯示。
- **右端字串只能來自 `sourceLabel()`。**

### 5.5 `RouteCurtain`（路由轉場）

- 深藍（`#0A1118`）幕，右緣 60° 斜切，`clip-path: polygon(0 0, X% 0, calc(X% - 38.5%) 100%, 0 100%)` 自左掃過，1.2s `ease.soft`。reduced-motion → 300ms crossfade。共享元素轉場（§6.1）失敗時仍可到達路由。

### 5.6 `HqUnfocusedMesh`（`design/framer-port/HqUnfocusedMesh.tsx`）

- 由使用者指定的 Framer 元件轉換而來：純 CSS 漸進模糊（清晰源 → 遮罩模糊層 → 顆粒 → vignette），只依賴 `react` 與 `motion/react`，1.9 kB gz。放到 `web/components/hq-unfocused-mesh.tsx`。
- 用在三處：**首頁拼貼舞台底層**（`mesh: {from:"#FFFFFF", to:"#E1E8F0", angle:120}`，grain 0.04，accent `null`，遮罩集中在舞台中央）、**模型空間底層**（預設 navy→cool gray，grain 0.06，accent width 1.5 或 null）、**404／章節轉場**（verm→navy 變體，僅小面積）。
- 已移除色散、失真、blur-glow、玻璃面板；角度型別鎖定 `0|30|60|90|120|150`；圓角 0；grain 上限 8%。`useReducedMotion` → 靜態；離開視窗停止 drift。**drift 動畫尚未在 Next dev 實測，請驗。**

### 5.7 `BrandPattern`

- `design/assets/pattern/hq-pattern-1073-100220-currentColor.svg`（Figma node 1073-100220 Variant2 向量，fill 已改 currentColor、已去 id）。用 `color` 上色：navy 底白線（footer、模型空間局部）、紙白底 navy 700 線（章節轉場）、極淡 navy 100 線（空狀態、404）。**橘紅底滿版只給 OG／封面**。

---

## 6. 頁面規格

### 6.1 首頁 `/{locale}`（A-00 … A-06）

**Hero = `ScrollZoomScene`，Powerhouse 式捲動影像場。**

- 外層 section 高 `240svh`，內層 sticky 舞台 `100svh`（硬規則 6 的唯一例外）。舞台底層 `HqUnfocusedMesh`（paper 變體）。
- 12 個 `ProjectTile`（`weight` lead／w6／w4 各取、photo 為主可混 viz，每張都帶尺寸線）以 12 欄格上的絕對位置佈局，寬度 = 4／6／9 欄，**不旋轉**。位置表集中在 `scene.config.ts`。
- `useScroll({target, offset:["start start","end end"]})` → `scrollYProgress`：
  - 舞台 `scale` 1→1.28（`useSpring` stiffness 90 damping 24）
  - 每個 tile `y` 依 `depth`（0.6–1.7）不同速率位移
  - statement `opacity` 1→0（0.7 之後）
  - 最接近視窗中心的 tile（由 progress 決定）`scale` +4%、尺寸線畫出、案名浮現；其餘 opacity 降到 0.55、`filter: blur(0–6px)` 依距離（最多同時 2 張模糊；reduced-motion 不模糊）
- statement 夾在 tile 之間：`AI Parametric`（Satoshi 300）+ 60° slash + `Construction Execution`（700）+ 中文一行 Noto 700；下方三個 stat（1,600+／30+／100%）。
- 點擊 tile：`layoutId="project-photo-<slug>"`（沿用 prototype 的鏈）放大成案例 hero；記錄 `scrollY`，返回時還原；沒有 sourceRect 時走 `RouteCurtain`。
- 舞台之後的區塊（皆為一般流式、不釘住）：01 定位（5/7 split：h2「AI 不只畫圖，而是提升整個交付。」+ 對照表，右欄 60° 短線標記）→ 02 流程雙軌（§6.4 的精簡版 + 橘紅進度線）→ 03 模型空間（§6.5 沉浸章節）→ 04 實績（9+3、6+6、4+4+4 共 6 張，兩帶標示）→ 05 客戶（純文字一列 mono：C.SUN INDUSTRIAL · AIONTECH · LIWEI ELECTRONICS · ZHONG BAO INSURANCE · DXC TECHNOLOGY）→ 06 開始專案（`--bg-sunken` 帶：一個 `.btn`、電話、email）→ Footer（navy，pattern 局部，lockup、地址、語言、sitemap）。
- 所有區塊：eyebrow（28px 髮絲 + mono 編號 `--brand` + 標題）、上緣 `--line-ink`。

### 6.2 實績 `/{locale}/work`（A-07）

- 頂部：h1「實績」+ lede + mono 各類數量。
- Toolbar：左「圖例 · Legend」= filter chips（全部 33 / Office / Hospitality / F&B / Showroom / Lounge，32px 高、mono caps、active 為 `--fg` 底 + 左上 60° 切角 `clip-path: polygon(18.5px 0,100% 0,100% 100%,0 100%)`）；右「找圖 · Search」mono 輸入（案名 zh/en、業主、地點）。狀態同步 URL `?cat=&q=`。
- 兩帶：**竣工圖集 As-built set**（photo + drawing）在前，**設計圖集 Design set**（viz + enh）在後，帶頭有 `notice` 影像性質區塊。`LayoutGroup` + `AnimatePresence mode="popLayout"` 重排（沿用 prototype `ProjectsBrowser` 模式）。
- 卡片 = 3:2 影像 + `DimensionString` + 案名（zh 500 15px / en 12px `--fg-3`）。lead 6 欄、w6 6 欄、w4 4 欄；`reg` 案改名冊列（96px 縮圖 + 案名 + mono 標示）。
- 空狀態：極淡 `BrandPattern` + 「沒有符合的案例」+ 重設。
- 手機：chips 橫向捲動，search 收成一格；鍵盤可操作全部。

### 6.3 案例 `/{locale}/work/[slug]`（A-08）

- **不做滿版 hero。** 頂部是這一案的圖名框 `titleblock`：左 eyebrow（類別 · 年份 · 地點 · 圖 1/N）+ h1 案名 Noto 700 + gloss Satoshi `--fg-3`；右 `SpecStrip` 四格（業主／地點／面積／年份，mono，上緣 `--line-ink`）。右上 mono「關閉 · ESC」回列表並還原捲動。
- Hero 9 欄 3:2（`layoutId` 目標）+ 3 欄 aside（lede）；下方 `DimensionString`。
- 若 `pairs.length`：`CompareWipe`（§7）；`intent===null` 時左半為極淡 pattern 空框 + 「設計意圖 · 同機位渲染待補」。
- 含 viz／enh：圖集前放影像性質區塊（`note`）。
- 圖集：6+6、4+4+4；**直式 2:3 允許 2:3 框、成對進 4 欄位**（D7 A）；每張 `DimensionString`（label = spaceZh + 可驗證事實）。`Lightbox`：Esc、方向鍵、focus trap、mono chrome、標示不消失。
- 相關案例 4+4+4：同類優先（`relatedSlugs` 空時以 category 相同 → 其他）。
- CTA。

### 6.4 流程 `/{locale}/process` 與 `/{locale}/process/[stage]`（A-09）

- 總覽：同一張圖三列 `ProcessTracks`。Track A 七段（01 現況掃描 AI／02 參數化方案 Parametric／03 設計意圖定案／04 技術驗證／05 BIM 協調 BIM／06 施工圖說／07 交付與專案管理 AI PM；tag 只給四段）。Track B 外部設計意圖五階段對齊 03→07（Design Intent Review／Technical Validation／BIM Coordination／Construction Documentation／Site Delivery；例：金普頓，01–02 為虛線空格）。Track C 施工六步驟落在 06→07（技術詳圖／施工文件／材料協調／樣板確認／現場品管／竣工交付）。捲動時橘紅進度線沿軌道前進；hover／focus 任一段顯示一句效益（來自 `content/process/*.json` 的 lede）。
- 各段頁：問句 h1（`h1` 欄位）、lede、輸入／輸出（`inp`/`out`）、SVG 製圖（`figures/*.svg`）以 `pathLength` 0→1 畫出、how（4）、why（3）、evidence。順序與命名不可自創。

### 6.5 模型空間（首頁 03 章節；A-10）— 全站唯一沉浸深底

- 底層 `HqUnfocusedMesh` navy→cool gray + 6% grain；左下一小角 verm→navy 能量場（計入 10% 預算）。
- 左欄：人數滑桿（20–60，thumb 14×24 方形 `--imm-brand`）→ 平面 SVG 的工位、會議室數、淨面積同步更新（示意規則：9 sqm／人、12 人一間，**必須標「示意模型，非實際案件數據」**）；圖層開關四個方形 checkbox（建築 Arch／機電 MEP／家具 FF&E／分區 Phasing，分區用 60° 疏線 hatch）；**建築與機電同時開啟時顯示 `CLASH 01 · 進場前解決`**（`--imm-brand` 方框 + 引線）。三條 claims（多方案不必多等待／撞管在模型裡被找到／人做決策系統做運算）。
- 右欄：平面 SVG（`cursor: crosshair`）+ 右上 `X · Y · MM` 座標讀數（pointermove，1px=20mm）；下方兩張等角 BIM 線稿（Figma 簡介 p07／p08 匯出，`prov="drawing"` `labelVariant="bim"`）各帶尺寸線。

### 6.6 服務 `/{locale}/services`

十項服務做**名冊列**（mono 編號 + 中文 + 英文 + 一句），不用 icon 卡；五部門（設計部／工程部／AI 部門／規劃顧問部／行政支援部）做髮絲線樹狀圖，AI 部門三項（AI & Parametric Design／BIM & Digital Coordination／智慧空間應用）展開。

### 6.7 關於 `/{locale}/about`

八節點里程碑（1995.1 公司創立 → 2010.1 整合服務成形 → 2019.1 大型連鎖門市 → 2022.1 國際飯店品牌 → 2023.1 連鎖餐飲拓點 → 2024.1 國際品牌進駐 → 2025.1 企業總部成長 → 2026.4 智慧設計轉型）排成**一條長尺寸線**：節點是 60° tick，年份 mono 在線上，說明在下。五部門、AI 部門、事實三格（Since 1995／1,600+／100%）。

### 6.8 加入我們 `/{locale}/careers`

四職缺（室內設計師／資深室內設計師／專案經理／工務經理）名冊列 + 技能 mono 標籤；六價值、六福利改為 mono 編號 + 60° 短線（**不用 emoji**）。「31+ 年」一律改 30+。

### 6.9 聯絡 `/{locale}/contact`

「第一次會議請準備六件事」做成勾選清單 → 預填表單（Formspree `xeendgkz`，欄位 `name email phone company space_type timeline description`）→ 送出前顯示 mono 需求摘要 → 成功狀態（圖名框顯示 `SENT`）。行內驗證、錯誤說明怎麼修。電話與 email 用 `ORG`。

### 6.10 404

極淡 `BrandPattern` 底、Noto 700「此圖未發行。」、圖名框顯示 `SHEET NOT ISSUED`、mono「回實績 →」。

---

## 7. 元件清單與契約（`web/components/`，kebab-case 檔名）

| 元件                                      | 主要 props                                         | 備註                                      |
| ----------------------------------------- | -------------------------------------------------- | ----------------------------------------- |
| `site-nav.tsx` `SiteNav`                  | `locale`                                           | 浮動矩形；手機 60° 斜切幕                 |
| `title-block.tsx` `TitleBlock`            | `sheets: {id, sheet, name}[]`, `locale`, `altHref` | IntersectionObserver 同步                 |
| `sheet-rail.tsx` `SheetRail`              | `sheets`                                           | ≥1180px                                   |
| `dimension-string.tsx` `DimensionString`  | `prov, variant?, locale, label, drawOnView?`       | 右端只用 `sourceLabel()`                  |
| `scroll-zoom-scene.tsx` `ScrollZoomScene` | `tiles: ProjectCardData[]`, `statement`            | Powerhouse 式；配置在 `scene.config.ts`   |
| `project-tile.tsx` `ProjectTile`          | `card, depth, span 4\|6\|9, active`                | `layoutId="project-photo-<slug>"`，不旋轉 |
| `project-card.tsx` `ProjectCard`          | `card, span`                                       | 列表用                                    |
| `work-browser.tsx` `WorkBrowser`          | `cards`, `locale`                                  | 圖例 + 找圖 + URL 同步 + 兩帶             |
| `register-row.tsx` `RegisterRow`          | `card`                                             | 1–3 張圖的案子                            |
| `project-hero.tsx` `ProjectHero`          | `project, locale`                                  | 圖名框 + 9 欄 hero + SpecStrip            |
| `spec-strip.tsx` `SpecStrip`              | `specs` (verified 優先)                            | 四格 mono                                 |
| `compare-wipe.tsx` `CompareWipe`          | `pair, images, locale`                             | 60° 斜邊；intent null 空狀態              |
| `gallery.tsx` `Gallery` + `lightbox.tsx`  | `images, locale`                                   | 2:3 例外、Esc、方向鍵、focus trap         |
| `related-projects.tsx`                    | `cards`                                            | 4+4+4                                     |
| `process-tracks.tsx` `ProcessTracks`      | `stages`, `compact?`                               | 三軌、進度線                              |
| `stage-figure.tsx` `StageFigure`          | `svg`                                              | pathLength 畫出                           |
| `model-space.tsx` `ModelSpace`            | —                                                  | 滑桿、圖層、衝突、座標                    |
| `hq-unfocused-mesh.tsx`                   | 見 `design/framer-port/README.md`                  | 三處使用                                  |
| `brand-pattern.tsx` `BrandPattern`        | `tone: navy\|paper\|faint\|verm`                   | inline SVG currentColor                   |
| `route-curtain.tsx` `RouteCurtain`        | —                                                  | 60° wipe                                  |
| `contact-brief.tsx` `ContactBrief`        | `locale`                                           | 六件事 → 預填 → 摘要 → Formspree          |
| `site-footer.tsx`                         | `locale`                                           | navy、pattern 局部                        |
| `motion/tokens.ts`                        | —                                                  | 見 §8（放 components 下，不進 `web/lib`） |

---

## 8. Motion token（`web/components/motion/tokens.ts`）

沿用 prototype `lib/motion.ts` 的 `hqMotion`，補三個：

```ts
export const hqMotion = {
  duration: { micro: 0.18, standard: 0.45, editorial: 0.8, scene: 1.2 },
  ease: {
    brand: [0.2, 0.7, 0.2, 1] as const,
    soft: [0.16, 1, 0.3, 1] as const,
  },
  spring: { scroll: { stiffness: 90, damping: 24 } },
  stagger: { tight: 0.05, standard: 0.1, relaxed: 0.16 },
  reveal: { y: 18 },
};
```

原則：一支筆（所有動態都是一條 60° 線在畫）；影像用 clip-path 裁切揭露，不縮放模糊；線先畫、字再進；scroll 只驅動 transform／opacity（MotionValue，不 re-render）；同一 DOM 屬性只有一個 owner；`MotionConfig reducedMotion="user"` 全站統一，reduced 下 transform 全關、只留 opacity，拼貼退成靜態網格。

---

## 9. prototype 元件的處置（你自己的 `prototype/next-motion-site`）

| 產出                                | 判定     | 怎麼做                                                                                                                                          |
| ----------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/motion.ts`                     | 沿用     | 搬到 `web/components/motion/tokens.ts`，補 §8 三個 token                                                                                        |
| `ProjectsBrowser`                   | 沿用模式 | LayoutGroup + popLayout 對；資料改 `ProjectCardData`；filter 改圖例、search 改找圖並同步 URL；分兩帶；空狀態用 pattern                          |
| `layoutId project-photo-<slug>`     | 沿用     | tile → 卡 → hero 一條鏈；加無 sourceRect 的 fallback                                                                                            |
| `SiteNavigation`                    | 沿用骨架 | 改浮動矩形；選單改 60° 斜切幕；語言移到圖名框；連結接 next-intl                                                                                 |
| `ProjectMosaic`                     | 改寫     | 保留 useScroll→useSpring 手感與 stage scale；**移除 rotate、移除「Scroll to explore」**；加 depth 視差、尺寸線、中心 tile 邏輯、mesh 底層、模糊 |
| `ProjectDetail`                     | 改寫     | 保留 hero layoutId 與 close；滿版 hero + 漸層 scrim + × → 圖名框 + 9 欄 hero + 尺寸線 + mono「關閉 · ESC」                                      |
| `globals.css`、`hq-tokens.css`      | 不搬     | token 走 `_ds/`                                                                                                                                 |
| `lib/projects.ts`、`content/*.json` | 不搬     | 資料權威是 `content/projects`                                                                                                                   |
| drawing 標示                        | **修正** | 你目前寫「圖面 · DRAWING」，權威是「設計圖面 · FLOOR PLAN」；正式站一律 `sourceLabel()`                                                         |

---

## 10. 品牌資產與 SEO

`hqdesign-8d` 正在做 favicon／OG／`lib/seo/metadata.ts`，**不要重做**，看 `COORDINATION.md` §7。設計規格供對方參考：favicon = 白色印記 on #D64518、rx 9.8%（16px 以下省略最細斜線）；OG 預設 1200×630 = navy 700 底 + Figma pattern @9% + 白色 lockup + 一條橘紅 slash + 右下迷你圖名框；案例 OG = hero 3:2 置中 + 圖名框，只放 `verifiedFacts()`。logo 只用 `HQ Design - Design System/HQ-logo/export/`（#D64518），`LOGO/` 資料夾（#DB421A）不用。

---

## 11. 驗收閘門與效能預算

**閘門**（全部通過才算完成）：

1. `npm run verify` 綠燈（typecheck + token 守衛 + 個資閘門 + 內容閘門 33/33 + build）。
2. Build-time lint：無襯線體、無 emoji、無 `100vh`（`ScrollZoomScene` 的 `svh` 例外）、圓角只有 4px／9.8%、漸層只有 HQ Mesh 四組、單一 h1、canonical 齊全。
3. 來源標示稽核：每張 `<img>` 在帶 `data-provenance` 的 figure 內；標示字串全部來自 `sourceLabel()`；13 個 viz 案不得出現 AS-BUILT。
4. `--brand` 像素稽核：Playwright 逐頁截圖計算橘紅像素（含 mesh），≤0.10。
5. a11y：鍵盤走完 nav／圖例／找圖／card／gallery／wipe／圖層；Esc 關閉；reduced-motion 下仍能完成導航；影像 alt 正確；`lang` fallback 標記。
6. 301 與 hreflang：27 條逐條；zh／en 互指 alternate。
7. Vercel preview 走完整站三個 viewport（1440／1024／390）：首頁 → 實績 → 案例 → 流程 → careers → 聯絡；直接進案例 URL 重新整理正常；瀏覽器返回還原捲動；console 無錯。

**效能預算**：LCP ≤2.0s（4G）；hero 影像 ≤180 KB；首頁 client JS ≤90 KB gz（Motion 只進 client islands）；CLS 0；INP <200ms；`/_next/image` 0 次。

---

## 12. 決策狀態

| #   | 事項             | 狀態                                                                                                           |
| --- | ---------------- | -------------------------------------------------------------------------------------------------------------- |
| D1  | 工作區           | 使用者將執行交給 Codex；在 `hq-design-website/web/` 直接動工（Fable 的路徑由 Codex 代為執行），不開新 worktree |
| D2  | 首頁 hero        | **使用者已確認**：Powerhouse 式捲動影像場 + 尺寸線                                                             |
| D3  | 內容層介面       | 已由 `hqdesign-8d` 完成（`bim` 變體、`focal`、`pairs`）；命名 BIM VIEW 採用                                    |
| D4  | 1.79 渲染裁 3:2  | 置中裁切 + `focal`（管線不裁，CSS 裁）                                                                         |
| D5  | 事實衝突         | 30+ 年、info@hqdesign.tw（facts.md／site.ts 為準）                                                             |
| D6  | 首頁拼貼混入 viz | 可混入、每張標示（可回溯：改 `scene.config.ts` 的 tile 清單即可）                                              |
| D7  | 直式 2:3 ×14     | 卡片、拼貼、hero 3:2 + focal；圖集允許 2:3 框成對進 4 欄（可回溯）                                             |
| —   | shader           | 使用者指示納入：`HqUnfocusedMesh` 三處使用（§5.6）                                                             |

D4–D7 是 Fable 的建議值、使用者未逐項回覆；已依建議寫入規格，皆可回溯。

---

## 13. 附件（都在 `design/`）

- `proposal/hq-design-visual-proposal-v0.3.html` — 完整視覺提案，單檔可開，含可操作示範：首頁拼貼視差與中心 tile、對照 wipe、模型空間（滑桿／圖層／衝突／座標）、圖名框與圖紙索引即時同步、Figma pattern 四種用法、HQ Mesh 四組。**版面與元件以此為視覺基準。**
- `framer-port/HqUnfocusedMesh.tsx` `README.md` `SOURCE-NOTES.md` `preview/index.html` — shader 元件與說明。
- `assets/pattern/hq-pattern-1073-100220-currentColor.svg` — 品牌 pattern（可上色版）；同目錄另有 Figma 原始三檔。
- 互動參考（僅參考，不得複製 bundle／CSS／圖片／文字／字體）：Powerhouse Company 首頁、Projects、專案頁；repo 根 `HQ Design React Project Experience System.md`、`HQ Design Motion-first 動畫元件系統.md`；`hq-design-website-motion/CLAUDE-INTEGRATION-HANDOFF.md`。

完成後回報：實際修改檔案、`npm run verify` 結果、七道閘門逐項、未確認項目與剩餘風險。**不要 push**，推送由使用者執行。
