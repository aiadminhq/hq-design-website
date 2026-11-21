import type { MetadataRoute } from "next";
import { initialRelease } from "../lib/content";
import { getStore } from "../lib/cms/storage";
import { published } from "../lib/cms/releases";
import { siteUrl } from "../lib/seo";
import { localizedPath } from "../lib/project";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const release = process.env.HQ_BLOB_PRIVATE_TOKEN
    ? await published(getStore(), initialRelease)
    : initialRelease;
  const paths = [
    "/",
    "/projects",
    "/services",
    "/about",
    "/contact",
    "/careers",
    "/local-partner-international-pm",
    "/faq",
    ...release.projects.map((p) => "/projects/" + p.slug),
  ];
  return paths.flatMap((path) =>
    (["en", "zh"] as const).map((locale) => ({
      url: siteUrl + localizedPath(path, locale),
      alternates: {
        languages: {
          en: siteUrl + localizedPath(path, "en"),
          "zh-Hant": siteUrl + localizedPath(path, "zh"),
        },
      },
    })),
  );
}
