# Template CMS Diff Report

> Locked-in template: **user-supplied Unframer template** (Framer MCP v1.8.0).
> Snapshot taken: 2026-05-25 via `getCMSCollections`.
> Outcome: `template-cms-changes.md` (this file) defines every collection / field that must be **created**, **modified**, or **removed** in the Framer template's CMS before importing local content.

## TL;DR

- Template ships with **2 collections** (`Work`, `Article`) and **0 globals/services/careers/homepage/about** support.
- Local schemas need **9 collections total** (1 modified + 8 new). All bilingual.
- Template uses Framer's **fixed-slot pattern** (Image 1…Image 9) — no native dynamic arrays. Local schemas must flatten `gallery` arrays into slots; multi-tenant `gallerySections` becomes a child collection with reference back to Work.

---

## 0. Template's current CMS (snapshot)

### Collection 1 — `Work` (id `ZRM2PWVwA`, 14 fields)

| Field ID    | Name        | Type          |
| ----------- | ----------- | ------------- |
| `YHsDzvkBN` | Category    | string        |
| `wfPmAnXMd` | Title       | string        |
| `aPs0LyMFs` | Inner Title | string        |
| `Z8v3oSKF6` | Site Link   | link          |
| `P3BOIXzYK` | Roll No     | string        |
| `yphiaikeG` | BG Image    | image         |
| `YHo9k2VRN` | Inner Image | image         |
| `OqqCWBVct` | Image 1     | image         |
| `qXUNIF8kG` | Image 2     | image         |
| `e44O8jjMd` | Date        | date          |
| `S4o7z4Psh` | Client      | string        |
| `tsWKM6lyk` | Duration    | string        |
| `XwulivaM5` | Location    | string        |
| `VGQRXHMFS` | Body Text   | formattedText |

### Collection 2 — `Article` (id `ERDJzzQHr`, 23 fields)

Title, Primary Body Text, Link, Category, Author, Read, Location, Date, Image 1–9, Heading 1–3, Body Text 1–3.

---

## 1. Architectural rules locked-in by the template

1. **Fixed slots, not arrays.** Framer CMS does not support `image[]` as a single field. The template encodes gallery via `Image 1…Image N`. We follow this pattern.
2. **No native bilingual.** Add `*En` siblings for every `*Zh` text field. Page templates bind language via Framer's Locale (or hide via condition).
3. **No native singleton.** "About / Homepage / Globals" become single-item collections; first item is the source-of-truth.
4. **Slug discipline.** Add an explicit `Slug` (string, unique) field on every collection and bind Framer's "CMS Item URL" to it — DO NOT rely on Title→auto-slug because we must preserve the existing 21 `kebab-case` filenames for SEO redirects.
5. **References for relations.** `relatedSlugs`, `featuredProjects`, `highlightedServices`, gallery sections — all use `multiCollectionReference` to existing CMS items (Framer stores IDs, not slug strings; our importer resolves slug → item-id at sync time).

---

## 2. Per-collection diff

### 2.1 `Globals` — **CREATE** (single-item)

Template has nothing here. Create singleton collection `Globals` with fields below. Local schema source: [globals.json](../../cms/schemas/globals.json).

| Local field                 | Framer type     | Notes                           |
| --------------------------- | --------------- | ------------------------------- |
| `slug` (set to `"globals"`) | string (unique) | Mandatory for our pattern       |
| `brandNameZh / brandNameEn` | string × 2      |                                 |
| `taglineZh / taglineEn`     | string × 2      |                                 |
| `phone`                     | string          |                                 |
| `email`                     | link            | `mailto:` prefix at render time |
| `addressZh / addressEn`     | string × 2      |                                 |
| `taxId`                     | string          | 統一編號 8 位數                 |
| `yearFounded`               | number          | 1995                            |
| `projectsDelivered`         | string          | "1,600+" (含千分位)             |
| `googleMapsEmbed`           | link            |                                 |
| `formspreeContactEndpoint`  | string          |                                 |
| `formspreeCareersEndpoint`  | string          |                                 |

Plus child collection **`Certification`** (multi-item, 6 rows from seed):

| Field                           | Type                                       |
| ------------------------------- | ------------------------------------------ |
| `slug`                          | string (unique)                            |
| `code`                          | string (LEED/GREEN/AIOT/ESG/ENERGY/HEALTH) |
| `labelZh / labelEn`             | string × 2                                 |
| `descriptionZh / descriptionEn` | formattedText × 2                          |
| `image`                         | image                                      |
| `sortOrder`                     | number                                     |

---

### 2.2 `Work` — **MODIFY** existing collection

This is the only collection we keep. Field-level decisions:

#### Rename (preserve data semantics)

| Template field | Rename to        | Reason                                          |
| -------------- | ---------------- | ----------------------------------------------- |
| `Title`        | `Name Zh`        | Establishes bilingual pattern                   |
| `Inner Title`  | `Subtitle Zh`    | Better describes usage (project subtitle)       |
| `BG Image`     | `Hero Image`     | Matches schema vocabulary                       |
| `Inner Image`  | `Thumbnail`      | Matches schema; used by listing card            |
| `Body Text`    | `Description Zh` | Matches schema                                  |
| `Roll No`      | `Sort Order`     | Convert string → number; controls listing order |

#### Add (new fields)

| Field                  | Type                            | Reason                                                        |
| ---------------------- | ------------------------------- | ------------------------------------------------------------- |
| `Slug`                 | string (unique)                 | Preserve 21 legacy filenames for SEO redirects                |
| `Name En`              | string                          | Bilingual                                                     |
| `Subtitle En`          | string                          | Bilingual                                                     |
| `Description En`       | formattedText                   | Bilingual                                                     |
| `Year`                 | number                          | Replace string `Date` with explicit completion year           |
| `Featured`             | boolean                         | Drives homepage carousel + listing pin                        |
| `Floor Area`           | string                          | e.g. "12,500 m²"                                              |
| `Style`                | string                          | e.g. "Contemporary Hospitality"                               |
| `Materials`            | string                          | Comma-separated material list                                 |
| `Image 3`              | image                           | Extend gallery slots (existing only 1+2)                      |
| `Image 4`              | image                           |                                                               |
| `Image 5`              | image                           |                                                               |
| `Image 6`              | image                           |                                                               |
| `Image 7`              | image                           |                                                               |
| `Image 8`              | image                           | 8 slots covers 90% of our 21 projects (max found = 8 images)  |
| `Related`              | multiCollectionReference (Work) | Replaces `relatedSlugs`; bind to "You may also like" carousel |
| `Has Gallery Sections` | boolean                         | Toggle to switch detail template (flat vs grouped)            |

#### Keep as-is

`Category` (string), `Site Link` (link, repurpose to external press URL), `Date` (date — keep as completion date alongside Year), `Client`, `Location`, `Duration`.

#### Change `Category` field type

- **Action**: convert `string` → **`enum`** with values `office | fb | hospitality | exhibition | retail`.
- **Rationale**: enables filter UI on `projects.html`; matches `projects.json` enum.
- **Implementation**: in Framer, delete `Category` and recreate as enum. (Unframer MCP `createCMSCollection` supports this; existing string values must be migrated to enum values via importer.)

#### Removed / not used

None. All template fields are repurposed.

#### Companion sub-collection — `GallerySection` (CREATE)

For multi-tenant projects (e.g. SECOM 南港複合大樓, 中保科技 — 3 sections each).

| Field                           | Type                         |
| ------------------------------- | ---------------------------- |
| `slug`                          | string (unique)              |
| `work`                          | collectionReference (→ Work) |
| `titleZh / titleEn`             | string × 2                   |
| `descriptionZh / descriptionEn` | formattedText × 2            |
| `sortOrder`                     | number                       |
| `Image 1` – `Image 6`           | image × 6                    |

**Activation rule**: Work item with `Has Gallery Sections = true` uses the grouped detail template; Framer plugin reads `GallerySection` items filtered by `work === currentItem.id`. Otherwise the flat-gallery template binds to Work's `Image 1…Image 8`.

---

### 2.3 `Service` — **CREATE**

Source: [services.json](../../cms/schemas/services.json). 10 seed items.

| Field                           | Type                                          |
| ------------------------------- | --------------------------------------------- |
| `slug`                          | string (unique)                               |
| `nameZh / nameEn`               | string × 2                                    |
| `categoryGroup`                 | enum (design/build/consulting/tech/aftercare) |
| `descriptionZh / descriptionEn` | formattedText × 2                             |
| `bulletsZh / bulletsEn`         | formattedText × 2 (markdown list)             |
| `icon`                          | image                                         |
| `heroImage`                     | image                                         |
| `featured`                      | boolean                                       |
| `sortOrder`                     | number                                        |
| `relatedProjects`               | multiCollectionReference (→ Work)             |

#### Companion collection — `ProcessStep` (CREATE, 5 seed items)

| Field                           | Type              |
| ------------------------------- | ----------------- |
| `slug`                          | string (unique)   |
| `stepNumber`                    | number (1–5)      |
| `titleZh / titleEn`             | string × 2        |
| `descriptionZh / descriptionEn` | formattedText × 2 |
| `icon`                          | image             |

---

### 2.4 Careers — **CREATE 3 collections**

#### `Position` (multi-item, 4 seed)

Source: [careers.json](../../cms/schemas/careers.json) `positions[]`.

| Field                                     | Type                                           |
| ----------------------------------------- | ---------------------------------------------- |
| `slug`                                    | string (unique)                                |
| `titleZh / titleEn`                       | string × 2                                     |
| `department`                              | enum (Design/Project/Site/Operations)          |
| `experienceLevel`                         | enum (junior/mid/senior/lead)                  |
| `employmentType`                          | enum (full-time/part-time/contract/internship) |
| `location`                                | string                                         |
| `descriptionZh / descriptionEn`           | formattedText × 2                              |
| `responsibilitiesZh / responsibilitiesEn` | formattedText × 2                              |
| `requirementsZh / requirementsEn`         | formattedText × 2                              |
| `niceToHaveZh / niceToHaveEn`             | formattedText × 2                              |
| `postedDate`                              | date                                           |
| `isOpen`                                  | boolean                                        |
| `formspreeEndpoint`                       | string (override globals if set)               |

#### `CareerValue` (multi-item, 6 seed)

| Field                           | Type              |
| ------------------------------- | ----------------- |
| `slug`                          | string (unique)   |
| `titleZh / titleEn`             | string × 2        |
| `descriptionZh / descriptionEn` | formattedText × 2 |
| `icon`                          | image             |
| `sortOrder`                     | number            |

#### `CareerPerk` (multi-item, 6 seed)

| Field                           | Type                                               |
| ------------------------------- | -------------------------------------------------- |
| `slug`                          | string (unique)                                    |
| `titleZh / titleEn`             | string × 2                                         |
| `descriptionZh / descriptionEn` | formattedText × 2                                  |
| `icon`                          | image                                              |
| `category`                      | enum (compensation/wellness/development/work-life) |
| `sortOrder`                     | number                                             |

---

### 2.5 `Homepage` — **CREATE** (single-item) + companion `ClientLogo`

Source: [homepage.json](../../cms/schemas/homepage.json).

#### `Homepage` singleton — 1 row, many text+image slots

Hero block:

| Field                                                                      | Type              |
| -------------------------------------------------------------------------- | ----------------- |
| `slug` (`"homepage"`)                                                      | string (unique)   |
| `heroKickerZh / heroKickerEn`                                              | string × 2        |
| `heroHeadlineZh / heroHeadlineEn`                                          | string × 2        |
| `heroSubZh / heroSubEn`                                                    | formattedText × 2 |
| `heroBackgroundImage`                                                      | image             |
| `heroCtaPrimaryLabelZh / heroCtaPrimaryLabelEn / heroCtaPrimaryHref`       | string × 3        |
| `heroCtaSecondaryLabelZh / heroCtaSecondaryLabelEn / heroCtaSecondaryHref` | string × 3        |

Hero stats (4 fixed slots):

| Field                                                   | Type       |
| ------------------------------------------------------- | ---------- |
| `heroStat1Number / heroStat1LabelZh / heroStat1LabelEn` | string × 3 |
| `heroStat2…heroStat4`                                   | string × 9 |

References:

| Field                 | Type                                        |
| --------------------- | ------------------------------------------- |
| `featuredProjects`    | multiCollectionReference (→ Work, max 6)    |
| `highlightedServices` | multiCollectionReference (→ Service, max 3) |

Taiwan Wedge block:

| Field                                                                | Type              |
| -------------------------------------------------------------------- | ----------------- |
| `taiwanWedgeTitleZh / taiwanWedgeTitleEn`                            | string × 2        |
| `taiwanWedgeDescZh / taiwanWedgeDescEn`                              | formattedText × 2 |
| `taiwanWedgeBullet1Zh…Bullet4En`                                     | string × 8        |
| `taiwanWedgeCtaLabelZh / taiwanWedgeCtaLabelEn / taiwanWedgeCtaHref` | string × 3        |

Approach (services) intro:

| Field                               | Type              |
| ----------------------------------- | ----------------- |
| `approachTitleZh / approachTitleEn` | string × 2        |
| `approachSubZh / approachSubEn`     | formattedText × 2 |

Testimonials (3 fixed slots):

| Field                                                                                                                                  | Type                       |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `testimonial1QuoteZh / testimonial1QuoteEn / testimonial1AuthorName / testimonial1AuthorRole / testimonial1Company / testimonial1Logo` | mixed (5 string + 1 image) |
| `testimonial2…testimonial3`                                                                                                            | × 2 repeats                |

#### `ClientLogo` (multi-item)

| Field       | Type            |
| ----------- | --------------- |
| `slug`      | string (unique) |
| `name`      | string          |
| `image`     | image           |
| `alt`       | string          |
| `sortOrder` | number          |

---

### 2.6 `AboutPage` — **CREATE** (single-item) + companion `TeamMember`, `TimelineMilestone`

Source: [about.json](../../cms/schemas/about.json).

#### `AboutPage` singleton

Stats (4 slots):

| Field                                       | Type            |
| ------------------------------------------- | --------------- |
| `slug` (`"about"`)                          | string (unique) |
| `stat1Number / stat1LabelZh / stat1LabelEn` | string × 3      |
| `stat2…stat4`                               | string × 9      |

Story:

| Field                                   | Type              |
| --------------------------------------- | ----------------- |
| `storyTagline`                          | string            |
| `storyParagraph1Zh / storyParagraph2Zh` | formattedText × 2 |
| `storyParagraphEn`                      | formattedText     |
| `storyImage`                            | image             |
| `storyImageCaption`                     | string            |

Team summary + 5 role cells:

| Field                                                                  | Type                    |
| ---------------------------------------------------------------------- | ----------------------- |
| `teamSummaryZh / teamSummaryEn`                                        | formattedText × 2       |
| `teamCell1Role / teamCell1LabelZh / teamCell1LabelEn / teamCell1Count` | string × 3 + number × 1 |
| `teamCell2…teamCell5`                                                  | × 4 repeats             |

#### `TeamMember` (multi-item, optional)

| Field           | Type              |
| --------------- | ----------------- |
| `slug`          | string (unique)   |
| `name`          | string            |
| `nameEn`        | string            |
| `role`          | string            |
| `bioZh / bioEn` | formattedText × 2 |
| `photo`         | image             |
| `linkedin`      | link              |
| `sortOrder`     | number            |

#### `TimelineMilestone` (multi-item, optional)

| Field               | Type              |
| ------------------- | ----------------- |
| `slug`              | string (unique)   |
| `year`              | number            |
| `titleZh / titleEn` | string × 2        |
| `descZh / descEn`   | formattedText × 2 |

---

## 3. Field-rename migration impact

When renaming template's existing `Work` fields, existing template content (sample CMS items the template ships with) will need migration:

- `Title` → `Name Zh`: existing values become Chinese (acceptable — sample data is throwaway, we replace with HQ projects)
- `Date` field type stays — but we ADD `Year` (number) alongside
- `Category` (string → enum): existing string values must be coerced to one of 5 enum values during importer

**Mitigation**: After collection schema updates, **delete all 1 existing template item from `Work`** before bulk-importing 21 HQ projects. The 5 articles in template's `Article` collection get archived (we keep `Article` collection as-is, may use later for blog).

---

## 4. Side-effect: `Article` collection

We don't repurpose `Article`. Two options:

- **Hide** by removing it from Framer's site navigation but keep schema for future blog
- **Delete** via `deleteCMSItem` on each item then `deleteNode` on collection

**Decision**: **Hide for now** (zero cost; preserves option to launch a blog later). Plan revisits this in Phase 5.

---

## 5. Execution checklist (for Phase 3.1 implementer)

1. [ ] Backup template state: run `getProjectXml` and save to `cms/snapshots/2026-05-25-template-baseline.xml`
2. [ ] `Work` collection — apply renames via Framer UI (Unframer MCP cannot rename fields; must use `createCMSCollection` for new collections only)
3. [ ] `Work` collection — add new fields (Slug, Name En, Subtitle En, …, Image 3–8, Related, Has Gallery Sections)
4. [ ] `Work` collection — convert `Category` to enum
5. [ ] Create `Globals`, `Certification`, `GallerySection`, `Service`, `ProcessStep`, `Position`, `CareerValue`, `CareerPerk`, `Homepage`, `ClientLogo`, `AboutPage`, `TeamMember`, `TimelineMilestone` — **13 new collections**
6. [ ] Run validator: every local `cms/data/*.json` must round-trip through `upsertCMSItem` after field-id resolution
7. [ ] Verify: `getCMSCollections` returns **15 total** collections (Work + Article + 13 new)

---

## 6. Open questions for the user

1. **Bilingual rendering strategy** — Framer's Locale system (separate variants) vs in-page binding by `*Zh` / `*En` fields? Recommendation: in-page binding (simpler; matches current static HTML).
2. **`Article` collection** — keep for future blog (recommended), or delete?
3. **Image upload pipeline** — template stores image URLs as strings. Local assets at `assets/images/projects/...` need uploading. Framer recommends `https://catbox.moe/user/api.php` (per MCP doc) but **Catbox is third-party**. Recommendation: upload to **Framer's own asset library** via the Framer plugin during initial bulk import; for CI snapshots, Unframer CLI handles asset references.
4. **SEO redirects** — preserve 21 legacy paths (e.g. `/projects/kimpton.html` → Framer's `/work/kimpton`). Recommendation: configure Framer's `Site Settings → Redirects` after Phase 4.

Mark these answered before Phase 3.1 dispatch.
