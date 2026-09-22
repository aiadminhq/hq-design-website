// SEO 基礎頁：ImageObject.license 的指向目標（seo/analysis.md §6.3）。
// 建立理由是 license 指向一個 404 比不寫 license 更糟——它會讓 Google
// 圖片的授權欄位變成壞連結。內容全部由 SOURCE_LABEL 推導，不手寫標示字串。
import { setRequestLocale } from "next-intl/server";
import { getAllProjects } from "@/lib/content/loader";
import { SOURCE_LABEL, type Locale, type Provenance } from "@/lib/content/schema";
import { ORG } from "@/lib/site";
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
  const copy = sectionCopy("image-policy", l)!;
  return pageMetadata({ locale: l, path: "/image-policy", ...copy });
}

/** 四類來源的說明。標示字串本身一律取自 SOURCE_LABEL，這裡只寫「代表什麼」。 */
const MEANING: Record<Provenance, { zh: string; en: string }> = {
  photo: {
    zh: "現場拍攝的完工紀錄。畫面中的空間、材料與燈光即為交付狀態。",
    en: "Photographed on site after completion. Space, materials and lighting are as delivered.",
  },
  viz: {
    zh: "設計階段的提案視覺，未必等同最終完工結果，也可能是未執行的方案。",
    en: "A design-stage visualisation. It may differ from the built result, or represent an option that was never built.",
  },
  enh: {
    zh: "現場實拍，另以 AI 調整光影。空間、材料與尺度來自實拍，未新增或移除實體元素。",
    en: "A site photograph with AI-assisted lighting adjustment. Space, materials and dimensions come from the photograph; no physical element is added or removed.",
  },
  drawing: {
    zh: "設計圖面或 BIM 視圖，用於說明配置與系統關係，不宣稱完工狀態。",
    en: "A drawing or BIM view illustrating layout and system relationships. It makes no claim about the built state.",
  },
};

const ORDER: Provenance[] = ["photo", "viz", "enh", "drawing"];

export default async function ImagePolicy({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as Locale;
  const zh = l === "zh";

  // 實際張數由內容層即時統計，不寫死——寫死的數字會在內容增加時默默變成錯的。
  const projects = await getAllProjects();
  const counts = ORDER.map((prov) => ({
    prov,
    n: projects.reduce(
      (sum, p) => sum + p.images.filter((im) => im.prov === prov).length,
      0,
    ),
  }));
  const total = counts.reduce((s, c) => s + c.n, 0);

  const copy = sectionCopy("image-policy", l as SeoLocale)!;
  const crumb = breadcrumbNode(l as SeoLocale, [
    { name: zh ? "首頁" : "Home", path: "" },
    { name: zh ? "影像來源標示政策" : "Image provenance policy", path: "/image-policy" },
  ]);

  return (
    <main id="main" className="page-shell">
      <JsonLd
        graph={[
          crumb,
          webPageNode({
            locale: l as SeoLocale,
            path: "/image-policy",
            name: copy.title,
            description: copy.description,
            breadcrumbId: crumb["@id"] as string,
          }),
        ]}
      />
      <PageHeading
        index="I / IMAGE PROVENANCE"
        title={zh ? "這張圖是實景還是提案？" : "Photograph, or proposal?"}
        description={
          zh
            ? `${ORG.shortZh}（${ORG.shortEn}）為網站上每一張影像標示來源類型。標示由影像資料的來源欄位單向推導，不由人工輸入，因此不可能把設計提案視覺標成完工實景。目前共 ${total} 張。`
            : `${ORG.shortEn} labels every image on this site with its provenance. The label is derived from the image record itself rather than typed by hand, so a design visualisation cannot be presented as an as-built photograph. ${total} images at present.`
        }
      />

      <section className="section">
        <p className="eyebrow">01 / FOUR LABELS</p>
        <h2>{zh ? "四種標示分別代表什麼？" : "What each label means"}</h2>
        <dl className="stage-io" lang={zh ? "zh-Hant" : "en"}>
          {counts.map(({ prov, n }) => (
            <div key={prov}>
              <dt>{SOURCE_LABEL[prov].default[l] ?? SOURCE_LABEL[prov].default.zh}</dt>
              <dd>
                {MEANING[prov][zh ? "zh" : "en"]}
                {n > 0 ? (zh ? ` 目前 ${n} 張。` : ` ${n} images.`) : null}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section">
        <p className="eyebrow">02 / HOW THE LABEL TRAVELS</p>
        <h2>{zh ? "標示如何隨影像一起傳遞？" : "How the label travels with the file"}</h2>
        <p className="body-large" lang={zh ? "zh-Hant" : "en"}>
          {zh
            ? `每張影像除了頁面上的可見標示，另以結構化資料（schema.org ImageObject）帶出 creditText 與 copyrightNotice 兩個欄位。這兩個欄位是搜尋引擎在圖片結果中會顯示的授權資訊，因此當影像脫離本站被單獨檢視時，來源類型仍然跟著它。`
            : `Besides the visible label on the page, each image carries creditText and copyrightNotice in structured data (schema.org ImageObject). Search engines surface those fields alongside the image itself, so the provenance stays attached when the image is viewed away from this site.`}
        </p>
      </section>

      <section className="section">
        <p className="eyebrow">03 / COPYRIGHT & USE</p>
        <h2>{zh ? "著作權與使用方式" : "Copyright and use"}</h2>
        <p className="body-large" lang={zh ? "zh-Hant" : "en"}>
          {zh
            ? `本站影像著作權歸 ${ORG.nameZh} 所有。媒體報導、學術研究或投標文件如需使用，請來信 ${ORG.email} 說明用途與刊載範圍；未經同意不得重製、改作或作為商業素材。`
            : `All images are copyright ${ORG.nameEn}. For press, academic or tender use, write to ${ORG.email} with the intended purpose and scope. Reproduction, adaptation or commercial reuse without permission is not permitted.`}
        </p>
        <a className="text-link" href={`/${l}/contact`}>
          {zh ? "聯絡我們" : "Contact us"} ↗
        </a>
      </section>
    </main>
  );
}
