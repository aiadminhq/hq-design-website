# HQ Design Motion-first Prototype

This isolated prototype is the first implementation slice for the HQ Design website direction:

- Next.js App Router
- Motion for React as the primary animation engine
- no GSAP in the first version
- Vercel-compatible static generation
- HQ Design project imagery copied from the existing `site/assets/img/work/` source tree for prototype-only use

## Routes

- `/` — scroll-driven project mosaic with Motion scale/translate/opacity
- `/projects` — project filter, search and layout animation
- `/projects/[slug]` — project hero, metadata, editorial section, gallery and return link

## Local usage

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Handoff boundary

This is a prototype in an isolated worktree. It must not overwrite the current `site/` static production artifact. Claude integration should first reconcile:

1. Next.js App Router route ownership versus the current static `site/` routes.
2. Figma content versus the current CMS/site content.
3. HQ Design token authority (`site/assets/css/hq.css` and the approved design-system source).
4. Image provenance labels for completed work, design visualisation and AI-enhanced imagery.
5. Vercel deployment configuration and preview read-back.

The copied images are only a bounded prototype sample. The final integration must read from the approved asset manifest and preserve source/provenance metadata.
