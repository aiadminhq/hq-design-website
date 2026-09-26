#!/usr/bin/env python3
"""把 site/ 內一頁打包成自足 HTML（內嵌 hq.css、Satoshi woff2、該頁用到的圖片）供 Artifact 發布。
用法：build_artifact.py <site-root> <page-rel-path> <out-file>"""
import sys,os,re,base64,subprocess,tempfile
SITE,PAGE,OUT=sys.argv[1],sys.argv[2],sys.argv[3]
src=os.path.join(SITE,PAGE)
t=open(src,encoding='utf-8').read()
# 1) hq.css 內嵌（字體路徑改為 data URI）
css=open(os.path.join(SITE,"assets/css/hq.css"),encoding='utf-8').read()
def font_uri(m):
    p=os.path.join(SITE,"assets/fonts",os.path.basename(m.group(1)))
    b=base64.b64encode(open(p,"rb").read()).decode()
    return f'url("data:font/woff2;base64,{b}") format("woff2")'
css=re.sub(r'url\("\.\./fonts/([^"]+)"\)\s*format\("woff2"\)',font_uri,css)
t=re.sub(r'<link rel="stylesheet" href="/assets/css/hq.css">',lambda m:"<style>\n"+css+"\n</style>",t)
# 2) 圖片：該頁引用的 /assets/img/... → 縮圖 data URI（hero 1600 / 其餘 960）
seen={}
def img_uri(m):
    attr,path=m.group(1),m.group(2)
    if path in seen: return f'{attr}="{seen[path]}"'
    fp=os.path.join(SITE,path.lstrip("/"))
    if not os.path.exists(fp): return m.group(0)
    is_hero="hero" in os.path.basename(path)
    w=1600 if is_hero else 960; q=78 if is_hero else 74
    with tempfile.NamedTemporaryFile(suffix=".jpg",delete=False) as tmp: out=tmp.name
    subprocess.run(["magick",fp,"-resize",f"{w}x{w}>","-strip","-quality",str(q),out],check=True,capture_output=True)
    b=base64.b64encode(open(out,"rb").read()).decode(); os.unlink(out)
    seen[path]="data:image/jpeg;base64,"+b
    return f'{attr}="{seen[path]}"'
t=re.sub(r'(src|href)="(/assets/img/[^"]+\.jpe?g)"',img_uri,t)
# 3) Artifact 外殼會自帶 doctype/html/head/body：只保留 <head> 內容 + <body> 內容
head=re.search(r'<head[^>]*>(.*?)</head>',t,re.S).group(1)
body=re.search(r'<body[^>]*>(.*?)</body>',t,re.S).group(1)
head=re.sub(r'<meta charset[^>]*>|<meta name="viewport"[^>]*>','',head)
open(OUT,"w",encoding='utf-8').write(head.strip()+"\n"+body.strip()+"\n")
sz=os.path.getsize(OUT)/1048576
print(f"✅ {PAGE} → {OUT}  {sz:.2f} MiB｜內嵌圖片 {len(seen)} 張")
if sz>15: print("⚠️ 超過 15 MiB，需降圖片尺寸")
