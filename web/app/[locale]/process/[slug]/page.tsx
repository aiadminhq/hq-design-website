import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getStage, STAGE_SLUGS, type StageSlug } from "@/lib/content/process";
import type { Locale } from "@/lib/content/schema";
import { PageHeading } from "@/components/page-heading";
import { plain } from "@/components/project-data";
import { clampDescription, pageMetadata, type SeoLocale } from "@/lib/seo/metadata";
import { stageParity } from "@/lib/seo/parity";
import { JsonLd, stagePageGraph } from "@/lib/seo/json-ld";
export const dynamicParams = false;
export function generateStaticParams() {
  return STAGE_SLUGS.map((slug) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const l = locale as SeoLocale;
  if (!STAGE_SLUGS.includes(slug as StageSlug)) return {};
  const s = await getStage(slug as StageSlug);

  // content/process/*.json 的 title／desc 已經是照 seo/analysis.md §3.1
  // 寫好的完整字串（含品牌後綴），所以走 brandedTitle 不重複加後綴。
  // 舊實作只回 { title: s.zh }，等於把寫好的關鍵字標題整個丟掉。
  const zh = l === "zh";
  return pageMetadata({
    locale: l,
    path: `/process/${slug}`,
    // zh 的 title 已含品牌後綴，走 brandedTitle；en 尚未撰寫完整標題，
    // 用階段英文名讓 pageMetadata 補後綴。
    ...(zh ? { brandedTitle: s.title } : { title: s.titleEn ?? s.en }),
    description: clampDescription(
      plain(zh ? s.desc : (s.descEn ?? s.gloss)),
      zh ? 80 : 155,
    ),
    image: `/og/process/${slug}.jpg`,
    imageAlt: zh ? s.zh : s.en,
    parity: stageParity(s),
  });
}
export default async function StagePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  if (!STAGE_SLUGS.includes(slug as StageSlug)) notFound();
  const s = await getStage(slug as StageSlug);
  const next = STAGE_SLUGS[STAGE_SLUGS.indexOf(slug as StageSlug) + 1];
  return (
    <main id="main" className="page-shell stage-page">
      <JsonLd
        graph={stagePageGraph(
          l as SeoLocale,
          s,
          l === "zh" ? s.h1 : s.en,
          plain(l === "zh" ? s.lede : s.gloss),
        )}
      />
      <a className="back-link mono" href={`/${l}/process`}>
        ← {l === "zh" ? "完整流程" : "All stages"}
      </a>
      <PageHeading
        index={`${s.idx} / ${s.en.toUpperCase()}`}
        title={l === "zh" ? s.h1 : s.en}
        description={plain(l === "zh" ? s.lede : s.gloss)}
      />
      <div className="stage-intro">
        <div
          className="stage-figure"
          role="img"
          aria-label={s.zh}
          dangerouslySetInnerHTML={{ __html: s.figure }}
        />
        <div>
          <p className="eyebrow">INPUT → OUTPUT</p>
          <h2>
            {l === "zh"
              ? "從什麼開始，交付什麼？"
              : "What goes in. What comes out."}
          </h2>
          <dl className="stage-io" lang="zh-Hant">
            <dt>INPUT / 輸入</dt>
            <dd>{plain(s.inp)}</dd>
            <dt>OUTPUT / 交付</dt>
            <dd>{plain(s.out)}</dd>
          </dl>
        </div>
      </div>
      <section className="stage-how" lang="zh-Hant">
        <h2>{plain(s.how_h2)}</h2>
        <div className="three-grid">
          {s.how.map(([en, zh, desc], i) => (
            <article key={en}>
              <p className="eyebrow">
                0{i + 1} / {en}
              </p>
              <h3>{zh}</h3>
              <p>{plain(desc)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="stage-how" lang="zh-Hant">
        <h2>{plain(s.why_h2)}</h2>
        {s.why.map(([en, zh, desc]) => (
          <div className="reason-row" key={en}>
            <h3>{zh}</h3>
            <p>{plain(desc)}</p>
          </div>
        ))}
      </section>
      <aside className="evidence" lang="zh-Hant">
        <p className="eyebrow">EVIDENCE / 實際依據</p>
        {s.ev.map((ev) => (
          <a
            className="text-link"
            key={ev.href}
            href={ev.href.startsWith("/work/") ? `/${l}${ev.href}` : ev.href}
          >
            {plain(ev.t)} ↗
          </a>
        ))}
        {s.ev_none && <p>{plain(s.ev_none)}</p>}
        {s.ev_foot && <p>{plain(s.ev_foot)}</p>}
      </aside>
      {next && (
        <a className="next-stage" href={`/${l}/process/${next}`}>
          {l === "zh" ? "下一階段" : "Next stage"} →
        </a>
      )}
    </main>
  );
}
