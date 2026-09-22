import type { Metadata } from "next";
import { MotionConfig } from "motion/react";
import { SiteNavigation } from "../components/site-navigation";
import { hqMotion } from "../lib/motion";
import "./hq-tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "HQ Design — Space, systems, and possibility",
  description:
    "HQ Design interior architecture, design systems and spatial intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-TW">
      <body>
        <MotionConfig
          reducedMotion="user"
          transition={{
            duration: hqMotion.duration.standard,
            ease: hqMotion.ease.brand,
          }}
        >
          <SiteNavigation />
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
