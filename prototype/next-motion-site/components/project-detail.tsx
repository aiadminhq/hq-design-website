"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Project } from "../lib/projects";
import { provenanceLabel } from "../lib/projects";

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <main className="detail-page">
      <section className="detail-hero">
        <motion.img
          layoutId={`project-photo-${project.slug}`}
          src={project.hero.src}
          alt={project.hero.alt}
          data-provenance={project.hero.provenance}
        />
        <div className="detail-hero-overlay" />
        <motion.div
          className="detail-hero-copy"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p>{project.nameEn}</p>
          <h1>{project.nameZh}</h1>
          <span>{project.subtitleEn}</span>
        </motion.div>
        <span className="detail-hero-source mono">
          {provenanceLabel(project.hero.provenance)}
        </span>
        <Link
          className="detail-close"
          href="/projects"
          aria-label="Back to projects"
        >
          ×
        </Link>
      </section>
      <section className="detail-intro page-width">
        <div>
          <p className="eyebrow">Project study</p>
          <h2>{project.nameEn}</h2>
        </div>
        <p>{project.descriptionZh}</p>
        {project.contentSource === "editorial-pending-cms" && (
          <p className="content-pending-note">
            此案場尚未建立 CMS
            條目，本頁文字為編輯佔位內容，待正式內容確認後替換。
          </p>
        )}
      </section>
      <section className="detail-meta page-width">
        {project.specs.map((spec) => (
          <div key={spec.label}>
            <small>{spec.label}</small>
            <strong>{spec.value}</strong>
          </div>
        ))}
      </section>
      <section className="detail-editorial page-width">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="eyebrow">Design intelligence</p>
          <h2>Space is a system of decisions.</h2>
        </motion.div>
        <div className="detail-gallery">
          {project.gallery.map((image, index) => (
            <figure
              className={
                index === 0
                  ? "gallery-image gallery-image-wide"
                  : "gallery-image"
              }
              key={image.src}
            >
              <img
                src={image.src}
                alt={image.alt}
                data-provenance={image.provenance}
              />
              <figcaption className="mono">
                {provenanceLabel(image.provenance)}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section className="related page-width">
        <div className="section-heading">
          <p className="eyebrow">Continue exploring</p>
          <h2>Related projects</h2>
        </div>
        <Link className="text-link" href="/projects">
          Discover all projects →
        </Link>
      </section>
    </main>
  );
}
