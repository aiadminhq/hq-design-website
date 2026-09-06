export type Project = {
  slug: string;
  titleZh: string;
  titleEn: string;
  subtitle: string;
  category: string;
  location: string;
  year: string;
  area: string;
  hero: string;
  gallery: string[];
  description: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "zhongbao-showroom",
    titleZh: "中保科技展示廳",
    titleEn: "SECOM TECHNOLOGY HALL",
    subtitle: "Technology, translated into space.",
    category: "Corporate",
    location: "Nangang, Taipei",
    year: "2025",
    area: "331 sqm",
    hero: "/projects/zhongbao-showroom-hero.jpg",
    gallery: ["/projects/zhongbao-showroom-gallery.jpg", "/projects/zhongbao-showroom-hero.jpg"],
    description: "A technology showcase that turns security systems, material language and visitor movement into one spatial narrative.",
    featured: true,
  },
  {
    slug: "csun",
    titleZh: "志聖工業總部",
    titleEn: "C.SUN INDUSTRIAL HQ",
    subtitle: "A workplace for precision and exchange.",
    category: "Workplace",
    location: "Taoyuan, Taiwan",
    year: "2026",
    area: "709 sqm",
    hero: "/projects/csun-hero.jpg",
    gallery: ["/projects/csun-gallery.jpg", "/projects/csun-hero.jpg"],
    description: "A workplace system balancing production culture, executive focus and shared collaboration.",
    featured: true,
  },
  {
    slug: "polytron",
    titleZh: "Polytron",
    titleEn: "POLYTRON",
    subtitle: "A clear frame for future work.",
    category: "Workplace",
    location: "Taipei, Taiwan",
    year: "2025",
    area: "1,020 sqm",
    hero: "/projects/polytron-hero.jpg",
    gallery: ["/projects/polytron-gallery.jpg", "/projects/polytron-hero.jpg"],
    description: "A focused workplace environment where daylight, circulation and material contrast create a calm working rhythm.",
  },
  {
    slug: "airport-lounges",
    titleZh: "機場貴賓室",
    titleEn: "AIRPORT LOUNGES",
    subtitle: "A quieter threshold between journeys.",
    category: "Hospitality",
    location: "Taiwan",
    year: "2024",
    area: "850 sqm",
    hero: "/projects/airport-lounges-hero.jpg",
    gallery: ["/projects/airport-lounges-gallery.jpg", "/projects/airport-lounges-hero.jpg"],
    description: "A hospitality interior shaped around pause, movement and a clear sense of arrival.",
  },
  {
    slug: "soup-spoon-station",
    titleZh: "匙碗湯車站店",
    titleEn: "SOUP SPOON STATION",
    subtitle: "Fast service, warm spatial memory.",
    category: "F&B",
    location: "Taipei, Taiwan",
    year: "2024",
    area: "180 sqm",
    hero: "/projects/soup-spoon-hero.jpg",
    gallery: ["/projects/soup-spoon-gallery.jpg", "/projects/soup-spoon-hero.jpg"],
    description: "A compact restaurant identity translated into a clear, durable and high-throughput interior.",
  },
  {
    slug: "guochan-office",
    titleZh: "國產建材辦公室",
    titleEn: "GUOCHAN OFFICE",
    subtitle: "Material intelligence for everyday work.",
    category: "Workplace",
    location: "Taipei, Taiwan",
    year: "2025",
    area: "560 sqm",
    hero: "/projects/guochan-office-hero.jpg",
    gallery: ["/projects/guochan-office-gallery.jpg", "/projects/guochan-office-hero.jpg"],
    description: "A workplace proposal that exposes material logic and turns a company story into a working environment.",
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
