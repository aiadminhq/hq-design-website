import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/content/schema";
import { getAllProjects } from "@/lib/content/loader";
import { getAllStages } from "@/lib/content/process";
import { ORG } from "@/lib/site";
import { pageMetadata, type SeoLocale } from "@/lib/seo/metadata";
import { HOME_COPY } from "@/lib/seo/page-copy";
import { JsonLd, webPageNode } from "@/lib/seo/json-ld";
import { toCardData } from "@/components/project-data";
import { ScrollZoomScene } from "@/components/scroll-zoom-scene";
import { ProjectCard } from "@/components/project-card";
import { ProcessTracks } from "@/components/process-tracks";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as SeoLocale;
  const copy = HOME_COPY[l];
  return pageMetadata({
    locale: l,
    brandedTitle: copy.title,
    description: copy.description,
  });
}
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const [projects, stages] = await Promise.all([
    getAllProjects(),
    getAllStages(),
  ]);
  const cards = projects.map((p) => toCardData(p, l));
  const photos = cards.filter((c) => c.image.prov === "photo");
  return (
    <main id="main">
      <JsonLd
        graph={[
          webPageNode({
            locale: l as SeoLocale,
            name: HOME_COPY[l as SeoLocale].title,
            description: HOME_COPY[l as SeoLocale].description,
          }),
        ]}
      />
      <ScrollZoomScene cards={photos.slice(0, 18)} locale={l} />
      <section className="section intro" id="intro">
        <p className="eyebrow">01 / OUR PRACTICE</p>
        <div className="intro-grid">
          <h2>
            {l === "zh" ? (
              <>
                設計，是想像。
                <br />
                交付，讓它成真。
              </>
            ) : (
              <>
                Designed with intent.
                <br />
                Built with care.
              </>
            )}
          </h2>
          <div>
            <p className="body-large">
              {l === "zh"
                ? "從辦公總部、品牌展廳，到餐飲與旅宿空間。以設計、技術與現場執行的整合，讓每個決策都有清楚的落點。"
                : "From corporate headquarters and brand environments to hospitality and dining. We connect design, technical coordination and construction to bring spaces into use."}
            </p>
            <a className="text-link" href={`/${l}/about`}>
              {l === "zh" ? "認識惠強" : "Our practice"} ↗
            </a>
          </div>
        </div>
        <div className="stats">
          <div>
            <strong>{ORG.foundedYear}</strong>
            <span>SINCE / {l === "zh" ? "創立" : "ESTABLISHED"}</span>
          </div>
          <div>
            <strong>{ORG.projectCount}</strong>
            <span>
              {l === "zh" ? "PROJECTS / 累積實績" : "PROJECTS DELIVERED"}
            </span>
          </div>
          <div>
            <strong>
              DESIGN
              <br />& BUILD
            </strong>
            <span>
              {l === "zh" ? "設計與施工整合" : "ONE CONNECTED PRACTICE"}
            </span>
          </div>
        </div>
      </section>
      <section id="selected" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">02 / SELECTED WORK</p>
            <h2>{l === "zh" ? "讓作品說話。" : "A selection of spaces."}</h2>
          </div>
          <a className="text-link" href={`/${l}/work`}>
            {l === "zh" ? "全部實績" : "All projects"}{" "}
            <span className="mono">({cards.length})</span> ↗
          </a>
        </div>
        <div className="selected-grid">
          {[
            ...photos.filter((c) => c.weight === "lead"),
            ...photos.filter((c) => c.weight !== "lead").slice(0, 2),
          ].map((card) => (
            <ProjectCard card={card} key={card.slug} />
          ))}
        </div>
      </section>
      <section className="section process-home" id="process">
        <div className="section-heading">
          <div>
            <p className="eyebrow">03 / AI × DESIGN × DELIVERY</p>
            <h2>
              {l === "zh" ? "每一步，都有依據。" : "Every step, connected."}
            </h2>
          </div>
          <p className="section-aside">
            {l === "zh"
              ? "從現況到交付，七段相互銜接的流程。讓設計意圖、技術資料與現場執行保持一致。"
              : "Seven connected stages, from the first survey to handover. Design intent, technical information and site delivery move together."}
          </p>
        </div>
        <ProcessTracks stages={stages} locale={l} compact />
        <a className="text-link" href={`/${l}/process`}>
          {l === "zh" ? "探索設計流程" : "Explore our process"} ↗
        </a>
      </section>
    </main>
  );
}
