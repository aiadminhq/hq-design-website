"use client";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import type { CardData } from "./project-data";
import { ProjectPhoto } from "./project-card";
import type { Locale } from "@/lib/content/schema";

export function ScrollZoomScene({
  cards,
  locale,
}: {
  cards: CardData[];
  locale: Locale;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.13]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.65, 1], [1, 1, 0]);
  const columns = Array.from({ length: 6 }, (_, col) =>
    cards.filter((_, i) => i % 6 === col),
  );
  return (
    <section
      ref={ref}
      className="scroll-scene"
      aria-label={locale === "zh" ? "精選空間影像場" : "Selected spaces"}
    >
      <div className="scene-stage">
        <motion.div
          className="image-field"
          style={reduced ? undefined : { scale, y }}
        >
          {columns.map((column, i) => (
            <div className={`image-column column-${i}`} key={i}>
              {column.map((card, j) => (
                <a
                  href={card.href}
                  className="field-tile"
                  key={`${card.slug}-${j}`}
                  aria-label={`${card.name} · ${card.image.label}`}
                >
                  <ProjectPhoto
                    image={card.image}
                    priority={j === 0 && i > 0 && i < 5}
                    sizes="(max-width: 700px) 46vw, 24vw"
                  />
                  <span className="tile-caption">
                    <span lang={card.lang}>{card.name}</span>
                    <span className="mono">{card.image.label}</span>
                  </span>
                </a>
              ))}
            </div>
          ))}
        </motion.div>
        <motion.div
          className="scene-title"
          style={reduced ? undefined : { opacity }}
        >
          <p className="eyebrow">SPACES, WITH PURPOSE.</p>
          <h1>
            HQ DESIGN<span className="brand-dot">.</span>
          </h1>
          <p>
            {locale === "zh"
              ? "從空間構想到落地交付"
              : "From spatial intent to built reality"}
          </p>
        </motion.div>
        <div className="scene-foot mono">
          <span>TAIPEI / SINCE 1995</span>
          <a href="#selected">
            {locale === "zh" ? "探索精選實績" : "Selected projects"} ↓
          </a>
          <span>DESIGN × BUILD</span>
        </div>
      </div>
    </section>
  );
}
