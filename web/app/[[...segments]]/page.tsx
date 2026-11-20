import { notFound } from "next/navigation";
import { Content } from "../../components/content";
import { ProjectDetail } from "../../components/project-detail";
import { getSnapshot, pages, resolveRoute } from "../../lib/content";
import { metadata, projectJsonLd, safeJson, siteUrl } from "../../lib/seo";
import { localizedPath } from "../../lib/project";
import "../../content/generated/project.css";

type Props = { params: Promise<{ segments?: string[] }> };
export async function generateMetadata({ params }: Props) {
  const { locale, project, page } = resolveRoute((await params).segments);
  if (project) {
    const p = (await getSnapshot()).projects.find((p) => p.slug === project);
    if (!p) notFound();
    return metadata(
      p.name[locale] + " — HQ Design",
      p.description[locale],
      "/projects/" + p.slug,
      locale,
      p.images[0].src,
    );
  }
  const content = page && pages[locale + "/" + page];
  if (!content) notFound();
  return metadata(
    content.title,
    content.description,
    page === "index" ? "/" : "/" + page,
    locale,
  );
}
export default async function Page({ params }: Props) {
  const { locale, project, page } = resolveRoute((await params).segments);
  const snapshot = await getSnapshot();
  if (project) {
    const p = snapshot.projects.find((p) => p.slug === project);
    if (!p) notFound();
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJson(projectJsonLd(p, locale)),
          }}
        />
        <ProjectDetail project={p} locale={locale} />
      </>
    );
  }
  const content = page && pages[locale + "/" + page];
  if (!content) notFound();
  const jsonLd =
    page === "projects"
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            numberOfItems: snapshot.projects.length,
            itemListElement: snapshot.projects.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.name[locale],
              url: siteUrl + localizedPath("/projects/" + p.slug, locale),
            })),
          },
        ]
      : content.jsonLd;
  return (
    <>
      <style>{content.styles}</style>
      {jsonLd.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJson(data) }}
        />
      ))}
      <Content
        html={content.html}
        projects={snapshot.projects}
        locale={locale}
      />
    </>
  );
}
