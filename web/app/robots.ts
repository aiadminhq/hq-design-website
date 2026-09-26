import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules:
      process.env.VERCEL_ENV === "preview"
        ? { userAgent: "*", disallow: "/" }
        : { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: "https://www.hqdesign.tw/sitemap.xml",
  };
}
