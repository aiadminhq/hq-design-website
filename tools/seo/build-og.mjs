// 舊靜態站的 og:image 產生器。與新站 web/scripts/build-og.mjs 同一套視覺處理，
// 只是來源改成 assets/images/projects/。舊站 27 頁目前 og:image 為 0，
// 分享出去沒有卡片圖（seo/analysis.md T07）。
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..", "..");
const OUT = join(ROOT, "assets", "images", "og");
const W = 1200, H = 630;
const INK = "#0A1118", BRAND = "#D64518";

const bar = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
     <rect x="0" y="${H - 12}" width="${W}" height="12" fill="${BRAND}"/></svg>`,
);

await mkdir(OUT, { recursive: true });

// 預設圖：品牌印記置中於深底
const logoPath = join(ROOT, "assets", "images", "logo");
const logoFile = (await readdir(logoPath)).find((f) => /\.(png|jpg|svg)$/i.test(f));
if (logoFile) {
  const logo = await sharp(join(logoPath, logoFile))
    .resize({ width: 520, fit: "inside" })
    .png()
    .toBuffer();
  const buf = await sharp({ create: { width: W, height: H, channels: 3, background: INK } })
    .composite([{ input: logo, gravity: "centre" }, { input: bar, top: 0, left: 0 }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await writeFile(join(OUT, "default.jpg"), buf);
  console.log("[og] default.jpg ←", logoFile);
}

// 各專案：取該頁實際顯示的第一張照片，而不是資料夾裡字母序第一個檔
// （字母序第一個常是 floorplan.jpg，當 OG 圖等於分享一張平面圖出去）
const pages = (await readdir(join(ROOT, "projects"))).filter((f) => f.endsWith(".html"));
let n = 0, skipped = [];
for (const page of pages) {
  const slug = page.replace(/\.html$/, "");
  const html = await readFile(join(ROOT, "projects", page), "utf8");
  const srcs = [...html.matchAll(/src="\.\.\/(assets\/images\/projects\/[^"]+\.(?:jpg|jpeg|png))"/gi)]
    .map((m) => m[1])
    .filter((p) => !/floorplan/i.test(p));
  const src = srcs[0] && join(ROOT, srcs[0]);
  if (!src || !existsSync(src)) { skipped.push(slug); continue; }
  const buf = await sharp(src)
    .resize(W, H, { fit: "cover", position: "centre" })
    .composite([{ input: bar, top: 0, left: 0 }])
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  await writeFile(join(OUT, `${slug}.jpg`), buf);
  n += 1;
}
console.log(`[og] 專案 ${n} 張`, skipped.length ? `· 略過 ${skipped.join(", ")}` : "");
