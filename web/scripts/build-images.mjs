/**
 * 影像管線：site/assets/img/work/ → web/public/media/work/
 *
 * 刻意不做裁切。來源長寬比不統一（3:2 有 64 張、AI 渲染 1.791 有 29 張、
 * 直式 2:3 有 14 張），把直式硬裁成 3:2 會砍掉一半畫面且不可逆。
 * 裁切是呈現層的事，交給 CSS 的 aspect-ratio + object-position（吃 focal）。
 *
 * sharp 預設不保留 metadata——規則是「永遠不要呼叫 .withMetadata()」，
 * 並由 gates/no-pii.mjs 對輸出做斷言，而不是靠記憶。
 *
 *   node scripts/build-images.mjs           增量（內容雜湊未變就跳過）
 *   node scripts/build-images.mjs --force   全部重產
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = dirname(fileURLToPath(import.meta.url));
const WEB = join(HERE, "..");
const ROOT = join(WEB, "..");
const SRC = join(ROOT, "site", "assets", "img", "work");
const OUT = join(WEB, "public", "media", "work");
const CONTENT = join(ROOT, "content", "projects");
const MANIFEST = join(WEB, "lib", "content", "generated", "images.json");

const WIDTHS = [800, 1024, 1280, 1600, 1920, 2560];
const QUALITY = { 2560: 76, 1920: 78, 1600: 80, 1280: 82, 1024: 82, 800: 84 };
const FORCE = process.argv.includes("--force");

const sha = (b) => createHash("sha256").update(b).digest("hex").slice(0, 16);

const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, "utf8")) : { images: {} };
const manifest = { generatedAt: new Date().toISOString(), widths: WIDTHS, images: {} };

const projects = readdirSync(CONTENT)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(join(CONTENT, f), "utf8")));

let made = 0,
  skipped = 0,
  bytes = 0;
const missing = [];

for (const p of projects) {
  for (const im of p.images) {
    const srcPath = join(SRC, p.slug, im.sourceFile);
    if (!existsSync(srcPath)) {
      missing.push(`${p.slug}/${im.sourceFile}`);
      continue;
    }
    const key = `${p.slug}/${im.stem}`;
    const hash = sha(readFileSync(srcPath));
    const targets = WIDTHS.filter((w) => w <= im.width);
    if (targets.length === 0) targets.push(WIDTHS[0]); // 來源比最小尺寸還小就原尺寸輸出

    const cached = prev.images?.[key];
    if (!FORCE && cached?.hash === hash && cached.widths.every((w) => existsSync(join(OUT, p.slug, `${im.stem}-${w}.webp`)))) {
      manifest.images[key] = cached;
      skipped += cached.widths.length;
      continue;
    }

    mkdirSync(join(OUT, p.slug), { recursive: true });
    const pipeline = sharp(srcPath);

    for (const w of targets) {
      const dest = join(OUT, p.slug, `${im.stem}-${w}.webp`);
      await pipeline
        .clone()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: QUALITY[w] ?? 80, effort: 5 })
        .toFile(dest);
      bytes += statSync(dest).size;
      made++;
    }

    // 20px blur placeholder，內嵌進 manifest 供 next/image 的 placeholder="blur"
    const blur = await sharp(srcPath).resize({ width: 20 }).webp({ quality: 40 }).toBuffer();

    manifest.images[key] = {
      hash,
      widths: targets,
      width: im.width,
      height: im.height,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    };
  }
}

mkdirSync(dirname(MANIFEST), { recursive: true });
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

console.log(`來源 ${SRC.replace(ROOT + "/", "")}`);
console.log(`輸出 ${OUT.replace(WEB + "/", "web/")}`);
console.log(`\n產生 ${made} 檔｜沿用 ${skipped} 檔｜共 ${(bytes / 1048576).toFixed(1)} MB`);
console.log(`manifest ${Object.keys(manifest.images).length} 筆 → lib/content/generated/images.json`);

if (missing.length) {
  console.error(`\n❌ 找不到來源檔 ${missing.length} 張：`);
  missing.slice(0, 10).forEach((m) => console.error(`  ${m}`));
  process.exit(1);
}
console.log(`\n✅ 影像管線完成`);
