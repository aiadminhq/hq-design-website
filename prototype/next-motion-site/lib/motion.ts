// Duration and stagger bands are prototype-owned: hq.css (site/assets/css/hq.css)
// defines only a single --ease token and no duration scale, so these values have
// no upstream authority to sync against yet.
export const hqMotion = {
  duration: {
    micro: 0.18,
    standard: 0.45,
    editorial: 0.8,
    scene: 1.2,
  },
  ease: {
    // Synced from hq.css `--ease: cubic-bezier(.2,.7,.2,1)` — the design system's
    // one approved easing curve. Use this, not an invented curve, for anything
    // that should read as "on-brand" motion.
    brand: [0.2, 0.7, 0.2, 1] as const,
  },
  stagger: {
    tight: 0.05,
    standard: 0.1,
    relaxed: 0.16,
  },
};
