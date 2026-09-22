#!/usr/bin/env python3
"""舊站 SEO 層：只改 <head>，不動頁面正文。可重複執行（idempotent）。

    python3 scripts/legacy-seo/apply_seo_layer.py          # 套用到根層、projects/、zh/ 的所有 HTML
    python3 scripts/legacy-seo/apply_seo_layer.py --check  # 只檢查，不寫入；有差異時 exit 1

做的事（每頁）：
  1. 檔尾若缺 </html>（歷史上被截斷過），補回 footer／body／html 結尾。
  2. 沒有 canonical 的頁面補 canonical（依檔案路徑推導網址）。
  3. 移除舊的 og:* / twitter:* meta，依「目前的 <title> 與 meta description」重新產生。
     → Alex 之後手動改標題或描述，重跑一次即同步；正文永遠是權威，這層只是衍生物。
  4. index.html 與 zh/index.html 加（或更新）JSON-LD Organization。
不做的事：不改 <body>、不改 title／description、不改 hreflang、不改 GA4、不改換行格式（CRLF 頁面維持 CRLF）。
"""
import re, sys, json, html, glob, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
ORIGIN = "https://www.hqdesign.tw"
SITE_NAME = "HQ Design"
IMAGE_URL = f"{ORIGIN}/assets/images/logo/IMG_6412.PNG"
IMAGE_ALT = "HQ Design logo"
PAGES = sorted(glob.glob(str(ROOT/"*.html")) + glob.glob(str(ROOT/"projects/*.html")) + glob.glob(str(ROOT/"zh/*.html")))
OG_RE = re.compile(r'^[ \t]*<meta (?:property="og:[^"]+"|name="twitter:[^"]+")[^\n]*\n', re.M)
LD_RE = re.compile(r'[ \t]*<script type="application/ld\+json">.*?</script>\n', re.S)

def attr(s): return html.escape(html.unescape(s.strip()), quote=True)

def page_url(rel):
    if rel == "index.html": return ORIGIN + "/"
    if rel == "zh/index.html": return ORIGIN + "/zh/"
    return f"{ORIGIN}/{rel}"

def locale_of(doc):
    m = re.search(r'<html[^>]*\blang="([^"]+)"', doc)
    lang = (m.group(1) if m else "zh-TW").lower()
    return "en_US" if lang.startswith("en") else "zh_TW"

def repair_tail(doc, rel):
    if "</html>" in doc: return doc
    idx = doc.rfind('<p class="en">©')
    if idx < 0: raise SystemExit(f"{rel}: truncated and no copyright line to anchor on")
    le = doc.find("\n", idx); line = doc[idx: le if le >= 0 else len(doc)].rstrip()
    if not line.endswith("."): line += "."
    if not line.endswith("</p>"): line += "</p>"
    prefix = "../" if rel.startswith(("projects/", "zh/")) else ""
    tail = f'{line}\n    </div>\n  </div>\n</footer>\n<script src="{prefix}assets/js/main.js"></script>\n</body>\n</html>\n'
    return doc[:idx] + tail

def org_jsonld(desc):
    return {
        "@context": "https://schema.org",
        "@type": ["Organization", "GeneralContractor"],
        "@id": f"{ORIGIN}/#organization",
        "name": "惠強室內裝修股份有限公司",
        "alternateName": ["HQ Design", "HQ Design CO., LTD.", "惠強室內裝修股份有限公司", "惠強室內裝修", "惠強設計"],
        "url": f"{ORIGIN}/",
        "logo": IMAGE_URL,
        "foundingDate": "1995",
        "taxID": "89956251",
        "telephone": "+886-2-2557-3003",
        "email": "info@hqdesign.tw",
        "description": html.unescape(desc),
        "address": {"@type": "PostalAddress", "streetAddress": "經貿二路135號9樓", "addressLocality": "南港區",
                    "addressRegion": "台北市", "postalCode": "115", "addressCountry": "TW"},
        "areaServed": {"@type": "Country", "name": "Taiwan"},
        "knowsAbout": ["商業空間設計", "辦公室設計施工", "設計施工統包", "Design and Build", "Commercial Fit-Out",
                       "參數化設計", "Parametric Design", "BIM 協調", "機電消防整合", "品牌空間識別"],
    }

def apply(doc, rel):
    doc = repair_tail(doc, rel)
    t = re.search(r"<title>(.*?)</title>", doc, re.S); title = t.group(1) if t else ""
    d = re.search(r'<meta name="description" content="([^"]*)"', doc); desc = d.group(1) if d else title
    url = page_url(rel)
    if 'rel="canonical"' not in doc:
        m = re.search(r'^[ \t]*<meta name="description"[^\n]*\n', doc, re.M) or re.search(r'^[ \t]*<title>[^\n]*\n', doc, re.M)
        doc = doc[:m.end()] + f'  <link rel="canonical" href="{url}">\n' + doc[m.end():]
    else:
        url = re.search(r'<link rel="canonical" href="([^"]*)"', doc).group(1)
    doc = OG_RE.sub("", doc)                     # 清掉舊的 og/twitter，重新產生
    block = "\n".join([
        '  <meta property="og:type" content="website">',
        f'  <meta property="og:site_name" content="{SITE_NAME}">',
        f'  <meta property="og:locale" content="{locale_of(doc)}">',
        f'  <meta property="og:url" content="{url}">',
        f'  <meta property="og:title" content="{attr(title)}">',
        f'  <meta property="og:description" content="{attr(desc)}">',
        '  <meta property="og:image" content="' + IMAGE_URL + '">',
        '  <meta property="og:image:alt" content="' + IMAGE_ALT + '">',
        '  <meta name="twitter:card" content="summary_large_image">',
        '  <meta name="twitter:image" content="' + IMAGE_URL + '">',
        '  <meta name="twitter:image:alt" content="' + IMAGE_ALT + '">',
        f'  <meta name="twitter:title" content="{attr(title)}">',
        f'  <meta name="twitter:description" content="{attr(desc)}">',
    ]) + "\n"
    anchors = list(re.finditer(r'^[ \t]*<link rel="alternate" hreflang=[^\n]*\n', doc, re.M))
    pos = anchors[-1].end() if anchors else re.search(r'^[ \t]*<link rel="canonical"[^\n]*\n', doc, re.M).end()
    doc = doc[:pos] + block + doc[pos:]
    if rel in ("index.html", "zh/index.html"):
        doc = LD_RE.sub("", doc)
        ld = '  <script type="application/ld+json">\n' + json.dumps(org_jsonld(desc), ensure_ascii=False, indent=2) + '\n  </script>\n'
        m = re.search(r'^[ \t]*<meta name="twitter:description"[^\n]*\n', doc, re.M)
        doc = doc[:m.end()] + ld + doc[m.end():]
    return doc

def main():
    check = "--check" in sys.argv; changed = []
    for p in PAGES:
        rel = str(pathlib.Path(p).relative_to(ROOT))
        with open(p, encoding="utf-8", newline="") as fh: raw = fh.read()   # 保留原始換行（有些頁面仍是 CRLF）；open() 相容 Python 3.8+
        eol = "\r\n" if "\r\n" in raw else "\n"
        before = raw.replace("\r\n", "\n")
        after = apply(before, rel)
        if after != before:
            changed.append(rel)
            if not check:
                with open(p, "w", encoding="utf-8", newline="") as fh: fh.write(after.replace("\n", eol))
    print(("would change" if check else "updated") + f" {len(changed)} / {len(PAGES)} pages" + (": " + ", ".join(changed) if changed and len(changed) <= 8 else ""))
    sys.exit(1 if (check and changed) else 0)

if __name__ == "__main__": main()
