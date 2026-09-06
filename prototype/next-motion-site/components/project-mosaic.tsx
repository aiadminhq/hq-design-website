"use client";

import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import type { Project } from "../lib/projects";

const positions = [
  { left: "4%", top: "8%", width: "25%", rotate: -3 },
  { left: "35%", top: "4%", width: "28%", rotate: 2 },
  { left: "70%", top: "12%", width: "24%", rotate: -2 },
  { left: "14%", top: "48%", width: "24%", rotate: 2 },
  { left: "43%", top: "42%", width: "27%", rotate: -1 },
  { left: "73%", top: "54%", width: "22%", rotate: 3 },
];

export function ProjectMosaic({ projects }: { projects: Project[] }) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start start", "end end"] });
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], [1, 1.34]), { stiffness: 90, damping: 24 });
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.82, 1], [1, 1, 0]);

  return (
    <section ref={sceneRef} className="mosaic-scene" aria-label="Featured HQ Design projects">
      <motion.div className="mosaic-stage" style={{ scale, y, opacity }}>
        <div className="mosaic-statement">WE<br />MAKE<br /><em>SPACE</em><span>MEANINGFUL.</span></div>
        {projects.map((project, index) => {
          const position = positions[index % positions.length];
          return (
            <motion.div
              className="mosaic-tile"
              key={project.slug}
              style={{ left: position.left, top: position.top, width: position.width, rotate: position.rotate }}
              whileHover={{ scale: 1.04, zIndex: 12, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <Link href={`/projects/${project.slug}`} aria-label={`Open ${project.titleEn}`}>
                <img src={project.hero} alt={`${project.titleZh} ${project.titleEn}`} />
                <span className="tile-caption">{project.titleEn}<small>{project.category}</small></span>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
      <div className="scroll-note">Scroll to explore <span>↓</span></div>
    </section>
  );
}
