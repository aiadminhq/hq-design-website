# HQ Design Website — CMS Schemas

> Source-of-truth schemas for the Notion → Framer CMS migration.
> Each `.json` is a JSON-Schema 2020-12 document that doubles as the Notion DB blueprint and the Framer Collection field reference.

## File map

| Schema          | Notion DB(s)                              | Framer Collection                              | Used by                                   |
| --------------- | ----------------------------------------- | ---------------------------------------------- | ----------------------------------------- |
| `globals.json`  | HQ — Globals (single-row)                 | Singleton or template style binding            | All pages (footer, contact, nav)          |
| `projects.json` | HQ — Projects                             | Multi-item collection                          | `projects.html` listing + 21 detail pages |
| `services.json` | HQ — Services + HQ — Process              | Multi-item collection (+ Process Singleton)    | `services.html` + homepage approach       |
| `careers.json`  | HQ — Positions, HQ — Why-Join, HQ — Perks | 3 collections                                  | `careers.html`                            |
| `homepage.json` | HQ — Homepage                             | Singleton (or split into Hero/Logos/Wedge DBs) | `index.html`                              |
| `about.json`    | HQ — About + HQ — Team Members            | Singleton + multi-item team                    | `about.html`                              |

## Mapping rules

1. **Bilingual content**: every visible string has `*Zh` / `*En` siblings. Framer plugin reads the Notion property `Title Zh` etc. and binds to the Chinese text style; English binds to `.en` text style.
2. **Slugs**: kebab-case, must match the existing static HTML filename so legacy redirects work.
3. **Images**: paths in seed data point at `assets/images/...` so import scripts can locate them; Notion imports will upload these to Framer assets.
4. **Variants**: `projects.gallery` vs `projects.gallerySections` is mutually exclusive. Single-tenant uses `gallery`; multi-tenant uses `gallerySections`.

## Notion property mapping (cheat sheet for Framer Notion plugin)

Framer's plugin requires Notion property types that map to its CMS field types. Use this exact mapping when creating the DBs:

| JSON field                                | Notion property type                | Framer field type                                                   |
| ----------------------------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| `slug`                                    | Text (Unique)                       | Slug                                                                |
| `nameZh / nameEn`                         | Title / Text                        | Plain Text                                                          |
| `descriptionZh / descriptionEn`           | Rich Text                           | Formatted Text                                                      |
| `category`                                | Select                              | Option                                                              |
| `year`                                    | Number                              | Number                                                              |
| `featured`                                | Checkbox                            | Boolean                                                             |
| `heroImage / thumbnail / gallery[].image` | Files & Media                       | Image                                                               |
| `specs` / `gallerySections`               | Rich Text (JSON) or Children blocks | Use a "Detail" rich-text and parse, OR break out into a relation DB |
| `relatedSlugs`                            | Relation (self)                     | Reference array                                                     |

## Implementation phases

Phase 1 (Notion authoring): create the DBs above, paste seed values from each schema's `registry` / `seed` field.

Phase 2 (Framer Notion plugin): in Framer, install the Notion plugin per DB, map fields, sync.

Phase 3 (Templates): bind Framer CMS Detail pages to `projects` and `services` collections.

Phase 4 (Unframer CI): use `npx unframer` to pull Framer code components and snapshot exported CMS data into git.
