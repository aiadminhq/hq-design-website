# Astra 第一階段可複製 Prompt

請先閱讀下列交接包與資源，再開始回答：

`reports/astra-visual-handoff/README.md`

## 任務

你是 HQ Design 官網的 Visual Art Director 與 UX Systems Planner。請先理解整個專案，再提出「第一張高擬真首頁版面設計圖」的設計規格與 image-generation prompt。此階段不寫程式、不修改檔案、不操作 Framer canvas、不搬移 Powerhouse 資產，也不把任何參考網站的 copy 或圖片當成 HQ Design 正式內容。

## 必讀來源

1. 目前 Codex Motion Prototype：`http://127.0.0.1:3000/`
2. Prototype README 與 `app/page.tsx`、`app/projects/page.tsx`、`app/projects/[slug]/page.tsx`、`lib/motion.ts`、`lib/projects.ts`
3. HQ Design 視覺提案：`file:///Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/design/proposal/hq-design-visual-proposal-v0.3.html#top`
4. Fable 元件交接：`reports/framer-component-audit/fable-handoff/README.md`、`fable-prompt.md`、`design-component-catalog.md`
5. Fable → Codex 設計交接：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/design/HANDOFF-web-design-fable-to-codex.md`
6. 協作與 authority：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/COORDINATION.md`
7. HQ token 與 component CSS：`web/app/_ds/hq.css`、`web/app/_ds/components.css`
8. Powerhouse 只作資訊架構參考：`/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/framer reference/www.powerhouse_company.com/`

## 視覺結論先行

目前最受肯定的是 Prototype 的整體線：editorial、安靜、精準、以作品影像與空間感為中心；不是目前正式首頁的 33 案平鋪清單。請以 Prototype 的氣質為主，吸收 Fable 的 Navigation／Portfolio Card／Gallery／Timeline component structure，再用 HQ 自己的施工圖說語言完成界面。

首頁必須呈現：

- HQDESIGN lockup、Projects、Process、About、locale switch。
- 大尺度但克制的 statement，不做一般 agency 的行銷 banner。
- scroll-driven project image field，影像 tile 使用 3:2 frame，不旋轉、不堆滿所有案例。
- 首先突出 `SECOM NANGANG` 與 `Kimpton` 兩個 lead projects。
- 每張影像附近有 mono metadata、60° dimension string 與可追溯的 image provenance。
- 影像下方或後段接入 `AI × DESIGN × DELIVERY` Process section。
- 桌機 12-column layout，手機改為單欄但保留 title block、metadata 與來源標示。

## Image generation prompt（請在理解後優化，不要盲目照抄）

Create a high-fidelity desktop website art-direction board for a Taiwanese interior architecture and spatial systems company named HQ Design. Show a refined editorial homepage at 1440×1024, photographed as a realistic browser viewport, with a white paper background, precise dark navy hairline rules, restrained vermillion accents, and real interior architecture project photography as the only major color source. Use a 12-column editorial grid with generous negative space and strict alignment. The header is minimal: a compact HQDESIGN lockup at left, Projects / Process / About navigation, and a small language switch at right. The hero is typographic and architectural, with a large confident sans-serif statement balanced by a quiet mono eyebrow and a short operational description.

Below and around the hero, compose a scroll-driven project image field rather than a regular card wall: two featured lead projects, SECOM NANGANG and Kimpton, receive the strongest visual weight; supporting projects appear in 6-column and 4-column 3:2 image frames with deliberate vertical rhythm. Each project image has a small mono title block and a thin dimension string beneath it, with 60-degree slash ticks at both ends. Include restrained labels such as AS-BUILT or DESIGN VISUALISATION only as metadata, never as decorative badges. The layout should feel like a living construction drawing translated into a digital interface: title block, dimension line, sheet index, layer notation, and a subtle 60-degree line motif.

Continue the visible page into a calm Process section labelled AI × DESIGN × DELIVERY, using a horizontal or vertical process rail, numbered stages, and one small vermillion progress mark. Keep the content legible, spacious, and credible. The interaction should be implied through scroll depth, image focus, line drawing, and shared-element transition cues, not through excessive effects. Use Satoshi-like geometric sans-serif for English, Noto Sans TC-like sans-serif for Chinese, and Geist Mono-like typography for measurements and labels. Use square corners everywhere except a 4px button and a small 9.8% logo mark.

Avoid: serif typography, rounded card UI, glassmorphism, neon, glow, gradients behind paragraphs, gradient text, emoji, generic startup dashboard patterns, masonry chaos, random card rotation, giant full-screen marketing slogans, fake statistics, invented project facts, copied Powerhouse branding, copied Powerhouse images, visible code, browser chrome clutter, and an overuse of vermillion. The result must look like an original HQ Design visual system: quiet, technical, spatial, editorial, and ready to become a real responsive website.

## 回覆格式

請先輸出：

1. 你從各來源確認到的 visual facts 與仍未確認事項。
2. 首頁 desktop／mobile composition map。
3. 優化後的英文 image-generation prompt。
4. 一份繁中 art-direction checklist，讓使用者能判斷生成圖是否符合 HQ Design。
5. 只有在使用者確認視覺稿後，才提出下一階段的 code integration plan。
