import "server-only";
import manifest from "@/lib/content/generated/images.json";
import { sourceLabel } from "@/lib/content/loader";
import { resolve } from "@/lib/content/locale";
import type { Locale, Project, ProjectImage } from "@/lib/content/schema";

export function plain(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&[lr]arr;/g, "→")
    .replace(/&times;/g, "×")
    .replace(/&quot;/g, '"');
}

export function imageData(
  project: Project,
  image: ProjectImage,
  locale: Locale,
) {
  return {
    src: `/media/work/${project.slug}/${image.stem}`,
    width: image.width,
    height: image.height,
    stem: image.stem,
    alt: resolve(image.alt, locale).value,
    label: sourceLabel(image.prov, locale, image.labelVariant as never),
    prov: image.prov,
    position: `${(image.focal?.x ?? 0.5) * 100}% ${(image.focal?.y ?? 0.5) * 100}%`,
    blur: (manifest.images as Record<string, { blurDataURL: string }>)[
      `${project.slug}/${image.stem}`
    ]?.blurDataURL,
  };
}

export function toCardData(project: Project, locale: Locale) {
  const image =
    project.images.find((im) => im.role === "hero") ?? project.images[0];
  const name = resolve(project.name, locale);
  return {
    slug: project.slug,
    name: name.value,
    lang: name.lang === "zh" ? "zh-Hant" : name.lang,
    category: project.category,
    weight: project.weight,
    gloss: plain(project.gloss),
    href: `/${locale}/work/${project.slug}`,
    image: imageData(project, image, locale),
    facts: project.specs
      .filter(
        (s) => s.verified && ["Location", "Year", "Area"].includes(s.labelEn),
      )
      .map((s) => (locale === "zh" ? s.value : (s.valueEn ?? s.value)))
      .join(" · "),
  };
}
export type CardData = ReturnType<typeof toCardData>;
export type ImageData = ReturnType<typeof imageData>;
