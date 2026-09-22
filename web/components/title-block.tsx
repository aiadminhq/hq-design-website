"use client";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/content/schema";
export function TitleBlock({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const key = pathname.split("/")[2] || "home";
  const sheets: Record<string, [string, string]> = {
    home: ["A-00", "OVERVIEW"],
    work: ["W-01", "PROJECTS"],
    process: ["P-01", "PROCESS"],
    about: ["A-01", "PRACTICE"],
    services: ["S-01", "SERVICES"],
    model: ["M-01", "MODEL SPACE"],
    careers: ["J-01", "CAREERS"],
    contact: ["C-01", "CONTACT"],
  };
  const sheet = sheets[key] || ["—", "INDEX"];
  return (
    <aside
      className="title-block"
      aria-label={locale === "zh" ? "頁面索引" : "Page index"}
    >
      <span>{sheet[0]}</span>
      <span>{sheet[1]}</span>
      <span>HQ DESIGN</span>
    </aside>
  );
}
