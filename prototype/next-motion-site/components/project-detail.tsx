"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Project } from "../lib/projects";

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <main className="detail-page">
      <section className="detail-hero">
        <img src={project.hero} alt={`${project.titleZh} ${project.titleEn}`} />
        <div className="detail-hero-overlay" />
        <motion.div className="detail-hero-copy" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}>
          <p>{project.titleEn}</p><h1>{project.titleZh}</h1><span>{project.subtitle}</span>
        </motion.div>
        <Link className="detail-close" href="/projects" aria-label="Back to projects">×</Link>
      </section>
      <section className="detail-intro page-width">
        <div><p className="eyebrow">Project study</p><h2>{project.titleEn}</h2></div>
        <p>{project.description}</p>
      </section>
      <section className="detail-meta page-width">
        {[['Type', project.category], ['Location', project.location], ['Year', project.year], ['Area', project.area]].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}
      </section>
      <section className="detail-editorial page-width">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><p className="eyebrow">Design intelligence</p><h2>Space is a system of decisions.</h2></motion.div>
        <div className="detail-gallery">{project.gallery.map((image, index) => <div className={index === 0 ? "gallery-image gallery-image-wide" : "gallery-image"} key={image}><img src={image} alt={`${project.titleEn} detail ${index + 1}`} /></div>)}</div>
      </section>
      <section className="related page-width"><div className="section-heading"><p className="eyebrow">Continue exploring</p><h2>Related projects</h2></div><Link className="text-link" href="/projects">Discover all projects →</Link></section>
    </main>
  );
}
