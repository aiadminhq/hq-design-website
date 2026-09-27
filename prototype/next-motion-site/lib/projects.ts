import zhongbaoShowroomCms from "../content/projects/zhongbao-showroom.json";
import csunCms from "../content/projects/csun.json";
import polytronCms from "../content/projects/polytron.json";
import soupSpoonStationCms from "../content/projects/soup-spoon-station.json";

// Four content-policy provenance labels for project imagery, synced from
// ds-bundle/tokens/components.css `.fig[data-provenance=...]`. Do not invent
// a fifth value — every image must be one of these.
export type ImageProvenance = "photo" | "viz" | "enh" | "drawing";

export type ProjectImage = {
  src: string;
  alt: string;
  provenance: ImageProvenance;
};

export type ProjectSpec = { label: string; value: string };

export type Project = {
  slug: string;
  nameZh: string;
  /** Editorial English display name — CMS has no nameEn yet, pending official localisation. */
  nameEn: string;
  /** Editorial marketing tagline — has no CMS equivalent, pending copy approval. */
  subtitleEn: string;
  categoryLabel: string;
  locationZh: string;
  yearLabel: string;
  descriptionZh: string;
  specs: ProjectSpec[];
  hero: ProjectImage;
  gallery: ProjectImage[];
  /** "cms" = text content sourced from cms/data/projects/<slug>.json. */
  contentSource: "cms" | "editorial-pending-cms";
  featured?: boolean;
};

type CmsSpec = { labelZh: string; value: string };
type CmsProject = {
  slug: string;
  nameZh: string;
  categoryLabel: string;
  locationZh: string;
  yearLabel: string;
  descriptionZh: string;
  specs: CmsSpec[];
};

const PROVENANCE_LABEL: Record<ImageProvenance, string> = {
  photo: "完工實景 · AS-BUILT",
  viz: "設計提案視覺 · DESIGN VISUALISATION",
  enh: "實拍 · AI 光影強化 · AI-ENHANCED",
  drawing: "圖面 · DRAWING",
};

export function provenanceLabel(provenance: ImageProvenance): string {
  return PROVENANCE_LABEL[provenance];
}

// Real filenames as copied from the approved asset library
// (site/assets/img/work/<slug>/) — not invented prototype sample images.
// Provenance values are read back from the live site's own markup
// (site/work/index.html), which tags each project card once for all of its
// imagery; per-image provenance can be split out later if a project ever
// mixes as-built photography with visualisation frames.
const ASSET_MANIFEST: Record<
  string,
  { files: string[]; provenance: ImageProvenance }
> = {
  "zhongbao-showroom": {
    files: [
      "zhongbao-showroom-hero-01.jpg",
      "zhongbao-showroom-gallery-02.jpg",
    ],
    provenance: "viz",
  },
  csun: {
    files: ["csun-hero-01.jpg", "csun-gallery-02.jpg"],
    provenance: "viz",
  },
  polytron: {
    files: ["polytron-hero-01.jpg", "polytron-gallery-02.jpg"],
    provenance: "viz",
  },
  "soup-spoon-station": {
    files: [
      "soup-spoon-station-hero-01.jpg",
      "soup-spoon-station-gallery-02.jpg",
      "soup-spoon-station-gallery-03.jpg",
      "soup-spoon-station-gallery-04.jpg",
      "soup-spoon-station-gallery-05.jpg",
      "soup-spoon-station-gallery-06.jpg",
      "soup-spoon-station-gallery-07.jpg",
      "soup-spoon-station-detail-08.jpg",
      "soup-spoon-station-context-09.jpg",
    ],
    provenance: "photo",
  },
  "guochan-office": {
    files: [
      "guochan-office-hero-01.jpg",
      "guochan-office-gallery-02.jpg",
      "guochan-office-gallery-03.jpg",
      "guochan-office-gallery-04.jpg",
    ],
    provenance: "photo",
  },
  "airport-lounges": {
    files: [
      "airport-lounges-hero-01.jpg",
      "airport-lounges-gallery-02.jpg",
      "airport-lounges-gallery-03.jpg",
      "airport-lounges-gallery-04.jpg",
      "airport-lounges-detail-05.jpg",
    ],
    provenance: "photo",
  },
};

// Hero alt text confirmed against site/work/index.html captions. Gallery alt
// text has no per-image source on the live site, so it is generated from the
// project name and frame position instead of invented per-image copy.
const HERO_ALT: Record<string, string> = {
  "zhongbao-showroom": "中保科技展示廳｜LED 影像牆研討區設計提案視覺",
  csun: "志聖工業 C.SUN｜室內空間設計提案視覺",
  polytron: "保創科技 POLYTRON｜室內空間設計提案視覺",
  "soup-spoon-station": "The Soup Spoon 台北車站店｜店面外觀",
  "guochan-office": "國產建材總部辦公｜會議室（大型董事會議室）",
  "airport-lounges": "桃園機場航空貴賓室｜接待大廳",
};

function buildImage(
  slug: string,
  filename: string,
  alt: string,
  provenance: ImageProvenance,
): ProjectImage {
  return { src: `/projects/${slug}/${filename}`, alt, provenance };
}

function buildImages(
  slug: string,
  nameZh: string,
): { hero: ProjectImage; gallery: ProjectImage[] } {
  const manifest = ASSET_MANIFEST[slug];
  const images = manifest.files.map((filename, index) => {
    const alt =
      index === 0 && HERO_ALT[slug]
        ? HERO_ALT[slug]
        : `${nameZh}｜影像 ${String(index + 1).padStart(2, "0")}`;
    return buildImage(slug, filename, alt, manifest.provenance);
  });
  const [hero, ...gallery] = images;
  return { hero, gallery };
}

function specsFromCms(cms: CmsProject): ProjectSpec[] {
  return cms.specs.map((spec) => ({ label: spec.labelZh, value: spec.value }));
}

function fromCms(
  cms: CmsProject,
  nameEn: string,
  subtitleEn: string,
  featured?: boolean,
): Project {
  const { hero, gallery } = buildImages(cms.slug, cms.nameZh);
  return {
    slug: cms.slug,
    nameZh: cms.nameZh,
    nameEn,
    subtitleEn,
    categoryLabel: cms.categoryLabel,
    locationZh: cms.locationZh,
    yearLabel: cms.yearLabel,
    descriptionZh: cms.descriptionZh,
    specs: specsFromCms(cms),
    hero,
    gallery,
    contentSource: "cms",
    featured,
  };
}

function editorialPendingCms(input: {
  slug: string;
  nameZh: string;
  nameEn: string;
  subtitleEn: string;
  categoryLabel: string;
  locationZh: string;
  yearLabel: string;
  descriptionZh: string;
  specs: ProjectSpec[];
}): Project {
  const { hero, gallery } = buildImages(input.slug, input.nameZh);
  return { ...input, hero, gallery, contentSource: "editorial-pending-cms" };
}

// Four projects backed by cms/data/projects/<slug>.json (the CMS content
// authority). heroImage/gallery *paths* inside those CMS files point at
// assets that do not exist in site/ — see ASSET_MANIFEST above for the real,
// approved imagery instead.
export const projects: Project[] = [
  fromCms(
    zhongbaoShowroomCms as CmsProject,
    "SECOM TECHNOLOGY HALL",
    "Technology, translated into space.",
    true,
  ),
  fromCms(
    csunCms as CmsProject,
    "C.SUN INDUSTRIAL HQ",
    "A workplace for precision and exchange.",
    true,
  ),
  fromCms(
    polytronCms as CmsProject,
    "POLYTRON",
    "A clear frame for future work.",
  ),
  fromCms(
    soupSpoonStationCms as CmsProject,
    "SOUP SPOON STATION",
    "Fast service, warm spatial memory.",
  ),
  // Not yet in cms/data/projects — real approved photography exists
  // (site/assets/img/work/airport-lounges/), but there is no CMS entry to
  // source name/description/specs from. Copy below is editorial placeholder,
  // flagged via contentSource, pending a real CMS entry.
  editorialPendingCms({
    slug: "airport-lounges",
    nameZh: "機場貴賓室",
    nameEn: "AIRPORT LOUNGES",
    subtitleEn: "A quieter threshold between journeys.",
    categoryLabel: "Airline Lounge",
    locationZh: "桃園國際機場",
    yearLabel: "",
    descriptionZh:
      "桃園機場航空貴賓室設計施工案，目前尚未建立 CMS 條目；本頁文字為編輯佔位內容，待正式內容確認後替換。",
    specs: [{ label: "類型", value: "航空貴賓室" }],
  }),
  editorialPendingCms({
    slug: "guochan-office",
    nameZh: "國產建材總部辦公",
    nameEn: "GUOCHAN OFFICE",
    subtitleEn: "Material intelligence for everyday work.",
    categoryLabel: "Corporate Office",
    locationZh: "台北",
    yearLabel: "",
    descriptionZh:
      "國產建材總部辦公室設計施工案，目前尚未建立 CMS 條目；本頁文字為編輯佔位內容，待正式內容確認後替換。",
    specs: [{ label: "類型", value: "企業總部辦公室" }],
  }),
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
