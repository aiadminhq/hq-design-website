export const hqMotion = {
  duration: {
    micro: 0.18,
    standard: 0.45,
    editorial: 0.8,
    scene: 1.2,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1] as const,
    soft: [0.16, 1, 0.3, 1] as const,
  },
  stagger: {
    tight: 0.05,
    standard: 0.1,
    relaxed: 0.16,
  },
};
