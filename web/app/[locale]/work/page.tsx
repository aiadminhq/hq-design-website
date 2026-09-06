import { setRequestLocale } from "next-intl/server";
import { getAllProjects } from "@/lib/content/loader";
import type { Locale } from "@/lib/content/schema";
import { toCardData } from "@/components/project-data";
import { WorkBrowser } from "@/components/work-browser";
import { PageHeading } from "@/components/page-heading";
import { pageMetadata, type SeoLocale } from "@/lib/seo/metadata";
import { sectionCopy } from "@/lib/seo/page-copy";
import { JsonLd, breadcrumbNode, itemListNode, webPageNode } from "@/lib/seo/json-ld";
import { plain } from "@/components/project-data";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as SeoLocale;
  const copy = sectionCopy("work", l)!;
  return pageMetadata({ locale: l, path: "/work", ...copy });
}
export default async function Work({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const projects = await getAllProjects();
  const copy = sectionCopy("work", l)!;
  const crumb = breadcrumbNode(l, [
    { name: l === "zh" ? "首頁" : "Home", path: "" },
    { name: l === "zh" ? "實績" : "Projects", path: "/work" },
  ]);
  return (
    <main id="main" className="page-shell">
      <JsonLd
        graph={[
          crumb,
          webPageNode({
            locale: l,
            path: "/work",
            name: copy.title,
            description: copy.description,
            breadcrumbId: crumb["@id"] as string,
          }),
          itemListNode(
            l,
            projects.map((p) => ({
              slug: p.slug,
              name: plain(p.name[l] ?? p.name.zh),
            })),
          ),
        ]}
      />
      <PageHeading
        index="W / PROJECT INDEX"
        title={l === "zh" ? "空間，持續發生" : "Spaces in practice"}
        english={
          l === "zh"
            ? "A collection of places, people and possibilities."
            : undefined
        }
      />
      <WorkBrowser cards={projects.map((p) => toCardData(p, l))} locale={l} />
    </main>
  );
}
