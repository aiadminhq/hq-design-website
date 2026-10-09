"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { hqMotion } from "../lib/motion";
import {
  categoryName,
  formatArea,
  localizedPath,
  type Locale,
  type Project,
} from "../lib/project";

export function ProjectCard({
  project,
  locale,
  large = false,
}: {
  project: Project;
  locale: Locale;
  large?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      layout={!reduce}
      className={`project-card${large ? " large" : ""}`}
      data-type={project.category}
      initial={false}
      animate={{ opacity: 1 }}
      whileHover={reduce ? {} : { y: -4 }}
      transition={{
        duration: hqMotion.duration.standard,
        ease: hqMotion.ease.brand,
      }}
    >
      <img
        src={project.images[0].src}
        alt={project.images[0].alt[locale]}
        loading="lazy"
      />
      <div className="project-card-overlay">
        <h3 className="project-name">
          <span className="name-en">{project.name.en}</span>
          <span className="name-zh-pn">{project.name.zh}</span>
        </h3>
        <span className="project-meta en">
          {[
            formatArea(project.areaSqm, locale),
            project.location[locale],
            project.year,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
        <span className="project-type">
          {categoryName(project.category, locale)}
        </span>
      </div>
      <Link
        className="project-link"
        aria-label={`${locale === "en" ? "View project" : "查看專案"}: ${project.name[locale]}`}
        href={localizedPath("/projects/" + project.slug, locale)}
      >
        {locale === "en" ? "View Case →" : "查看作品 →"}
      </Link>
    </motion.div>
  );
}
export function FeaturedProjects({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  return (
    <div className="projects-grid">
      {projects
        .filter((p) => p.featured)
        .sort(
          (a, b) => (a.featuredOrder ?? a.order) - (b.featuredOrder ?? b.order),
        )
        .slice(0, 4)
        .map((p, i) => (
          <ProjectCard
            key={p.slug}
            project={p}
            locale={locale}
            large={i === 0}
          />
        ))}
    </div>
  );
}
export function ProjectsBrowser({
  projects,
  locale,
}: {
  projects: Project[];
  locale: Locale;
}) {
  const search = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  const categories = [...new Set(projects.map((p) => p.category))];
  const requested = search.get("category") || "office";
  const active =
    requested === "all" || categories.includes(requested)
      ? requested
      : "office";
  const visible = projects.filter(
    (p) => active === "all" || p.category === active,
  );
  return (
    <>
      <div
        className="filter-tabs"
        role="group"
        aria-label={locale === "en" ? "Project categories" : "作品分類"}
      >
        {["all", ...categories].map((category) => (
          <button
            key={category}
            type="button"
            className={`filter-btn${active === category ? " active" : ""}`}
            aria-pressed={active === category}
            onClick={() => {
              const params = new URLSearchParams(search.toString());
              params.set("category", category);
              router.replace(path + "?" + params.toString(), { scroll: false });
            }}
          >
            {category === "all"
              ? locale === "en"
                ? "All projects"
                : "全部作品"
              : categoryName(category, locale)}
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        {visible.length} {locale === "en" ? "projects" : "個專案"}
      </p>
      <div className="projects-grid">
        {visible.map((p) => (
          <ProjectCard key={p.slug} project={p} locale={locale} />
        ))}
      </div>
    </>
  );
}
