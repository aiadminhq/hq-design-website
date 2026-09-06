import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getAllProjects, getProject } from "@/lib/content/loader";
import { resolve } from "@/lib/content/locale";
import type { Locale } from "@/lib/content/schema";
import { imageData, plain, toCardData } from "@/components/project-data";
import {
  ProjectCard,
  ProjectPhoto,
  DimensionString,
} from "@/components/project-card";
import { Gallery } from "@/components/gallery";
import { verifiedFacts } from "@/lib/content/loader";
import { clampDescription, pageMetadata, type SeoLocale } from "@/lib/seo/metadata";
import { projectParity } from "@/lib/seo/parity";
import {
  JsonLd,
  breadcrumbNode,
  creativeWorkNode,
  imageObjectNode,
  webPageNode,
} from "@/lib/seo/json-ld";
export const dynamicParams = false;
export async function generateStaticParams() {
  return (await getAllProjects()).map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const l = locale as SeoLocale;
  const p = await getProject(slug);
  if (!p) return {};

  // 標題只吃已核實的事實。seo/analysis.md §1.2 實測舊站 21 個案例頁的 title
  // 「案名外無空間型別、無地點、無服務詞」——空間型別與地點就是這裡補回去的。
  // 暫填值不得進 og:title（COORDINATION.md §4），所以用 verifiedFacts 而非 facts。
  const f = verifiedFacts(p) as { typeZh?: string; locationZh?: string };
  const name = plain(resolve(p.name, l as Locale).value);
  const qualifier = [f.typeZh, f.locationZh].filter(Boolean).join("・");
  const lede = plain(resolve(p.lede, l as Locale).value);
  const hero = [...p.images].sort((a, b) => a.order - b.order)[0];

  return pageMetadata({
    locale: l,
    path: `/work/${slug}`,
    title: qualifier ? `${name}｜${qualifier}` : name,
    description: clampDescription(lede, l === "zh" ? 80 : 155),
    image: `/og/work/${slug}.jpg`,
    imageAlt: hero ? (hero.alt[l] ?? hero.alt.zh) : name,
    // 英文缺席時本頁 /en 版渲染的是中文，屬薄內容，依 §3.3-4 不進索引。
    parity: projectParity(p),
  });
}
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const p = await getProject(slug);
  if (!p) notFound();
  const card = toCardData(p, l);
  const lede = resolve(p.lede, l);
  const related = (await getAllProjects()).filter((other) =>
    p.relatedSlugs.includes(other.slug),
  );
  const ordered = [...p.images].sort((a, b) => a.order - b.order);
  const name = plain(resolve(p.name, l).value);
  const crumb = breadcrumbNode(l as SeoLocale, [
    { name: l === "zh" ? "首頁" : "Home", path: "" },
    { name: l === "zh" ? "實績" : "Projects", path: "/work" },
    { name, path: `/work/${p.slug}` },
  ]);
  return (
    <main id="main" className="page-shell project-page">
      <JsonLd
        graph={[
          crumb,
          webPageNode({
            locale: l as SeoLocale,
            path: `/work/${p.slug}`,
            name,
            description: plain(resolve(p.lede, l).value),
            breadcrumbId: crumb["@id"] as string,
          }),
          creativeWorkNode(p, l, name),
          ...ordered.map((im) => imageObjectNode(im, p.slug, l)),
        ]}
      />
      <a className="back-link mono" href={`/${l}/work`}>
        ← {l === "zh" ? "全部實績" : "Project index"}
      </a>
      <header className="project-heading">
        <p className="eyebrow">PROJECT / {p.category.toUpperCase()}</p>
        <h1 lang={card.lang}>{card.name}</h1>
        <p className="heading-english">{card.gloss}</p>
      </header>
      <figure className="project-hero">
        <ProjectPhoto image={card.image} priority sizes="90vw" />
        <DimensionString label={card.image.label} detail={card.facts} />
      </figure>
      <section className="project-story">
        <div>
          <p className="eyebrow">THE PROJECT</p>
          <p className="body-large" lang={lede.lang}>
            {plain(lede.value)}
          </p>
          {p.note && (
            <aside className="project-note">
              <h2>{plain(resolve(p.note.title, l).value)}</h2>
              <p lang="zh-Hant">{plain(resolve(p.note.body, l).value)}</p>
            </aside>
          )}
        </div>
        <dl className="spec-strip">
          {p.specs.map((spec) => (
            <div key={spec.labelEn}>
              <dt>{l === "zh" ? spec.labelZh : spec.labelEn}</dt>
              <dd>
                {spec.value}
                {!spec.verified && (
                  <small>{l === "zh" ? "資料待核對" : "To be confirmed"}</small>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      {p.images.some((im) => im.prov === "viz" || im.prov === "enh") && (
        <p className="provenance-note">
          {l === "zh"
            ? "影像性質說明：本案含設計提案視覺或 AI 光影強化影像，請依每張圖片的來源標示閱讀；設計視覺不代表完工實景。"
            : "Image disclosure: this project includes design visualisations or AI-enhanced photography. Refer to each image’s source label; visualisations are not completed-project photographs."}
        </p>
      )}
      {(["photo", "viz", "enh", "drawing"] as const).map((prov) => {
        const group = ordered.filter((im) => im.prov === prov);
        return (
          group.length > 0 && (
            <section className="gallery-section" key={prov}>
              <Gallery
                images={group.map((im) => imageData(p, im, l))}
                locale={l}
              />
            </section>
          )
        );
      })}
      {p.pairs.length > 0 && (
        <section className="comparison">
          <p className="eyebrow">INTENT / AS-BUILT</p>
          <h2>{l === "zh" ? "設計意圖與完工對照" : "Intent and delivery"}</h2>
          {p.pairs.map((pair, i) => (
            <p key={i}>
              {pair.intent === null
                ? l === "zh"
                  ? "同機位設計意圖影像尚未提供，目前僅展示本案完工影像。"
                  : "A matching design-intent image is not yet available. Only this project’s completed photography is shown."
                : pair.note}
            </p>
          ))}
        </section>
      )}
      {related.length > 0 && (
        <section className="related">
          <div className="section-heading">
            <h2>{l === "zh" ? "延伸探索" : "Related spaces"}</h2>
            <a className="text-link" href={`/${l}/work`}>
              {l === "zh" ? "全部實績" : "All projects"} ↗
            </a>
          </div>
          <div className="project-grid">
            {related.map((other) => (
              <ProjectCard card={toCardData(other, l)} key={other.slug} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
