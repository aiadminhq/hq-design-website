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

This is a prototype in an isolated worktree. It must not overwrite the current `site/` static production artifact.

## Integration status (Claude, this session)

Reconciled against `site/` and `cms/`, still inside this worktree only:

1. **Content authority** — `lib/projects.ts` now sources name/category/location/year/description/specs from `cms/data/projects/<slug>.json` (copied into `content/projects/`) for the four projects that have CMS entries (zhongbao-showroom, csun, polytron, soup-spoon-station). `airport-lounges` and `guochan-office` have no CMS entry yet — they still use editorial placeholder copy, explicitly flagged via `contentSource: "editorial-pending-cms"` and a visible on-page note. English display names/taglines are prototype-editorial everywhere (CMS has no `nameEn`) and are not yet approved copy.
2. **Asset provenance** — the six sample images are now real files copied from `site/assets/img/work/<slug>/` (not the old single placeholder pair). Every image carries one of the four policy provenance values (`photo`/`viz`/`enh`/`drawing`, read back from `site/work/index.html`) as `data-provenance`, plus a visible mono caption ("完工實景 · AS-BUILT" / "設計提案視覺 · DESIGN VISUALISATION" etc.) on cards, mosaic tiles and the detail hero/gallery.
3. **hq.css token authority** — `app/hq-tokens.css` is a synced copy of `site/assets/css/hq.css` (fonts, colors, spacing, the one `--ease` token), imported before `globals.css`; the prototype's own `--ink/--paper/--muted/--accent` names now alias to it instead of inventing independent values. `lib/motion.ts`'s easing now reads from that same `--ease` curve; duration/stagger bands stay prototype-owned since hq.css defines none.
4. **Figma vs. site** — no code change needed: `.workflow/.../product-manager/analysis.md` already scopes Figma to visual sign-off only, not content or token authority, so this integration used CMS + site/hq.css exclusively.
5. **Shared-element click transition** — implemented via a matching Motion `layoutId` (`project-photo-<slug>`) on the mosaic tile image, the projects-grid card image and the detail hero image; no AnimatePresence/intercepting-route scaffolding needed.
6. **Homepage scroll restoration** — fixed. Removed the global `html{scroll-behavior:smooth}`, which was fighting Next.js App Router's own back/forward scroll restoration (a documented Next.js issue); verified empirically (scrollY survives a round trip to a detail page and back). The `/#process` anchor link now smooth-scrolls via `scrollIntoView` from `SiteNavigation` instead of relying on the global CSS.
7. **Mobile viewport QA** — found and fixed a real bug: the mobile mosaic's `:nth-of-type` CSS selectors were counting the sibling `.mosaic-statement` div, so the hide/alternate-side rules landed on the wrong tiles and two tiles nearly fully overlapped. Tiles are now wrapped in their own `.mosaic-tiles` container so `:nth-child` counts correctly. Also fixed a provenance-label/tagline collision on the detail hero on narrow viewports by moving the label to the top-right corner.

**Not done / explicitly out of scope this pass:**

- Only 6 of the 21 CMS projects are wired up (the ones the prototype already featured); the other 15, and the `about`/`contact`/`process`/`services`/404 routes that exist in `site/` but not here, are untouched — a real route/content gap, not something papered over.
- `next/image` optimisation is still deferred (plain `<img>`, per the original handoff note) — no Vercel image config exists yet.
- **No `vercel.json` exists anywhere in this repo**, and root `package.json` is an unrelated Notion-CMS toolchain with no workspace linkage to this Next app. There has been no Vercel deployment or preview for this prototype — "Vercel preview/read-back" is still unconfigured, not merely unverified. Setting that up (choosing this directory as the Vercel project root, or wiring a monorepo build) needs an explicit decision before a preview can exist.
- `npm run typecheck` and `npm run build` both pass after these changes (11 static routes, same as before); browser-verified manually (desktop + mobile emulation) for homepage, project filtering, detail pages, shared-element navigation, and scroll restoration.

The six real images are still a bounded sample (only the six previously-featured projects), not the full 21-project approved asset manifest.
