# HqUnfocusedMesh — drop-in for the HQ Design Next.js site

Port of the Framer "UnfocusedEnhanced" progressive-blur component (see `SOURCE-NOTES.md`).
Client component, React 19, Next.js 15 App Router, Motion for React. No Framer runtime.

## Install

1. Copy `HqUnfocusedMesh.tsx` to `web/components/HqUnfocusedMesh.tsx`
   (or `web/components/hq-unfocused-mesh.tsx` if the folder uses kebab-case — just keep the import path in sync).
2. Make sure `motion` (≥ 11.11, exports `motion/react`) is a dependency — it already is on this site.
3. Nothing else: no CSS file, no `next.config` change, no assets. The file starts with `"use client"`,
   so it can be imported from any Server Component page.

## Usage (3 lines)

```tsx
import HqUnfocusedMesh from "@/components/HqUnfocusedMesh";

<HqUnfocusedMesh className="h-[70vh]" />                                   {/* default navy→cool-gray mesh, 60° reveal */}
<HqUnfocusedMesh image="/renders/lobby.jpg" blur={18} mask={{ angle: 90 }} />
```

Content on top:

```tsx
<HqUnfocusedMesh style={{ height: 640 }}>
  <h1 className="p-16 text-white">…</h1>
</HqUnfocusedMesh>
```

Static, unblurred mesh for any element (no JS): `style={{ backgroundImage: hqMeshBackground({ angle: 60 }) }}`.
The mask alone is exported too: `hqBlurMask({ angle: 90, start: 30, end: 55 })` returns `{ mask, WebkitMask }` for any layer.

## Props (all optional)

| Prop | Default | Meaning |
|------|---------|---------|
| `image` | — | Photo / render URL; replaces the mesh as source |
| `mesh` | navyDeep → coolGray @120°, vermillion band @60° | `{ from, to, angle, accent }` — colours are typed to the 9 brand tokens, angles to `0/30/60/90/120/150` |
| `blur` | `14` | px, blur radius of the revealed layer |
| `baseBlur` | `0` | px, uniform softening of everything (the original's "unmask blur", 1.1 on the node) |
| `mask` | `{ angle: 60, start: 42, end: 49, floor: 0.12 }` | progressive reveal; `false` = uniform blur |
| `saturation` | `1` | saturation multiplier on the blurred layer |
| `grain` / `grainBlend` | `0.06` / `"overlay"` | fine grain, clamped to 0–0.08 |
| `vignette` / `vignetteSpread` | `0.22` / `43` | navy-ink vignette |
| `drift` | `false` | `{ x, y, duration, delay?, loop? }` slow tween of the blurred texture; off under `prefers-reduced-motion`, paused off-screen |
| `className` / `style` / `children` | — | sizing and content slot |

Brand guard-rails baked in: only token colours can be passed (TypeScript union), only the six
allowed angles, corners always square, grain ≤ 8 %, no glow / blend-screen layers, vermillion
accent ≈ 3.3 % of pixels at every common viewport (analytically checked for 390×844 … 1920×1200).

## Bundle-size estimate

| Piece | Size |
|-------|------|
| `HqUnfocusedMesh.tsx` compiled | ≈ 4.5 kB min / ≈ 1.9 kB gzip (incl. the inline SVG grain tile) |
| `motion/react` (`motion`, `useInView`, `useReducedMotion`) | ≈ 32 kB gzip if not already in the bundle; **≈ 0 kB marginal** on this site, which already ships Motion for React |
| Runtime cost | 2 full-size layers (sharp + blurred) + 2 overlay divs; blur is rasterised once by the compositor. No canvas, no rAF loop unless `drift` is on |

If Motion were ever removed from the site, the component would still work with `motion/react-m` +
`LazyMotion` (≈ 5 kB) since it only uses `motion.div` with a tween.

## Verification done in this scratch folder

- `tsc --strict --noUnusedLocals --noUnusedParameters` passes against the site's own `web/node_modules`
  (TypeScript 5.9.3, React 19.2.8 + `@types/react` 19.2.18, motion 12.43.0) — no `any`, no Framer imports.
- SSR: `renderToStaticMarkup(<HqUnfocusedMesh />)` renders in Node without touching `window`; markup is in `preview/index.html`.
- Visual check in Chromium at 1440×900 and 390×844: reveal boundary at 60°, band crisp in the sharp zone and soft in the
  blurred zone, 6 % grain visible but fine, no colour outside the token set. `CSS.supports('mask', …)` is true in Chromium;
  `-webkit-mask` is emitted for Safari.
- Accent area share (analytic, default `at: 68, width: 2.5`): 3.40 % @1920×1200, 3.30 % @1440×800, 3.24 % @390×844.

Not verified here: the `drift` tween and the in-view / reduced-motion switches need a running Next.js dev server.

## Files in this folder

- `HqUnfocusedMesh.tsx` — the component (the deliverable)
- `SOURCE-NOTES.md` — what the Framer component was, node values, licence notes, kept/changed/dropped
- `preview/` — static preview used to eyeball the default output (not needed in the site)
- `_source_UnfocusedComponent.framer.tsx`, `_raw_readCodeFile.txt` — verbatim source pulled through the Framer MCP, for reference only
