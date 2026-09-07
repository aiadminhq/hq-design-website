import type { Project } from "@/lib/content/schema";
import type { StageWithMeta } from "@/lib/content/process-schema";

export type Parity = "full" | "partial";

/**
 * 英文覆蓋率判定，驅動 noindex 與 sitemap 排除。
 *
 * 依據 seo/analysis.md §3.3-4／P0-13：`/en/` 頁在 parity != full 時
 * MUST 為 `noindex,follow` 且 MUST NOT 進 en sitemap。理由不是「英文不重要」，
 * 而是英文缺席時該頁承載的是中文內容——那是薄內容訊號，會拖累整個 en 目錄。
 *
 * 這裡刻意做成「由資料計算」而非人工開關：翻譯補齊的當下索引自動開啟，
 * 不需要有人記得回來改設定。§3.3-4 明確要求可自動化。
 *
 * zh 永遠是 full——中文是權威語言，不存在 fallback。
 */
export function projectParity(p: Project): Parity {
  const translated =
    p.name.en != null &&
    p.lede.en != null &&
    p.images.every((im) => im.alt.en != null) &&
    // 影像性質聲明是內容政策紅線（COORDINATION.md §5）。英文頁若讓它掉回中文，
    // 等於對英文讀者少了一段必要揭露，那比不進索引更糟。
    (p.note == null || (p.note.title.en != null && p.note.body.en != null)) &&
    // spec 值含中文者必須有 valueEn，否則英文頁的規格表會混語。
    p.specs.every((s) => !/[\u4e00-\u9fff]/.test(s.value) || s.valueEn != null);
  return translated ? "full" : "partial";
}

/**
 * 階段頁的英文覆蓋率。
 *
 * 目前 content/process/*.json 的 title／desc／lede／inp／out 全為單語中文，
 * 英文只有 `en`（階段名）、`gloss`、`qen` 與 how／why 三元組的第一個元素。
 * 換句話說 /en/process/<slug> 目前渲染的主體仍是中文，parity 必然是 partial。
 *
 * 判定條件寫成資料驅動而非硬編 false，是為了讓翻譯補齊時自動生效——
 * 在 Stage schema 補上 titleEn／descEn／ledeEn／inpEn／outEn 即可。
 */
export function stageParity(s: StageWithMeta): Parity {
  // 條件涵蓋階段頁上「實際會渲染出來的每一段」，不只是 metadata。
  // 只要有一段仍會掉回中文，這一頁對英文讀者就是混語頁，不該進索引。
  const translated =
    s.titleEn != null &&
    s.descEn != null &&
    s.h1En != null &&
    s.ledeEn != null &&
    s.inpEn != null &&
    s.outEn != null &&
    s.howH2En != null &&
    s.whyH2En != null &&
    s.figAltEn != null &&
    s.howEn.length === s.how.length &&
    s.whyEn.length === s.why.length &&
    (!s.ev_foot || s.evFootEn != null) &&
    (!s.ev_none || s.evNoneEn != null) &&
    s.ev.every((e) => e.en.length > 0);
  return translated ? "full" : "partial";
}

// 註：locale 與 parity 的結合判斷在 pageMetadata() 內完成
// （zh 永遠可索引），這裡只負責「英文內容到底齊不齊」這一件事。
