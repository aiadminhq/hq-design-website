/**
 * 內容閘門：用 Zod schema 驗證 content/ 的 33 案，並跑跨案的一致性檢查。
 * 非零 exit = 有阻斷項。build 前必跑。
 *
 * 用法（可在 repo 根跑，不需要 web/ 的相依）：
 *   node --import tsx web/scripts/check-content.ts
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { Project, SOURCE_LABEL } from "../lib/content/schema";
import { Stage, STAGES } from "../lib/content/process-schema";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const PROJECTS = join(ROOT, "content", "projects");

let failed = 0;
const fail = (msg: string) => {
  console.error(`  ✗ ${msg}`);
  failed++;
};

const files = readdirSync(PROJECTS).filter((f) => f.endsWith(".json"));
const parsed: z.infer<typeof Project>[] = [];

console.log(`內容閘門：${files.length} 個專案檔\n`);

// ── 1. Schema 驗證
for (const f of files) {
  const r = Project.safeParse(
    JSON.parse(readFileSync(join(PROJECTS, f), "utf8")),
  );
  if (!r.success) fail(`${f}\n${z.prettifyError(r.error)}`);
  else parsed.push(r.data);
}
console.log(`[1] schema  通過 ${parsed.length}/${files.length}`);

// ── 2. slug 與檔名一致
for (const p of parsed) {
  if (!files.includes(`${p.slug}.json`)) fail(`slug「${p.slug}」與檔名不符`);
}
console.log(`[2] slug 與檔名一致`);

// ── 3. relatedSlugs 必須指向存在的案子（防斷鏈）
const known = new Set(parsed.map((p) => p.slug));
for (const p of parsed) {
  for (const s of p.relatedSlugs) {
    if (!known.has(s)) fail(`${p.slug}.relatedSlugs 指向不存在的 ${s}`);
    if (s === p.slug) fail(`${p.slug}.relatedSlugs 指向自己`);
  }
}
console.log(`[3] relatedSlugs 無斷鏈`);

// ── 4. 影像 stem 全域唯一（產出路徑 /media/work/<slug>/<stem>-<w>.webp 不得碰撞）
const seen = new Map<string, string>();
for (const p of parsed) {
  for (const im of p.images) {
    const key = `${p.slug}/${im.stem}`;
    if (seen.has(key)) fail(`影像 stem 重複：${key}`);
    seen.set(key, p.slug);
  }
}
console.log(`[4] 影像 stem 唯一（共 ${seen.size} 張）`);

// ── 5. 來源標示可推導（內容政策紅線）
for (const p of parsed) {
  for (const im of p.images) {
    if (!SOURCE_LABEL[im.prov])
      fail(`${p.slug}/${im.stem} 的 prov「${im.prov}」無對應標示`);
  }
}
console.log(`[5] 四類來源標示皆可推導`);

// ── 6. 對外機器可讀宣稱不得含未驗證數值
for (const p of parsed) {
  const unverified = p.specs.filter((s) => !s.verified).map((s) => s.labelZh);
  if (p.dataQuality.factsVerified && unverified.length)
    fail(
      `${p.slug} factsVerified=true 但有未驗證 specs：${unverified.join("、")}`,
    );
}
console.log(`[6] verified 旗標與 dataQuality 一致`);

// ── 統計
const counts = (fn: (p: z.infer<typeof Project>) => string) =>
  parsed.reduce<Record<string, number>>(
    (a, p) => ((a[fn(p)] = (a[fn(p)] ?? 0) + 1), a),
    {},
  );
const provCount = parsed
  .flatMap((p) => p.images)
  .reduce<
    Record<string, number>
  >((a, i) => ((a[i.prov] = (a[i.prov] ?? 0) + 1), a), {});

console.log(`\n類別   ${JSON.stringify(counts((p) => p.category))}`);
console.log(`權重   ${JSON.stringify(counts((p) => p.weight))}`);
console.log(`來源   ${JSON.stringify(provCount)}`);
console.log(
  `事實   齊全 ${parsed.filter((p) => p.dataQuality.factsVerified).length}｜待核對 ${
    parsed.filter((p) => !p.dataQuality.factsVerified).length
  }`,
);
const noHero = parsed
  .filter((p) => !p.images.some((i) => i.role === "hero"))
  .map((p) => p.slug);
if (noHero.length) console.log(`\n注意   缺 hero 的案子：${noHero.join("、")}`);

// ── 7. 七段流程
const PROC = join(ROOT, "content", "process");
for (const s of STAGES) {
  const f = join(PROC, `${s.slug}.json`);
  if (!existsSync(f)) { fail(`流程缺 ${s.slug}.json`); continue; }
  const r = Stage.safeParse(JSON.parse(readFileSync(f, "utf8")));
  if (!r.success) fail(`process/${s.slug}.json\n${z.prettifyError(r.error)}`);
  if (!existsSync(join(PROC, "figures", `${s.slug}.svg`))) fail(`流程缺製圖 ${s.slug}.svg`);
  // 佐證：有案例就該有註腳，沒案例就該有誠實說明——不能兩者皆無
  if (r.success && r.data.ev.length === 0 && !r.data.ev_none)
    fail(`process/${s.slug} 無佐證案例卻也沒有 ev_none 說明`);
  // 佐證連結必須指向存在的案子
  if (r.success) for (const e of r.data.ev) {
    const slug = e.href.replace(/^\/work\//, "").replace(/\/$/, "");
    if (!known.has(slug)) fail(`process/${s.slug} 佐證連結指向不存在的 ${slug}`);
  }
}
console.log(`[7] 七段流程 + 製圖齊全，佐證連結無斷鏈`);

if (failed) {
  console.error(`\n❌ ${failed} 項阻斷`);
  process.exit(1);
}
console.log(`\n✅ 全數通過`);
