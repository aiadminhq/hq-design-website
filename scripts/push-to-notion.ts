#!/usr/bin/env tsx
/**
 * push-to-notion.ts — HQ Website CMS → Notion importer
 *
 * Reads cms/data/**\/*.json + cms/notion-manifest.json
 * Pushes content into the 14 Notion databases via @notionhq/client.
 *
 * Usage:
 *   tsx scripts/push-to-notion.ts --dry-run
 *   tsx scripts/push-to-notion.ts --db=globals
 *   tsx scripts/push-to-notion.ts --pass=1
 *   tsx scripts/push-to-notion.ts                  (full real run)
 *
 * Token: NOTION_TOKEN env var (load via .env)
 * Rate limit: 350ms between calls (~2.8 req/s, under Notion's 3 req/s cap)
 *
 * See docs/migration-plan/notion-token-setup.md for setup instructions.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";
import { Client, APIErrorCode, isFullPage } from "@notionhq/client";
import "dotenv/config";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

type DbKey =
  | "globals"
  | "certifications"
  | "projects"
  | "services"
  | "processSteps"
  | "positions"
  | "careerValues"
  | "careerPerks"
  | "clientLogos"
  | "aboutPage"
  | "teamMembers"
  | "timelineMilestones"
  | "homepage"
  | "gallerySections";

interface ManifestDb {
  title: string;
  databaseId: string;
  dataSourceId: string;
  url: string;
  kind: "singleton" | "multi";
  schemaFile: string;
}

interface Manifest {
  parentPage: { title: string; id: string; url: string };
  databases: Record<DbKey, ManifestDb>;
  relations: ManifestRelation[];
}

interface ManifestRelation {
  id: string;
  status: string;
  source: DbKey;
  target: DbKey;
  kind: "one-way" | "two-way";
  sourceProperty: string;
  backRefProperty?: string;
  purpose?: string;
}

interface NormalizedRow {
  /** Title property name (e.g. "Slug" / "Name" / "Code") */
  titleProp: string;
  /** Title value used for idempotent lookup */
  titleValue: string;
  /** Notion property payload (NO relations — those go in relationProps) */
  properties: Record<string, any>;
  /** Pass-2 relation payload: { propName: [slugOrTitle, ...] in target DB } */
  relationProps?: Record<string, { targetDb: DbKey; titleValues: string[] }>;
  /** Skipped fields (file fields, missing-in-DB fields) — for log */
  skipped?: Array<{ field: string; reason: string; value?: any }>;
}

interface MapperResult {
  /** Database key (matches manifest) */
  dbKey: DbKey;
  /** Title property name for this DB */
  titleProp: string;
  /** Rows to upsert */
  rows: NormalizedRow[];
}

interface RunSummary {
  mode: "dry-run" | "real";
  startedAt: string;
  finishedAt?: string;
  databases: Record<
    string,
    {
      rowsPlanned: number;
      rowsCreated: number;
      rowsUpdated: number;
      rowsFailed: number;
      skippedFields: number;
      notes: string[];
    }
  >;
  errors: Array<{ db: string; titleValue: string; error: string }>;
}

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "cms", "notion-manifest.json");
const DATA_DIR = path.join(ROOT, "cms", "data");
const LOGS_DIR = path.join(ROOT, "logs");
const RATE_LIMIT_MS = Number(process.env.NOTION_RATE_LIMIT_MS) || 350;

// ────────────────────────────────────────────────────────────
// CLI
// ────────────────────────────────────────────────────────────

interface CliArgs {
  dryRun: boolean;
  dbFilter?: DbKey;
  pass?: 1 | 2;
}

function parseArgs(): CliArgs {
  const args: CliArgs = { dryRun: false };
  for (const a of process.argv.slice(2)) {
    if (a === "--dry-run") args.dryRun = true;
    else if (a.startsWith("--db=")) args.dbFilter = a.slice(5) as DbKey;
    else if (a === "--pass=1") args.pass = 1;
    else if (a === "--pass=2") args.pass = 2;
  }
  return args;
}

// ────────────────────────────────────────────────────────────
// Throttled Notion client
// ────────────────────────────────────────────────────────────

class ThrottledNotion {
  private client: Client;
  private lastCallAt = 0;

  constructor(token: string) {
    this.client = new Client({ auth: token });
  }

  private async throttle() {
    const elapsed = Date.now() - this.lastCallAt;
    if (elapsed < RATE_LIMIT_MS) {
      await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed));
    }
    this.lastCallAt = Date.now();
  }

  private async withRetry<T>(fn: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      await this.throttle();
      return await fn();
    } catch (err: any) {
      const code = err?.code;
      const status = err?.status;
      const retryable =
        code === APIErrorCode.RateLimited ||
        status === 429 ||
        status === 502 ||
        status === 503 ||
        status === 504;
      if (retryable && attempt <= 5) {
        const wait = Math.min(60_000, 1000 * 2 ** attempt);
        console.warn(
          `[notion] ${code || status} — retry #${attempt} after ${wait}ms`,
        );
        await new Promise((r) => setTimeout(r, wait));
        return this.withRetry(fn, attempt + 1);
      }
      throw err;
    }
  }

  async queryByTitle(
    dataSourceId: string,
    titleProp: string,
    titleValue: string,
  ) {
    return this.withRetry(async () => {
      // Using databases.query (deprecated but supported); future: data_sources.query
      const resp = await (this.client.databases as any).query({
        database_id: dataSourceId,
        filter: { property: titleProp, title: { equals: titleValue } },
        page_size: 1,
      });
      return resp.results[0];
    });
  }

  async createPage(databaseId: string, properties: Record<string, any>) {
    return this.withRetry(() =>
      this.client.pages.create({
        parent: { database_id: databaseId },
        properties,
      }),
    );
  }

  async updatePage(pageId: string, properties: Record<string, any>) {
    return this.withRetry(() =>
      this.client.pages.update({ page_id: pageId, properties }),
    );
  }
}

// ────────────────────────────────────────────────────────────
// Property builders
// ────────────────────────────────────────────────────────────

const P = {
  title: (s: string) => ({
    title: [{ type: "text", text: { content: String(s || "") } }],
  }),
  text: (s: string | undefined | null) => {
    const content = String(s ?? "").slice(0, 2000); // Notion rich_text 2000 char limit per chunk
    return { rich_text: content ? [{ type: "text", text: { content } }] : [] };
  },
  number: (n: number | undefined | null) => ({
    number:
      n === undefined || n === null || Number.isNaN(Number(n))
        ? null
        : Number(n),
  }),
  select: (name: string | undefined | null) =>
    name ? { select: { name: String(name) } } : { select: null },
  multiSelect: (names: string[] | undefined) => ({
    multi_select: (names || [])
      .filter(Boolean)
      .map((name) => ({ name: String(name) })),
  }),
  checkbox: (b: boolean | undefined | null) => ({ checkbox: !!b }),
  url: (u: string | undefined | null) => ({ url: u || null }),
  email: (e: string | undefined | null) => ({ email: e || null }),
  date: (d: string | undefined | null) =>
    d ? { date: { start: d } } : { date: null },
  /** Used in pass-2 only; pageIds resolved from slug→pageId map */
  relation: (pageIds: string[]) => ({
    relation: pageIds.map((id) => ({ id })),
  }),
};

// ────────────────────────────────────────────────────────────
// File loader helpers
// ────────────────────────────────────────────────────────────

async function loadJson<T = any>(p: string): Promise<T> {
  return JSON.parse(await fs.readFile(p, "utf-8")) as T;
}

async function loadAllData() {
  const globals = await loadJson(path.join(DATA_DIR, "globals.json"));
  const homepage = await loadJson(path.join(DATA_DIR, "homepage.json"));
  const about = await loadJson(path.join(DATA_DIR, "about.json"));
  const services = await loadJson(path.join(DATA_DIR, "services.json"));
  const careers = await loadJson(path.join(DATA_DIR, "careers.json"));

  const projectsDir = path.join(DATA_DIR, "projects");
  const projectFiles = (await fs.readdir(projectsDir)).filter((f) =>
    f.endsWith(".json"),
  );
  const projects: any[] = [];
  for (const f of projectFiles) {
    projects.push(await loadJson(path.join(projectsDir, f)));
  }
  projects.sort((a, b) => String(a.slug).localeCompare(String(b.slug)));

  return { globals, homepage, about, services, careers, projects };
}

// ────────────────────────────────────────────────────────────
// MAPPERS — one per Notion DB
// Each returns { dbKey, titleProp, rows: NormalizedRow[] }
// ────────────────────────────────────────────────────────────

function mapGlobals(globals: any): MapperResult {
  const skipped: NormalizedRow["skipped"] = [];
  const dbMissing = [
    "yearsOfExperience",
    "designBuildPercent",
    "warrantyMonths",
    "fax",
    "officeHours",
    "responseSLA",
    "brandShortZh",
    "brandShortEn",
    "social",
    "logo",
  ];
  for (const k of dbMissing) {
    if (globals[k] !== undefined && globals[k] !== "" && globals[k] !== null) {
      skipped.push({
        field: k,
        reason: "no matching Notion property",
        value: globals[k],
      });
    }
  }

  const projectsNum = parseInt(
    String(globals.projectsDelivered || "").replace(/[^\d]/g, ""),
    10,
  );

  return {
    dbKey: "globals",
    titleProp: "Name",
    rows: [
      {
        titleProp: "Name",
        titleValue: globals.brandShortEn || globals.brandNameEn || "HQ Design",
        properties: {
          Name: P.title(
            globals.brandShortEn || globals.brandNameEn || "HQ Design",
          ),
          "Brand Name Zh": P.text(globals.brandNameZh),
          "Brand Name En": P.text(globals.brandNameEn),
          "Tagline Zh": P.text(globals.tagline),
          "Tagline En": P.text(globals.taglineEn),
          "Year Founded": P.number(globals.yearFounded),
          "Projects Delivered": P.number(
            Number.isFinite(projectsNum) ? projectsNum : null,
          ),
          Phone: P.text(globals.phone),
          Email: { email: globals.email || null },
          "Address Zh": P.text(globals.addressZh),
          "Address En": P.text(globals.addressEn),
          "Tax ID": P.text(globals.taxId),
          "Formspree Contact Endpoint": P.url(
            globals.formspree?.contactEndpoint,
          ),
          "Formspree Careers Endpoint": P.url(
            globals.formspree?.careersEndpoint,
          ),
          "Google Maps Embed": P.url(globals.googleMapsEmbed),
        },
        skipped,
      },
    ],
  };
}

function mapCertifications(globals: any, about: any): MapperResult {
  // Both globals.certifications and about.certifications exist; prefer about (longer list if different)
  const source: any[] = about.certifications || globals.certifications || [];
  return {
    dbKey: "certifications",
    titleProp: "Code",
    rows: source.map((c, i) => ({
      titleProp: "Code",
      titleValue: c.code,
      properties: {
        Code: P.title(c.code),
        "Label Zh": P.text(c.labelZh),
        "Label En": P.text(c.labelEn),
        "Description Zh": P.text(c.descriptionZh),
        "Description En": P.text(c.descriptionEn),
        "Sort Order": P.number(i + 1),
      },
      skipped: [{ field: "image", reason: "file field — skipped in v1" }],
    })),
  };
}

function mapProjects(projects: any[]): MapperResult {
  return {
    dbKey: "projects",
    titleProp: "Slug",
    rows: projects.map((p, i) => {
      const skipped: NormalizedRow["skipped"] = [];
      // File fields all skipped
      if (p.heroImage)
        skipped.push({ field: "heroImage", reason: "file field" });
      if (p.gallery?.length)
        skipped.push({
          field: "gallery",
          reason: "file field — gallery images skipped",
          value: `${p.gallery.length} items`,
        });
      // Specs / Highlights — flatten to JSON text for Specs JSON / Highlights JSON
      const specsJson = p.specs ? JSON.stringify(p.specs) : "";
      const props: Record<string, any> = {
        Slug: P.title(p.slug),
        "Name Zh": P.text(p.nameZh),
        "Name En": P.text(p.nameEn),
        Category: P.select(p.category),
        "Category Label": P.text(p.categoryLabel),
        Year: P.number(p.year),
        "Year Label": P.text(p.yearLabel),
        "Location Zh": P.text(p.locationZh),
        "Design Build Label": P.text(p.designBuildLabel),
        "Description Zh": P.text(p.descriptionZh),
        "Scope Zh": P.text(p.scopeZh),
        Client: P.text(p.client),
        Featured: P.checkbox(p.featured),
        "Has Gallery Sections": P.checkbox(!!p.gallerySections?.length),
        "Specs JSON": P.text(specsJson),
        "Sort Order": P.number(i + 1),
      };
      // gallerySections handled in Gallery Sections mapper (pass-2 relation back-fills)
      return {
        titleProp: "Slug",
        titleValue: p.slug,
        properties: props,
        skipped,
      };
    }),
  };
}

function mapServices(services: any): MapperResult {
  const items: any[] = services.services || [];
  return {
    dbKey: "services",
    titleProp: "Slug",
    rows: items.map((s, i) => ({
      titleProp: "Slug",
      titleValue: s.slug,
      properties: {
        Slug: P.title(s.slug),
        "Name Zh": P.text(s.titleZh),
        "Name En": P.text(s.titleEn),
        Icon: P.text(s.icon),
        // DB enum only has design/build/consulting — remap tech→build, aftercare→consulting
        "Category Group": P.select(remapServiceCategory(s.categoryGroup)),
        "Description Zh": P.text(s.descriptionZh),
        "Description En": P.text(s.descriptionEn),
        Featured: P.checkbox(s.featured),
        "Sort Order": P.number(s.order ?? i + 1),
      },
      skipped:
        s.categoryGroup &&
        !["design", "build", "consulting"].includes(s.categoryGroup)
          ? [
              {
                field: "categoryGroup",
                reason: `remapped: ${s.categoryGroup} → ${remapServiceCategory(s.categoryGroup)} (DB enum limitation)`,
              },
            ]
          : [],
    })),
  };
}

function remapServiceCategory(g: string): string {
  if (g === "tech") return "build";
  if (g === "aftercare") return "consulting";
  return g;
}

function mapProcessSteps(services: any): MapperResult {
  const items: any[] = services.process || [];
  return {
    dbKey: "processSteps",
    titleProp: "Slug",
    rows: items.map((p, i) => {
      const slug = `step-${p.number || (i + 1).toString().padStart(2, "0")}`;
      return {
        titleProp: "Slug",
        titleValue: slug,
        properties: {
          Slug: P.title(slug),
          "Step Number": P.number(parseInt(p.number || String(i + 1), 10)),
          "Title Zh": P.text(p.titleZh),
          "Title En": P.text(p.titleEn),
          "Description Zh": P.text(p.descriptionZh),
          "Description En": P.text(p.descriptionEn),
          Icon: P.text(p.icon),
        },
      };
    }),
  };
}

function mapPositions(careers: any): MapperResult {
  const items: any[] = careers.positions || [];
  // Department: data uses "Design 設計部" / "Project 專案部" / "Site 工務部" → map to enum (design/engineering/operations/business)
  const deptRemap: Record<string, string> = {
    "Design 設計部": "design",
    "Project 專案部": "operations",
    "Site 工務部": "engineering",
  };
  return {
    dbKey: "positions",
    titleProp: "Slug",
    rows: items.map((p) => ({
      titleProp: "Slug",
      titleValue: p.slug,
      properties: {
        Slug: P.title(p.slug),
        "Title Zh": P.text(p.titleZh),
        "Title En": P.text(p.titleEn),
        Department: P.select(deptRemap[p.department] || p.department),
        "Description Zh": P.text(p.summaryZh),
        "Description En": P.text(p.summaryEn),
        "Requirements Zh": P.text((p.skills || []).join("、")),
        "Is Open": P.checkbox(true),
        "Employment Type": P.select("full-time"),
        "Experience Level": P.select(
          p.slug.startsWith("senior-") ? "senior" : "mid",
        ),
        Location: P.text("Taipei"),
      },
      skipped: [
        {
          field: "skills (array)",
          reason: "flattened into Requirements Zh as joined string",
        },
      ],
    })),
  };
}

function mapCareerValues(careers: any): MapperResult {
  const items: any[] = careers.values || [];
  return {
    dbKey: "careerValues",
    titleProp: "Slug",
    rows: items.map((v, i) => ({
      titleProp: "Slug",
      titleValue: v.slug,
      properties: {
        Slug: P.title(v.slug),
        Icon: P.text(v.icon),
        "Title Zh": P.text(v.titleZh),
        "Title En": P.text(v.titleEn),
        "Description Zh": P.text(v.descZh),
        "Description En": P.text(v.descEn),
        "Sort Order": P.number(i + 1),
      },
    })),
  };
}

function mapCareerPerks(careers: any): MapperResult {
  const items: any[] = careers.perks || [];
  return {
    dbKey: "careerPerks",
    titleProp: "Slug",
    rows: items.map((p, i) => ({
      titleProp: "Slug",
      titleValue: p.slug,
      properties: {
        Slug: P.title(p.slug),
        Icon: P.text(p.icon),
        "Title Zh": P.text(p.titleZh),
        "Title En": P.text(p.titleEn),
        "Description Zh": P.text(p.descZh),
        "Description En": P.text(p.descEn),
        // Perks category not in source JSON → leave null (DB has enum but optional)
        "Sort Order": P.number(i + 1),
      },
    })),
  };
}

function mapClientLogos(homepage: any): MapperResult {
  const items: any[] = homepage.logosBar?.items || [];
  return {
    dbKey: "clientLogos",
    titleProp: "Slug",
    rows: items.map((logo, i) => {
      const slug = (logo.alt || logo.name || `logo-${i + 1}`)
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      return {
        titleProp: "Slug",
        titleValue: slug || `logo-${i + 1}`,
        properties: {
          Slug: P.title(slug || `logo-${i + 1}`),
          Name: P.text(logo.name),
          Alt: P.text(logo.alt),
          "Sort Order": P.number(i + 1),
        },
        skipped: [{ field: "image", reason: "file field — skipped in v1" }],
      };
    }),
  };
}

function mapAboutPage(about: any): MapperResult {
  const stats: any[] = about.stats || [];
  const cells: any[] = about.team?.cells || [];
  const story = about.story || {};

  const properties: Record<string, any> = {
    Name: P.title("About Page"),
    "Story Tagline Zh": P.text(story.tagline),
    "Story Tagline En": P.text(story.taglineEn),
    "Story Paragraph 1 Zh": P.text(story.paragraphsZh?.[0]),
    "Story Paragraph 2 Zh": P.text(story.paragraphsZh?.[1]),
    "Story Paragraph En": P.text(story.paragraphEn),
    "Story Image Caption": P.text(story.imageCaption),
    "Team Summary Zh": P.text(about.team?.summaryZh),
    "Team Summary En": P.text(about.team?.summaryEn),
  };

  for (let i = 0; i < 4; i++) {
    const s = stats[i] || {};
    properties[`Stat ${i + 1} Number`] = P.text(s.number);
    properties[`Stat ${i + 1} Label Zh`] = P.text(s.labelZh);
    properties[`Stat ${i + 1} Label En`] = P.text(s.labelEn);
  }

  for (let i = 0; i < 5; i++) {
    const c = cells[i] || {};
    // DB has Title/Body Zh; local JSON uses role + roleLabelZh/En + count → store role label + count summary
    properties[`Team Cell ${i + 1} Title Zh`] = P.text(c.roleLabelZh || c.role);
    const bodyParts: string[] = [];
    if (c.count) bodyParts.push(`${c.count} 人`);
    if (c.roleLabelEn) bodyParts.push(c.roleLabelEn);
    properties[`Team Cell ${i + 1} Body Zh`] = P.text(bodyParts.join(" · "));
  }

  return {
    dbKey: "aboutPage",
    titleProp: "Name",
    rows: [
      {
        titleProp: "Name",
        titleValue: "About Page",
        properties,
        skipped: [
          { field: "story.image", reason: "file field" },
          {
            field: "team.cells[].count→Body Zh",
            reason: "flattened count + roleLabelEn into Body Zh",
          },
          { field: "certifications", reason: "handled by Certifications DB" },
        ],
      },
    ],
  };
}

function mapTeamMembers(_about: any): MapperResult {
  // Local data has no individual team-member records (team.cells = aggregate counts).
  // DB is for future individual entries. Empty for v1.
  return {
    dbKey: "teamMembers",
    titleProp: "Slug",
    rows: [],
  };
}

function mapTimelineMilestones(_about: any): MapperResult {
  // Local data has no timeline milestones (about.json has no timeline field).
  // DB ready for future content. Empty for v1.
  return {
    dbKey: "timelineMilestones",
    titleProp: "Slug",
    rows: [],
  };
}

function mapHomepage(homepage: any): MapperResult {
  const hero = homepage.hero || {};
  const stats: any[] = hero.stats || [];
  const wedge = homepage.taiwanWedge || {};

  const properties: Record<string, any> = {
    Name: P.title("Homepage"),
    "Hero Kicker Zh": P.text(hero.kicker),
    "Hero Kicker En": P.text(hero.kickerEn),
    "Hero Headline Zh": P.text(hero.headlineZh),
    "Hero Headline En": P.text(hero.headlineEn),
    "Hero Sub Zh": P.text(hero.subZh),
    "Hero Sub En": P.text(hero.subEn),
    "Hero CTA1 Label Zh": P.text(hero.ctaPrimary?.labelZh),
    "Hero CTA1 Label En": P.text(hero.ctaPrimary?.label),
    "Hero CTA1 Href": P.url(toAbsoluteUrl(hero.ctaPrimary?.href)),
    "Hero CTA2 Label Zh": P.text(hero.ctaSecondary?.labelZh),
    "Hero CTA2 Label En": P.text(hero.ctaSecondary?.label),
    "Hero CTA2 Href": P.url(toAbsoluteUrl(hero.ctaSecondary?.href)),
    "Taiwan Wedge Tagline Zh": P.text(wedge.tagline),
    "Taiwan Wedge Headline Zh": P.text(wedge.headline),
    "Taiwan Wedge Body Zh": P.text((wedge.bullets || []).join("\n")),
  };

  for (let i = 0; i < 4; i++) {
    const s = stats[i] || {};
    properties[`Hero Stat ${i + 1} Number`] = P.text(s.number);
    properties[`Hero Stat ${i + 1} Label Zh`] = P.text(s.labelZh || s.labelEn);
  }

  return {
    dbKey: "homepage",
    titleProp: "Name",
    rows: [
      {
        titleProp: "Name",
        titleValue: "Homepage",
        properties,
        relationProps: {
          "Featured Projects": {
            targetDb: "projects",
            titleValues: homepage.featuredProjects || [],
          },
        },
        skipped: [
          {
            field: "hero.backgroundImage",
            reason: "file field — no DB property for hero bg",
          },
          { field: "logosBar", reason: "handled by Client Logos DB" },
          {
            field: "taiwanWedge.ctaLabel/ctaHref",
            reason: "no DB property (only Taiwan Wedge body Zh)",
          },
        ],
      },
    ],
  };
}

function toAbsoluteUrl(href: string | undefined): string | undefined {
  if (!href) return undefined;
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("/")) return `https://example.com${href}`;
  return `https://example.com/${href}`;
}

function mapGallerySections(projects: any[]): MapperResult {
  const rows: NormalizedRow[] = [];
  for (const proj of projects) {
    const sections: any[] = proj.gallerySections || [];
    sections.forEach((sec, idx) => {
      const slug = `${proj.slug}-section-${idx + 1}`;
      rows.push({
        titleProp: "Slug",
        titleValue: slug,
        properties: {
          Slug: P.title(slug),
          "Title Zh": P.text(sec.titleZh),
          "Title En": P.text(sec.titleEn),
          "Description Zh": P.text(sec.descriptionZh),
          "Sort Order": P.number(idx + 1),
        },
        relationProps: {
          Project: { targetDb: "projects", titleValues: [proj.slug] },
        },
        skipped: sec.items?.length
          ? [
              {
                field: "items[].image",
                reason: `${sec.items.length} file fields skipped in v1`,
              },
            ]
          : [],
      });
    });
  }
  return { dbKey: "gallerySections", titleProp: "Slug", rows };
}

// ────────────────────────────────────────────────────────────
// Upsert orchestrator
// ────────────────────────────────────────────────────────────

async function upsertRow(
  notion: ThrottledNotion,
  manifest: Manifest,
  dbKey: DbKey,
  row: NormalizedRow,
  pageIdCache: Map<string, string>,
  summary: RunSummary,
  dryRun: boolean,
): Promise<{
  pageId: string | null;
  action: "created" | "updated" | "dry-run" | "failed";
}> {
  const dbInfo = manifest.databases[dbKey];
  if (!dbInfo) {
    summary.errors.push({
      db: dbKey,
      titleValue: row.titleValue,
      error: "no manifest entry",
    });
    return { pageId: null, action: "failed" };
  }
  const cacheKey = `${dbKey}::${row.titleValue}`;
  if (dryRun) {
    pageIdCache.set(cacheKey, `dry-${dbKey}-${row.titleValue}`);
    return { pageId: pageIdCache.get(cacheKey)!, action: "dry-run" };
  }

  try {
    const existing = await notion.queryByTitle(
      dbInfo.dataSourceId,
      row.titleProp,
      row.titleValue,
    );
    if (existing && isFullPage(existing)) {
      await notion.updatePage(existing.id, row.properties);
      pageIdCache.set(cacheKey, existing.id);
      return { pageId: existing.id, action: "updated" };
    }
    const created = await notion.createPage(dbInfo.databaseId, row.properties);
    if (isFullPage(created)) {
      pageIdCache.set(cacheKey, created.id);
      return { pageId: created.id, action: "created" };
    }
    return { pageId: null, action: "failed" };
  } catch (err: any) {
    summary.errors.push({
      db: dbKey,
      titleValue: row.titleValue,
      error:
        `${err.code || err.status || "unknown"}: ${err.message || ""}`.slice(
          0,
          500,
        ),
    });
    return { pageId: null, action: "failed" };
  }
}

async function applyPass2Relations(
  notion: ThrottledNotion,
  manifest: Manifest,
  allMappers: MapperResult[],
  pageIdCache: Map<string, string>,
  summary: RunSummary,
  dryRun: boolean,
) {
  for (const mr of allMappers) {
    for (const row of mr.rows) {
      if (!row.relationProps) continue;
      const sourcePageId = pageIdCache.get(`${mr.dbKey}::${row.titleValue}`);
      if (!sourcePageId) continue;

      const relationPayload: Record<string, any> = {};
      for (const [propName, ref] of Object.entries(row.relationProps)) {
        const ids: string[] = [];
        for (const tv of ref.titleValues) {
          const id = pageIdCache.get(`${ref.targetDb}::${tv}`);
          if (id && !id.startsWith("dry-")) ids.push(id);
          else if (id?.startsWith("dry-")) ids.push(id); // keep marker for dry-run summary
        }
        if (ids.length > 0)
          relationPayload[propName] = P.relation(
            ids.filter((i) => !i.startsWith("dry-")),
          );
      }

      if (dryRun) {
        summary.databases[mr.dbKey].notes.push(
          `would set ${Object.keys(row.relationProps).join(", ")} on "${row.titleValue}"`,
        );
        continue;
      }

      if (Object.keys(relationPayload).length === 0) continue;

      try {
        await notion.updatePage(sourcePageId, relationPayload);
      } catch (err: any) {
        summary.errors.push({
          db: mr.dbKey,
          titleValue: row.titleValue,
          error: `pass-2 relation: ${err.message || err}`,
        });
      }
    }
  }
}

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  console.log(`[push-to-notion] ${args.dryRun ? "DRY-RUN" : "REAL"} mode`);
  if (args.dbFilter)
    console.log(`[push-to-notion] filter: --db=${args.dbFilter}`);
  if (args.pass) console.log(`[push-to-notion] pass: ${args.pass}`);

  const token = process.env.NOTION_TOKEN;
  if (!args.dryRun && !token) {
    console.error(
      "ERROR: NOTION_TOKEN env var required for real run. See docs/migration-plan/notion-token-setup.md",
    );
    process.exit(1);
  }

  const manifest = await loadJson<Manifest>(MANIFEST_PATH);
  console.log(
    `[push-to-notion] manifest loaded: ${Object.keys(manifest.databases).length} databases`,
  );

  const data = await loadAllData();
  console.log(
    `[push-to-notion] data loaded: ${data.projects.length} projects + 5 singleton/multi files`,
  );

  // Build all mapper results
  const allMappers: MapperResult[] = [
    mapGlobals(data.globals),
    mapCertifications(data.globals, data.about),
    mapProjects(data.projects),
    mapServices(data.services),
    mapProcessSteps(data.services),
    mapPositions(data.careers),
    mapCareerValues(data.careers),
    mapCareerPerks(data.careers),
    mapClientLogos(data.homepage),
    mapAboutPage(data.about),
    mapTeamMembers(data.about),
    mapTimelineMilestones(data.about),
    mapHomepage(data.homepage),
    mapGallerySections(data.projects),
  ];

  const filtered = args.dbFilter
    ? allMappers.filter((m) => m.dbKey === args.dbFilter)
    : allMappers;

  // Summary skeleton
  const summary: RunSummary = {
    mode: args.dryRun ? "dry-run" : "real",
    startedAt: new Date().toISOString(),
    databases: {},
    errors: [],
  };
  for (const m of filtered) {
    summary.databases[m.dbKey] = {
      rowsPlanned: m.rows.length,
      rowsCreated: 0,
      rowsUpdated: 0,
      rowsFailed: 0,
      skippedFields: m.rows.reduce(
        (sum, r) => sum + (r.skipped?.length || 0),
        0,
      ),
      notes: [],
    };
  }

  const notion = args.dryRun ? null : new ThrottledNotion(token!);
  const pageIdCache = new Map<string, string>();

  // PASS 1 — primitives
  if (!args.pass || args.pass === 1) {
    console.log("\n[push-to-notion] PASS 1 — primitives");
    for (const m of filtered) {
      console.log(`  → ${m.dbKey.padEnd(20)} ${m.rows.length} rows`);
      for (const row of m.rows) {
        const { action } = await upsertRow(
          notion!,
          manifest,
          m.dbKey,
          row,
          pageIdCache,
          summary,
          args.dryRun,
        );
        const s = summary.databases[m.dbKey];
        if (action === "created") s.rowsCreated++;
        else if (action === "updated") s.rowsUpdated++;
        else if (action === "failed") s.rowsFailed++;
      }
    }
  }

  // PASS 2 — relations
  if (!args.pass || args.pass === 2) {
    console.log("\n[push-to-notion] PASS 2 — relations");
    await applyPass2Relations(
      notion!,
      manifest,
      filtered,
      pageIdCache,
      summary,
      args.dryRun,
    );
  }

  summary.finishedAt = new Date().toISOString();

  // Print summary
  console.log("\n[push-to-notion] SUMMARY");
  console.log("─".repeat(72));
  for (const [db, s] of Object.entries(summary.databases)) {
    const status = args.dryRun
      ? `${s.rowsPlanned} planned`
      : `${s.rowsCreated} created / ${s.rowsUpdated} updated / ${s.rowsFailed} failed`;
    console.log(
      `  ${db.padEnd(20)} ${status}   (${s.skippedFields} skipped fields)`,
    );
  }
  if (summary.errors.length) {
    console.log("\n[push-to-notion] ERRORS:");
    for (const e of summary.errors) {
      console.log(`  ✗ ${e.db}/${e.titleValue}: ${e.error}`);
    }
  }

  // Write log JSON
  await fs.mkdir(LOGS_DIR, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const logFile = path.join(LOGS_DIR, `push-to-notion-${today}.json`);
  await fs.writeFile(logFile, JSON.stringify(summary, null, 2), "utf-8");
  console.log(
    `\n[push-to-notion] log written: ${path.relative(ROOT, logFile)}`,
  );

  if (summary.errors.length > 0 && !args.dryRun) process.exit(1);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
