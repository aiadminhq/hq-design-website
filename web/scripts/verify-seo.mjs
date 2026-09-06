// 所有權：Claude（SEO 品質閘門，見 COORDINATION.md §6 登記）
//
// seo/analysis.md §4.3 的硬性要求：「MUST 於切換前驗證發佈後的 HTML，
// 不得僅信任平台自動輸出」。舊站 27 頁 canonical 0、hreflang 0、OG 0、
// JSON-LD 1 —— 沒有閘門就是會這樣。
//
// 用法：先 `npm run build && npm start`，另一個終端跑 `npm run seo:verify`
//       或指定 BASE=https://... npm run seo:verify

const BASE = process.env.BASE ?? "http://localhost:3000";
const ORIGIN = "https://www.hqdesign.tw";

let failures = 0;
let checks = 0;

function ok(cond, label, detail = "") {
  checks += 1;
  if (!cond) {
    failures += 1;
    console.error(`  ✗ ${label}${detail ? `\n      ${detail}` : ""}`);
  }
  return cond;
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "follow" });
  return { status: res.status, text: await res.text() };
}

const one = (html, re) => html.match(re)?.[1] ?? null;
const all = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

/** 檢查一個頁面的頭部標記。expect.locale 決定 canonical 與 lang 的期望值。 */
async function checkPage(locale, path, { indexable = true } = {}) {
  const url = `/${locale}${path}`;
  const canonicalExpected = `${ORIGIN}${url}`;
  console.log(`\n[page] ${url}`);
  const { status, text: html } = await get(url);
  if (!ok(status === 200, `HTTP 200（實得 ${status}）`)) return;

  // T05 <html lang>：seo §1.3 的首頁 lang="en" 是舊站最嚴重的單點問題之一
  const lang = one(html, /<html[^>]*\slang="([^"]+)"/);
  ok(
    lang === (locale === "zh" ? "zh-Hant-TW" : "en"),
    `<html lang> 正確`,
    `實得 ${lang}`,
  );

  // T03 canonical：§4.2-1 自我指向的絕對 URL，且只能有一個
  const canon = all(html, /<link rel="canonical" href="([^"]+)"/g);
  ok(canon.length === 1, `canonical 恰好 1 個`, `實得 ${canon.length}`);
  ok(canon[0] === canonicalExpected, `canonical 自我指向且為絕對 URL`, `實得 ${canon[0]}`);

  // T04 hreflang：§4.2-2 雙向對稱 + x-default
  const alts = [...html.matchAll(/<link rel="alternate" hrefLang="([^"]+)" href="([^"]+)"/gi)];
  const map = Object.fromEntries(alts.map((m) => [m[1], m[2]]));
  ok(map["zh-Hant-TW"] === `${ORIGIN}/zh${path}`, `hreflang zh-Hant-TW 指向 zh 版`, JSON.stringify(map));
  ok(map["x-default"] === `${ORIGIN}/zh${path}`, `x-default 指向 zh 版`, JSON.stringify(map));

  // T07 OG／Twitter：舊站 0/27，直接阻斷「可轉發 deep link 與 OG 卡」
  for (const prop of ["og:title", "og:description", "og:url", "og:image", "og:locale"]) {
    const v = one(html, new RegExp(`<meta property="${prop}" content="([^"]*)"`));
    ok(v != null && v.length > 0, `${prop} 存在且非空`);
  }
  ok(
    one(html, /<meta property="og:url" content="([^"]+)"/) === canonicalExpected,
    `og:url 與 canonical 一致`,
  );
  ok(
    one(html, /<meta property="og:locale" content="([^"]+)"/) ===
      (locale === "zh" ? "zh_TW" : "en_US"),
    `og:locale 正確`,
  );
  ok(one(html, /<meta name="twitter:card" content="([^"]+)"/) === "summary_large_image", `twitter:card`);

  // description 長度：§3.1 要求 60–80 中文字元；舊站 180–224 必被截斷
  const desc = one(html, /<meta name="description" content="([^"]*)"/);
  ok(desc != null && desc.length > 0, `meta description 存在`);
  if (desc && locale === "zh") {
    ok(desc.length <= 90, `zh description ≤ 90 字元（§3.1 目標 60–80）`, `實得 ${desc.length}`);
  }

  // P0-13 parity：/en/ 薄內容頁 MUST noindex,follow
  const robotsMeta = one(html, /<meta name="robots" content="([^"]+)"/);
  if (indexable) {
    ok(!/noindex/.test(robotsMeta ?? ""), `本頁可索引`, `robots=${robotsMeta}`);
  } else {
    ok(/noindex/.test(robotsMeta ?? ""), `parity 不足的 /en 頁為 noindex`, `robots=${robotsMeta}`);
    ok(/\bfollow\b/.test(robotsMeta ?? ""), `noindex 仍為 follow（連結權重要流動）`);
  }

  // T08 JSON-LD：舊站 27 頁只有 1 頁有
  const blocks = all(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  ok(blocks.length > 0, `至少一個 JSON-LD 區塊`);
  let graph = [];
  for (const b of blocks) {
    try {
      const parsed = JSON.parse(b.replaceAll("\\u003c", "<"));
      graph = graph.concat(parsed["@graph"] ?? [parsed]);
    } catch (e) {
      ok(false, `JSON-LD 可解析`, String(e));
    }
  }
  const types = graph.flatMap((n) => (Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]));
  ok(types.includes("Organization"), `含 Organization 節點`, types.join(","));
  ok(types.includes("GeneralContractor"), `Organization 同時宣告 GeneralContractor`);
  const org = graph.find((n) => n["@id"] === `${ORIGIN}/#organization`);
  ok(Array.isArray(org?.sameAs) && org.sameAs.length > 0, `Organization.sameAs 非空（geo §G0-5）`);
  ok(Array.isArray(org?.alternateName) && org.alternateName.length >= 6, `alternateName 涵蓋品牌別名`);
  return { html, graph, types };
}

console.log(`SEO 驗證 — base = ${BASE}`);

// ── robots.txt（geo §2.3）────────────────────────────────────
console.log("\n[file] /robots.txt");
{
  const { status, text } = await get("/robots.txt");
  ok(status === 200, `HTTP 200（舊站為 404）`, `實得 ${status}`);
  ok(text.includes(`Sitemap: ${ORIGIN}/sitemap.xml`), `宣告 sitemap`);
  for (const bot of ["GPTBot", "ClaudeBot", "OAI-SearchBot", "PerplexityBot", "facebookexternalhit"]) {
    ok(new RegExp(`User-Agent: ${bot}`, "i").test(text), `明示允許 ${bot}`);
  }
  ok(!/Disallow: \/\s*$/m.test(text), `沒有全站 Disallow`);
}

// ── sitemap.xml（T02／P0-13）─────────────────────────────────
console.log("\n[file] /sitemap.xml");
let sitemap = "";
{
  const { status, text } = await get("/sitemap.xml");
  sitemap = text;
  ok(status === 200, `HTTP 200（舊站為 404）`, `實得 ${status}`);
  ok(text.includes("<urlset"), `是合法的 urlset`);
  ok(text.includes(`${ORIGIN}/zh/work/secom-nangang-complex`), `含案例頁 zh URL`);
  ok(text.includes('hreflang="x-default"'), `含 x-default alternates`);
  // parity != full 的 en 頁不得進 sitemap
  ok(!text.includes(`${ORIGIN}/en/work/`), `英文案例頁未進 sitemap（parity 不足）`);
  ok(text.includes(`${ORIGIN}/en/about`), `英文 about 有進 sitemap（parity 足夠）`);
}

// ── llms.txt（geo §3.3）─────────────────────────────────────
console.log("\n[file] /llms.txt");
{
  const { status, text } = await get("/llms.txt");
  ok(status === 200, `HTTP 200`, `實得 ${status}`);
  ok(text.includes("惠強室內裝修"), `含公司名`);
  ok(text.includes("HuiCiang Design"), `含 Facebook 使用的別名（實體消歧義）`);
  ok(/交付流程（七階段）/.test(text), `含七段流程`);
  ok(!/undefined|NaN|null/.test(text), `無未定義值滲出`);
}

// ── 頁面 ────────────────────────────────────────────────────
await checkPage("zh", "");
await checkPage("en", "");
await checkPage("zh", "/about");
await checkPage("en", "/about");
await checkPage("zh", "/services");
await checkPage("zh", "/work");
await checkPage("zh", "/process");
await checkPage("zh", "/image-policy");
await checkPage("zh", "/process/bim");
await checkPage("en", "/process/bim", { indexable: false });
await checkPage("zh", "/work/secom-nangang-complex");
await checkPage("en", "/work/secom-nangang-complex", { indexable: false });

// ── 案例頁的資料政策：暫填值不得進 JSON-LD ──────────────────
console.log("\n[policy] JSON-LD 只吃已核實事實（COORDINATION.md §4）");
{
  const { text: html } = await get("/zh/work/zhongbao-tianhe");
  const blocks = all(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  const graph = blocks.flatMap((b) => JSON.parse(b.replaceAll("\\u003c", "<"))["@graph"] ?? []);
  const work = graph.find((n) => n["@type"] === "CreativeWork");
  ok(work != null, `案例頁有 CreativeWork 節點`);
  const raw = JSON.stringify(work ?? {});
  ok(!/"value":\s*null/.test(raw), `沒有 null 數值滲入`);
}

console.log(
  `\n${failures === 0 ? "PASS" : "FAIL"} — ${checks - failures}/${checks} 項通過`,
);
process.exit(failures === 0 ? 0 : 1);
