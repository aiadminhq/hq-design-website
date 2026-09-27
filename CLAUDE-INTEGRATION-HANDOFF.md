# HQ Design Motion-first Prototype — Claude Integration Handoff

## Source worktree

- Worktree: `/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website-motion`
- Branch: `codex/hq-motion-first`
- Prototype root: `prototype/next-motion-site`
- Integration target: Next.js App Router + Vercel direction

## What is implemented

- Next.js App Router with `/`, `/projects`, and `/projects/[slug]` routes.
- Motion for React as the only animation dependency; GSAP is intentionally absent.
- Global `MotionConfig` with user reduced-motion support.
- Central `hqMotion` timing/easing tokens.
- Homepage project mosaic with scroll-linked scale, translation and opacity.
- Project tile hover state and direct project links.
- Projects page with category filter, search and Motion layout transitions.
- Project detail page with full-screen hero, bilingual title, metadata, editorial section, gallery and related-project return link.
- AI × Design × Delivery introduction section as the first process narrative slice.
- Six prototype projects backed by a typed local data model.

## Validation evidence

- `npm run typecheck` passes.
- `npm run build` passes.
- Build produces 11 static routes, including six project detail pages.
- Browser verification on `http://127.0.0.1:3010/` confirmed:
  - homepage mosaic images render;
  - homepage links open `/projects/zhongbao-showroom`;
  - project detail hero and metadata render;
  - Projects filter changes visible results;
  - Search produces an empty state and returns the matching Polytron project when `All` is selected.

## Integration decisions for Claude

1. Treat this as an isolated prototype. Do not overwrite the current `site/` static artifact until route/content authority is resolved.
2. Reconcile the Figma company profile and existing `site/` content before expanding the project dataset.
3. Use `site/assets/css/hq.css`, the approved design system and asset provenance records as authority for final tokens and images.
4. Replace the six copied sample images with the approved asset manifest; preserve `data-provenance` for real photo, design visualisation and AI-enhanced imagery.
5. Restore `next/image` optimization only after the Vercel image configuration is confirmed. The prototype uses direct local `<img>` assets because the isolated dev server returned 400 for Next image optimization.
6. Keep Motion as the default animation owner. Add GSAP only for a separately owned scene that proves Motion cannot provide the required pin/scrub/Flip behavior.
7. Preserve the existing worktree boundary and do not push or publish without explicit deployment read-back.

## Suggested next integration slice

Integrate the typed project data adapter and `ProjectCard`/`ProjectDetail` route model into the selected Next.js application, then compare the first viewport against the approved HQ Design design system before adding more scroll choreography or WebGL.
