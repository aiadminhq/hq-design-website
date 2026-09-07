# -*- coding: utf-8 -*-
"""舊靜態站的 SEO 閘門。對映新站的 web/scripts/verify-seo.mjs，
但這裡沒有伺服器，直接讀檔案——舊站就是一堆靜態檔，讀檔即所見。"""
import glob, json, os, re, sys, html

ORIGIN = "https://www.hqdesign.tw"
ORG_ID = f"{ORIGIN}/#organization"
ONE = ("惠強室內裝修（HQ Design）是台灣台北的商業空間設計施工統包（design & build）公司，"
       "1995 年創立，累積 1,600+ 件商業空間案件，設計與施工由同一團隊在單一合約下負責。")

fails = checks = 0
def ok(cond, label, detail=""):
    global fails, checks
    checks += 1
    if not cond:
        fails += 1
        print(f"  ✗ {label}" + (f"\n      {detail}" if detail else ""))

def url_of(path):
    if path == "index.html": return f"{ORIGIN}/"
    return f"{ORIGIN}/{path}"

pages = ["index.html", "about.html", "services.html", "projects.html",
         "contact.html", "careers.html"] + sorted(glob.glob("projects/*.html"))

print(f"舊站 SEO 驗證 — {len(pages)} 頁")

for p in pages:
    raw = open(p, "rb").read()
    ok(b"\x00" not in raw, f"{p}: 無 NUL byte")     # geo §G0-2
    s = raw.decode("utf-8")
    u = url_of(p)

    lang = (re.search(r'<html[^>]*lang="([^"]+)"', s) or [None, None])[1]
    ok(lang == "zh-TW", f"{p}: <html lang> 為 zh-TW", f"實得 {lang}")

    canon = re.findall(r'<link rel="canonical" href="([^"]+)"', s)
    ok(len(canon) == 1, f"{p}: canonical 恰好 1 個", f"實得 {len(canon)}")
    ok(canon and canon[0] == u, f"{p}: canonical 自我指向", f"實得 {canon[0] if canon else None}")

    for prop in ["og:title", "og:description", "og:url", "og:image", "og:locale"]:
        ok(f'property="{prop}"' in s, f"{p}: {prop} 存在")
    ok(re.search(r'<meta property="og:url" content="([^"]+)"', s).group(1) == u,
       f"{p}: og:url 與 canonical 一致")
    ok('name="twitter:card"' in s, f"{p}: twitter:card")

    img = re.search(r'<meta property="og:image" content="([^"]+)"', s)
    if img:
        rel = img.group(1).replace(ORIGIN + "/", "")
        ok(os.path.exists(rel), f"{p}: og:image 檔案實際存在", rel)

    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
    ok(len(blocks) == 1, f"{p}: JSON-LD 恰好 1 個區塊", f"實得 {len(blocks)}")
    try:
        graph = json.loads(blocks[0])["@graph"]
    except Exception as e:
        ok(False, f"{p}: JSON-LD 可解析", str(e)); continue

    types = [t for n in graph for t in (n["@type"] if isinstance(n["@type"], list) else [n["@type"]])]
    ok("Organization" in types, f"{p}: 含 Organization")
    ok("GeneralContractor" in types, f"{p}: 含 GeneralContractor")
    org = next((n for n in graph if n.get("@id") == ORG_ID), None)
    ok(org is not None, f"{p}: Organization 有 @id")
    if org:
        ok(len(org.get("sameAs", [])) > 0, f"{p}: sameAs 非空（geo §G0-5）")
        ok(len(org.get("alternateName", [])) >= 6, f"{p}: alternateName 涵蓋別名")
        ok("HuiCiang Design" in org.get("alternateName", []),
           f"{p}: alternateName 含 Facebook 使用的孤立拼音")
        ok(org.get("description") == ONE, f"{p}: Organization 描述與 llms.txt 逐字一致")

    if p.startswith("projects/"):
        work = next((n for n in graph if n.get("@type") == "CreativeWork"), None)
        ok(work is not None, f"{p}: 有 CreativeWork")
        ok(any(n.get("@type") == "BreadcrumbList" for n in graph), f"{p}: 有 BreadcrumbList")

print("\n[file] robots.txt / sitemap.xml / llms.txt")
r = open("robots.txt", encoding="utf-8").read()
ok(f"Sitemap: {ORIGIN}/sitemap.xml" in r, "robots.txt 宣告 sitemap")
for bot in ["GPTBot", "ClaudeBot", "OAI-SearchBot", "PerplexityBot"]:
    ok(re.search(rf"User-agent: {bot}", r, re.I) is not None, f"robots.txt 明示允許 {bot}")
ok("facebookexternalhit" not in r or "Disallow" not in r.split("facebookexternalhit")[1][:80],
   "facebookexternalhit 未被封（否則 OG 卡失效）")

sm = open("sitemap.xml", encoding="utf-8").read()
locs = re.findall(r"<loc>([^<]+)</loc>", sm)
ok(len(locs) == len(pages), f"sitemap 條目數與頁數一致", f"sitemap {len(locs)} vs 頁 {len(pages)}")
for loc in locs:
    rel = loc.replace(ORIGIN + "/", "") or "index.html"
    ok(os.path.exists(rel), f"sitemap 的 {loc} 有對應檔案")

l = open("llms.txt", encoding="utf-8").read()
ok(ONE in l, "llms.txt 首段與 Organization 描述逐字一致（geo §5.4）")
ok("HuiCiang Design" in l, "llms.txt 含 Facebook 使用的別名")
ok("https://www.facebook.com/HuiCiangDesign/" in l, "llms.txt 含官方帳號")

print(f"\n{'PASS' if fails == 0 else 'FAIL'} — {checks - fails}/{checks} 項通過")
sys.exit(0 if fails == 0 else 1)
