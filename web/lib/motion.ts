// Selectively ported from codex/hq-motion-first, prototype/next-motion-site/lib/motion.ts.
export const hqMotion = {
  duration: { micro: 0.18, standard: 0.45, editorial: 0.8, scene: 1.2 },
  ease: { brand: [0.2, 0.7, 0.2, 1] as const },
  stagger: { tight: 0.05, standard: 0.1, relaxed: 0.16 },
};
