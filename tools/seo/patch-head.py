# -*- coding: utf-8 -*-
"""
把 feat/geo-seo 的 GEO／SEO 決策移植到舊靜態站。

移植的是「決策與設定」，不是程式碼——舊站沒有 Next.js，web/lib/seo 在這裡跑不動。
每一項的依據都標在下面，值與新站的 web/lib/seo/identity.ts 逐字一致，
因為跨來源逐字重複正是實體解析最有效的訊號（geo/analysis.md §5.4）。

刻意不做 hreflang：舊站是單語站，沒有第二個語言版本可指。
自我指向的單一 hreflang 不傳達任何資訊（§4.2 的雙向對稱前提不存在）。
"""
import json, glob, os, re, sys, html

ORIGIN = "https://www.hqdesign.tw"
ORG_ID = f"{ORIGIN}/#organization"
SITE_ID = f"{ORIGIN}/#website"
NEW_CONTENT = os.path.join("..", "hq-design-website", "content", "projects")

ONE_LINER = ("惠強室內裝修（HQ Design）是台灣台北的商業空間設計施工統包（design & build）公司，"
             "1995 年創立，累積 1,600+ 件商業空間案件，設計與施工由同一團隊在單一合約下負責。")

ALTERNATE_NAMES = ["惠強室內裝修", "惠強室內裝修股份有限公司", "惠強設計",
                   "惠強設計工程股份有限公司", "HQ Design", "HQ Design Co., Ltd.",
                   "HQ Interior & Space Design", "HuiCiang Design"]

SAME_AS = ["https://www.facebook.com/HuiCiangDesign/",
           "https://www.104.com.tw/company/15bpmni0"]

KNOWS_ABOUT = ["商業空間室內裝修", "設計施工統包", "辦公室設計施工", "參數化設計",
               "BIM 室內裝修協調", "AI 室內設計流程", "施工圖說與深化設計", "營運不中斷分區施工"]

def organization():
    return {
        "@type": ["Organization", "GeneralContractor"],
        "@id": ORG_ID,
        "name": "惠強室內裝修股份有限公司",
        "alternateName": ALTERNATE_NAMES,
        "legalName": "惠強室內裝修股份有限公司",
        "description": ONE_LINER,
        "url": f"{ORIGIN}/",
        "logo": f"{ORIGIN}/assets/images/logo/IMG_6412.PNG",
        "image": f"{ORIGIN}/assets/images/og/default.jpg",
        "telephone": "+886-2-2557-3003",
        "email": "info@hqdesign.tw",
        "foundingDate": "1995",
        "address": {"@type": "PostalAddress", "streetAddress": "經貿二路135號9樓",
                    "addressLocality": "南港區", "addressRegion": "台北市", "addressCountry": "TW"},
        "areaServed": {"@type": "Country", "name": "Taiwan", "identifier": "TW"},
        "knowsAbout": KNOWS_ABOUT,
        "sameAs": SAME_AS,
        "slogan": "AI Parametric × Construction Execution",
    }

def website():
    return {"@type": "WebSite", "@id": SITE_ID, "url": f"{ORIGIN}/",
            "name": "惠強室內裝修 HQ Design", "inLanguage": "zh-Hant-TW",
            "publisher": {"@id": ORG_ID}}

def webpage(url, name, desc, crumb_id=None):
    n = {"@type": "WebPage", "@id": f"{url}#webpage", "url": url, "name": name,
         "description": desc, "inLanguage": "zh-Hant-TW",
         "isPartOf": {"@id": SITE_ID}, "about": {"@id": ORG_ID}}
    if crumb_id: n["breadcrumb"] = {"@id": crumb_id}
    return n

def breadcrumb(url, trail):
    return {"@type": "BreadcrumbList", "@id": f"{url}#breadcrumb",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": nm, "item": u}
                                for i, (nm, u) in enumerate(trail)]}

# 已核實事實只從新站內容層取；舊 cms 沒有 verified 旗標，
# 把未核實數字寫進 JSON-LD 會被搜尋引擎與 AI 當事實引用（COORDINATION.md §4）。
def verified_facts(slug):
    p = os.path.join(NEW_CONTENT, f"{slug}.json")
    if not os.path.exists(p): return {}
    d = json.load(open(p, encoding="utf-8"))
    dq = d["dataQuality"]
    if not dq["factsVerified"]: return {}
    prov = set(dq["provisionalFields"])
    return {k: v for k, v in d["facts"].items() if v is not None and k not in prov}

def creative_work(url, slug, name, desc, image):
    f = verified_facts(slug)
    n = {"@type": "CreativeWork", "@id": f"{url}#work", "url": url, "name": name,
         "description": desc, "inLanguage": "zh-Hant-TW",
         "creator": {"@id": ORG_ID}, "provider": {"@id": ORG_ID}, "image": image}
    if f.get("year"): n["dateCreated"] = str(f["year"])
    if f.get("locationZh"):
        n["locationCreated"] = {"@type": "Place", "name": f["locationZh"],
                                "address": {"@type": "PostalAddress", "addressCountry": "TW"}}
    if f.get("areaSqm"):
        n["size"] = {"@type": "QuantitativeValue", "value": f["areaSqm"],
                     "unitCode": "MTK", "unitText": "sqm"}
    if f.get("typeZh"): n["genre"] = f["typeZh"]
    return n

def services():
    d = json.load(open(os.path.join("cms", "data", "services.json"), encoding="utf-8"))
    out = []
    for s in sorted(d["services"], key=lambda x: x["order"]):
        desc = re.sub(r"<[^>]+>", "", s["descriptionZh"]).replace("無縫融入空間", "融入整體空間")
        out.append({"@type": "Service", "@id": f"{ORIGIN}/services.html#{s['slug']}",
                    "name": s["titleZh"], "description": desc, "serviceType": s["titleZh"],
                    "provider": {"@id": ORG_ID},
                    "areaServed": {"@type": "Country", "name": "Taiwan", "identifier": "TW"}})
    return out

def block(graph):
    body = json.dumps({"@context": "https://schema.org", "@graph": graph},
                      ensure_ascii=False, indent=2)
    return '  <script type="application/ld+json">\n' + body + '\n  </script>\n'

JSONLD_RE = re.compile(r'[ \t]*<script type="application/ld\+json">.*?</script>\s*\n', re.S)

def meta(s, name=None, prop=None):
    pat = (rf'<meta property="{prop}" content="(.*?)"' if prop
           else rf'<meta name="{name}" content="(.*?)"')
    m = re.search(pat, s, re.S)
    return html.unescape(m.group(1)) if m else ""

TOP = {
 "index.html":    (f"{ORIGIN}/",              [("首頁", f"{ORIGIN}/")]),
 "about.html":    (f"{ORIGIN}/about.html",    [("首頁", f"{ORIGIN}/"), ("關於惠強", f"{ORIGIN}/about.html")]),
 "services.html": (f"{ORIGIN}/services.html", [("首頁", f"{ORIGIN}/"), ("服務項目", f"{ORIGIN}/services.html")]),
 "projects.html": (f"{ORIGIN}/projects.html", [("首頁", f"{ORIGIN}/"), ("實績", f"{ORIGIN}/projects.html")]),
 "contact.html":  (f"{ORIGIN}/contact.html",  [("首頁", f"{ORIGIN}/"), ("聯絡", f"{ORIGIN}/contact.html")]),
 "careers.html":  (f"{ORIGIN}/careers.html",  [("首頁", f"{ORIGIN}/"), ("加入我們", f"{ORIGIN}/careers.html")]),
}

report = []

def patch(path, url, trail, extra):
    raw = open(path, "rb").read()
    # G0-2：about.html 檔尾 25 個 NUL byte 讓 file(1) 判為 data、grep 視為 binary，
    # 瀏覽器容忍但解析器與爬蟲行為不可預期。
    nul = raw.count(b"\x00")
    if nul:
        raw = raw.replace(b"\x00", b"")
        report.append(f"{path}: 移除 {nul} 個 NUL byte")
    s = raw.decode("utf-8")

    # G0-1／P0-5：<html lang> 必須與內容語言一致
    m = re.search(r'<html[^>]*lang="([^"]+)"', s)
    if m and m.group(1) != "zh-TW":
        s = s.replace(f'<html lang="{m.group(1)}"', '<html lang="zh-TW"', 1)
        report.append(f"{path}: lang {m.group(1)} → zh-TW")

    title = html.unescape((re.search(r"<title>(.*?)</title>", s, re.S) or [None, ""])[1]).strip()
    desc = meta(s, name="description")
    slug = os.path.basename(path).replace(".html", "")
    og_img = f"{ORIGIN}/assets/images/og/{slug}.jpg"
    if not os.path.exists(os.path.join("assets", "images", "og", f"{slug}.jpg")):
        og_img = f"{ORIGIN}/assets/images/og/default.jpg"

    # T07：舊站 og:image 0/27，分享出去沒有卡片圖
    if "og:image" not in s:
        ins = ('  <meta property="og:image" content="%s">\n'
               '  <meta property="og:image:width" content="1200">\n'
               '  <meta property="og:image:height" content="630">\n'
               '  <meta name="twitter:image" content="%s">\n') % (og_img, og_img)
        anchor = re.search(r'[ \t]*<meta name="twitter:description"[^>]*>\n', s)
        if anchor:
            s = s[:anchor.end()] + ins + s[anchor.end():]
        else:
            s = s.replace("</head>", ins + "</head>", 1)
        report.append(f"{path}: 補 og:image")

    crumb = breadcrumb(url, trail) if len(trail) > 1 else None
    graph = [organization(), website(),
             webpage(url, title, desc, crumb["@id"] if crumb else None)]
    if crumb: graph.append(crumb)
    graph += extra(url, slug, title, desc, og_img)

    had = bool(JSONLD_RE.search(s))
    s = JSONLD_RE.sub("", s)
    s = s.replace("</head>", block(graph) + "</head>", 1)
    report.append(f"{path}: JSON-LD {'重寫' if had else '新增'}（{len(graph)} 個節點）")

    open(path, "w", encoding="utf-8").write(s)

def extra_none(url, slug, title, desc, img): return []
def extra_services(url, slug, title, desc, img): return services()
def extra_projects_index(url, slug, title, desc, img):
    items = sorted(os.path.basename(p).replace(".html", "") for p in glob.glob("projects/*.html"))
    return [{"@type": "ItemList", "@id": f"{url}#list", "numberOfItems": len(items),
             "itemListOrder": "https://schema.org/ItemListOrderAscending",
             "itemListElement": [{"@type": "ListItem", "position": i + 1,
                                  "url": f"{ORIGIN}/projects/{s}.html"}
                                 for i, s in enumerate(items)]}]
def clean_name(title):
    """把品牌後綴從標題切掉。舊站三種分隔符都有：｜、| 與 em dash。"""
    return re.split(r"\s*[｜|]\s*|\s+—\s+", title)[0].strip()

def extra_work(url, slug, title, desc, img):
    name = clean_name(title)
    return [creative_work(url, slug, name, desc, img)]

for f, (url, trail) in TOP.items():
    patch(f, url, trail,
          extra_services if f == "services.html"
          else extra_projects_index if f == "projects.html" else extra_none)

for p in sorted(glob.glob("projects/*.html")):
    slug = os.path.basename(p).replace(".html", "")
    url = f"{ORIGIN}/projects/{slug}.html"
    title = html.unescape((re.search(r"<title>(.*?)</title>",
                                     open(p, encoding="utf-8", errors="replace").read(), re.S) or [None, ""])[1])
    name = clean_name(title)
    patch(p, url, [("首頁", f"{ORIGIN}/"), ("實績", f"{ORIGIN}/projects.html"), (name, url)], extra_work)

print("\n".join(report))
print(f"\n共處理 {len(TOP) + len(glob.glob('projects/*.html'))} 頁")
