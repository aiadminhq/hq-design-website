// 所有權：Claude（SEO 資產管線，見 COORDINATION.md §6 登記）
//
// 產生 og:image。seo/analysis.md T07：全頁 MUST 具 og:image，
// 階段頁與案例頁 MUST 有專屬圖；舊站 0/27 有 OG，ux-expert §6-J1
// 的「可轉發 deep link 與 OG 卡」因此完全不成立。
//
// 刻意不做動態文字合成：中文字體在 sharp／satori 的 SVG 光柵化路徑上
// 依賴系統 fontconfig，在 CI 與本機會排版不一致，而排錯的品牌名比
// 沒有文字更糟。所以 OG 圖只由「既有攝影／製圖 + 向量品牌印記」組成。
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = join(import.meta.dirname, "..");
const CONTENT = join(ROOT, "..", "content");
const PUB = join(ROOT, "public");
const OUT = join(PUB, "og");

/** 影像管線的產出清單。各 stem 實際存在的寬度不一——來源比 1600 小的
 *  影像不會被放大（管線刻意不放大），所以要挑實際存在的最大寬度。 */
const MANIFEST = JSON.parse(
  await readFile(join(ROOT, "lib", "content", "generated", "images.json"), "utf8"),
);

function widestFile(slug, stem) {
  const entry = MANIFEST.images[`${slug}/${stem}`];
  if (!entry?.widths?.length) return null;
  const widest = Math.max(...entry.widths);
  return join(PUB, "media", "work", slug, `${stem}-${widest}.webp`);
}

const W = 1200;
const H = 630;
const INK = "#0A1118";
const BRAND = "#D64518";

/** 深底版的製圖配色。對映 ds-bundle 的 dark theme token。 */
const FIG = {
  fg: "#E6ECF2",
  fg2: "#B7C2CE",
  fg3: "#8494A3",
  line: "#2E3B49",
  lineStrong: "#3C4B5B",
  bg: INK,
  bgSunken: "#131B25",
};

const FIG_CSS = `
.ln{fill:none;stroke:currentColor;stroke-width:1;stroke-linecap:butt;stroke-linejoin:miter}
.ln2{stroke:${FIG.lineStrong}}
.ln3{stroke:${FIG.line}}
.br{stroke:${BRAND}}
.fb{fill:${BRAND};stroke:none}
.fs{fill:${FIG.bgSunken}}
.fx{fill:${FIG.bg}}
.fi{fill:currentColor;stroke:none}
.ds{stroke-dasharray:3 3}
.tx{font-family:monospace;font-size:11px;fill:${FIG.fg3};letter-spacing:.06em}
.tx.b{fill:${BRAND}}
.tx.f{fill:${FIG.fg}}
.tc{font-size:12px;fill:${FIG.fg2}}
.tc.f{fill:${FIG.fg};font-weight:500}
`;

/** 讀 logo 並改成單色，避免在深色底上出現低對比。 */
async function lockup(fill) {
  const svg = await readFile(join(PUB, "brand", "hq-design-lockup.svg"), "utf8");
  return Buffer.from(svg.replaceAll("#D64518", fill).replaceAll("#DB421A", fill));
}

async function write(out, buf) {
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, buf);
}

/** 底圖：純色畫布 + 左下角品牌條。零圓角、零漸層（COORDINATION.md §3-5）。 */
function canvas(bg) {
  return sharp({
    create: { width: W, height: H, channels: 3, background: bg },
  });
}

const brandBar = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
     <rect x="0" y="${H - 12}" width="${W}" height="12" fill="${BRAND}"/>
   </svg>`,
);

async function buildDefault() {
  const logo = await sharp(await lockup("#FFFFFF"))
    .resize({ width: 620, fit: "inside" })
    .png()
    .toBuffer();
  const buf = await canvas(INK)
    .composite([
      { input: logo, gravity: "centre" },
      { input: brandBar, top: 0, left: 0 },
    ])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await write(join(OUT, "default.jpg"), buf);
  return 1;
}

/**
 * 案例頁：用該案 hero 影像裁 1200×630。
 * 尊重 ProjectImage.focal——AI 渲染母檔是 1.792 的長寬比，置中硬裁會切掉重點。
 */
async function buildProjects() {
  const files = (await readdir(join(CONTENT, "projects"))).filter((f) => f.endsWith(".json"));
  let n = 0;
  for (const file of files) {
    const p = JSON.parse(await readFile(join(CONTENT, "projects", file), "utf8"));
    const hero = [...p.images].sort((a, b) => a.order - b.order)[0];
    if (!hero) continue;
    const src = widestFile(p.slug, hero.stem);
    if (!src || !existsSync(src)) {
      console.warn(`[og] 缺少來源影像，略過：${p.slug}/${hero.stem}`);
      continue;
    }
    const position = hero.focal
      ? hero.focal.y < 0.4
        ? "top"
        : hero.focal.y > 0.6
          ? "bottom"
          : "centre"
      : "centre";
    const buf = await sharp(src)
      .resize(W, H, { fit: "cover", position })
      .composite([{ input: brandBar, top: 0, left: 0 }])
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    await write(join(OUT, "work", `${p.slug}.jpg`), buf);
    n += 1;
  }
  return n;
}

/** 階段頁：60° 幾何製圖置於深底，品牌色描邊。製圖是向量，縮放不失真。 */
async function buildStages() {
  const dir = join(CONTENT, "process", "figures");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".svg"));
  let n = 0;
  for (const file of files) {
    const slug = file.replace(/\.svg$/, "");
    // 製圖的 .ln/.tx/.tc/.fx 等 class 樣式原本定義在頁面 CSS 的 .dia 範圍內，
    // SVG 本身不帶樣式。脫離頁面光柵化時必須自帶，否則所有 polygon
    // 會落到 SVG 預設的 fill:black——那正是第一版 OG 圖出現黑塊的原因。
    // 值取自舊站 site/process/*/index.html 的 .dia 規則，改為深底配色。
    const raw = (await readFile(join(dir, file), "utf8")).replace(
      "<svg",
      `<svg style="color:${FIG.fg}"`,
    ).replace(/(<svg[^>]*>)/, `$1<style>${FIG_CSS}</style>`);
    const fig = await sharp(Buffer.from(raw), { density: 300 })
      .resize({ width: 940, height: 450, fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const logo = await sharp(await lockup("#FFFFFF"))
      .resize({ width: 220, fit: "inside" })
      .png()
      .toBuffer();
    const buf = await canvas(INK)
      .composite([
        { input: fig, gravity: "centre" },
        { input: logo, top: 44, left: 64 },
        { input: brandBar, top: 0, left: 0 },
      ])
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    await write(join(OUT, "process", `${slug}.jpg`), buf);
    n += 1;
  }
  return n;
}

const [d, w, s] = [await buildDefault(), await buildProjects(), await buildStages()];
console.log(`[og] default ${d} · work ${w} · process ${s} → public/og/`);
