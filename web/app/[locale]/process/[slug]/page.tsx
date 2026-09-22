import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getStage, STAGE_SLUGS, type StageSlug } from "@/lib/content/process";
import { getAllProjects } from "@/lib/content/loader";
import { resolve } from "@/lib/content/locale";
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
  const zh = l === "zh";
  // 證據連結的錨點文字要說出是哪一個案子。ev.en 是類型描述
  // （例「Corporate HQ · Full Design & Build」），單獨當連結文字讀者
  // 不知道連到哪裡；seo/analysis.md T14 要求描述性錨點。
  const projectNames = new Map(
    (await getAllProjects()).map((p) => [p.slug, plain(resolve(p.name, l).value)]),
  );
  const evLabel = (href: string, t: string, en: string) => {
    const slug = href.match(/^\/work\/([^/]+)/)?.[1];
    const name = slug ? projectNames.get(slug) : undefined;
    if (zh) return plain(t);
    return name ?? plain(en || t);
  };
  // 英文欄位缺席時退回中文，並讓 lang 屬性跟著改——WCAG 3.1.2 要求
  // 標記實際語言，混語頁面不得整段宣告 en。
  const pick = (en: string | null, fallback: string) => ({
    text: en ?? fallback,
    lang: en ? "en" : "zh-Hant",
  });
  const heading = zh ? s.h1 : (s.h1En ?? s.en);
  const lede = zh ? s.lede : (s.ledeEn ?? s.gloss);
  const io = zh
    ? { inp: { text: s.inp, lang: "zh-Hant" }, out: { text: s.out, lang: "zh-Hant" } }
    : { inp: pick(s.inpEn, s.inp), out: pick(s.outEn, s.out) };
  const howH2 = zh ? s.how_h2 : (s.howH2En ?? s.how_h2);
  const whyH2 = zh ? s.why_h2 : (s.whyH2En ?? s.why_h2);
  const howLang = zh || s.howEn.length ? (zh ? "zh-Hant" : "en") : "zh-Hant";
  const whyLang = zh || s.whyEn.length ? (zh ? "zh-Hant" : "en") : "zh-Hant";
  return (
    <main id="main" className="page-shell stage-page">
      <JsonLd
        graph={stagePageGraph(
          l as SeoLocale,
          s,
          heading,
          plain(lede),
        )}
      />
      <a className="back-link mono" href={`/${l}/process`}>
        ← {l === "zh" ? "完整流程" : "All stages"}
      </a>
      <PageHeading
        index={`${s.idx} / ${s.en.toUpperCase()}`}
        title={heading}
        description={plain(lede)}
      />
      <div className="stage-intro">
        <div
          className="stage-figure"
          role="img"
          aria-label={zh ? s.zh : (s.figAltEn ?? s.en)}
          dangerouslySetInnerHTML={{ __html: zh ? s.figure : s.figureEn }}
        />
        <div>
          <p className="eyebrow">INPUT → OUTPUT</p>
          <h2>
            {l === "zh"
              ? "從什麼開始，交付什麼？"
              : "What goes in. What comes out."}
          </h2>
          <dl className="stage-io">
            <dt>{zh ? "INPUT / 輸入" : "INPUT"}</dt>
            <dd lang={io.inp.lang}>{plain(io.inp.text)}</dd>
            <dt>{zh ? "OUTPUT / 交付" : "OUTPUT"}</dt>
            <dd lang={io.out.lang}>{plain(io.out.text)}</dd>
          </dl>
        </div>
      </div>
      <section className="stage-how" lang={howLang}>
        <h2>{plain(howH2)}</h2>
        <div className="three-grid">
          {s.how.map(([label, titleZh, desc], i) => (
            <article key={label}>
              <p className="eyebrow">
                0{i + 1} / {label}
              </p>
              <h3>{zh ? titleZh : (s.howEn[i]?.[0] ?? titleZh)}</h3>
              <p>{plain(zh ? desc : (s.howEn[i]?.[1] ?? desc))}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="stage-how" lang={whyLang}>
        <h2>{plain(whyH2)}</h2>
        {s.why.map(([label, titleZh, desc], i) => (
          <div className="reason-row" key={label}>
            <h3>{zh ? titleZh : (s.whyEn[i]?.[0] ?? titleZh)}</h3>
            <p>{plain(zh ? desc : (s.whyEn[i]?.[1] ?? desc))}</p>
          </div>
        ))}
      </section>
      <aside className="evidence" lang={zh ? "zh-Hant" : "en"}>
        <p className="eyebrow">{zh ? "EVIDENCE / 實際依據" : "EVIDENCE"}</p>
        {s.ev.map((ev) => (
          <a
            className="text-link"
            key={ev.href}
            href={ev.href.startsWith("/work/") ? `/${l}${ev.href}` : ev.href}
            lang={zh ? "zh-Hant" : "en"}
          >
            {evLabel(ev.href, ev.t, ev.en)} ↗
          </a>
        ))}
        {s.ev_none && (
          <p lang={zh || !s.evNoneEn ? "zh-Hant" : "en"}>
            {plain(zh ? s.ev_none : (s.evNoneEn ?? s.ev_none))}
          </p>
        )}
        {s.ev_foot && (
          <p lang={zh || !s.evFootEn ? "zh-Hant" : "en"}>
            {plain(zh ? s.ev_foot : (s.evFootEn ?? s.ev_foot))}
          </p>
        )}
      </aside>
      {next && (
        <a className="next-stage" href={`/${l}/process/${next}`}>
          {l === "zh" ? "下一階段" : "Next stage"} →
        </a>
      )}
    </main>
  );
}
