import { setRequestLocale } from "next-intl/server";
import { getAllStages } from "@/lib/content/process";
import type { Locale } from "@/lib/content/schema";
import { ProcessTracks } from "@/components/process-tracks";
import { PageHeading } from "@/components/page-heading";
import { pageMetadata, type SeoLocale } from "@/lib/seo/metadata";
import { sectionCopy } from "@/lib/seo/page-copy";
import { JsonLd, breadcrumbNode, webPageNode } from "@/lib/seo/json-ld";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = locale as SeoLocale;
  const copy = sectionCopy("process", l)!;
  return pageMetadata({ locale: l, path: "/process", ...copy });
}
export default async function Process({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const stages = await getAllStages();
  const copy = sectionCopy("process", l)!;
  const crumb = breadcrumbNode(l, [
    { name: l === "zh" ? "首頁" : "Home", path: "" },
    { name: l === "zh" ? "設計流程" : "Process", path: "/process" },
  ]);
  return (
    <main id="main" className="page-shell">
      <JsonLd
        graph={[
          crumb,
          webPageNode({
            locale: l,
            path: "/process",
            name: copy.title,
            description: copy.description,
            breadcrumbId: crumb["@id"] as string,
          }),
        ]}
      />
      <PageHeading
        index="P / AI × DESIGN × DELIVERY"
        title={
          l === "zh"
            ? "從一份基準，到完整交付"
            : "One intent. A connected process"
        }
        description={
          l === "zh"
            ? "七段流程，串接設計、技術與現場。依委任範圍選擇完整設計施工統包，或承接外部設計意圖。"
            : "Seven stages connect design, technical coordination and site delivery."
        }
      />
      <div className="engagements">
        <div>
          <p className="eyebrow">01 / FULL DESIGN & BUILD</p>
          <h2>{l === "zh" ? "設計施工統包" : "Full design & build"}</h2>
          <p>
            {l === "zh"
              ? "從現況掃描開始，銜接七段完整流程。"
              : "All seven stages, starting with the site survey."}
          </p>
        </div>
        <div>
          <p className="eyebrow">02 / EXTERNAL DESIGN INTENT</p>
          <h2>{l === "zh" ? "承接外部設計意圖" : "External design intent"}</h2>
          <p>
            {l === "zh"
              ? "由設計意圖定案進入技術驗證、BIM、施工圖說與交付。"
              : "Design intent, technical validation, BIM, documentation and delivery."}
          </p>
        </div>
      </div>
      <ProcessTracks stages={stages} locale={l} />
      <a className="text-link" href={`/${l}/model`}>
        {l === "zh" ? "探索模型與圖說" : "Explore model space"} ↗
      </a>
    </main>
  );
}
