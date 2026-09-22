import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";
import { z } from "zod";
import { Stage, STAGES, STAGE_SLUGS, type StageSlug, type StageWithMeta } from "./process-schema";

export * from "./process-schema";

const CONTENT = join(process.cwd(), "..", "content", "process");

export const getStage = cache(
  async (slug: StageSlug): Promise<StageWithMeta> => {
    const meta = STAGES.find((s) => s.slug === slug);
    if (!meta) throw new Error(`[process] 未知的階段：${slug}`);

    const raw = JSON.parse(
      await readFile(join(CONTENT, `${slug}.json`), "utf8"),
    );
    const r = Stage.safeParse(raw);
    if (!r.success)
      throw new Error(`[process] ${slug}.json\n${z.prettifyError(r.error)}`);

    // 60° 幾何製圖，內嵌 SVG 而非 <img>，才能吃 currentColor 與 CSS 變數
    const figure = await readFile(
      join(CONTENT, "figures", `${slug}.svg`),
      "utf8",
    );

    // 英文版製圖：只替換 <title> 的內文。<title> 是螢幕閱讀器唸出的名稱，
    // 在英文頁留中文會讓輔助技術唸出讀者聽不懂的內容。圖形與圖內的
    // 中英並列標籤保持原樣——那是雙語技術製圖，不是未翻譯的內文。
    const figureEn = r.data.figAltEn
      ? figure.replace(
          /(<title[^>]*>)[\s\S]*?(<\/title>)/,
          (_m, open: string, close: string) => `${open}${r.data.figAltEn}${close}`,
        )
      : figure;

    return { ...r.data, ...meta, figure, figureEn };
  },
);

export const getAllStages = cache(
  async (): Promise<StageWithMeta[]> => Promise.all(STAGE_SLUGS.map(getStage)),
);

/**
 * 兩種委任模式。Figma 32 頁簡介的五階段是「外部設計意圖」軌，
 * 七段是完整設計施工統包軌——不是矛盾，是同一體系的兩條路徑。
 */
export const ENGAGEMENT_MODES = {
  full: { zh: "設計施工統包", en: "Full Design & Build", stages: STAGE_SLUGS },
  intent: {
    zh: "外部設計意圖",
    en: "External Design Intent",
    stages: [
      "design-intent",
      "technical-validation",
      "bim",
      "construction-docs",
      "delivery",
    ],
  },
} as const;
