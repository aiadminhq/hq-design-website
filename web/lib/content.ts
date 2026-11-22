import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import pagesJson from "../content/generated/pages.json";
import chromeJson from "../content/generated/chrome.json";
import initialJson from "../content/initial-release.json";
import { snapshotSchema, type Locale } from "./project";
import { getStore } from "./cms/storage";
import { published, readSnapshot } from "./cms/releases";
import { verifyTicket } from "./cms/auth";

export interface MainPage {
  title: string;
  description: string;
  styles: string;
  jsonLd: unknown[];
  html: string;
}
export const pages = pagesJson as Record<string, MainPage>;
export const chrome = chromeJson as Record<
  Locale,
  { brand: string; nav: string; footer: string }
>;
export const initialRelease = snapshotSchema.parse(initialJson);
export const getSnapshot = cache(async () => {
  const cookie = (await cookies()).get("hq-preview")?.value;
  const preview = verifyTicket(cookie);
  if (preview) return readSnapshot(getStore(), "drafts", preview);
  if (!process.env.HQ_BLOB_PRIVATE_TOKEN && !process.env.HQ_CMS_LOCAL)
    return initialRelease;
  return published(getStore(), initialRelease);
});
export function resolveRoute(segments: string[] = []) {
  const locale: Locale = segments[0] === "zh" ? "zh" : "en";
  const parts = locale === "zh" ? segments.slice(1) : segments;
  const project =
    parts[0] === "projects" && parts.length === 2 ? parts[1] : null;
  const page = parts.length <= 1 ? parts[0] || "index" : null;
  return { locale, project, page };
}
