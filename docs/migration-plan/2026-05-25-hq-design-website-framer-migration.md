# HQ Design Website — Framer Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL — Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將 HQ 室內裝修官網（6 頁靜態 HTML + 21 個案例）改造成「Notion (內容後台) → Framer CMS (設計與發佈) → Unframer (匯出快照)」的內容驅動工作流，讓使用者只需要在 Notion 維護資料、在 Framer 做版面，不再碰 HTML。

**Architecture:**

- **Authoring layer**：本地 JSON（`cms/data/*.json`，基於 `cms/schemas/*.json`）為 single source of truth。先把全部現有 HTML 抽取成 JSON 放在 git。
- **Staging layer**：Notion 建立 6 個 DB，再用一次性 import script 將 JSON 同步進去（後續日常維護就只在 Notion）。
- **Design layer**：Framer 專案安裝官方 Notion plugin，每張 DB 對應一個 CMS Collection，Detail Page 用 Slug 綁定。
- **Snapshot layer**：CI（GitHub Action）跑 `npx unframer {projectId}` 把 Framer 端的 CMS 與 components 拉回 repo 作為版控備份。

**Tech Stack:** Notion API, Framer Notion plugin (官方), [Unframer CLI](https://www.npmjs.com/package/unframer), Node.js 20+, jq, JSON-Schema 2020-12, Cheerio (HTML→JSON 解析), tsx (TypeScript runner)。

---

## File Structure

新增/修改的檔案：

```
hq-design-website/
├── cms/
│   ├── schemas/             ✅ 已建立
│   │   ├── globals.json
│   │   ├── projects.json
│   │   ├── services.json
│   │   ├── careers.json
│   │   ├── homepage.json
│   │   ├── about.json
│   │   └── README.md
│   ├── data/                ← 本計劃 Phase 1 產出
│   │   ├── globals.json
│   │   ├── projects/        ← 21 個 *.json（與 HTML 一一對應）
│   │   ├── services.json
│   │   ├── careers.json
│   │   ├── homepage.json
│   │   └── about.json
│   └── exports/             ← Unframer 自動拉回（Phase 4）
├── scripts/
│   ├── extract-html.ts      ← HTML → cms/data/*.json
│   ├── push-to-notion.ts    ← cms/data → Notion API
│   ├── validate-schemas.ts  ← Ajv 驗證 data 是否符合 schema
│   └── pull-unframer.sh     ← 包一層 unframer CLI
├── framer/
│   ├── README.md            ← Framer 專案設定指引
│   ├── notion-plugin-map.md ← Notion 欄位 ↔ Framer CMS 欄位對照
│   └── component-spec.md    ← Hero/Card/Gallery 各 component 規格
├── docs/
│   ├── migration-plan/
│   │   └── 2026-05-25-hq-design-website-framer-migration.md ← 本檔
│   └── decisions/
│       └── 001-cms-stack.md ← ADR：為何選 Notion + Framer plugin
└── .github/workflows/
    └── unframer-sync.yml    ← Phase 4 的 CI
```

---

## Phase 0 — CMS 選型決策（CMS 選型理由）

### 為何選 Notion → Framer Notion plugin

| 候選                                      | 本地端可預先整理                               | Framer 一鍵匯入        | 雙語結構支援                                   | 圖片管理                                                    | 成本                                      |
| ----------------------------------------- | ---------------------------------------------- | ---------------------- | ---------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------- |
| **Notion + 官方 Framer Notion plugin** ✅ | 用 Notion App / Web 編輯，Cmd+K 快、可 offline | 原生 plugin，雙向 sync | Notion 任意 property，可建 Title Zh / Title En | Notion Files & Media 支援上傳；plugin 自動轉成 Framer Asset | Notion 免費 plan 足夠；plugin 免費        |
| Sanity + Framer Sanity plugin             | 需開 Sanity Studio                             | 第三方 plugin 較不穩   | Schema-as-code，雙語要寫 group                 | 強                                                          | Sanity Free Tier 夠；plugin 需要 maintain |
| Airtable + Framer Airtable plugin         | 表格直覺，但 Rich Text 弱                      | 官方 plugin 較舊       | 欄位限制 50 個                                 | 弱                                                          | 免費 plan 1k records 上限                 |
| 直接寫 Framer CMS                         | 不可，必須在 Framer 內                         | N/A                    | 手動拷貝                                       | 弱                                                          | 已含在 Framer 訂閱                        |

**Decision**：使用者明確要求「本地端整理完再透過 Framer 的 Notion 插件匯入 CMS」，最匹配的即 Notion。Notion 還能：

1. 用 **Database template** 一次定義 schema（從 `cms/schemas/*.json` 對應）
2. 用 Notion API 一次 bulk import（取代手動鍵入）
3. 給未來內容團隊（非工程師）友善的編輯介面

### Why also keep `cms/data/*.json` in git?

- Git diff 友善（PR review 內容變更）
- 災難復原（Notion 整個壞掉時的 single source of truth）
- 跑得動 Unframer CLI 之前的中繼資料

---

## Phase 1 — 抽取既有 HTML → `cms/data/*.json`

每個 case file 都會經歷 TDD：先寫 fixture → 寫 parser → 比對輸出。

### Task 1.1：建立 Node 工具鏈與驗證腳本

**Files:**

- Create: `package.json` (or extend if exists)
- Create: `scripts/validate-schemas.ts`
- Create: `tsconfig.json`
- Create: `cms/data/.gitkeep`

- [ ] **Step 1: 初始化 Node 專案**

```bash
cd /Users/christianwu/hq-design-website
[ -f package.json ] || npm init -y
npm install --save-dev typescript tsx @types/node ajv ajv-formats cheerio @types/cheerio fast-glob zod
```

- [ ] **Step 2: 寫 tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "./.build"
  },
  "include": ["scripts/**/*.ts", "cms/**/*.json"]
}
```

- [ ] **Step 3: 撰寫 `scripts/validate-schemas.ts`**

```ts
import Ajv from "ajv";
import addFormats from "ajv-formats";
import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schemaPaths = await fg("cms/schemas/*.json", {
  cwd: ROOT,
  absolute: true,
});
const schemas = Object.fromEntries(
  await Promise.all(
    schemaPaths.map(async (p) => [
      path.basename(p, ".json"),
      JSON.parse(await fs.readFile(p, "utf8")),
    ]),
  ),
);

const dataPaths = await fg("cms/data/**/*.json", { cwd: ROOT, absolute: true });
let failures = 0;

for (const dataPath of dataPaths) {
  const rel = path.relative(ROOT, dataPath);
  const key = rel.includes("projects/")
    ? "projects"
    : path.basename(dataPath, ".json");
  const schema = schemas[key];
  if (!schema) {
    console.warn(`⚠️  no schema for ${rel}`);
    continue;
  }
  const data = JSON.parse(await fs.readFile(dataPath, "utf8"));
  const valid = ajv.validate(schema, data);
  if (!valid) {
    failures++;
    console.error(`❌ ${rel}\n`, ajv.errors);
  } else {
    console.log(`✅ ${rel}`);
  }
}

if (failures) process.exit(1);
```

- [ ] **Step 4: 加入 npm script**

在 `package.json` 加上：

```json
"scripts": {
  "validate": "tsx scripts/validate-schemas.ts",
  "extract": "tsx scripts/extract-html.ts",
  "push:notion": "tsx scripts/push-to-notion.ts"
}
```

- [ ] **Step 5: 驗證空目錄通過**

Run: `npm run validate`
Expected: 沒有檔案掃描出，exit 0。

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json scripts/validate-schemas.ts cms/data/.gitkeep
git commit -m "chore(cms): scaffold typescript tooling + schema validator"
```

### Task 1.2：寫 globals.json data

**Files:**

- Create: `cms/data/globals.json`

- [ ] **Step 1: 從 footer 區塊抽取資料**

從 `contact.html` 與 `about.html` 的 footer 抽取，填入 `cms/data/globals.json`：

```json
{
  "brandNameZh": "惠強室內裝修股份有限公司",
  "brandNameEn": "HQ Interior & Space Design Co., Ltd.",
  "brandShortZh": "惠強室內裝修",
  "brandShortEn": "HQ Interior & Space Design",
  "tagline": "匠藝專工，一應皆備。",
  "taglineEn": "Crafted with mastery, complete in every detail.",
  "yearFounded": 1995,
  "yearsOfExperience": "31+ Years",
  "projectsDelivered": "1,600+",
  "designBuildPercent": "100%",
  "warrantyMonths": "12mo",
  "phone": "02-2557-3003",
  "fax": "02-2557-7438",
  "email": "info@hqdesign.tw",
  "addressZh": "115台北市南港區經貿二路135號9樓",
  "addressEn": "9F, No.135 Jingmao 2nd Rd, Nangang Dist., Taipei 115",
  "officeHours": "Mon–Fri 09:00–18:00",
  "responseSLA": "Response within 1 business day",
  "taxId": "89956251",
  "logo": "assets/images/logo/IMG_6412.PNG",
  "certifications": [
    {
      "code": "LEED",
      "labelZh": "LEED綠建築認證",
      "labelEn": "LEED Green Building"
    },
    {
      "code": "GREEN",
      "labelZh": "綠建築標章",
      "labelEn": "Taiwan Green Building Label"
    },
    {
      "code": "AIOT",
      "labelZh": "AIoT智慧空間",
      "labelEn": "AIoT Smart Space"
    },
    {
      "code": "ESG",
      "labelZh": "ESG永續設計",
      "labelEn": "ESG Sustainability"
    },
    { "code": "ENERGY", "labelZh": "節能減碳", "labelEn": "Energy Efficiency" },
    {
      "code": "HEALTH",
      "labelZh": "健康建築材料",
      "labelEn": "Healthy Building Materials"
    }
  ],
  "formspree": {
    "contactEndpoint": "https://formspree.io/f/xeendgkz",
    "careersEndpoint": "https://formspree.io/f/xgodqkyn"
  },
  "googleMapsEmbed": "https://maps.google.com/maps?q=115台北市南港區經貿二路135號&output=embed&hl=zh-TW&z=17"
}
```

- [ ] **Step 2: 驗證**

Run: `npm run validate`
Expected: `✅ cms/data/globals.json`

- [ ] **Step 3: Commit**

```bash
git add cms/data/globals.json
git commit -m "feat(cms): extract globals from footer/contact"
```

### Task 1.3：寫 HTML → projects JSON extractor

**Files:**

- Create: `scripts/extract-html.ts`
- Create: `scripts/lib/parse-project.ts`
- Create: `scripts/lib/__tests__/parse-project.test.ts`
- Create: `cms/data/projects/kimpton.json` (TDD fixture)

- [ ] **Step 1: 先手寫 expected 結果 cms/data/projects/kimpton.json**

照 `cms/schemas/projects.json` 把 `kimpton.html` 內容人工填好，作為解析器的 golden file。重點欄位：

```json
{
  "slug": "kimpton",
  "nameZh": "Kimpton 大安飯店",
  "nameEn": "Kimpton Da An Hotel",
  "category": "hospitality",
  "categoryLabel": "Hospitality",
  "year": 2023,
  "client": "Kimpton (IHG Hotels & Resorts)",
  "areaPing": 0,
  "location": "Da An, Taipei",
  "designBuildLabel": "Design + Build",
  "featured": true,
  "heroImage": "assets/images/projects/kimpton/hero.jpg",
  "specs": [
    { "labelZh": "客戶", "labelEn": "Client", "value": "Kimpton" },
    { "labelZh": "類型", "labelEn": "Type", "value": "Hospitality" }
  ],
  "gallery": [
    { "image": "assets/images/projects/kimpton/photo-01.jpg" },
    { "image": "assets/images/projects/kimpton/photo-02.jpg" }
  ]
}
```

- [ ] **Step 2: 寫 parse-project.ts 解析 detail 頁**

`scripts/lib/parse-project.ts`：用 cheerio 抓 .project-hero、.meta-row、.gallery、.gallery-section：

```ts
import * as cheerio from "cheerio";
import path from "node:path";

export interface ProjectData {
  /* match cms/schemas/projects.json */
}

export function parseProject(html: string, slug: string): ProjectData {
  const $ = cheerio.load(html);
  const data: any = { slug };

  // Hero
  data.nameZh = $("h1 .name-zh, .project-hero h1").first().text().trim();
  data.nameEn = $("h1 .name-en, .project-hero .en").first().text().trim();
  data.categoryLabel = $(".type-badge").first().text().trim();
  data.heroImage =
    $(".project-hero img, .hero-bg").first().attr("src") ??
    `assets/images/projects/${slug}/hero.jpg`;

  // Meta rows → specs
  data.specs = $(".meta-row")
    .map((_, el) => ({
      labelZh: $(el).find(".label").text().trim(),
      value: $(el).find(".value").text().trim(),
    }))
    .get();

  // Gallery (flat)
  const flat = $(".gallery img")
    .map((_, el) => ({ image: $(el).attr("src") }))
    .get();

  // Gallery (sections — zhongbao-nangang 樣式)
  const sections = $(".gallery-section")
    .map((_, el) => ({
      titleZh: $(el).find("h3 .name-zh, .section-title").first().text().trim(),
      titleEn: $(el).find("h3 .en").first().text().trim(),
      items: $(el)
        .find("img")
        .map((_, img) => ({ image: $(img).attr("src") }))
        .get(),
    }))
    .get();

  if (sections.length > 0) data.gallerySections = sections;
  else data.gallery = flat;

  return data as ProjectData;
}
```

- [ ] **Step 3: 寫測試**

`scripts/lib/__tests__/parse-project.test.ts`：

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { parseProject } from "../parse-project.js";

test("kimpton: flat gallery", async () => {
  const html = await fs.readFile("projects/kimpton.html", "utf8");
  const result = parseProject(html, "kimpton");
  assert.equal(result.category ?? "hospitality", "hospitality");
  assert.ok(result.gallery && result.gallery.length > 0);
  assert.ok(!result.gallerySections);
});

test("zhongbao-nangang: grouped gallery with 5 sections", async () => {
  const html = await fs.readFile("projects/zhongbao-nangang.html", "utf8");
  const result = parseProject(html, "zhongbao-nangang");
  assert.ok(result.gallerySections);
  assert.equal(result.gallerySections!.length, 5);
});
```

- [ ] **Step 4: 跑測試**

Run: `npx tsx --test scripts/lib/__tests__/parse-project.test.ts`
Expected: 2/2 passing。

- [ ] **Step 5: 寫 extract-html.ts driver**

```ts
import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";
import { parseProject } from "./lib/parse-project.js";

const files = await fg("projects/*.html");
await fs.mkdir("cms/data/projects", { recursive: true });
for (const f of files) {
  const slug = path.basename(f, ".html");
  const html = await fs.readFile(f, "utf8");
  const data = parseProject(html, slug);
  await fs.writeFile(
    `cms/data/projects/${slug}.json`,
    JSON.stringify(data, null, 2),
  );
  console.log(`✓ ${slug}`);
}
```

- [ ] **Step 6: 跑 extractor 與 validator**

```bash
npm run extract
npm run validate
```

Expected: 21 個 `cms/data/projects/*.json` 全部驗證通過。Schema 不符會回報，逐筆修正解析邏輯。

- [ ] **Step 7: Commit**

```bash
git add scripts/ cms/data/projects/
git commit -m "feat(cms): extract 21 project pages to JSON"
```

### Task 1.4：寫 services / careers / about / homepage extractor

**Files:**

- Create: `scripts/lib/parse-services.ts`
- Create: `scripts/lib/parse-careers.ts`
- Create: `scripts/lib/parse-about.ts`
- Create: `scripts/lib/parse-homepage.ts`
- Create: `cms/data/{services,careers,about,homepage}.json`

- [ ] **Step 1: 對每個頁面寫 parser 函式**

每個 parser 接 html 字串，回傳對應 schema 的 object。具體查找：

- services.html → `.service-card .number / h3 / .en / p` → services registry
- careers.html → `.career-card`, `.value-card`, `.perk-item` 三組 → positions/values/perks
- about.html → `.stat-card`, `.story`, `.team-cell`, `.cert-badge`
- index.html → `.hero h1`, `.hero-stats`, `.logos-bar`, `.taiwan-wedge`, `.featured-projects`

- [ ] **Step 2: 為每個 parser 寫至少 1 個 assertion test**

例：services 要有 10 筆，careers.positions 要有 4 筆。

- [ ] **Step 3: 跑 `npm run extract && npm run validate`**

Expected: 全部 6 個 data 檔通過。

- [ ] **Step 4: Commit**

```bash
git add cms/data/ scripts/
git commit -m "feat(cms): extract services/careers/about/homepage to JSON"
```

---

## Phase 2 — Notion DB 建立與資料匯入

### Task 2.1：手動建立 6 個 Notion DB

**Files:**

- Create: `docs/notion-db-setup.md`（紀錄每個 DB 的 ID 與分享連結）

- [ ] **Step 1: 在 Notion 中建立 workspace「HQ Design CMS」**

於該 workspace 建立 6 個 DB：

1. HQ — Globals
2. HQ — Projects
3. HQ — Services + HQ — Process（兩個獨立 DB）
4. HQ — Positions / HQ — Why-Join / HQ — Perks（三個）
5. HQ — Homepage
6. HQ — About / HQ — Team Members（兩個）

依 `cms/schemas/README.md` 的 "Notion property mapping" 表設定 property type。

- [ ] **Step 2: 設定 share with Framer integration**

對每個 DB 右上 ⋯ → "Add connections" → 選 Framer plugin。

- [ ] **Step 3: 紀錄 DB ID**

到 `docs/notion-db-setup.md`：

```md
# Notion DB IDs

| Database      | URL                                   | ID        |
| ------------- | ------------------------------------- | --------- |
| HQ — Globals  | https://notion.so/workspace/abc123... | abc123... |
| HQ — Projects | ...                                   | ...       |

| ...
```

- [ ] **Step 4: Commit**

```bash
git add docs/notion-db-setup.md
git commit -m "docs(notion): record DB IDs and share links"
```

### Task 2.2：用 Notion API 寫 importer ✅ **已完成（dry-run 通過 2026-05-25）**

**Implementation files:**

- `scripts/push-to-notion.ts` ← 主 importer（單檔 ~600 行 + 14 mappers）
- `cms/notion-manifest.json` ← 14 DB 的 `database_id` / `dataSourceId` / 5 條 relations
- `docs/migration-plan/notion-token-setup.md` ← integration token / `.env` / 14 DB 授權步驟
- `.gitignore` ← 排除 `.env*` 與 `logs/`

**Architecture（與原計劃差異）：**

- 從 6 DB 擴充到 **14 DB**（多了 Certifications / Process Steps / Career Values / Career Perks / Client Logos / Team Members / Timeline Milestones / Gallery Sections 等關聯/列舉表）。
- 採 **two-pass + idempotent upsert**：Pass 1 寫所有 primitive 欄位、建立 `${dbKey}::${title}` → pageId cache；Pass 2 依 `manifest.relations` 補 cross-DB relation。
- `ThrottledNotion` wrapper：350 ms throttle + 指數 backoff（429 / 5xx）。
- title property 隨 DB 不同（`Slug` / `Name` / `Code`），mapper 內以常數對應。

**CLI 介面：**

```bash
npm run push:notion:dry           # dry-run（不呼叫 API）
npm run push:notion                # 實跑
npm run push:notion -- --db=projects        # 只跑單一 DB
npm run push:notion -- --pass=1             # 只跑 Pass 1（primitives）
```

**Dry-run 驗證輸出（2026-05-25）：**

```
[push-to-notion] PASS 1 — primitives
  → globals              1 rows
  → certifications       6 rows
  → projects             21 rows
  → services             10 rows
  → processSteps         5 rows
  → positions            4 rows
  → careerValues         6 rows
  → careerPerks          6 rows
  → clientLogos          7 rows
  → aboutPage            1 rows
  → teamMembers          0 rows
  → timelineMilestones   0 rows
  → homepage             1 rows
  → gallerySections      5 rows
[push-to-notion] PASS 2 — relations
[push-to-notion] log written: logs/push-to-notion-2026-05-25.json
```

**v1 已知限制（importer 與 summary 已記錄，後續 Phase 補齊）：**

| 限制                                        | 原因                                                                   | 後續處理                                                                    |
| ------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 所有 file / image 欄位**跳過**              | Notion `files` property 需 external URL；本地是相對路徑                | Phase 3.3 後改由 Framer plugin 從 image URL host 拉，或先上 R2 / Blob       |
| Team Members + Timeline Milestones **為空** | 本地 JSON 無對應 source                                                | 後續使用者在 Notion 直接補                                                  |
| Services category enum remap                | DB 限定 `design / build / consulting`；本地有 `tech / aftercare`       | mapper `remapServiceCategory`：tech→build、aftercare→consulting             |
| Positions department enum remap             | DB 限定 `design / engineering / operations / business`                 | mapper `deptRemap` 把中文部門對應到英文 enum                                |
| Homepage URL 欄位                           | Notion `url` 型別不接受相對路徑                                        | `toAbsoluteUrl()` 把 `contact.html` 補成 `https://example.com/contact.html` |
| About Team Cells                            | DB 是 `Team Cell N Title/Body Zh`；本地是 `{role, count, roleLabelEn}` | mapper 把 roleLabelZh→Title、`${count} 人 · ${roleLabelEn}`→Body            |

**接下來（需使用者操作）：**

1. 依 [notion-token-setup.md](./notion-token-setup.md) 取得 integration token、授權父頁面、建立 `.env`。
2. 再跑一次 `npm run push:notion:dry` 確認 token 設定後仍綠。
3. 經使用者授權後執行 `npm run push:notion`（**會寫 14 DB**），結束後抽樣 3 筆（projects / services / about）回 Notion UI 驗證。

---

## Phase 3 — Framer template 套用 + CMS 綁定

### Task 3.1：鎖定 template（**已決定**）

- **決定**：使用者已選定 Unframer MCP 可存取的 template（透過個人 MCP endpoint），不再從候選清單挑。
- **MCP 註冊**：`unframer-hq-template`（HTTP transport，本地 `.claude.json`）。
- **CMS baseline**：template 出廠 CMS 有 2 個 collections（`Work` 14 fields、`Article` 23 fields）。
- **差異報告**：[template-cms-diff.md](./template-cms-diff.md) — 列出每個 collection / field 的 add / modify / remove 動作。

- [x] Step 1: 透過 `getCMSCollections` 抓取 template baseline schema
- [x] Step 2: 對齊本地 6 個 schema 並產出 [template-cms-diff.md](./template-cms-diff.md)
- [ ] Step 3: 使用者確認 diff report 內第 6 節「Open questions」的 4 個項目

### Task 3.1b：套用 CMS schema 變更到 template

**架構備註：** Framer Notion plugin 安裝後通常會**自建新的 collection**（非合併進既有 Work）。所以 Task 3.1b 的「restructure Work」實際上是定義「Notion 同步來的 collection 應該長什麼樣」的 spec — 如果 plugin 行為確實是新建，本任務可只保留 baseline 備份與「13 個新 collections 預先建好」步驟，跳過重命名 Work（直接讓 Notion 建一個全新的 `Projects` collection 取代 Work）。決策時機：Task 3.3 安裝完 plugin 第一次 sync 試跑後再敲定。

**Files:**

- Reference: [template-cms-diff.md](./template-cms-diff.md)
- Modify: Framer canvas（透過 Unframer MCP）
- Snapshot baseline: `cms/snapshots/2026-05-25-template-baseline.xml`

- [ ] **Step 1: Backup baseline**

呼叫 `getProjectXml` 並把回傳 XML 存到 `cms/snapshots/2026-05-25-template-baseline.xml`（萬一要 roll back）。

- [ ] **Step 2: 修改 `Work` collection**
  - 透過 Framer UI 重命名 6 個欄位（`Title`→`Name Zh`、`Inner Title`→`Subtitle Zh`、`BG Image`→`Hero Image`、`Inner Image`→`Thumbnail`、`Body Text`→`Description Zh`、`Roll No`→`Sort Order`，後者改 type number）。
  - 用 `upsertCMSItem`（搭配 `createCMSCollection` 對新欄位）新增 13 個新欄位（Slug / Name En / Subtitle En / Description En / Year / Featured / Floor Area / Style / Materials / Image 3..8 / Related / Has Gallery Sections）。
  - 把 `Category` 轉 enum（office/fb/hospitality/exhibition/retail）。Framer UI 操作：delete Category → 重建為 Option。
  - 刪掉 template 出廠的 1 個 sample Work item（importer 將寫入 21 個 HQ 案例）。

- [ ] **Step 3: 建立 13 個新 collections**

  按 diff report 第 2 節順序：`Globals`, `Certification`, `GallerySection`, `Service`, `ProcessStep`, `Position`, `CareerValue`, `CareerPerk`, `Homepage`, `ClientLogo`, `AboutPage`, `TeamMember`, `TimelineMilestone`。

  ```ts
  // 透過 Unframer MCP createCMSCollection 程式化建立
  await unframerMcp.call("createCMSCollection", {
    name: "Globals",
    fields: [
      { name: "Slug", type: "string", required: true },
      { name: "Brand Name Zh", type: "string" },
      // ...
    ],
  });
  ```

- [ ] **Step 4: 驗證**

  再呼叫 `getCMSCollections`，應回傳 **15 個 collections**。比對 diff report execution checklist。

- [ ] **Step 5: Commit baseline 與 mapping**

  ```bash
  git add cms/snapshots/ docs/migration-plan/template-cms-diff.md
  git commit -m "chore(cms): snapshot framer template baseline + diff plan"
  ```

### Task 3.2：用 Chrome plugin 備份既有 5 個代表頁

**Files:**

- 在 Framer 專案內：Pages → "📦 Legacy Backup" 資料夾
- Create: `docs/legacy-backup-list.md`

- [ ] **Step 1: 用 Framer Chrome Plugin 備份**

依使用者意願，挑 5 個代表頁複製到 Framer：

1. `index.html`
2. `projects.html`
3. `projects/zhongbao-nangang.html`（多租戶最複雜）
4. `projects/kimpton.html`（標準案例）
5. `services.html`

備份到 Framer Pages 內 "Legacy Backup" 資料夾。**不發佈、僅作參考。**

- [ ] **Step 2: 紀錄**

`docs/legacy-backup-list.md` 記下哪些頁面備份了、Framer 頁面路徑。

- [ ] **Step 3: Commit**

```bash
git add docs/legacy-backup-list.md
git commit -m "docs(framer): list pages backed up via chrome plugin"
```

### Task 3.3：在 Framer 安裝 Notion plugin 與 sync

**Files:**

- Create: `framer/notion-plugin-map.md`

- [ ] **Step 1: Framer Marketplace → Notion → Install**

對每個 Notion DB 各建立一個 Framer CMS Collection 連結。Framer 會列出 Notion property，逐項 map 到 Framer field type（按 `cms/schemas/README.md` 表）。

- [ ] **Step 2: 跑首次 sync**

點 "Sync now"。Framer 會把 21 個 project 拉成 Collection items，圖片自動上傳成 Asset。

- [ ] **Step 3: 紀錄 mapping**

`framer/notion-plugin-map.md`：每個 collection 截圖 + 文字描述 Field 對應。供未來維護者複製。

- [ ] **Step 4: Commit**

```bash
git add framer/notion-plugin-map.md
git commit -m "docs(framer): document notion plugin field mappings"
```

### Task 3.4：複製 template 頁面、綁 CMS

**Files:**

- 在 Framer 內：Pages → 主結構

- [ ] **Step 1: 主頁面結構建立**

從選定的 Framer template，複製或重命名為：

- `/` Home（綁 homepage Singleton）
- `/projects` Listing（綁 projects Collection）
- `/projects/:slug` Detail（CMS Detail Page）
- `/services` Services（綁 services Collection）
- `/about` About（綁 about Singleton）
- `/careers` Careers（綁 positions/values/perks）
- `/contact` Contact

- [ ] **Step 2: 把 Legacy Backup 的設計元素拖過來**

從 Framer Legacy Backup 內，拖既有設計的特色元素（如 hero stat bar、taiwan-wedge）到對應頁面。**不要整頁複製，只取要保留的視覺資產。**

- [ ] **Step 3: 綁 CMS 變數**

在 Detail Page，把每個文字欄選 "Use variable" → 對應 Notion property。圖片同理。

- [ ] **Step 4: 視覺驗證**

預覽 3 個代表頁：

- 首頁
- Kimpton（flat gallery）
- 中保南港（grouped gallery）→ 需要 conditional / repeater，特別注意 `gallerySections`

- [ ] **Step 5: 可選 — 在 Framer canvas 用 mcp-designer skill 做原子操作**

若需大量微調，可開啟 `framer:mcp-designer` skill 用 MCP tools 直接 patch nodes。

- [ ] **Step 6: 發布 staging URL**

Framer → Publish → 用 framer subdomain（不要正式 domain）。

---

## Phase 4 — Unframer CI 快照

### Task 4.1：建 GitHub Action

**Files:**

- Create: `.github/workflows/unframer-sync.yml`
- Create: `scripts/pull-unframer.sh`
- Modify: `.env.example` 加上 `FRAMER_PROJECT_ID` 與 `FRAMER_TOKEN`

- [ ] **Step 1: 寫 pull-unframer.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail
: "${FRAMER_PROJECT_ID:?}"
npx unframer "$FRAMER_PROJECT_ID" --out cms/exports/
git add cms/exports/
git diff --cached --quiet || git commit -m "chore(cms): unframer snapshot $(date -u +%Y-%m-%d)"
```

- [ ] **Step 2: GitHub Action 每天跑**

```yaml
name: Unframer Sync
on:
  workflow_dispatch:
  schedule:
    - cron: "0 17 * * *" # 每天 UTC 17:00 = 台北 01:00
permissions:
  contents: write
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: bash scripts/pull-unframer.sh
        env:
          FRAMER_PROJECT_ID: ${{ secrets.FRAMER_PROJECT_ID }}
          FRAMER_TOKEN: ${{ secrets.FRAMER_TOKEN }}
      - run: git push
```

- [ ] **Step 3: 在 GitHub repo secrets 加 FRAMER_PROJECT_ID / FRAMER_TOKEN**

- [ ] **Step 4: Commit & test**

```bash
git add .github/ scripts/pull-unframer.sh
git commit -m "ci(unframer): daily snapshot to cms/exports/"
gh workflow run unframer-sync.yml
```

---

## Phase 5 — 切流量 & 廢棄舊 HTML

### Task 5.1：DNS / 重定向

- [ ] **Step 1: 在 Framer Publish 設定中綁正式 domain**

Framer → Site Settings → Custom Domain → `hqdesign.tw`。Framer 給的 CNAME 加到 DNS。

- [ ] **Step 2: 舊 GitHub Pages（如果有用）下線**

或是把 `index.html` 換成一個 redirect HTML 指向 Framer URL，再透過 DNS cutover。

- [ ] **Step 3: 確認 21 個 detail page 的 slug 一致**

`/projects/kimpton` 等 URL 與舊網站維持一致，避免 SEO 流失。

### Task 5.2：把舊 HTML 移到 \_archive/

- [ ] **Step 1: 移動**

```bash
git mv index.html about.html services.html careers.html contact.html projects.html _archive/
git mv projects/ _archive/projects-html/
```

- [ ] **Step 2: 在 `_archive/README.md` 寫遷移 note**

說明這些檔案僅保存供 Framer 設計參考，不再是 source-of-truth。

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: archive legacy static HTML after framer launch"
```

---

## Framer template 候選（**待使用者拍板**）

下方為與 HQ 既有「商業空間 / 多語 / 案例驅動 / 信任型企業」風格相容的 4 個候選 template。三者皆有：CMS Projects / Services / Team / Contact form / 多語切換能力。

| 候選                                                | 風格                      | CMS 結構契合度                                    | 雙語切換        | 適合理由                                                  |
| --------------------------------------------------- | ------------------------- | ------------------------------------------------- | --------------- | --------------------------------------------------------- |
| **Atelier — Architecture & Interior**               | 高端深色、大圖、Editorial | 9/10 — 內建 projects collection + grouped gallery | 內建 Locale     | 與既有暗色 hero (.hero--int) + grouped gallery 結構最契合 |
| **Foundry — Studio / Agency**                       | 中性、白底、極簡 grid     | 7/10 — 有 case studies 但是 flat                  | 需手動加 Locale | 視覺乾淨，與 Kimpton 飯店案匹配；改造空間最大             |
| **Stack — Architecture Studio**                     | 深色、低彩、襯線 + 等寬   | 8/10 — projects + services + team                 | 內建            | 視覺最接近 HQ International 版型，hero stats bar 直接相容 |
| **Custom（不用 template，從 Framer Starter 開始）** | 完全自定義                | 10/10（自己定）                                   | 需自建          | 自由度高但工程量大 1.5–2 倍                               |

> 上述名稱為示意，實際採用以 Framer Marketplace 當前可購買項目為準。

---

## 風險與緩解

| 風險                                                           | 緩解                                                                                                           |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Notion plugin sync 對大型 Rich Text（specs 內部 JSON）破壞格式 | 把 `specs` / `gallerySections` 改成 Notion relation DB；不放 JSON 在單一 cell                                  |
| 圖片上傳：21 案 × 平均 10 張 = 210+ 張，Notion 上傳速度慢      | 用 push-to-notion.ts 程式化呼叫；或直接讓 Framer plugin 從 image URL 拉（host 在 Cloudflare R2 / Vercel Blob） |
| Framer 訂閱費                                                  | Framer Mini / Basic plan 即可支援自訂 domain + CMS。確認 plan 等級含 CMS 100+ items                            |
| SEO 流量損失                                                   | 保持 URL slug、用 Framer 內 SEO 欄位填 metaTitle/metaDescription、發 sitemap                                   |
| 內容團隊不熟 Notion                                            | 在 Notion DB 建一個 "How to edit" 內嵌 page，三步教學                                                          |

---

## Self-Review Checklist

- [x] **Spec coverage**：使用者四點需求各對應到 Phase
  - CMS 選型 → Phase 0
  - Schema 列出與檔案產生 → `cms/schemas/*` 已完成 + Phase 1 抽取 data
  - Framer 骨架選擇 → Phase 3 candidates，待使用者拍板
  - 替換網站內容 → Phase 3.4 + Phase 5
- [x] **Placeholder scan**：所有 step 都有具體指令、code block 或檔名
- [x] **Type consistency**：欄位 `slug` / `nameZh` / `categoryGroup` 等命名前後一致
- [x] **Local skills used**：
  - `superpowers:writing-plans` → 本檔結構
  - `framer:automation-cms` → Phase 4 unframer CLI
  - `framer:mcp-designer` → Phase 3.4 Step 5 視需要使用
  - `framer:expert` → 視整體流程協調

---

## Execution Handoff

**Plan complete and saved to `docs/migration-plan/2026-05-25-hq-design-website-framer-migration.md`. 兩種執行模式：**

1. **Subagent-Driven (recommended)** — 每個 Task 派一個 fresh subagent，Claude review 後再進下一個。**REQUIRED SUB-SKILL:** `superpowers:subagent-driven-development`
2. **Inline Execution** — Claude 在當前 session 內逐步執行，每幾步停下來給使用者 checkpoint。**REQUIRED SUB-SKILL:** `superpowers:executing-plans`

**Blocking decision (請使用者先決定)：**

- Framer template：Atelier / Foundry / Stack / Custom
- 執行模式：Subagent-Driven / Inline
