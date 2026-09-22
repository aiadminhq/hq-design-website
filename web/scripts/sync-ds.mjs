/**
 * Design token 同步：ds-bundle → web/
 *
 * 為什麼要複製而不是直接讀：Vercel 的 Root Directory 設為 `web`，
 * build 時看不到上一層的 ds-bundle。所以產物必須提交，並用 checksum 擋漂移。
 *
 *   node scripts/sync-ds.mjs            同步並寫入 checksum
 *   node scripts/sync-ds.mjs --verify   只驗證，不寫入（prebuild 用）
 *
 * 驗證兩層：
 *   1. 同步產物是否被手改過（只需要 web/，Vercel 上也能跑）
 *   2. ds-bundle 來源是否變動過（需要上一層，本機與 CI 才有）
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = join(HERE, "..");
const DS = join(WEB, "..", "ds-bundle");
const OUT_CSS = join(WEB, "app", "_ds");
const OUT_FONT = join(WEB, "public", "fonts");
const MANIFEST = join(OUT_CSS, ".checksums.json");

const VERIFY = process.argv.includes("--verify");
const sha = (b) => createHash("sha256").update(b).digest("hex").slice(0, 16);

const CSS = ["hq.css", "components.css"];

/** ds-bundle 的字體路徑是相對的（../fonts/），Next 從 public/ 根目錄供應。 */
const rewrite = (t) => t.replaceAll('url("../fonts/', 'url("/fonts/');

let failed = 0;
const fail = (m) => {
  console.error(`  ✗ ${m}`);
  failed++;
};

const hasSource = existsSync(DS);

if (!VERIFY) {
  if (!hasSource) {
    console.error(`❌ 找不到 ds-bundle：${DS}`);
    process.exit(1);
  }
  mkdirSync(OUT_CSS, { recursive: true });
  mkdirSync(OUT_FONT, { recursive: true });

  const manifest = { generatedAt: new Date().toISOString(), source: {}, output: {} };

  for (const f of CSS) {
    const src = readFileSync(join(DS, "tokens", f));
    const out = Buffer.from(rewrite(src.toString("utf8")), "utf8");
    writeFileSync(join(OUT_CSS, f), out);
    manifest.source[`tokens/${f}`] = sha(src);
    manifest.output[f] = sha(out);
  }

  // Satoshi 授權（ITF FFL v2.0 §01）要求不得 subset 或轉檔，逐位元組複製
  const fonts = readdirSync(join(DS, "fonts"));
  for (const f of fonts) {
    copyFileSync(join(DS, "fonts", f), join(OUT_FONT, f));
    manifest.source[`fonts/${f}`] = sha(readFileSync(join(DS, "fonts", f)));
  }

  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`✅ token ${CSS.length} 檔 → app/_ds/`);
  console.log(`✅ 字體 ${fonts.length} 檔 → public/fonts/`);
  console.log(`✅ checksum → app/_ds/.checksums.json`);
  process.exit(0);
}

// ── 驗證模式
if (!existsSync(MANIFEST)) {
  console.error(`❌ 找不到 ${MANIFEST}，請先跑 node scripts/sync-ds.mjs`);
  process.exit(1);
}
const m = JSON.parse(readFileSync(MANIFEST, "utf8"));

for (const [f, want] of Object.entries(m.output)) {
  const p = join(OUT_CSS, f);
  if (!existsSync(p)) fail(`app/_ds/${f} 不存在`);
  else if (sha(readFileSync(p)) !== want) fail(`app/_ds/${f} 被手改過——請改 ds-bundle 後重新同步`);
}
console.log(`[1] 同步產物未被竄改（${Object.keys(m.output).length} 檔）`);

if (hasSource) {
  for (const [rel, want] of Object.entries(m.source)) {
    const p = join(DS, rel);
    if (!existsSync(p)) fail(`ds-bundle/${rel} 不存在`);
    else if (sha(readFileSync(p)) !== want) fail(`ds-bundle/${rel} 已變動——請重新同步`);
  }
  console.log(`[2] ds-bundle 來源未漂移（${Object.keys(m.source).length} 檔）`);
} else {
  console.log(`[2] ds-bundle 不在此環境（Vercel Root Directory = web），略過來源比對`);
}

if (failed) {
  console.error(`\n❌ token 同步 ${failed} 項阻斷`);
  process.exit(1);
}
console.log(`\n✅ token 同步驗證通過`);
