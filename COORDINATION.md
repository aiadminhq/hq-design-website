# 多 Agent 協作契約 — HQ Design 官網重建

> 建立於 2026-09-06，由 Claude session `hqdesign-8d` 撰寫。
> 目前有三方同時在此 repo 工作。**動任何檔案前先讀本檔。**

## 0. 為什麼需要這份契約

三方共用同一個 `.git`，其中兩方在同一個 worktree。沒有契約就會互相覆蓋。
另外已經發生過一次實質問題：Codex 的 prototype 寫入了與權威來源不符的專案數據
（`polytron` 1,020 vs 850 sqm、`csun` 709 vs 711 sqm 等），詳見 §4。

## 1. 誰在哪裡

| 方            | 身分                   | worktree                    | branch                  | 職掌                                 |
| ------------- | ---------------------- | --------------------------- | ----------------------- | ------------------------------------ |
| **Claude**    | `hqdesign-8d`          | `hq-design-website/`        | `feat/site-rebuild`     | 內容層、資料管線、基礎建設、品質閘門 |
| **Fable 5.1** | `hq-design-website-a4` | 同上 ⚠️                     | 同上 ⚠️                 | 視覺語言與設計                       |
| **Codex**     | CLI / `/codex:*`       | `hq-design-website-motion/` | `codex/hq-motion-first` | Motion 元件與互動實作                |

⚠️ **Claude 與 Fable 目前在同一個 worktree 的同一個分支上。** 這是唯一的高風險點，
靠下面的目錄所有權來隔離。若 Fable 的工作會大量改寫既有檔案，應先開獨立 worktree。

## 2. 目錄所有權

「擁有」＝可自由建立與修改，不需先問。**非擁有者要改，先在 §5 登記。**

### Claude 擁有

```
content/**              33 案 + 7 段流程的內容層（單一事實來源）
scripts/**              抽取器、影像管線、品質閘門
web/next.config.ts      路由與 301
web/middleware.ts       i18n locale routing
web/lib/content/**      Zod schema、loader、locale resolver
web/lib/site.ts         公司常數（唯一來源）
web/lib/seo/**          metadata、canonical、hreflang
web/lib/routes/**       301 對照表
web/package.json  web/tsconfig.json
AGENTS.md  CLAUDE.md  COORDINATION.md  .gitignore
```

### Fable 5.1 擁有（自 2026-09-06 起由 **Codex 代為執行**）

Fable 已完成設計並收尾，規格以 `design/HANDOFF-web-design-fable-to-codex.md`（34 KB）為準。
下列路徑的實作由 Codex 進行；Codex 要改 `web/lib/**` 時仍走 §6 登記。


```
web/app/**              頁面版面與構成
web/components/**       視覺元件
web/app/globals.css     以及所有 CSS
web/messages/**         UI 字串字典
design/**               交接文件、視覺提案 v0.3、shader 元件、Figma pattern 向量（11 檔 / 2.2 MB）
```

### Codex 擁有

```
hq-design-website-motion/prototype/next-motion-site/**    整個 motion worktree
```

### 沒有人可以碰

```
assets/**                 525 MB 舊站影像母檔（唯讀，可據以產生衍生檔）
site/**                   舊靜態站，抽取完成，等待歸檔
.workflow/**              Claude workflow session 所有物
cms/**                    既有 CMS 資料與 schema（改動會使 26 份資料失效）
.git/**  .claude/**  .codex/**
framer reference/**       ⚠️ 1,890 檔 / 260 MB 第三方參考素材，含 Powerhouse Company
                          官網鏡像（42 MB / 79 張其攝影作品）與第三方個人網站（127 MB）。
                          **已加入 .gitignore**——repo 公開，提交等同以惠強名義發布他人
                          受版權保護的內容，Codex 規格書亦明文禁止。唯讀比對用。
                          兩份 Codex 規格書與 hq-design-website-exact-next/ 已被搬進此目錄
```

## 3. 硬規則（任何一方都不得違反）

1. **絕不 `git push`。** 這是公開 repo，推送由使用者執行。
2. **絕不 `git add -A` / `git add .` / `git add -u`。** 逐檔列出路徑。
   個資排除只靠 `.gitignore`，全加會在規則失效時一次外洩到公開 repo。
3. **絕不** `git reset` / `checkout` / `stash` / `clean` 他人的未提交修改。
4. **絕不**移除或放寬 `.gitignore` 中標示「第三方個資」的區塊。
5. 設計硬規則照舊：絕無襯線體、零圓角（僅按鈕 4px／logo 印記 9.8%）、
   `--brand` 單頁像素 ≤10%、影像 3:2 走 9/6/4 欄、不得用 emoji／漸層文字／玻璃擬態。
   主色 `#D64518`（LOGO 檔裡的 `#DB421A` 是過期值）。

## 4. 專案數據：可暫填，但必須可回溯

使用者已裁示：**缺漏數據可先暫填以豐富內容**，之後人工核對。
但暫填值必須結構化標記，否則會靜默變成「事實」。

- `content/projects/*.json` 的 `specs[].verified` 與 `dataQuality` 是強制欄位。
- 暫填值 → `verified: false`，並登記進 `dataQuality.provisionalFields`。
- **`verified: false` 的數值不得進入 JSON-LD、`llms.txt`、OG image、`sitemap`。**
  那些是機器可讀的對外宣稱，會被搜尋引擎與 AI 當事實引用。頁面上正常顯示不受限。
- 待核對總表：`content/NEEDS-REVIEW.json`（目前 18 案：缺 `areaSqm` 18、`year` 13、`locationZh` 6）。

## 5. 影像來源標示是內容政策紅線

每張影像必須帶四類標示之一，且**由資料的 `prov` 欄位單向推導，不得手寫**：

| `prov`    | 標示                                | 目前張數 |
| --------- | ----------------------------------- | -------- |
| `photo`   | 完工實景 · AS-BUILT                 | 91       |
| `viz`     | 設計提案視覺 · DESIGN VISUALISATION | 29       |
| `enh`     | 實拍 · AI 光影強化 · AI-ENHANCED    | 4        |
| `drawing` | 設計圖面 · FLOOR PLAN               | 2        |

把設計視覺標成完工實景是紅線。含 `viz`／`enh` 的案子必須帶影像性質聲明；
同一案不得混排 `viz` 與 `photo`。這兩條已由抽取器驗證通過，不要破壞。

## 6. 跨界申請

要改別人擁有的目錄時，在本節末尾追加一行，然後就可以動：

```
[時間] [誰] [要改什麼路徑] [為什麼] [是否已完成]
```

**申請紀錄**

```
2026-09-06  Fable→Claude  web/lib/content/schema.ts  四項介面擴充  已完成
2026-09-07  Claude→Fable  web/app/[locale]/layout.tsx           注入 Organization/WebSite JSON-LD 與 metadataBase  已完成
2026-09-07  Claude→Fable  web/app/[locale]/page.tsx             generateMetadata 改走 lib/seo            已完成
2026-09-07  Claude→Fable  web/app/[locale]/[section]/page.tsx   generateMetadata 改走 lib/seo + JSON-LD  已完成
2026-09-07  Claude→Fable  web/app/[locale]/work/page.tsx        generateMetadata + ItemList JSON-LD      已完成
2026-09-07  Claude→Fable  web/app/[locale]/work/[slug]/page.tsx generateMetadata + CreativeWork/ImageObject  已完成
2026-09-07  Claude→Fable  web/app/[locale]/process/page.tsx     generateMetadata + JSON-LD               已完成
2026-09-07  Claude→Fable  web/app/[locale]/process/[slug]/page.tsx  generateMetadata 改用內容層既有 title/desc  已完成
2026-09-07  Claude→Fable  web/app/[locale]/image-policy/page.tsx    新頁：ImageObject.license 的指向目標  已完成
2026-09-07  Claude       web/app/{robots.ts,sitemap.ts,llms.txt/route.ts}  SEO 基礎路由（Claude 所有）  已完成
2026-09-07  Claude→Fable  web/app/[locale]/globals.css          移植舊站 .dia 的 SVG 線稿樣式為 .stage-figure svg（七張流程圖原渲染成實心黑塊）  已完成
2026-09-07  Claude→Fable  web/app/[locale]/process/[slug]/page.tsx  改用階段英文欄位渲染（h1En/ledeEn/inpEn/outEn/howEn/whyEn/evFootEn/figAltEn）、修正硬寫的 lang="zh-Hant"、證據連結錨點改用案件英文名  已完成
2026-09-07  Claude→Fable  web/app/[locale]/work/[slug]/page.tsx     規格表英文頁改讀 spec.valueEn、影像性質聲明的 lang 改為跟著實際內容  已完成
2026-09-07  Claude→Fable  web/components/project-data.ts           toCardData 英文卡片改讀 spec.valueEn  已完成
2026-09-07  Claude→Fable  web/components/__tests__/project-data.test.ts  spec fixture 補 valueEn: null（schema 新增欄位）  已完成
```

**這批修改的邊界**：只動 `generateMetadata` 與在 `<main>` 內加一個 `<JsonLd>`。
版面、CSS、文案結構完全未動。所有 SEO 邏輯在 `web/lib/seo/**`，頁面只是呼叫端——
Fable／Codex 要整份取代版面時，把那幾行搬過去即可，不需要重寫任何 SEO 邏輯。

Fable 提出、Claude 已實作的四項（不需再申請，直接用）：

1. **`sourceLabel(prov, locale, variant?)`** — `drawing` 家族新增 `bim` 變體
   （`設計圖面 · BIM VIEW` / `BIM VIEW`）。變體型別上限縮在同一 prov 家族內，
   `photo` 沒有 `bim` 這個 key，所以紅線依然是結構性的，不是靠自律。
2. **`ProjectImage.focal?: {x, y}`** — 0–1 正規化座標，給 5504×3072 裁 3:2 用。
   另有 `labelVariant?: string`，由 R8 驗證必須是該 prov 的合法變體。
3. **`Project.pairs: [{intent: string|null, asBuilt: string, note}]`** —
   `intent` 允許 null。`gen_work.py` 原本的做法是渲染圖未到位時保留結構、
   不放替代圖，那個誠實的選擇保住了。R7 驗證兩端 stem 都必須存在於本案影像，
   且 `asBuilt` **不得指向 viz**。目前 `zhongbao-store-daan` 有一組，intent 為 null。
4. **`web/messages/**` 劃給 Fable**（見 §2）。`web/app/_ds/` 的 token 同步由 Claude
   產生並加 checksum 守衛，Fable 只 import。

## 7. 現況

2026-09-06 Codex：依使用者要求優化 RWD、置入本機正式 Logo，建立新的 Vercel 專案 hq-design-next。沿用已授權 current checkout；`web/next.config.ts` tracing root 包含上層 content 與品牌 SVG，`web/public/brand/`、`web/app/icon.svg` 僅複製正式品牌資產；既有 staging 保留。

跨界修正登記：2026-09-06 Codex — `web/package.json`：將本次 DTO／影像尺寸回歸測試加入 `test` 與 `verify`，另提供需先啟動本地站的 `test:local`；不更動 dependencies。

跨界修正登記：2026-09-06 Codex — `web/lib/image-loader.ts`：整站 HTTP 驗證發現小尺寸來源被請求不存在的 2560px 檔案；依現有 generated/images.json 的實際 widths 選檔，保留內容與管線來源。此修正隨本地網站交付檢查。

**最後更新：2026-09-07，由 Claude（GEO／SEO 實作，branch `feat/geo-seo`）**

### 前置全部完成 — Fable 可以動手了

- ✅ **內容層** 33 案 / 126 張影像 + 7 段流程 + 7 張 60° SVG 製圖
- ✅ **Zod schema** 9 條 superRefine，兩條內容政策紅線是結構性的
- ✅ **內容閘門** 6 道檢查，33/33 通過
- ✅ **個資閘門** 檔名／內容／EXIF 三層，582 張輸出零中繼資料
- ✅ **Design token 同步** `ds-bundle/tokens/*` → `web/app/_ds/`，checksum 守衛實測會擋
- ✅ **Satoshi 7 檔** → `web/public/fonts/`（逐位元組複製，未 subset）
- ✅ **影像管線** 126 張 → 582 檔 webp（六個尺寸）+ 126 個 blur placeholder
- ✅ **i18n** `/zh` `/en` 靜態產生，英文缺漏 fallback 中文並帶 `lang="zh-Hant"`
- ✅ **27 條 301** 實測 27/27 正確
- ✅ **`next build` 綠燈**

### 給 Fable 的介面

```ts
import { getAllProjects, getProject, sourceLabel, verifiedFacts } from "@/lib/content/loader";
import { resolve } from "@/lib/content/locale";
import { toCardData, SOURCE_LABEL, type Project, type Locale } from "@/lib/content/schema";
import { ORG, BRAND } from "@/lib/site";
import images from "@/lib/content/generated/images.json";
```

**影像用法**（`src` 不帶副檔名與尺寸，loader 會補）：

```tsx
<Image
  src={`/media/work/${slug}/${im.stem}`}
  width={im.width} height={im.height}
  placeholder="blur"
  blurDataURL={images.images[`${slug}/${im.stem}`].blurDataURL}
  sizes="..."
/>
```

實測：srcset 全部指向預先產好的靜態 webp，**`/_next/image` 出現 0 次**——
Vercel 的 image transformation 配額完全不消耗。

**管線刻意不裁切。** 來源長寬比不統一（3:2 有 64 張、AI 渲染 1.791 有 29 張、
直式 2:3 有 14 張），直式硬裁成 3:2 會砍掉一半畫面且不可逆。裁切交給 CSS 的
`aspect-ratio` + `object-position`（吃 `ProjectImage.focal`）。

**Token 已接上** `web/app/[locale]/globals.css` 開頭兩行 `@import`。
`--brand`、`--f-en`、`--container`、`--radius-control`、`--hq-ratio-brand-max`
全部進到產出的 CSS，Satoshi `@font-face` 指向 `/fonts/`。
要改 token 請改 `ds-bundle/tokens/` 後跑 `npm run sync:ds`——手改 `web/app/_ds/` 會讓 build 失敗。

### 指令

```bash
cd web
npm run dev          # 開發
npm run sync:ds      # ds-bundle → app/_ds（改 token 後跑）
npm run images       # 影像管線（增量，內容雜湊未變就跳過）
npm run gates        # token 守衛 + 個資閘門 + 內容閘門
npm run verify       # typecheck + gates + build
```

`prebuild` 會自動跑 token 守衛 → 影像管線 → 個資閘門，所以 `npm run build` 一定是乾淨的。

### 還沒做

- ⏳ 品牌資產（logo 與 favicon 已就位；OG image 已由 `npm run og` 產生 41 張）
- ✅ `web/lib/seo/**`（canonical／hreflang／OG／JSON-LD／robots／sitemap／llms.txt）
      2026-09-07 完成於 `feat/geo-seo`，`npm run seo:verify` 293/293 通過
- ✅ **英文內容**：33 案（name／lede／note／126 張 alt／spec 值）與 7 段流程
      （標題／說明／輸入輸出／how／why／證據註腳／製圖無障礙標題）2026-09-07 完成。
      `parity` 隨之自動翻為 full，40 個 `/en/` 深層頁進入索引，
      sitemap 由 58 條增為 98 條，無需人工開關
- ⏳ `app/` 只有最小骨架，四個檔都標了 Fable 所有權，整份取代沒問題

### 已知缺陷（非本次範圍，需 Fable／Codex）

- **七段流程製圖在頁面上是黑塊。** `content/process/figures/*.svg` 用 `.ln`／`.tx`／
  `.tc`／`.fx` 等 class 取樣式，但這組規則只存在於舊站 `site/process/*/index.html`
  的 `.dia` 範圍，未被移植到 `web/app/[locale]/globals.css` 的 `.stage-figure`。
  沒有樣式時 SVG polygon 落到預設 `fill:black`。
  規則原文見 `site/process/bim/index.html` 第 69–82 行；
  深底版本的等效配色已寫在 `web/scripts/build-og.mjs` 的 `FIG_CSS`，可直接參考。

### 跨方待辦

**給 Codex**（Fable 發現、Claude 覆核，兩方都沒有直達 Codex 的通道）：

`hq-design-website-motion/prototype/next-motion-site/lib/projects.ts` 的
`PROVENANCE_LABEL.drawing` 目前是 `"圖面 · DRAWING"`，**權威值是
`"設計圖面 · FLOOR PLAN"`**（來源：`gen_work.py` 的 `src_label()`，
以及 `web/lib/content/schema.ts` 的 `SOURCE_LABEL`）。其餘三類都正確。

順帶一提：`drawing` 家族現在多了一個 `bim` 變體（`設計圖面 · BIM VIEW`），
給等角 BIM 線稿用。取用一律走 `sourceLabel(prov, locale, variant?)`，
不要自建對照表——變體的型別限縮在同一 prov 家族內，那是紅線的結構性保證。

Codex 已把資料源改成 `import` 本 repo 的 `content/projects/*.json`，方向正確。

### 待使用者裁決

- Fable 的六項設計裁決 D1–D6
- `/projects/zhongbao-nangang.html` 暫時導向 `/zh/work/secom-nangang-complex`（同址同業主）
- `content/NEEDS-REVIEW.json` 的 18 案缺漏事實
- 3 案缺 hero：`burger-ray`、`staff-facility`、`transasia-bakery-dayuan`
- **D7（Fable 提出）**：直式 2:3 有 14 張，與硬規則「影像一律 3:2」衝突。
  Fable 建議卡片／拼貼／hero 維持 3:2 走 focal，案例頁圖集允許 2:3 成對進 4 欄。
  裁決前不改規則文字
