#!/usr/bin/env python3
"""靜態站完整性檢查：內部連結、資源、hq.css 唯一性、禁用項。"""
import os,re,sys,json
SITE=sys.argv[1] if len(sys.argv)>1 else "/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/site"
pages=[os.path.join(r,f) for r,_,fs in os.walk(SITE) for f in fs if f.endswith(".html") and "_partials" not in r.split(os.sep)]
def resolve(href,frm):
    href=href.split("#")[0].split("?")[0]
    if not href or href.startswith(("http","mailto:","tel:","data:")): return None
    p=os.path.join(SITE,href.lstrip("/")) if href.startswith("/") else os.path.normpath(os.path.join(os.path.dirname(frm),href))
    if p.endswith("/") or os.path.isdir(p): p=os.path.join(p,"index.html")
    return p
broken=[];bad_css=[];serif=[];emoji=[];fake=[];nocanon=[];h1n=[]
EMO=re.compile("[\U0001F300-\U0001FAFF☀-➿]")
for pg in pages:
    t=open(pg,encoding='utf-8',errors='replace').read()
    for m in re.finditer(r'(?:href|src)="([^"]+)"',t):
        p=resolve(m.group(1),pg)
        if p and not os.path.exists(p): broken.append((os.path.relpath(pg,SITE),m.group(1)))
    css=re.findall(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"',t)
    local=[c for c in css if not c.startswith("http")]
    if local!=["/assets/css/hq.css"]: bad_css.append((os.path.relpath(pg,SITE),local))
    if re.search(r'font-family:[^;]*(serif|Georgia|Times)',t,re.I) and not re.search(r'sans-serif',t): serif.append(os.path.relpath(pg,SITE))
    if EMO.search(re.sub(r'<script.*?</script>','',t,flags=re.S)): emoji.append(os.path.relpath(pg,SITE))
    if re.search(r'(Lorem|待補|TODO|placeholder|Scroll to explore)',re.sub(r'<div class="empty"[^>]*>.*?</div>','',t,flags=re.S)): fake.append(os.path.relpath(pg,SITE))
    if 'rel="canonical"' not in t: nocanon.append(os.path.relpath(pg,SITE))
    n=len(re.findall(r'<h1[\s>]',t))
    if n!=1: h1n.append((os.path.relpath(pg,SITE),n))
print(f"頁面數: {len(pages)}")
print(f"斷鏈: {len(broken)}"); [print("   ",a,"→",b) for a,b in broken[:20]]
print(f"非唯一 hq.css: {len(bad_css)}"); [print("   ",a,b) for a,b in bad_css[:10]]
print(f"疑似襯線: {len(serif)}", serif[:5])
print(f"emoji: {len(emoji)}", emoji[:5])
print(f"佔位／填充文案: {len(fake)}", fake[:8])
print(f"缺 canonical: {len(nocanon)}", nocanon[:8])
print(f"h1 數量 ≠1: {len(h1n)}", h1n[:8])
sys.exit(1 if (broken or bad_css or serif or emoji) else 0)
