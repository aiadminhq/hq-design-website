/**
 * 個資閘門。repo 是公開的，任何進到網站的檔名或內容都不得帶第三方個資。
 *
 * ⚠️ 手機號碼在原始檔名中是「空格分隔」的（09## ### ###）。
 *    寫成 /09\d{8}/ 會抓到 0 筆並給出假的通過——實測驗證過。
 *
 * 掃描三層：web/ 與 content/ 的檔名、content/ 的 JSON 內容、public/media 的影像中繼資料。
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = join(HERE, "..", "..");
const ROOT = join(WEB, "..");

const PHONE = /\b09\d{2}[\s\-]?\d{3}[\s\-]?\d{3}\b/;
const SKIP = new Set(["node_modules", ".next", ".git", ".vercel"]);

let failed = 0;
const fail = (m) => {
  console.error(`  ✗ ${m}`);
  failed++;
};

function* walk(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir)) {
    if (SKIP.has(e)) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

// ── 1. 檔名
let files = 0;
for (const dir of [join(ROOT, "content"), join(WEB, "app"), join(WEB, "lib"), join(WEB, "public")]) {
  for (const p of walk(dir)) {
    files++;
    if (PHONE.test(p)) fail(`檔名含手機號碼樣式：${relative(ROOT, p)}`);
  }
}
console.log(`[1] 檔名  掃描 ${files} 個檔`);

// ── 2. 內容（只掃文字檔）
const TEXT = new Set([".json", ".ts", ".tsx", ".mjs", ".js", ".css", ".md", ".svg"]);
let scanned = 0;
for (const dir of [join(ROOT, "content"), join(WEB, "app"), join(WEB, "lib")]) {
  for (const p of walk(dir)) {
    if (!TEXT.has(extname(p))) continue;
    scanned++;
    const t = readFileSync(p, "utf8");
    if (PHONE.test(t)) fail(`內容含手機號碼樣式：${relative(ROOT, p)}`);
  }
}
console.log(`[2] 內容  掃描 ${scanned} 個文字檔`);

// ── 3. 影像中繼資料（sharp 預設不保留 metadata，這裡是斷言不是信任）
const media = join(WEB, "public", "media");
if (existsSync(media)) {
  const { default: sharp } = await import("sharp");
  let imgs = 0;
  for (const p of walk(media)) {
    if (![".webp", ".jpg", ".jpeg", ".png", ".avif"].includes(extname(p))) continue;
    imgs++;
    const m = await sharp(p).metadata();
    if (m.exif || m.iptc || m.xmp) fail(`影像仍帶中繼資料：${relative(ROOT, p)}`);
  }
  console.log(`[3] 中繼資料  掃描 ${imgs} 張影像`);
} else {
  console.log(`[3] 中繼資料  public/media 尚未產生，略過`);
}

if (failed) {
  console.error(`\n❌ 個資閘門 ${failed} 項阻斷`);
  process.exit(1);
}
console.log(`\n✅ 個資閘門通過`);
