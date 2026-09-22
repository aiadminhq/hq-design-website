import type { Locale } from "@/lib/content/schema";
import type { StageWithMeta } from "@/lib/content/process-schema";
import { plain } from "./project-data";
export function ProcessTracks({
  stages,
  locale,
  compact = false,
}: {
  stages: StageWithMeta[];
  locale: Locale;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "process-tracks compact" : "process-tracks"}>
      {stages.map((stage) => (
        <a
          className="process-step"
          href={`/${locale}/process/${stage.slug}`}
          key={stage.slug}
        >
          <span className="step-number mono">
            {stage.idx}
            <i />
          </span>
          <div>
            <p className="mono small muted">{stage.en}</p>
            <h3>{locale === "zh" ? stage.zh : stage.en}</h3>
            {!compact && (
              <p>{plain(locale === "zh" ? stage.lede : stage.gloss)}</p>
            )}
          </div>
          <span className="step-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      ))}
    </div>
  );
}
