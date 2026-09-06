"use client";

import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Project } from "../lib/projects";

export function ProjectsBrowser({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...Array.from(new Set(projects.map((project) => project.category)))];
  const visibleProjects = useMemo(() => projects.filter((project) => {
    const searchable = `${project.titleZh} ${project.titleEn} ${project.category} ${project.location}`.toLowerCase();
    return (category === "All" || project.category === category) && searchable.includes(query.toLowerCase());
  }), [category, projects, query]);

  return (
    <LayoutGroup>
      <div className="project-toolbar">
        <div className="filter-row" role="group" aria-label="Filter projects">
          {categories.map((item) => <button className={category === item ? "active" : ""} key={item} type="button" onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <label className="search-field"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Project name, type, location" /></label>
      </div>
      <AnimatePresence mode="popLayout">
        <div className="project-grid">
          {visibleProjects.map((project) => (
            <motion.article className="project-card" layout key={project.slug} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}>
              <Link href={`/projects/${project.slug}`}>
                <div className="project-card-image"><img src={project.hero} alt={`${project.titleZh} ${project.titleEn}`} /></div>
                <div className="project-card-copy"><p>{project.category} · {project.year}</p><h2>{project.titleZh}</h2><span>{project.titleEn}</span></div>
              </Link>
            </motion.article>
          ))}
        </div>
      </AnimatePresence>
      {!visibleProjects.length && <p className="empty-state">No projects match this search.</p>}
    </LayoutGroup>
  );
}
