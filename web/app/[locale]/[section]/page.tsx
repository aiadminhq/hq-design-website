import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/content/schema";
import { getProject } from "@/lib/content/loader";
import { getAllStages } from "@/lib/content/process";
import { ORG } from "@/lib/site";
import { PageHeading } from "@/components/page-heading";
import { ProjectPhoto, DimensionString } from "@/components/project-card";
import { toCardData, plain } from "@/components/project-data";
import { ContactBrief } from "@/components/contact-brief";
import { ModelSpace } from "@/components/model-space";
import { serviceCopy, roleCopy } from "@/messages/editorial-en";
import { pageMetadata, type SeoLocale } from "@/lib/seo/metadata";
import { sectionCopy } from "@/lib/seo/page-copy";
import {
  JsonLd,
  breadcrumbNode,
  serviceNodes,
  webPageNode,
} from "@/lib/seo/json-ld";
export const dynamicParams = false;

const titles = {
  about: ["關於惠強", "About"],
  services: ["服務項目", "Services"],
  careers: ["加入我們", "Careers"],
  contact: ["聯絡", "Contact"],
  model: ["模型空間", "Model space"],
} as const;
type Section = keyof typeof titles;
export function generateStaticParams() {
  return Object.keys(titles).map((section) => ({ section }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section } = await params;
  const l = locale as SeoLocale;
  if (!(section in titles)) return {};
  const copy = sectionCopy(section, l);
  if (!copy) return {};
  // 這五頁兩語系都有實際撰寫的英文文案（messages/editorial-en.ts），
  // 不是 fallback，所以 parity 是 full、/en 版可索引。
  return pageMetadata({ locale: l, path: `/${section}`, ...copy });
}
async function cms(name: "about" | "services" | "careers") {
  return JSON.parse(
    await readFile(
      join(process.cwd(), "..", "cms", "data", `${name}.json`),
      "utf8",
    ),
  );
}

export default async function Information({
  params,
}: {
  params: Promise<{ locale: string; section: string }>;
}) {
  const { locale, section } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const zh = l === "zh";
  if (!(section in titles)) notFound();

  const seo = sectionCopy(section, l as SeoLocale);
  const crumb = breadcrumbNode(l as SeoLocale, [
    { name: zh ? "首頁" : "Home", path: "" },
    { name: titles[section as Section][zh ? 0 : 1], path: `/${section}` },
  ]);
  const pageGraph = seo
    ? [
        crumb,
        webPageNode({
          locale: l as SeoLocale,
          path: `/${section}`,
          name: seo.title,
          description: seo.description,
          breadcrumbId: crumb["@id"] as string,
        }),
      ]
    : [];
  if (section === "contact")
    return (
      <main id="main" className="page-shell">
        <JsonLd graph={pageGraph} />
        <PageHeading
          index="C / START A CONVERSATION"
          title={
            zh
              ? "下一個空間，從對話開始"
              : "Every space starts with a conversation"
          }
        />
        <div className="contact-strip">
          <a href={`mailto:${ORG.email}`}>{ORG.email} ↗</a>
          <a href={`tel:${ORG.tel}`}>{ORG.tel}</a>
          <p>
            {ORG.address.addressRegion}
            {ORG.address.addressLocality}
            {ORG.address.streetAddress}
          </p>
        </div>
        <ContactBrief locale={l} />
      </main>
    );
  if (section === "model") {
    const stages = await getAllStages();
    return (
      <main id="main" className="page-shell">
        <JsonLd graph={pageGraph} />
        <PageHeading
          index="M / MODEL SPACE"
          title={
            zh ? "看見設計背後的邏輯" : "See the thinking behind the space"
          }
          description={
            zh
              ? "切換現況、BIM 與施工圖說，探索七段流程中的圖形語言。"
              : "Explore the graphic language of site survey, BIM coordination and construction documentation."
          }
        />
        <ModelSpace
          figures={stages
            .filter((s) =>
              ["site-survey", "bim", "construction-docs"].includes(s.slug),
            )
            .map((s) => ({
              name: s.zh,
              english: s.en,
              svg: s.figure,
              description: plain(zh ? s.lede : s.gloss),
            }))}
          locale={l}
        />
        <a className="text-link" href={`/${l}/process`}>
          {zh ? "回到完整設計流程" : "Explore the complete process"} ↗
        </a>
      </main>
    );
  }
  if (section === "services") {
    const data = (await cms("services")) as {
      services: {
        slug: string;
        number: string;
        titleZh: string;
        descriptionZh: string;
        categoryGroup: string;
      }[];
    };
    return (
      <main id="main" className="page-shell">
        <JsonLd graph={pageGraph} />
        <PageHeading
          index="S / OUR CAPABILITIES"
          title={
            zh
              ? "完整的空間，整合的專業"
              : "Connected expertise. Complete spaces"
          }
          description={
            zh
              ? "從空間策略、品牌體驗、技術整合到施工管理，依專案需要配置服務。"
              : "Spatial strategy, brand experience, technical coordination and construction management, tailored to each project."
          }
        />
        <div className="service-register" lang={zh ? "zh-Hant" : "en"}>
          {data.services.map((s) => (
            <article id={s.slug} key={s.slug}>
              <span className="mono service-number">{s.number}</span>
              <h2>
                {zh ? s.titleZh : serviceCopy[s.slug]?.title || s.titleZh}
              </h2>
              <p>
                {zh
                  ? plain(s.descriptionZh).replace(
                      "無縫融入空間",
                      "融入整體空間",
                    )
                  : serviceCopy[s.slug]?.description || plain(s.descriptionZh)}
              </p>
              <a
                href={`/${l}/contact`}
                aria-label={`${zh ? s.titleZh : serviceCopy[s.slug]?.title || s.titleZh} ${zh ? "洽詢" : "enquiry"}`}
              >
                ↗
              </a>
            </article>
          ))}
        </div>
        <a className="text-link" href={`/${l}/process`}>
          {zh ? "了解如何合作" : "How we work"} ↗
        </a>
      </main>
    );
  }
  if (section === "careers") {
    const data = (await cms("careers")) as {
      positions: {
        slug: string;
        titleZh: string;
        department: string;
        summaryZh: string;
        skills: string[];
      }[];
      values: { slug: string; titleZh: string; descZh: string }[];
      perks: { titleZh: string; descZh: string }[];
    };
    return (
      <main id="main" className="page-shell">
        <JsonLd graph={pageGraph} />
        <PageHeading
          index="J / JOIN THE PRACTICE"
          title={
            zh ? "讓好設計，有一起完成的人" : "Good spaces are built together"
          }
          description={
            zh
              ? "設計、工務與專案管理，在同一個團隊中協作。"
              : "Design, construction and project management, working as one team."
          }
        />
        <section className="jobs" lang={zh ? "zh-Hant" : "en"}>
          {data.positions.map((p, i) => (
            <details key={p.slug}>
              <summary>
                <span className="mono">0{i + 1}</span>
                <h2>{zh ? p.titleZh : roleCopy[p.slug]?.title || p.titleZh}</h2>
                <span className="mono small">
                  {zh ? p.department : p.department.split(" ")[0]}
                </span>
                <span>+</span>
              </summary>
              <div className="job-body">
                <p>
                  {zh ? p.summaryZh : roleCopy[p.slug]?.summary || p.summaryZh}
                </p>
                <div className="skill-tags">
                  {(zh ? p.skills : roleCopy[p.slug]?.skills || p.skills).map(
                    (s) => (
                      <span key={s}>{s}</span>
                    ),
                  )}
                </div>
                <a
                  className="text-link"
                  href={`mailto:${ORG.email}?subject=${encodeURIComponent(zh ? `應徵 ${p.titleZh}` : `Application: ${roleCopy[p.slug]?.title || p.titleZh}`)}`}
                >
                  {zh ? "寄送履歷" : "Email your application"} ↗
                </a>
                <p className="small muted">
                  {zh
                    ? "招募資訊與職缺狀態以團隊回覆為準。"
                    : "Please contact the team for current availability."}
                </p>
              </div>
            </details>
          ))}
        </section>
        <section className="stage-how" lang="zh-Hant">
          <h2>{zh ? "在這裡工作的理由" : "Working at HQ"}</h2>
          <div className="three-grid">
            {data.values.map((v, i) => (
              <article key={v.slug}>
                <p className="eyebrow">0{i + 1}</p>
                <h3>{v.titleZh.replace("31+", "30+")}</h3>
                <p>{v.descZh.replaceAll("31+", "30+")}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="stage-how" lang="zh-Hant">
          <h2>{zh ? "福利與支持" : "Benefits & support"}</h2>
          <div className="three-grid">
            {data.perks.map((v, i) => (
              <article key={i}>
                <p className="eyebrow">0{i + 1}</p>
                <h3>{v.titleZh}</h3>
                <p>{v.descZh}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    );
  }
  const about = (await cms("about")) as {
    story: { paragraphsZh: string[]; paragraphEn: string };
    team: {
      cells: { role: string; roleLabelZh: string; roleLabelEn: string }[];
    };
  };
  const project = await getProject("kimpton");
  const card = project ? toCardData(project, l) : null;
  const milestones = [
    ["1995", "公司創立", "Founded"],
    ["2010", "整合服務成形", "Integrated services"],
    ["2019", "大型連鎖門市", "Retail networks"],
    ["2022", "國際飯店品牌", "International hospitality"],
    ["2023", "連鎖餐飲拓點", "F&B rollouts"],
    ["2024", "國際品牌進駐", "Global brands"],
    ["2025", "企業總部成長", "Corporate headquarters"],
    ["2026", "智慧設計轉型", "Intelligent design workflows"],
  ];
  return (
    <main id="main" className="page-shell">
      <JsonLd graph={pageGraph} />
      <PageHeading
        index="A / ABOUT THE PRACTICE"
        title={
          zh ? "匠藝專工，一應皆備" : "Thoughtful spaces. Lasting relationships"
        }
      />
      <div className="about-story">
        <p className="body-large" lang={zh ? "zh-Hant" : "en"}>
          {zh ? about.story.paragraphsZh.join("\n\n") : about.story.paragraphEn}
        </p>
        <div className="about-label mono">
          {ORG.shortEn}
          <br />
          TAIPEI, TAIWAN
          <br />
          SINCE {ORG.foundedYear}
        </div>
      </div>
      {card && (
        <figure className="about-photo">
          <ProjectPhoto image={card.image} sizes="90vw" />
          <DimensionString label={card.image.label} detail={card.name} />
        </figure>
      )}
      <section className="stage-how">
        <p className="eyebrow">OUR EVOLUTION</p>
        <h2>{zh ? "持續前進的實踐。" : "A practice in motion."}</h2>
        <div className="milestones">
          {milestones.map(([year, cn, en]) => (
            <article key={year}>
              <span className="mono">{year}</span>
              <i />
              <h3>{zh ? cn : en}</h3>
            </article>
          ))}
        </div>
      </section>
      <section className="stage-how">
        <p className="eyebrow">ONE TEAM / MANY PERSPECTIVES</p>
        <h2>
          {zh
            ? "讓設計與執行，在同一張桌上。"
            : "Design and delivery at the same table."}
        </h2>
        <div className="team-register">
          {about.team.cells.map((c) => (
            <div key={c.role}>
              <span className="mono">{c.role}</span>
              <h3>{zh ? c.roleLabelZh : c.roleLabelEn}</h3>
            </div>
          ))}
          <div>
            <span className="mono">AI</span>
            <h3>
              {zh
                ? "AI 事業發展與商業應用"
                : "AI development & business applications"}
            </h3>
          </div>
        </div>
        <a className="text-link" href={`/${l}/careers`}>
          {zh ? "加入團隊" : "Join the team"} ↗
        </a>
      </section>
    </main>
  );
}
