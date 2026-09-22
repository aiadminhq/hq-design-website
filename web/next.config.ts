import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import legacy from "./lib/routes/legacy-redirects.json" with { type: "json" };

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  typedRoutes: true,

  // Runtime content and brand SVGs live beside web/ in this monorepo.
  outputFileTracingRoot: `${import.meta.dirname}/..`,

  // 影像走預先產好的靜態檔，不用 Vercel Image Optimization：
  // 圖集固定且已知，沒有理由為動態轉換付 transformation 配額。
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: [800, 1024, 1280, 1600, 1920, 2560],
  },

  async redirects() {
    // permanent: true 產生的是 308，需求是 301，所以明確指定 statusCode
    return legacy.map((r) => ({
      source: r.from,
      destination: r.to,
      statusCode: 301,
    }));
  },
};

export default withNextIntl(nextConfig);
