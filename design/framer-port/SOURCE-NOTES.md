# SOURCE-NOTES — Framer node `RhV2IHfHj` ("Personal-Website-now")

## How the source was obtained

The Framer desktop app had the project open (published URL `christianwu.framer.ai`), so the
Framer MCP could be used directly:

1. `getNodeXml("RhV2IHfHj")` → the node is a **component instance** of code file `j68B5di`
   (`Workshop/UnfocusedComponent.tsx`, default export named `UnfocusedEnhanced`,
   insert URL `https://framer.com/m/UnfocusedComponent-jgbm.js@…`).
2. `readCodeFile("j68B5di")` → 1 641 lines of TSX (71 kB). A verbatim copy is kept next to this
   file as `_source_UnfocusedComponent.framer.tsx` (raw MCP JSON in `_raw_readCodeFile.txt`).

The unframer endpoint was not needed.

## What the component is

**A pure CSS/DOM "unfocused" (progressive blur) image treatment. Not WebGL, not GLSL, not a
gradient-mesh generator, no canvas rendering loop.**

Layer stack (bottom → top), all `position:absolute; inset:0`:

| # | Layer | Implementation |
|---|-------|----------------|
| 1 | Background image | `div` with `background-image: url(image)`, `cover` |
| 2 | "Unmask blur" | `<img>` copy, `filter: blur(unmaskBlur)`, oversized by 2×blur on each side to hide edge fade |
| 3 | Masked blur (main effect) | `motion.div` with CSS `mask` / `-webkit-mask` gradient (linear / radial / conic / "scroll"); inside, an `<img>` copy with `filter: blur()` ("gaussian") **or** `filter: url(#svgFilter)` for the other 7 "blur types" |
| 3a | Displacement | extra blurred copy, `translate/scale`, `mix-blend-mode: screen`, `brightness(1.2)`, opacity 0.3 |
| 3b | Distortion | copy with `hue-rotate()` + `saturate(1.5)`, `mix-blend-mode: color`, opacity 0.4 |
| 3c | Dispersion | six copies tinted red / lime / blue / cyan / magenta / yellow, shifted & skewed, `mix-blend-mode: screen` (fake chromatic aberration) |
| 4 | Grain | 1024×1024 2D `<canvas>`, random grey per pixel, alpha = `grainOpacity` (0–255), `image-rendering: pixelated`, `mix-blend-mode` |
| 5 | Vignette | `radial-gradient(ellipse, transparent … , rgba(0,0,0,v))` |
| 6 | Mask preview / interactive slider panel | Framer-canvas dev UI (`backdrop-filter: blur(10px)`, 12 px radius, coloured range sliders) |

Notes on the "blur types": `motion`, `zoom`, `radial`, `directional`, `cubic`, `quadratic`,
`square` are all a single `<feGaussianBlur>` whose `stdDeviation` is the blur value times a
constant (0.3–0.5) plus an `feFuncA slope` alpha boost and sometimes `feColorMatrix saturate`.
They are cosmetic scalars on a Gaussian blur, not different algorithms. CSS `blur(Npx)` is exactly
`stdDeviation = N`.

Animation: optional Motion tween (`framer-motion`) of the masked layer's `x/y` to
`displacementX/Y`, ease `[0.44, 0, 0.56, 1]`, `repeat: Infinity`, `repeatType: "reverse"`.
Optional mouse-proximity radial mask that clears the blur around the cursor.

### Props / property controls (all optional)

`image`, `blur` 0–500, `unmaskBlur`, `blurType` (8 enum), `blurDirection`, `blurIntensity`,
`blurMaskType` (none | linear | radial | conic | scroll), `blurMaskFillType` (gradient | solid |
image), `blurMaskFillColor`, `blurMaskFillGradientStart/End`, `blurMaskFillImage`,
`maskAngle`, `maskStartPosition`, `maskEndPosition`, `maskContrast`, `maskStartColor`,
`maskEndColor`, `originX/Y`, `saturation`, `hue`, `vignette`, `vignetteSpread`, `grainOpacity`,
`grainSize`, `grainDensity`, `grainBlendMode`, `grainUseBlurMask`, `backgroundOpacity`,
`borderRadius`, `displacement`, `displacementX/Y`, `displacementScale`, `distortion`,
`dispersion`, `animationEnabled`, `animationDuration`, `animationDelay`, `loop`,
`mouseProximityEnabled`, `mouseProximityRadius`, `showInteractiveControls`,
`interactiveControlsPosition`, `showMaskPreview`, `width`, `height`.

### Values set on node `RhV2IHfHj` (what the user actually sees)

```
width 100% · height 1200px · borderRadius 0
image           = component default (a PNG on framerusercontent.com — Framer project asset)
blur            = 39.7   blurType = "square"   blurIntensity = 0.7
                  → SVG stdDeviation = 39.7 × 0.7 × 0.5 ≈ 13.9 px  (≈ CSS blur(14px))
unmaskBlur      = 1.1
blurMaskType    = "scroll"  fill = gradient  start rgba(255,255,255,.12) → end #fff
maskAngle 70 · maskStart 41 · maskEnd 50 · maskContrast 1.5
                  → effective mask: linear-gradient(70deg, #fff 42.5%, rgba(255,255,255,.12) 48.5%)
                    i.e. lower-left ≈42 % fully blurred, 6 % transition, upper-right 88 % sharp
saturation 1.1 · hue 0 · vignette 0.22 · vignetteSpread 43
grainOpacity 55 (/255 ≈ 21.6 %) · grainSize 1 · grainDensity 100 · blend overlay
displacement 3 · displacementX −11 · displacementY 50 · displacementScale 2
distortion 7 (→ hue-rotate ≈ 0.9°, negligible) · dispersion 0
animationEnabled false · mouseProximity false · interactive controls hidden
```

## Dependencies of the original

`react`, `framer-motion` (`motion`), `framer` (`addPropertyControls`, `ControlType`). No other
third-party code. The default `image` and `blurMaskFillImage` URLs point at
`framerusercontent.com` assets belonging to the Framer project; they are **not** carried over.

## Authorship / licence

No licence header, author tag or marketplace attribution is present in the file. It lives in the
project's own `Workshop/` folder and contains Chinese comments such as "參考原始 Framer 實作"
("referring to the original Framer implementation"), which suggests it is a first-party rewrite
inspired by Framer's built-in / marketplace "Unfocused" style components. Treat it as
project-owned code; no third-party licence obligations were found, but no explicit licence is
declared either.

## What the port keeps, changes and drops

Kept (mechanic is identical): sharp source → blurred copy (edge-bled by 2×blur) revealed through a
CSS `mask` gradient → fine grain (`mix-blend-mode`) → vignette → optional Motion tween.

Changed to satisfy the HQ brand rules:

| Original | Port |
|----------|------|
| Photo source (Framer asset) | Default source is an **HQ Mesh**: `#131B25 → #C0C8D2` at 120°, one hard-edged vermillion `#D64518` band at 60° covering ≈3.3 % of the pixels (`image` prop still accepts a photo / render) |
| mask angle 70° | snapped to **60°** (`HqAngle = 0 | 30 | 60 | 90 | 120 | 150`, enforced by the type) |
| 8 "blur types" via SVG filters | single `blur` px prop, CSS `filter: blur()`; default 14 px = the instance's effective stdDeviation |
| grain 21.6 %, 1024² random canvas | grain **6 %** (clamped 0–8 %), deterministic SVG `feTurbulence` tile as a repeating `background-image` — SSR-safe, no canvas, no JS work per frame |
| vignette in black | vignette in navy ink `#0A1118` |
| `borderRadius` prop (12 px default) | always 0 |
| `saturation 1.1`, `hue` | `saturation` kept (default 1 so tokens stay exact); `hue` removed |
| Displacement layer (`screen` + `brightness 1.2` = blur-glow) | removed |
| Distortion (hue-rotate) and Dispersion (6 rainbow-tinted copies) | removed (rainbow / off-token colours) |
| Interactive slider panel (`backdrop-filter`, 12 px radius) and mask preview | removed (Framer-canvas dev UI, glassmorphism) |
| Mouse-proximity mask | removed (not used by the node; can be re-added as a CSS radial mask on `pointermove` if wanted) |
| Mask travels with the animated layer | mask is fixed, only the blurred texture drifts |
| No reduced-motion / visibility handling | `useReducedMotion()` → static frame; `useInView()` → tween stops off-screen |
| `framer` + `framer-motion` imports | `motion/react` only |
