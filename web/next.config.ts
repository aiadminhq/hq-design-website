import type { NextConfig } from "next";

const config: NextConfig = {
  // Resolve metadata and missing project status before the response starts streaming.
  htmlLimitedBots: /.*/,
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/zh/index.html", destination: "/zh", permanent: true },
      { source: "/:path+.html", destination: "/:path+", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};
export default config;
