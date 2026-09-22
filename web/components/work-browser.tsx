"use client";
import { useEffect, useState } from "react";
import type { CardData } from "./project-data";
import { ProjectCard } from "./project-card";
import type { Locale } from "@/lib/content/schema";

export function WorkBrowser({
  cards,
  locale,
}: {
  cards: CardData[];
  locale: Locale;
}) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid");
  useEffect(() => {
    const read = () => {
      const p = new URLSearchParams(location.search);
      setCategory(p.get("category") || "all");
      setQuery(p.get("q") || "");
      setView(p.get("view") === "list" ? "list" : "grid");
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);
  const change = (key: string, value: string) => {
    const url = new URL(location.href);
    if (value && value !== "all") url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    history.replaceState(null, "", url);
  };
  const categories = [
    ["all", "全部", "All"],
    ["office", "辦公", "Office"],
    ["hospitality", "旅宿", "Hospitality"],
    ["fb", "餐飲", "Food & beverage"],
    ["showroom", "展廳", "Showroom"],
    ["lounge", "貴賓室", "Lounge"],
    ["other", "其他", "Other"],
  ];
  const filtered = cards.filter(
    (card) =>
      (category === "all" || card.category === category) &&
      `${card.name} ${card.gloss} ${card.facts}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="work-browser">
      <div className="filter-bar">
        <div
          className="filter-tabs"
          role="group"
          aria-label={locale === "zh" ? "案例分類" : "Categories"}
        >
          {categories.map(([key, zh, en]) => (
            <button
              key={key}
              aria-pressed={category === key}
              onClick={() => {
                setCategory(key);
                change("category", key);
              }}
            >
              {locale === "zh" ? zh : en}
              <sup>
                {key === "all"
                  ? cards.length
                  : cards.filter((c) => c.category === key).length}
              </sup>
            </button>
          ))}
        </div>
        <div className="filter-tools">
          <input
            type="search"
            value={query}
            aria-label={locale === "zh" ? "搜尋實績" : "Search projects"}
            placeholder={
              locale === "zh" ? "搜尋實績、地點…" : "Search projects…"
            }
            onChange={(e) => {
              setQuery(e.target.value);
              change("q", e.target.value);
            }}
          />
          <button
            aria-pressed={view === "list"}
            onClick={() => {
              const next = view === "grid" ? "list" : "grid";
              setView(next);
              change("view", next);
            }}
          >
            {view === "grid"
              ? locale === "zh"
                ? "清單 ↗"
                : "List ↗"
              : locale === "zh"
                ? "圖集 ↗"
                : "Grid ↗"}
          </button>
        </div>
      </div>
      <p className="mono small result-count" aria-live="polite">
        {filtered.length} {locale === "zh" ? "個實績" : "projects"}
      </p>
      {filtered.length === 0 && (
        <div className="empty-state">
          <h2>
            {locale === "zh" ? "沒有符合條件的實績。" : "No matching projects."}
          </h2>
          <button
            className="text-link"
            onClick={() => {
              setCategory("all");
              setQuery("");
              change("category", "all");
              change("q", "");
            }}
          >
            {locale === "zh" ? "清除篩選" : "Clear filters"} ↗
          </button>
        </div>
      )}
      {[
        ["photo", "完工實景", "Built spaces"],
        ["other", "設計視覺與圖面", "Visual studies & drawings"],
      ].map(([group, zh, en]) => {
        const items = filtered.filter((c) =>
          group === "photo"
            ? c.image.prov === "photo"
            : c.image.prov !== "photo",
        );
        return (
          items.length > 0 && (
            <section className="work-band" key={group}>
              <div className="section-line">
                <h2>{locale === "zh" ? zh : en}</h2>
                <span className="mono">
                  {String(items.length).padStart(2, "0")}
                </span>
              </div>
              <div
                className={view === "grid" ? "project-grid" : "project-list"}
              >
                {items.map((card, i) => (
                  <ProjectCard card={card} key={card.slug} priority={i < 2} />
                ))}
              </div>
            </section>
          )
        );
      })}
    </div>
  );
}
