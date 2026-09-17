# Stage 1 Report — HQ Design bilingual split (`feat/zh-en-split` draft)

**Workdir:** `/workspace/hq-bilingual/`  
**Source:** Live site + GitHub `aiadminhq/hq-design-website` main (identical at clone time)  
**Date:** 2026-09-17 (Asia/Taipei)  
**Status:** Draft file tree ready to commit. **Not** merged. **Not** pushed (no gh auth assumed).

---

## Goal achieved

| Tree | `lang` | Path | Content |
|------|--------|------|---------|
| English | `en` | site root | All English UI/body; legal Chinese name kept as proper noun in footer/company blocks |
| Traditional Chinese | `zh-Hant` | `/zh/` | Full ZH UI and body |

Language toggle **EN | 中文** on every mirrored page, linking to the counterpart.  
`hreflang` (`en`, `zh-Hant`, `x-default`) in `<head>` on all mirrored pages.

---

## File list (new / rewritten Stage 1 pages)

### Root (EN)
- `index.html` — purified; two-door band; six live services strip; 31+ stats kept
- `services.html` — six EN service names (Design & Build, Permits & Compliance, Construction Management, Public-sector tenders, MEP, Reinstatement)
- `projects.html` — EN filter labels; EN-primary titles; ZH names as proper-noun subtitles; links to `/projects/*.html`
- `about.html` — EN-only body; team roles EN; legal name + 室裝 disclaimer; Tax ID 89956251
- `contact.html` — EN form labels/options
- `careers.html` — EN careers + form
- `local-partner-international-pm.html` — EN Local Partner (unchanged substance; new chrome + hreflang)

### `/zh/` (ZH)
- `zh/index.html` — full ZH; two-door; **30+ / 1,600+** stats; six services
- `zh/services.html`
- `zh/projects.html` — ZH filter labels; links to existing `../projects/*.html`
- `zh/about.html`
- `zh/contact.html`
- `zh/careers.html`
- `zh/local-partner-international-pm.html` — includes: under design lead, legal name, 統編 89956251, 室裝 not architect, 一個工作天 + info@ + lily@, AIONTECH/SECOM/C.SUN, three models, what to send

### Shared / meta
- `assets/css/style.css` — **appended** only: `.lang-toggle*`, EN logo subtitle, ≤375px nav tweaks
- `sitemap.xml` — root + `/zh/` mirrors + existing project case URLs (no `office-fit-out-taipei`)
- `robots.txt` — `Allow: /` + sitemap (unchanged policy)
- `projects/*.html` — **unchanged** (shared Stage 1 case pages)
- `assets/images/**`, `assets/js/main.js` — unchanged

### Build helpers (optional; do not deploy)
- `_build/chrome.py`, `nav.py`, `gen_*.py` — generators used to produce the draft

---

## Placeholders / Stage 1 deferrals

1. **Project case pages** (`projects/*.html`) remain **shared** bilingual chrome/captions — not split. Both EN and ZH project listings link to the same case URLs. Stage 2: EN-only / ZH-only case chrome or `/zh/projects/...` copies.
2. **LINE QR** — still “Coming Soon / 即將上線” on contact pages.
3. **Public-sector filter** — filter button present; no cards currently tagged `public` (same as live).
4. **Industrial & lab filter** — only showroom-type cards use `industrial` (same as live).
5. **`_archive/`** and orphan `projects/zhongbao-nangang.html` still contain old “HQ Interior & Space Design” branding — **not** linked from Stage 1 nav; clean up in a later pass.
6. **Careers** not in primary nav (matches live international pattern); present in footer on both trees.
7. **Map iframe** still uses Chinese address query string (geocoding); visible address copy is language-pure per tree.

---

## Brand & compliance checks

- Brand: **HQ Design / HQ Design Co., Ltd. / 惠強室內裝修股份有限公司 / Tax ID 89956251**
- Never “HQ Interior & Space Design” on Stage 1 pages
- No architect licence claim; Local Partner states 室內裝修業 / not architect
- No invented permit lead times; LP says no durations / 不公布工期
- Stats: EN homepage keeps **31+**; ZH prefers **30+ / 1,600+**
- No link to `office-fit-out-taipei.html`

---

## Phone 375px notes

Observed / mitigated in appended CSS:

| Issue | Mitigation |
|-------|------------|
| Lang toggle crowding hamburger | Toggle `order: 3`, hamburger `order: 4`; CTA hidden ≤900px (existing pattern) |
| Logo + dual name wrapping | At ≤375px hide `.nav-logo--int .name-zh` subtitle; shrink logo to 32px |
| Filter bar horizontal overflow | Existing filter-bar scroll behavior in `style.css` — verify on device; ZH labels slightly longer (“零售與餐飲”) |
| Door grid | Already stacks to 1 col ≤900px |
| About team 5-col grid | May squeeze at 375px — Stage 2: stack or 2-col; not changed in Stage 1 CSS beyond lang toggle |
| Hero stats 4-up | Gap reduced at ≤768px in page inline CSS; at 375px may still wrap — acceptable Stage 1 |

**Manual QA checklist @ 375×812:** nav toggle works both directions; `/zh/` asset paths (`../assets/...`) load; project case links from `/zh/projects.html` resolve to `/projects/*.html`.

---

## Suggested commit

```bash
cd /workspace/hq-bilingual   # or copy tree onto repo checkout
git checkout -b feat/zh-en-split
git add index.html services.html projects.html about.html contact.html careers.html \
  local-partner-international-pm.html zh/ sitemap.xml robots.txt assets/css/style.css STAGE1-REPORT.md
# optionally omit _build/ and _archive/
git commit -m "feat: Stage 1 EN root + /zh/ Traditional Chinese bilingual split"
```

Do **not** merge to main until QA + stakeholder review.

---

## Success summary

Complete bilingual draft under `/workspace/hq-bilingual/`: 7 EN root pages purified, 7 `/zh/` mirrors, lang toggle + hreflang, sitemap updated, CSS append-only, shared project cases linked from both listings, Local Partner ZH complete per brief.
