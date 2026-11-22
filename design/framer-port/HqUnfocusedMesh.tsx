"use client";

/**
 * HqUnfocusedMesh
 *
 * React 19 / Next.js App Router port of the Framer code component
 * "UnfocusedEnhanced" (Workshop/UnfocusedComponent.tsx, used by node RhV2IHfHj
 * of the "Personal-Website-now" Framer project).
 *
 * The original is a pure CSS/DOM effect, not a shader:
 *   1. a source image,
 *   2. a copy of it blurred with a Gaussian blur (CSS `filter: blur()` or an
 *      SVG <feGaussianBlur> filter) and revealed through a CSS `mask`
 *      gradient -> a progressive / "unfocused" blur,
 *   3. a 2D-canvas grain overlay (mix-blend-mode),
 *   4. a radial vignette.
 *
 * This port keeps that mechanic with zero Framer-runtime dependency and swaps
 * the photo for an HQ Mesh (navy -> cool gray, one small vermillion band) as
 * the default source. A photo / render can still be supplied through `image`.
 *
 * Runtime deps: react, motion (`motion/react`). No WebGL, no canvas.
 */

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

// ---------------------------------------------------------------------------
// Brand tokens — the only colours this component can emit
// ---------------------------------------------------------------------------

export const HQ = {
  vermillion: "#D64518",
  vermillionLight: "#ED6D45",
  vermillionDeep: "#8E2A09",
  navy: "#1F2A36",
  navyDeep: "#131B25",
  navyInk: "#0A1118",
  coolGray: "#C0C8D2",
  coolGrayLight: "#E1E8F0",
  white: "#FFFFFF",
} as const;

export type HqColor = (typeof HQ)[keyof typeof HQ];

/** The only angles allowed for directional geometry (gradients, masks, bands). */
export type HqAngle = 0 | 30 | 60 | 90 | 120 | 150;

export type HqGrainBlend = "overlay" | "soft-light" | "multiply";

export interface HqMeshAccent {
  /** Band colour. Default: vermillion. */
  color: HqColor;
  /** Band direction. Default: 60. */
  angle: HqAngle;
  /** Centre of the band along the gradient line, 0–100. Default: 68. */
  at: number;
  /** Band thickness as % of the gradient line (≈ share of the area). 0–6. Default: 2.5 (≈ 3 % of pixels). */
  width: number;
}

export interface HqMesh {
  /** Dark end of the mesh. */
  from: HqColor;
  /** Light end of the mesh. */
  to: HqColor;
  /** Direction of the main gradient (CSS convention: 0 = to top, 90 = to right). */
  angle: HqAngle;
  /** Single hard-edged accent band. `null` removes it. */
  accent: HqMeshAccent | null;
}

export interface HqBlurMask {
  /** Direction of the reveal; 0 % of the gradient line is fully blurred. Default: 60. */
  angle: HqAngle;
  /** Up to this % the blurred layer is fully visible. Default: 42. */
  start: number;
  /** From this % on the blurred layer sits at `floor` opacity. Default: 49. */
  end: number;
  /** Residual opacity of the blurred layer in the sharp zone, 0–1. Default: 0.12. */
  floor: number;
}

export interface HqDrift {
  /** Offset of the blurred texture at the far end of the tween, px. */
  x: number;
  y: number;
  /** Seconds for one leg of the tween. */
  duration: number;
  delay?: number;
  /** Repeat forever (reverse). Default: true. */
  loop?: boolean;
}

export interface HqUnfocusedMeshProps {
  /** Optional photo / render URL. When set it replaces the mesh as the source. */
  image?: string;
  /** Mesh definition, used when `image` is not set. Partial overrides of the default. */
  mesh?: Partial<HqMesh>;
  /** Blur radius of the masked layer, px (CSS blur(px) == SVG stdDeviation). Default: 14. */
  blur?: number;
  /** Uniform softening of the whole source, px. Default: 0. */
  baseBlur?: number;
  /** Progressive-blur mask. `false` blurs the whole surface uniformly. */
  mask?: Partial<HqBlurMask> | false;
  /** Saturation multiplier on the blurred layer. Default: 1 (keeps tokens exact). */
  saturation?: number;
  /** Grain opacity, 0–0.08 (brand: fine grain 3–8 %). Default: 0.06. */
  grain?: number;
  /** Blend mode of the grain. Default: "overlay". */
  grainBlend?: HqGrainBlend;
  /** Vignette strength 0–1, drawn in navy ink (#0A1118), never black. Default: 0.22. */
  vignette?: number;
  /** % of the radius that stays clear before the vignette starts. Default: 43. */
  vignetteSpread?: number;
  /**
   * Slow tween of the blurred texture under the fixed mask. Off by default.
   * Automatically disabled under `prefers-reduced-motion` and while off-screen.
   */
  drift?: HqDrift | false;
  className?: string;
  style?: CSSProperties;
  /** Content rendered above the effect. */
  children?: ReactNode;
}

// ---------------------------------------------------------------------------
// Defaults (mirror node RhV2IHfHj, snapped to brand rules)
// ---------------------------------------------------------------------------

const DEFAULT_MESH: HqMesh = {
  from: HQ.navyDeep,
  to: HQ.coolGray,
  angle: 120,
  accent: { color: HQ.vermillion, angle: 60, at: 68, width: 2.5 },
};

const DEFAULT_MASK: HqBlurMask = { angle: 60, start: 42, end: 49, floor: 0.12 };

const DRIFT_EASE: [number, number, number, number] = [0.44, 0, 0.56, 1];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** Builds the layered CSS `background-image` of an HQ Mesh (first layer on top). Also usable on its own for static, unblurred surfaces. */
export function hqMeshBackground(mesh: Partial<HqMesh> = {}): string {
  const m: HqMesh = { ...DEFAULT_MESH, ...mesh };
  const layers: string[] = [];

  if (m.accent && m.accent.width > 0) {
    const half = clamp(m.accent.width, 0, 6) / 2;
    const a0 = clamp(m.accent.at - half, 0, 100);
    const a1 = clamp(m.accent.at + half, 0, 100);
    layers.push(
      `linear-gradient(${m.accent.angle}deg, transparent ${a0}%, ${m.accent.color} ${a0}% ${a1}%, transparent ${a1}%)`,
    );
  }

  // A soft pool of the light colour at the light end gives the two-colour
  // gradient its "mesh" depth without introducing a third hue.
  const rad = (m.angle * Math.PI) / 180;
  const lx = (50 + 50 * Math.sin(rad)).toFixed(1);
  const ly = (50 - 50 * Math.cos(rad)).toFixed(1);
  layers.push(`radial-gradient(ellipse 60% 55% at ${lx}% ${ly}%, ${m.to} 0%, transparent 100%)`);

  layers.push(`linear-gradient(${m.angle}deg, ${m.from} 0%, ${m.from} 28%, ${m.to} 100%)`);

  return layers.join(", ");
}

/** CSS mask that reveals the blurred layer progressively (port of the Framer "scroll" mask). */
export function hqBlurMask(mask: Partial<HqBlurMask> = {}): CSSProperties {
  const m: HqBlurMask = { ...DEFAULT_MASK, ...mask };
  const start = clamp(m.start, 0, 100);
  const end = clamp(Math.max(m.end, start), 0, 100);
  const floor = clamp(m.floor, 0, 1);
  const gradient = `linear-gradient(${m.angle}deg, #fff ${start}%, rgba(255,255,255,${floor}) ${end}%)`;
  return { mask: gradient, WebkitMask: gradient };
}

/** Oversizes a layer so CSS blur does not fade towards transparent at the edges. */
function bleed(extend: number): CSSProperties {
  if (extend <= 0) return { inset: 0 };
  return {
    top: -extend,
    left: -extend,
    width: `calc(100% + ${extend * 2}px)`,
    height: `calc(100% + ${extend * 2}px)`,
  };
}

// Deterministic, SSR-safe grain tile: SVG fractal noise, desaturated, contrast
// boosted, opaque. Rasterised once by the browser at device resolution.
const GRAIN_TILE = 160;
const GRAIN_SVG =
  `<svg xmlns='http://www.w3.org/2000/svg' width='${GRAIN_TILE}' height='${GRAIN_TILE}'>` +
  `<filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>` +
  `<feTurbulence type='fractalNoise' baseFrequency='1.15' numOctaves='2' seed='7' stitchTiles='stitch'/>` +
  `<feColorMatrix type='saturate' values='0'/>` +
  `<feComponentTransfer>` +
  `<feFuncR type='linear' slope='2' intercept='-0.5'/>` +
  `<feFuncG type='linear' slope='2' intercept='-0.5'/>` +
  `<feFuncB type='linear' slope='2' intercept='-0.5'/>` +
  `<feFuncA type='table' tableValues='1 1'/>` +
  `</feComponentTransfer>` +
  `</filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`;
const GRAIN_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(GRAIN_SVG)}")`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HqUnfocusedMesh({
  image,
  mesh,
  blur = 14,
  baseBlur = 0,
  mask = {},
  saturation = 1,
  grain = 0.06,
  grainBlend = "overlay",
  vignette = 0.22,
  vignetteSpread = 43,
  drift = false,
  className,
  style,
  children,
}: HqUnfocusedMeshProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.05 });
  const reducedMotion = useReducedMotion(); // null until known on the client

  const meshSpec: HqMesh = { ...DEFAULT_MESH, ...mesh };
  const maskSpec: HqBlurMask | null = mask === false ? null : { ...DEFAULT_MASK, ...mask };

  const source: CSSProperties = image
    ? { backgroundImage: `url("${image}")`, backgroundSize: "cover", backgroundPosition: "center" }
    : { backgroundImage: hqMeshBackground(meshSpec) };

  const blurPx = Math.max(0, blur);
  const basePx = Math.max(0, baseBlur);
  const grainOpacity = clamp(grain, 0, 0.08);
  const vig = clamp(vignette, 0, 1);
  const clear = clamp(100 - vignetteSpread, 0, 100);

  const driftSpec = drift === false ? null : drift;
  const driftOn = driftSpec !== null && inView && reducedMotion === false;
  const driftReach = driftSpec ? Math.max(Math.abs(driftSpec.x), Math.abs(driftSpec.y)) : 0;

  const filterFor = (px: number): string | undefined => {
    const parts: string[] = [];
    if (px > 0) parts.push(`blur(${px}px)`);
    if (saturation !== 1) parts.push(`saturate(${saturation})`);
    return parts.length > 0 ? parts.join(" ") : undefined;
  };

  return (
    <div
      ref={ref}
      className={className}
      role={children === undefined ? "presentation" : undefined}
      style={{
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
        width: "100%",
        height: "100%",
        borderRadius: 0,
        backgroundColor: meshSpec.from,
        ...style,
      }}
    >
      {/* 1. Sharp source (mesh or image) */}
      <div aria-hidden style={{ position: "absolute", inset: 0, ...source }} />

      {/* 2. Optional uniform softening ("unmask blur" in the original) */}
      {basePx > 0 && (
        <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <div style={{ position: "absolute", ...bleed(basePx * 2), ...source, filter: filterFor(basePx) }} />
        </div>
      )}

      {/* 3. Progressive blur: fixed mask, optionally drifting blurred texture */}
      {blurPx > 0 && (
        <div
          aria-hidden
          style={{ position: "absolute", inset: 0, overflow: "hidden", ...(maskSpec ? hqBlurMask(maskSpec) : {}) }}
        >
          <motion.div
            initial={false}
            animate={driftOn && driftSpec ? { x: driftSpec.x, y: driftSpec.y } : { x: 0, y: 0 }}
            transition={
              driftOn && driftSpec
                ? {
                    duration: driftSpec.duration,
                    delay: driftSpec.delay ?? 0,
                    ease: DRIFT_EASE,
                    repeat: driftSpec.loop === false ? 0 : Infinity,
                    repeatType: "reverse",
                  }
                : { duration: 0.8, ease: "easeOut" }
            }
            style={{
              position: "absolute",
              ...bleed(blurPx * 2 + driftReach),
              ...source,
              filter: filterFor(blurPx),
              willChange: driftOn ? "transform" : undefined,
            }}
          />
        </div>
      )}

      {/* 4. Fine grain */}
      {grainOpacity > 0 && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage: GRAIN_URL,
            backgroundSize: `${GRAIN_TILE}px ${GRAIN_TILE}px`,
            backgroundRepeat: "repeat",
            opacity: grainOpacity,
            mixBlendMode: grainBlend,
          }}
        />
      )}

      {/* 5. Vignette in navy ink */}
      {vig > 0 && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(ellipse at center, transparent ${clear}%, rgba(10, 17, 24, ${vig}) 100%)`,
          }}
        />
      )}

      {/* 6. Content slot */}
      {children !== undefined && <div style={{ position: "relative", zIndex: 1 }}>{children}</div>}
    </div>
  );
}

export default HqUnfocusedMesh;
