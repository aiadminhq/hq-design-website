import type { Metadata } from "next";
import { MotionConfig } from "motion/react";
import { SiteNavigation } from "../components/site-navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "HQ Design — Space, systems, and possibility",
  description: "HQ Design interior architecture, design systems and spatial intelligence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-TW">
      <body>
        <MotionConfig reducedMotion="user" transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
          <SiteNavigation />
          {children}
        </MotionConfig>
      </body>
    </html>
  );
}
