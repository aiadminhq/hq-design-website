# -*- coding: utf-8 -*-
"""
HQ Design 流程區產生器：/process/index.html + 七段階段頁
- head/nav/footer 由 site/_partials 逐字讀入
- 七段 slug/編號/名稱/標籤以 site/_partials/stages.json 為準
- 頁面級 <style> 只使用 hq.css 已定義之 CSS 變數與既有數值
- 事實來源：公司簡介 P02–P09、P12；SECOM = 5,940 sqm（U-G1 裁定）
"""
import json, os, math, re

SITE = "/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/site"
BASE = "https://www.hqdesign.tw"

def rd(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

HEAD_PARTIAL = rd(f"{SITE}/_partials/head.html")
NAV = rd(f"{SITE}/_partials/nav.html").rstrip() + "\n"
FOOTER = rd(f"{SITE}/_partials/footer.html").rstrip() + "\n"
STAGES = json.load(open(f"{SITE}/_partials/stages.json", encoding="utf-8"))
BY_SLUG = {s["slug"]: s for s in STAGES}

# ────────────────────────────────────────────────────────────────
# 頁面級樣式：只允許 hq.css 的 token 與已出現過的數值
# ────────────────────────────────────────────────────────────────
CSS = """
/* ── process pages · 延伸 hq.css 的 .steps/.step 與 .cmp 語彙，只用既有 token ── */
.rail{display:flex;border-top:1px solid var(--line-ink);border-bottom:1px solid var(--line);font-family:var(--f-mono);font-size:12px;letter-spacing:.06em}
.rail a{flex:1;padding:var(--s3) 0;color:var(--fg-3);display:flex;align-items:center;gap:var(--s2);border-right:1px solid var(--line);transition:color .2s}
.rail a:last-child{border-right:0}
.rail a::before{content:"";width:6px;height:6px;border:1px solid var(--line-ink);transform:rotate(45deg);flex:none}
.rail a:hover{color:var(--fg)}
.rail a.on{color:var(--fg)}
.rail a.on::before{background:var(--brand);border-color:var(--brand)}
.rail a span{display:none}
@media (min-width:1000px){.rail a span{display:inline;font-family:var(--f-cjk);letter-spacing:0}}

.phero{padding:clamp(56px,7vw,120px) 0 0}
.phero .grid{align-items:start}
.phero .copy{grid-column:1/span 12}
.phero .io{grid-column:1/span 12}
@media (min-width:1000px){.phero .copy{grid-column:1/span 8}.phero .io{grid-column:10/span 3;margin-top:var(--s6)}}
.phero h1{margin:var(--s5) 0 var(--s6);font-size:clamp(34px,4.4vw,64px);line-height:1.08}
.phero .lede{max-width:30em}
.phero .gloss{margin-top:var(--s4);font-family:var(--f-en);font-size:15px;color:var(--fg-3);line-height:1.6}
.io .note .blk+.blk{margin-top:var(--s5);padding-top:var(--s4);border-top:1px solid var(--line)}
.io .note span{display:block}
.io .note .mono{font-size:12px;color:var(--fg-3);letter-spacing:.04em}

.q h2{font-size:clamp(28px,3.2vw,48px);line-height:1.22}
@media (min-width:900px){.q .l{grid-column:1/span 6}.q .r{grid-column:8/span 5}}
.q .r .en{color:var(--fg-3);font-size:15px;line-height:1.6}

.how h2{margin-top:var(--s5)}
.how .items{margin-top:var(--s8);display:grid;grid-template-columns:1fr;gap:0;border-top:1px solid var(--line-ink)}
@media (min-width:900px){.how .items.c3{grid-template-columns:repeat(3,1fr);gap:var(--gutter)}.how .items.c4{grid-template-columns:repeat(4,1fr);gap:var(--gutter)}}
@media (min-width:900px) and (max-width:999px){.how .step{border-bottom:0}.how .step::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:var(--line)}}
.how .step .idx::before{background:transparent;border-color:var(--line-ink)}
.how .step:first-child::before{background:var(--brand)}
.how .step h3{font-size:clamp(20px,1.9vw,26px)}
.how .step p{font-size:15px}
.fact{margin-top:var(--s4);padding-top:var(--s3);border-top:1px solid var(--line);font-size:14px;color:var(--fg-2);line-height:1.7}
.fact .k{font-family:var(--f-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--brand);margin-right:var(--s2)}
.fact b{color:var(--fg);font-weight:500}

.dia{padding:var(--section-y) 0}
.dia figure{margin:0;border:1px solid var(--line);position:relative;background:var(--bg)}
.dia .lab{position:absolute;left:0;top:0;padding:var(--s2) var(--s3);font-family:var(--f-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-3);border-right:1px solid var(--line);border-bottom:1px solid var(--line);display:flex;align-items:center;gap:var(--s2)}
.dia .lab .n{color:var(--brand)}
.dia .frame{overflow-x:auto;padding:var(--s7) var(--s5) var(--s5)}
.dia svg{display:block;width:100%;min-width:44em;height:auto;color:var(--fg)}
.dia figcaption{display:flex;flex-wrap:wrap;gap:var(--s3) var(--s6);padding:var(--s4) var(--s5);border-top:1px solid var(--line);font-family:var(--f-mono);font-size:12px;color:var(--fg-3);letter-spacing:.02em;line-height:1.7}
.dia figcaption .cjk{font-family:var(--f-cjk);color:var(--fg-2);letter-spacing:0}
.dia .ln{fill:none;stroke:currentColor;stroke-width:1;vector-effect:non-scaling-stroke;stroke-linecap:butt;stroke-linejoin:miter}
.dia .ln2{stroke:var(--line-strong)}
.dia .ln3{stroke:var(--line)}
.dia .br{stroke:var(--brand)}
.dia .fb{fill:var(--brand);stroke:none}
.dia .fs{fill:var(--bg-sunken)}
.dia .fx{fill:var(--bg)}
.dia .fi{fill:currentColor;stroke:none}
.dia .ds{stroke-dasharray:3 3}
.dia .tx{font-family:var(--f-mono);font-size:11px;fill:var(--fg-3);letter-spacing:.06em}
.dia .tx.b{fill:var(--brand)}
.dia .tx.f{fill:var(--fg)}
.dia .tc{font-family:var(--f-cjk);font-size:12px;fill:var(--fg-2)}
.dia .tc.f{fill:var(--fg);font-weight:500}

.why{background:var(--bg-sunken)}
.why h2{margin-top:var(--s5)}
.why .grid3{margin-top:var(--s8);display:grid;grid-template-columns:1fr;gap:var(--s7)}
@media (min-width:900px){.why .grid3{grid-template-columns:repeat(3,1fr);gap:var(--gutter)}}
.why .it{padding-top:var(--s5);border-top:1px solid var(--line-ink)}
.why .k{font-family:var(--f-mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--brand)}
.why h3{margin-top:var(--s3);font-weight:700;font-size:18px;letter-spacing:0}
.why p{margin-top:var(--s2);font-size:15px;color:var(--fg-2);line-height:1.7}

.ev h2{margin-top:var(--s5)}
.ev .cards{margin-top:var(--s8);display:grid;grid-template-columns:1fr;gap:var(--gutter)}
@media (min-width:900px){.ev .cards{grid-template-columns:repeat(2,1fr)}}
.ev .card2{display:block;border:1px solid var(--line);padding:var(--s5);transition:border-color .2s}
.ev .card2:hover{border-color:var(--line-ink)}
.ev .t{font-weight:500;font-size:17px;line-height:1.35}
.ev .t .en{display:block;font-size:13px;color:var(--fg-3);font-weight:400;margin-top:2px}
.ev .d{margin-top:var(--s4);font-family:var(--f-mono);font-size:12px;color:var(--fg-3);letter-spacing:.02em;line-height:1.7}
.ev .d b{color:var(--fg);font-weight:500}
.ev .claim{margin-top:var(--s4);padding-top:var(--s4);border-top:1px solid var(--line);font-size:14px;color:var(--fg-2);line-height:1.7}
.ev .claim b{color:var(--fg);font-weight:500;display:block}
.ev .mode{display:inline-flex;font-family:var(--f-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--fg-3);border:1px solid var(--line-strong);padding:3px 8px;margin-top:var(--s4)}
.ev .none{margin-top:var(--s8);padding:var(--s5);border:1px solid var(--line);color:var(--fg-2);font-size:15px;line-height:1.7;max-width:44em}
.ev .none b{color:var(--fg);font-weight:500}
.ev .foot{margin-top:var(--s6);font-size:14px;color:var(--fg-3);max-width:44em;line-height:1.7}

.pn{border-top:1px solid var(--line-ink);display:grid;grid-template-columns:1fr}
@media (min-width:700px){.pn{grid-template-columns:1fr 1fr}}
.pn a{padding:var(--s6) 0;display:flex;flex-direction:column;gap:var(--s2);border-bottom:1px solid var(--line)}
@media (min-width:700px){.pn a:first-child{padding-right:var(--s7);border-right:1px solid var(--line)}.pn a:last-child{padding-left:var(--s7);text-align:right;align-items:flex-end}}
.pn .k{font-family:var(--f-mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-3)}
.pn .t{font-weight:700;font-size:clamp(20px,1.9vw,26px);line-height:1.3;transition:color .2s}
.pn .t .en{display:block;font-family:var(--f-en);font-weight:500;font-size:13px;color:var(--fg-3);margin-top:2px}
.pn a:hover .t{color:var(--brand)}

/* 總覽專用 */
.tl h2{margin-top:var(--s5)}
.tl .steps .step{display:block}
.tl .step .idx::before{background:transparent;border-color:var(--line-ink)}
.tl .step.ai .idx::before{background:var(--brand);border-color:var(--brand)}
.tl .step .num{font-family:var(--f-en);font-size:clamp(34px,3.2vw,48px);font-weight:700;letter-spacing:-.03em;line-height:1;margin-top:var(--s5);font-feature-settings:"tnum" 1}
.tl .step .en{margin-top:var(--s4)}
.tl .step h3{transition:color .2s}
.tl .step:hover h3{color:var(--brand)}
.tl .step .go{display:block;margin-top:var(--s4);font-family:var(--f-mono);font-size:12px;color:var(--fg-3);letter-spacing:.06em}
.tl .asset{grid-column:1/-1;margin-top:var(--s5);padding-top:var(--s3);border-top:1px solid var(--line-strong);font-family:var(--f-mono);font-size:12px;letter-spacing:.06em;color:var(--fg-3);display:flex;justify-content:space-between;gap:var(--s4);flex-wrap:wrap}
.tl .asset .cjk{font-family:var(--f-cjk);letter-spacing:0;color:var(--fg-2)}
@media (min-width:1000px){.tl .asset{grid-column:2/-1}}
.tl .foot{margin-top:var(--s7);color:var(--fg-2);font-size:15px;max-width:44em}
.modes h2{margin-top:var(--s5)}
.modes .two{margin-top:var(--s7);display:grid;grid-template-columns:1fr;gap:var(--gutter)}
@media (min-width:900px){.modes .two{grid-template-columns:repeat(2,1fr)}}
.modes .m{border-top:1px solid var(--line-ink);padding-top:var(--s5)}
.modes .m .k{font-family:var(--f-mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--brand)}
.modes .m h3{margin-top:var(--s3);font-weight:700;font-size:clamp(20px,1.9vw,26px);letter-spacing:0}
.modes .m .en{display:block;font-family:var(--f-en);font-weight:500;font-size:14px;color:var(--fg-3);margin-top:6px}
.modes .m p{margin-top:var(--s4);font-size:15px;color:var(--fg-2);line-height:1.7}
.modes .m .chain{margin-top:var(--s4);display:flex;flex-wrap:wrap;gap:var(--s2);font-family:var(--f-mono);font-size:12px;letter-spacing:.06em}
.modes .m .chain span{border:1px solid var(--line-strong);padding:3px 8px;color:var(--fg-3)}
.modes .m .chain span.on{border-color:var(--brand);color:var(--brand)}
.modes .cite{margin-top:var(--s7);max-width:44em}
.modes .cite p+p{margin-top:var(--s4)}
.modes .cite .small{margin-top:var(--s4)}
.ai h2{margin-top:var(--s5)}
"""

# ────────────────────────────────────────────────────────────────
# SVG 輔助：monoline、60° 角度族
# ────────────────────────────────────────────────────────────────
S60, C60 = math.sin(math.radians(60)), math.cos(math.radians(60))
def f(v): return ("%.1f" % v).rstrip("0").rstrip(".")
def L(x1,y1,x2,y2,cls="ln"): return f'<line class="{cls}" x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}"/>'
def R(x,y,w,h,cls="ln"): return f'<rect class="{cls}" x="{f(x)}" y="{f(y)}" width="{f(w)}" height="{f(h)}"/>'
def T(x,y,s,cls="tx",anchor="start"): return f'<text class="{cls}" x="{f(x)}" y="{f(y)}" text-anchor="{anchor}">{s}</text>'
def P(pts,cls="ln"): return f'<polyline class="{cls}" points="{" ".join(f(a)+","+f(b) for a,b in pts)}"/>'
def PG(pts,cls="ln"): return f'<polygon class="{cls}" points="{" ".join(f(a)+","+f(b) for a,b in pts)}"/>'
def up60(x,y,dy):   # 往右上 60°，垂直位移 dy → 終點
    Ln = dy / S60; return (x + Ln*C60, y - dy)
def dn60(x,y,dy):   # 往右下 60°
    Ln = dy / S60; return (x + Ln*C60, y + dy)
def tick60(x,y,h=8,cls="ln"):   # 60° 斜向刻度（製圖尺寸線用）
    dx = h*C60/S60; return L(x-dx/2, y+h/2, x+dx/2, y-h/2, cls)
def node(x,y,s=10,cls="ln fx"): return R(x-s/2,y-s/2,s,s,cls)
def hatch_def(pid="h60"):
    w=8.0; h=w*math.tan(math.radians(60))
    return (f'<defs><pattern id="{pid}" patternUnits="userSpaceOnUse" width="{f(w)}" height="{f(h)}">'
            f'<line class="ln ln2" x1="0" y1="{f(h)}" x2="{f(w)}" y2="0"/></pattern></defs>')
def svg(vb_w, vb_h, title_id, title, body):
    return (f'<svg viewBox="0 0 {vb_w} {vb_h}" role="img" aria-labelledby="{title_id}" xmlns="http://www.w3.org/2000/svg">'
            f'<title id="{title_id}">{title}</title>{body}</svg>')

# ── FIG 01 點雲網格 → 平面 ──
def fig_survey():
    b=[hatch_def()]
    # 左：點雲（規則格點，只落在牆帶內）L 形房間
    ox,oy=60,60; W,H=300,240; cut_w,cut_h=120,100  # 右上缺角
    outer=[(ox,oy),(ox+W-cut_w,oy),(ox+W-cut_w,oy+cut_h),(ox+W,oy+cut_h),(ox+W,oy+H),(ox,oy+H)]
    def in_poly(px,py,poly):
        c=False; n=len(poly)
        for i in range(n):
            x1,y1=poly[i]; x2,y2=poly[(i+1)%n]
            if ((y1>py)!=(y2>py)) and (px < (x2-x1)*(py-y1)/(y2-y1+1e-9)+x1): c=not c
        return c
    def near_wall(px,py):
        n=len(outer); best=1e9
        for i in range(n):
            x1,y1=outer[i]; x2,y2=outer[(i+1)%n]
            if x1==x2: d=abs(px-x1) if min(y1,y2)<=py<=max(y1,y2) else 1e9
            else: d=abs(py-y1) if min(x1,x2)<=px<=max(x1,x2) else 1e9
            best=min(best,d)
        return best
    pts=[]
    step=8
    for gx in range(ox-8, ox+W+9, step):
        for gy in range(oy-8, oy+H+9, step):
            d=near_wall(gx,gy)
            if d<=9 and (in_poly(gx,gy,outer) or d<=4):
                pts.append((gx,gy))
    # 柱位點
    for cx,cy in [(ox+90,oy+150),(ox+210,oy+150)]:
        for gx in range(cx-8,cx+9,step):
            for gy in range(cy-8,cy+9,step): pts.append((gx,gy))
    for (x,y) in pts: b.append(R(x-1,y-1,2,2,"fi"))
    b.append(T(ox,oy-22,"SCAN · POINT CLOUD","tx"))
    b.append(T(ox,oy+H+28,"現場丈量 · 既有 CAD／紙本圖","tc"))
    # 中：轉換箭（水平 + 60° 箭頭）
    ax0,ax1,ay=410,520,180
    b.append(L(ax0,ay,ax1,ay,"ln br"))
    # 箭頭以 60°/120° 兩短線構成（L=14：dx=7、dy=12.1）
    b.append(L(ax1,ay,ax1-7, ay-12.1,"ln br")); b.append(L(ax1,ay,ax1-7, ay+12.1,"ln br"))
    b.append(T((ax0+ax1)/2,ay-14,"AI 識圖丈量","tc f","middle"))
    b.append(T((ax0+ax1)/2,ay+24,"CAD → BIM","tx b","middle"))
    # 右：平面（雙線牆、柱、門、尺寸線）
    px,py=560,60; t=6
    outer2=[(px,py),(px+W-cut_w,py),(px+W-cut_w,py+cut_h),(px+W,py+cut_h),(px+W,py+H),(px,py+H)]
    inner2=[(px+t,py+t),(px+W-cut_w-t,py+t),(px+W-cut_w-t,py+cut_h+t),(px+W-t,py+cut_h+t),(px+W-t,py+H-t),(px+t,py+H-t)]
    b.append(PG(outer2)); b.append(PG(inner2))
    # 牆帶 hatch（局部：左牆）
    b.append(f'<rect x="{f(px)}" y="{f(py)}" width="{f(t)}" height="{f(H)}" fill="url(#h60)"/>')
    # 柱
    b.append(R(px+90-8,py+150-8,16,16,"ln")); b.append(R(px+210-8,py+150-8,16,16,"ln fb"))
    # 門：下牆開口 + 60° 門扇
    dx0=px+120; b.append(R(dx0,py+H-t,40,t,"ln fx"));
    ex,ey=up60(dx0,py+H-t,34); b.append(L(dx0,py+H-t,ex,ey,"ln"))
    # 內隔間（0°/90°）
    b.append(L(px+W-cut_w-t,py+cut_h+t+40,px+W-t,py+cut_h+t+40,"ln ln2"))
    b.append(L(px+t,py+120,px+90-8,py+120,"ln ln2"))
    # 尺寸線（上方、右側）含 60° 刻度
    dy_=py-18
    b.append(L(px,dy_,px+W-cut_w,dy_,"ln ln2")); b.append(tick60(px,dy_)); b.append(tick60(px+W-cut_w,dy_))
    b.append(L(px,dy_-6,px,py,"ln ln3")); b.append(L(px+W-cut_w,dy_-6,px+W-cut_w,py,"ln ln3"))
    rx_=px+W+18
    b.append(L(rx_,py+cut_h,rx_,py+H,"ln ln2")); b.append(tick60(rx_,py+cut_h)); b.append(tick60(rx_,py+H))
    b.append(T(px,py-30,"PLAN · BIM BASE","tx"))
    b.append(T(px,py+H+28,"現況模型 · 後續六段共用基準","tc"))
    return svg(960,360,"fig01","現況掃描圖解：左側為現場點雲網格，經 AI 識圖丈量與 CAD 轉 BIM，轉為右側帶尺寸的現況平面與模型基準","".join(x for x in b if x))

# ── FIG 02 一個輸入 → 多組方案 ──
def fig_parametric():
    b=[]
    # 輸入節點
    ix,iy,iw,ih=40,135,220,90
    b.append(R(ix,iy,iw,ih,"ln br"))
    b.append(T(ix+16,iy+26,"INPUT · 條件","tx b"))
    b.append(T(ix+16,iy+50,"人數 80 → 120","tc f"))
    b.append(T(ix+16,iy+72,"面積 · 動線 · 品牌規範","tc"))
    # 分岐：水平到 320，再 0° / ±60°
    sx,sy=320,180
    b.append(L(ix+iw,sy,sx,sy)); b.append(node(sx,sy,8,"ln fb"))
    rows=[60,180,300]; bx=430; bw=270; bh=90
    for i,cy in enumerate(rows):
        if cy==sy: b.append(L(sx,sy,bx,sy))
        elif cy<sy:
            ex,ey=up60(sx,sy,sy-cy); b.append(L(sx,sy,ex,ey)); b.append(L(ex,ey,bx,cy))
        else:
            ex,ey=dn60(sx,sy,cy-sy); b.append(L(sx,sy,ex,ey)); b.append(L(ex,ey,bx,cy))
        y0=cy-bh/2
        b.append(R(bx,y0,bw,bh,"ln"))
        b.append(T(bx+bw+12,cy-2,f"OPTION {'ABC'[i]}","tx f"))
        # 三種配置：A 開放、B 混合、C 隔間
        if i==0:
            for r in range(3):
                for c in range(9):
                    b.append(R(bx+18+c*26,y0+16+r*22,14,10,"ln ln2"))
        elif i==1:
            b.append(L(bx+130,y0,bx+130,y0+bh,"ln"))
            for r in range(3):
                for c in range(4):
                    b.append(R(bx+18+c*26,y0+16+r*22,14,10,"ln ln2"))
            b.append(R(bx+150,y0+14,100,bh-28,"ln ln2"))
            b.append(L(bx+150,y0+bh/2,bx+250,y0+bh/2,"ln ln3"))
        else:
            for c in range(4):
                x=bx+c*(bw/4); b.append(L(x,y0,x,y0+bh,"ln") if c>0 else "")
                b.append(R(x+14,y0+18,bw/4-28,bh-36,"ln ln2"))
    b.append(T(bx+bw+12,rows[0]+16,"座位數 · 會議室數 · 使用率","tc"))
    b.append(T(bx+bw+12,rows[1]+16,"座位數 · 會議室數 · 使用率","tc"))
    b.append(T(bx+bw+12,rows[2]+16,"座位數 · 會議室數 · 使用率","tc"))
    # 右側：同步輸出欄
    ox=900; b.append(L(ox,40,ox,320,"ln ln2"))
    for j,(lab,cy) in enumerate([("PLAN",70),("ELEV",140),("SECT",210),("DATA",280)]):
        b.append(node(ox,cy,8,"ln fx")); b.append(T(ox+12,cy+4,lab,"tx"))
    b.append(T(ox,30,"SYNC","tx b"))
    b.append(T(ox-8,340,"平立剖與數據同步","tc","end"))
    return svg(960,360,"fig02","參數化方案圖解：一組輸入條件（人數、面積、動線、品牌）分岐為多組可比較的空間方案，平面、立面、剖面與數據同步更新","".join(b))

# ── FIG 03 多方案收斂 → 定案節點 → 四項確認；外部意圖接入 ──
def fig_intent():
    b=[]
    ys=[60,180,300]; ox,ow,oh=40,160,70
    nx,ny=420,180
    for i,cy in enumerate(ys):
        y0=cy-oh/2; b.append(R(ox,y0,ow,oh,"ln ln2"))
        b.append(T(ox+12,y0+20,f"OPTION {'ABC'[i]}","tx"))
        for c in range(4): b.append(R(ox+12+c*34,y0+32,22,10,"ln ln3"))
        if cy==ny: b.append(L(ox+ow,cy,nx-12,cy))
        elif cy<ny:
            kx=300; b.append(L(ox+ow,cy,kx,cy)); ex,ey=dn60(kx,cy,ny-cy); b.append(L(kx,cy,ex,ey)); b.append(L(ex,ey,nx-12,ny))
        else:
            kx=300; b.append(L(ox+ow,cy,kx,cy)); ex,ey=up60(kx,cy,cy-ny); b.append(L(kx,cy,ex,ey)); b.append(L(ex,ey,nx-12,ny))
    b.append(R(nx-12,ny-12,24,24,"ln fb"))
    b.append(T(nx,ny-26,"DESIGN INTENT","tx b","middle")); b.append(T(nx,ny+40,"定案","tc f","middle"))
    # 外部意圖：底部虛線 → 60° 上接節點
    ex0,ey0=60,350
    Ln=(ey0-(ny+12))/S60; kx=nx-Ln*C60   # 由節點下緣以 60° 反推轉折點
    b.append(L(ex0,ey0,kx,ey0,"ln br ds")); b.append(L(kx,ey0,nx,ny+12,"ln br ds"))
    b.append(T(ex0,ey0-8,"EXTERNAL DESIGN INTENT → REVIEW","tx b"))
    b.append(T(ex0+240,ey0-8,"外部設計意圖在此接入審閱","tc"))
    # 右：四項確認
    bus=580; b.append(L(nx+12,ny,bus,ny)); b.append(L(bus,60,bus,300,"ln"))
    items=[("GOALS","設計目標",60),("BRAND LANGUAGE","品牌語彙",140),("KEY VISUALS","關鍵視覺",220),("SCENARIOS","使用情境",300)]
    for lab,zh,cy in items:
        b.append(L(bus,cy,bus+30,cy)); b.append(R(bus+30,cy-22,280,44,"ln"))
        b.append(T(bus+46,cy-4,lab,"tx")); b.append(T(bus+46,cy+14,zh,"tc f"))
    b.append(T(bus+30,30,"4 ITEMS CONFIRMED · 四項確認","tx"))
    return svg(960,380,"fig03","設計意圖定案圖解：多組參數化方案收斂為一個定案節點，確認設計目標、品牌語彙、關鍵視覺與使用情境四項；外部設計意圖亦可在同一節點接入審閱","".join(b))

# ── FIG 04 五道檢核閘門；外部意圖自此接手 ──
def fig_validation():
    b=[]
    y=180; x0,x1=60,900
    b.append(L(x0,y,x1,y))
    b.append(R(x0-10,y-10,20,20,"ln fx")); b.append(T(x0-10,y-24,"03 INTENT","tx"))
    b.append(R(x1-10,y-10,20,20,"ln fb")); b.append(T(x1+10,y-24,"05 BIM","tx b","end"))
    gates=[("SCALE","尺度",220),("MATERIAL","材料",360),("CODE","法規",500),("BUDGET","預算",640),("BUILDABILITY","施工可行性",780)]
    for lab,zh,gx in gates:
        b.append(R(gx-8,y-50,16,100,"ln fx"))
        b.append(L(gx-8,y-50,gx+8,y-50,"ln"));
        b.append(T(gx,y-64,lab,"tx","middle")); b.append(T(gx,y+76,zh,"tc f","middle"))
        # 通過刻度：60° 短斜線（品牌色）
        b.append(L(gx+24-4,y-24+7,gx+24+4,y-24-7,"ln br"))
    # 外部接入
    ey0=330; ex0=60
    Ln=(ey0-y)/S60; kx=196-Ln*C60
    b.append(L(ex0,ey0,kx,ey0,"ln br ds")); b.append(L(kx,ey0,196,y,"ln br ds")); b.append(node(196,y,8,"ln fb"))
    b.append(T(ex0,ey0-10,"EXTERNAL DESIGN INTENT · 自此接手","tx b"))
    b.append(T(ex0,ey0+22,"設計意圖來自外部團隊時，惠強自技術驗證接手 · Kimpton 2022","tc"))
    b.append(T(x0,40,"5 CHECKS BEFORE BIM · 五項確認","tx"))
    return svg(960,370,"fig04","技術驗證圖解：定案設計依序通過尺度、材料、法規、預算與施工可行性五道檢核，再進入 BIM 協調；外部設計意圖自此階段接手","".join(b))

# ── FIG 05 三層疊合 + 衝突點 ──
def fig_bim():
    b=[hatch_def()]
    W=460; S=110; dx=S*C60; dy=S*S60   # 60° 側邊
    x0=330
    layers=[("EQUIPMENT","設備",40),("MEP","機電",150),("ARCHITECTURE","建築",260)]
    def para(px,py,w,cls="ln fx"): return PG([(px,py),(px+w,py),(px+w-dx,py+dy),(px-dx,py+dy)],cls)
    def inpt(u,v,px,py):   # 平面內座標 (u 沿水平 0..1, v 沿 60° 0..1) → 畫布
        return (px+u*W - v*dx, py + v*dy)
    for lab,zh,py in layers:
        b.append(para(x0,py,W))
        # 左側標籤引線
        lx=60; b.append(L(lx+120,py+dy/2,x0-dx/2,py+dy/2,"ln ln3"))
        b.append(T(lx,py+dy/2-2,lab,"tx f")); b.append(T(lx,py+dy/2+16,zh,"tc"))
        if lab=="ARCHITECTURE":
            for v in (0.3,0.7):
                a=inpt(0.05,v,x0,py); c=inpt(0.95,v,x0,py); b.append(L(*a,*c,"ln ln2"))
            for u in (0.3,0.6):
                a=inpt(u,0.05,x0,py); c=inpt(u,0.95,x0,py); b.append(L(*a,*c,"ln ln2"))
        elif lab=="MEP":
            for v in (0.42,0.58):
                a=inpt(0.05,v,x0,py); c=inpt(0.95,v,x0,py); b.append(L(*a,*c,"ln"))
            a=inpt(0.5,0.58,x0,py); c=inpt(0.5,0.95,x0,py); b.append(L(*a,*c,"ln"))
            a2=inpt(0.55,0.58,x0,py); c2=inpt(0.55,0.95,x0,py); b.append(L(*a2,*c2,"ln"))
        else:
            for (u,v) in [(0.15,0.3),(0.4,0.3),(0.65,0.3),(0.15,0.65),(0.4,0.65),(0.65,0.65)]:
                p1=inpt(u,v,x0,py); p2=inpt(u+0.12,v,x0,py); p3=inpt(u+0.12,v+0.18,x0,py); p4=inpt(u,v+0.18,x0,py)
                b.append(PG([p1,p2,p3,p4],"ln ln2"))
    # 衝突點：垂直虛線貫穿三層，交 MEP 層處標記
    cx=x0+W*0.5-dx*0.5; b.append(L(cx,30,cx,260+dy+10,"ln br ds"))
    my=150+dy*0.5
    b.append(R(cx-9,my-9,18,18,"ln br fx"))
    # 60°/120° 交叉
    b.append(L(cx-6,my+10.4,cx+6,my-10.4,"ln br")); b.append(L(cx-6,my-10.4,cx+6,my+10.4,"ln br"))
    b.append(L(cx+9,my,cx+60,my,"ln br")); b.append(T(cx+68,my-4,"CLASH · 衝突點","tx b")); b.append(T(cx+68,my+14,"在模型中辨識（進場前）","tc f"))
    # 底：同一套模型
    by=260+dy+34; b.append(L(x0-dx,by,x0+W,by,"ln ln2")); b.append(tick60(x0-dx,by)); b.append(tick60(x0+W,by))
    b.append(T((x0-dx+x0+W)/2,by+18,"ONE MODEL · 同一套模型","tx","middle"))
    return svg(960,440,"fig05","BIM 協調圖解：建築、機電、設備三層在同一套模型中疊合，跨層衝突點在進場前被標記","".join(b))

# ── FIG 06 六步時間軸 → 你會拿到什麼 ──
def fig_docs():
    b=[hatch_def()]
    y=110; x0,x1=60,900; b.append(L(x0,y,x1,y))
    steps=[("01 DETAILING","技術詳圖","節點・收邊・接合","施工順序圖說"),
           ("02 DOCUMENTS","施工文件","平面・立面・剖面","大樣・工序文件"),
           ("03 MATERIALS","材料協調","材料選樣紀錄","供應商・交期表"),
           ("04 MOCK-UP","樣板確認","關鍵區域實體樣板","你在現場確認"),
           ("05 SITE QC","現場品管","品質查核紀錄","進度・安全管理"),
           ("06 HANDOVER","竣工交付","竣工圖・操作手冊","保固書・驗收文件")]
    for i,(lab,zh,l1,l2) in enumerate(steps):
        gx=110+i*150; last=(i==len(steps)-1)
        b.append(node(gx,y,10,"ln fb" if last else "ln fx"))
        b.append(T(gx,y-40,lab,"tx b" if last else "tx","middle")); b.append(T(gx,y-22,zh,"tc f","middle"))
        b.append(L(gx,y+5,gx,y+40,"ln ln2"))
        bw,bh=124,72; bx=gx-bw/2; by=y+40
        if last: b.append(f'<rect x="{f(bx)}" y="{f(by)}" width="{f(bw)}" height="{f(bh)}" fill="url(#h60)"/>')
        b.append(R(bx,by,bw,bh,"ln br" if last else "ln"))
        b.append(f'<rect class="fx" x="{f(bx+6)}" y="{f(by+16)}" width="{f(bw-12)}" height="{f(44)}"/>' if last else "")
        b.append(T(gx,by+32,l1,"tc","middle")); b.append(T(gx,by+52,l2,"tc","middle"))
    b.append(T(x0,y+40+72+34,"YOU RECEIVE · 你會拿到","tx"))
    b.append(T(x0,40,"6 STEPS · 施工深化六步","tx"))
    return svg(960,290,"fig06","施工圖說圖解：技術詳圖、施工文件、材料協調、樣板確認、現場品管到竣工交付六步，各步對應業主實際拿到的文件","".join(x for x in b if x))

# ── FIG 07 分區施工 + 營運不中斷 ──
def fig_delivery():
    b=[hatch_def()]
    # 左：樓板四分區
    px,py,W,H=40,50,380,260
    b.append(R(px,py,W,H))
    b.append(L(px+W/2,py,px+W/2,py+H)); b.append(L(px,py+H/2,px+W,py+H/2))
    zones=[("Z1",px,py),("Z2",px+W/2,py),("Z3",px,py+H/2),("Z4",px+W/2,py+H/2)]
    for i,(z,zx,zy) in enumerate(zones):
        if z=="Z2":
            b.append(f'<rect x="{f(zx)}" y="{f(zy)}" width="{f(W/2)}" height="{f(H/2)}" fill="url(#h60)"/>')
            b.append(T(zx+14,zy+24,z+" · 施工中","tc f"))
        else:
            b.append(T(zx+14,zy+24,z+" · 營運中","tc"))
            for r in range(3):
                for c in range(5):
                    b.append(R(zx+24+c*30,zy+44+r*26,16,9,"ln ln3"))
    b.append(T(px,py-16,"FLOOR PLATE · 分區施工","tx"))
    b.append(T(px,py+H+26,"施工區隔 · 非核心時段進料 · 安全動線","tc"))
    # 右：時程（60° 端點平行四邊形）與營運線
    gx0,gx1=500,900; rows=[("Z1",80),("Z2",140),("Z3",200),("Z4",260)]
    b.append(L(gx0,40,gx0,300,"ln ln2"))
    for k in range(5):
        tx=gx0+k*100; b.append(L(tx,300,tx,306,"ln ln2")); b.append(T(tx,322,f"T{k}","tx","middle"))
    d=8*C60/S60  # 60° 斜端水平位移
    for i,(z,cy) in enumerate(rows):
        bx=gx0+i*100; bw=100; h=16
        pts=[(bx+d,cy-h/2),(bx+bw+d,cy-h/2),(bx+bw-d,cy+h/2),(bx-d,cy+h/2)]
        b.append(f'<polygon points="{" ".join(f(a)+","+f(c) for a,c in pts)}" fill="url(#h60)"/>')
        b.append(PG(pts,"ln"))
        b.append(T(gx0-12,cy+4,z,"tx","end"))
    oy=290; b.append(L(gx0,oy,gx1,oy,"ln br")); b.append(node(gx0,oy,8,"ln fb")); b.append(node(gx1,oy,8,"ln fb"))
    b.append(T(gx1,oy-10,"OPERATION · 營運持續","tx b","end"))
    b.append(T(gx0,24,"PHASED SCHEDULE · 分期時程","tx"))
    return svg(960,350,"fig07","交付圖解：左側樓板分四區輪替施工，右側時程顯示各區依序進場，而營運線在整個工期中持續不中斷","".join(b))

# ── FIG 00 總覽：七段軸 + 兩種委任模式 ──
def fig_modes():
    b=[]
    y=150; x0,x1=80,920; b.append(L(x0,y,x1,y))
    for i,s in enumerate(STAGES):
        gx=120+i*130; ai=bool(s["tag"])
        b.append(node(gx,y,12,"ln fb" if ai else "ln fx"))
        b.append(T(gx,y-30,s["idx"],"tx f","middle")); b.append(T(gx,y-48,s["zh"],"tc","middle"))
        if ai: b.append(T(gx,y+34,s["tag"].upper(),"tx b","middle"))
    # 模式 A：主線起點
    b.append(T(x0,y-92,"A · FULL DESIGN & BUILD","tx b")); b.append(T(x0,y-74,"全案設計施工 · 自 01 現況掃描開始","tc"))
    b.append(L(x0,y-64,x0,y,"ln br")); b.append(node(x0,y,8,"ln fb"))
    # 模式 B：由下方虛線 60° 上接 04
    n4=120+3*130; ey0=270
    Ln=(ey0-y)/S60; kx=n4-Ln*C60
    b.append(L(x0,ey0,kx,ey0,"ln br ds")); b.append(L(kx,ey0,n4,y,"ln br ds")); b.append(node(x0,ey0,8,"ln fb"))
    b.append(T(x0,ey0+28,"B · TECHNICAL PARTNER","tx b")); b.append(T(x0,ey0+46,"設計意圖來自外部團隊 · 自 04 技術驗證接手 · Kimpton 2022","tc"))
    return svg(960,330,"fig00","兩種委任模式圖解：全案設計施工自 01 現況掃描起沿七段主線進行；設計意圖來自外部團隊時，自 04 技術驗證接入主線","".join(b))

# ────────────────────────────────────────────────────────────────
# 內容
# ────────────────────────────────────────────────────────────────
KIMPTON = {"href":"/work/kimpton/","t":"金普頓大安酒店 Kimpton","en":"Hospitality · Public Areas Construction",
           "d":"TAIPEI DA'AN · <b>2022</b>","claim_t":"外部設計意圖接手（第二委任模式）",
           "claim":"設計意圖來自外部團隊，惠強承攬公共區域與客房走廊施工，自技術驗證起負責把設計品質建造出來並可被驗收。",
           "mode":"委任模式說明 · 非 AI 流程證據"}
SECOM = {"href":"/work/secom-nangang-complex/","t":"中興保全 SECOM 南港總部","en":"Corporate HQ · Full Design &amp; Build",
         "d":"NANGANG · <b>5,940</b> sqm · <b>2025</b>"}

CONTENT = {
"site-survey": dict(
  title="現況掃描｜AI 識圖丈量與 CAD 轉 BIM｜惠強 HQ Design",
  desc="現場和舊圖不一樣，誰來量？惠強以 AI 識圖丈量與 CAD→BIM 建立現況模型，作為後續六段共用的基準；2026 年 4 月起導入。了解你需要準備什麼。",
  h1="進場前，我們先量清楚什麼？",
  lede="現況量清楚一次，後續六段都以同一份基準運算；舊圖與現場的落差在進場前被看見。",
  gloss="Site Survey — AI-assisted measurement from existing drawings and site data; CAD converted to a BIM base model.",
  inp="既有建築／裝修圖（CAD 或紙本）、現場進入時段與大樓管制條件、營運中區域的範圍。",
  out="現況 BIM 模型與現況平面；後續參數化方案、BIM 協調與施工圖說共用的基準檔。",
  q="現場和舊圖不一樣，重新丈量要多久、要我準備什麼？",
  quote="惠強室內裝修（HQ Design）在現況掃描階段，以 AI 識圖丈量讀取既有 CAD 或紙本圖面與現場量測資料，並將 CAD 圖轉為 BIM 現況模型，作為七段流程中後續六段共用的運算基準。AI 識圖丈量與 CAD→BIM 兩項自 2026 年 4 月起導入。",
  quote2="業主端只需提供既有圖面與現場進入條件；辨識牆、柱、開口、設備位置與建立模型由惠強完成。",
  qen="Owners provide existing drawings and site access; HQ Design reads them with AI-assisted measurement and builds the BIM base that every later stage shares.",
  how_h2="惠強室內裝修在現況掃描階段做哪三件事？",
  how=[
    ("AI Recognition","AI 識圖丈量","讀取既有 CAD／紙本圖與現場量測資料，辨識牆、柱、開口與設備位置，減少人工逐點抄繪。",
     "2026 年 4 月導入項目之一（公司簡介 Milestones），與 CAD→BIM、參數化多方案、BIM 報價整合並列四項。"),
    ("CAD → BIM","二維圖面轉三維模型","將二維現況圖轉為帶尺寸與屬性的 BIM 模型：牆體、樓板、開口與機電幹管位置一次建立。",
     "同一模型延用至 05 BIM 協調與 06 施工圖說——七段中有 <b>3 段</b>直接共用此基準。"),
    ("Site Conditions","現地條件建檔","記錄大樓管制、進料動線、營運時段與保全要求，作為後續分區施工計畫的前提。",
     "2025 年 SECOM 南港總部 <b>5,940 sqm</b> 於營運中總部施工，進場前即建立施工區隔、非核心時段進料與安全動線條件。"),
  ],
  fig=fig_survey, fig_lab="FIG · 01",
  cap=["SCAN → PLAN","<span class='cjk'>點雲網格經 AI 識圖丈量與 CAD→BIM，轉為帶尺寸線的現況平面；品牌色標示的柱位為模型中被保留的既有結構。</span>"],
  why_h2="現況掃描對業主的意義是什麼？",
  why=[("Single Baseline","後續每一段都以同一份現況為準","平面、立面、剖面與報價數據來自同一套模型，不再各自維護。"),
       ("Earlier Visibility","舊圖與現場的落差在進場前被看見","問題不在拆除後才發現，返工與工期風險不由業主承擔。"),
       ("Low Effort","你只需提供既有圖與進場條件","辨識、建模與現地條件建檔由惠強完成。")],
  ev_h2="有哪些案件可以對照？",
  ev=[], ev_none="<b>目前尚無可公開引用的階段證據。</b>AI 識圖丈量與 CAD→BIM 自 2026 年 4 月起導入；2024 年前完成之案件不列為本階段的 AI 流程證據，以免誤導。首批以此流程完成並驗收的案件將補列於此。",
),
"parametric": dict(
  title="參數化設計 室內｜一個條件改變，整套空間同步更新｜惠強 HQ Design",
  desc="人數從 80 變 120，方案要重畫多久？惠強以參數化設計讓一個條件改變、整套空間同步更新：多方案可比較、平立剖與數據同步。看它怎麼運作。",
  h1="改一次條件，要重畫幾次圖？",
  lede="條件改一次，方案與圖面一起更新，不必從頭重畫。人做決策，系統做運算。",
  gloss="Parametric Design — one change, multiple verified options. Plans, elevations, sections and data update together.",
  inp="使用人數與成長預估、面積與樓層條件、部門關係與動線需求、品牌規範。",
  out="多組可比較的空間方案，各附座位數、會議室數與面積使用率等數據；供 03 設計意圖定案選定。",
  q="如果人數從 80 變 120，方案要重畫多久？",
  quote="惠強室內裝修（HQ Design）在參數化方案階段，以人數、尺寸、動線與品牌條件作為輸入，由系統重新運算並產出多組可比較的空間方案；條件改變時，平面、立面、剖面與相關數據同步更新，不需從頭重畫。參數化多方案自 2026 年 4 月起導入。",
  quote2="一般設計流程為單一方案、改一次重畫一次；參數化流程讓同一份需求可在多種使用情境下快速驗證，品牌特徵成為可複製的空間系統。",
  qen="When headcount, dimensions, circulation or brand rules change, the system recalculates the options and keeps spatial and design rules consistent — instead of redrawing from scratch.",
  how_h2="惠強室內裝修在參數化方案階段做哪四件事？",
  how=[
    ("Inputs","條件即輸入","人數、尺寸、動線、品牌規範不是註記在圖上的文字，而是驅動方案的參數。",
     "公司簡介 Parametric Advantage：「人數、尺寸、動線或品牌需求調整時，不必從頭重畫；系統可即時重新運算。」"),
    ("Options","多方案運算與比較","同一份需求產出多組配置，每組附座位數、會議室數、面積使用率等數據，讓業主用數字比較而非憑感覺。",
     "對照一般流程的「單一方案，改一次重畫一次」（公司簡介 The Difference 對照表）。"),
    ("Sync","平立剖與數據同步","方案變更延伸至相關圖面與數據；平面、立面、剖面與報價依據來自同一套模型。",
     "與 05 BIM 協調的「BIM 報價整合」共用同一模型（2026 年 4 月導入項目）。"),
    ("Human-led","人做決策，系統做運算","設計團隊掌握方向與判斷，AI 與規則負責加速推演與一致性。",
     "規則來源為惠強 <b>30 年</b>、<b>1,600+</b> 件商業空間案件的設計決策與材料工法紀錄。"),
  ],
  fig=fig_parametric, fig_lab="FIG · 02",
  cap=["INPUT → OPTIONS → SYNC","<span class='cjk'>一組輸入條件分岐為三組可比較方案（開放、混合、隔間），每組以座位數、會議室數與面積使用率比較；右側為同步更新的平面、立面、剖面與數據。示意圖，不含特定案件數值。</span>"],
  why_h2="參數化方案對業主的意義是什麼？",
  why=[("More Options, Less Waiting","多方案，不必多等待","調整輸入條件即可快速比較方案。"),
       ("Synchronized Outputs","平立剖與數據同步","方案變更可延伸至相關圖面與數據。"),
       ("Human-led, System-assisted","人做決策，系統做運算","設計團隊掌握方向，AI 與規則加速推演。")],
  ev_h2="有哪些案件可以對照？",
  ev=[], ev_none="<b>目前尚無可公開引用的階段證據。</b>參數化多方案自 2026 年 4 月起導入；本頁不列 2024 年前完成之案件，也不陳述尚未統計的方案數與改版工時。首批以此流程完成的案件將補列方案比較數。",
),
"design-intent": dict(
  title="設計意圖定案｜Design Intent Review｜惠強 HQ Design",
  desc="這個階段你要決定什麼？設計意圖定案確認設計目標、品牌語彙、關鍵視覺與使用情境四項；外部設計意圖也在此接入審閱。了解你要拍板的四件事。",
  h1="這個階段你要決定什麼？",
  lede="你在這裡拍板四件事：設計目標、品牌語彙、關鍵視覺、使用情境。定案後的每一段都以此為對照。",
  gloss="Design Intent — goals, brand language, key visuals and use scenarios confirmed; the reference every later stage is checked against.",
  inp="你對參數化方案的選擇與取捨、品牌規範、營運情境與未來成長預估。",
  out="定案設計意圖文件（設計目標、品牌語彙、關鍵視覺、使用情境四項），交 04 技術驗證。",
  q="方案這麼多，我要在什麼時候、憑什麼定案？",
  quote="惠強室內裝修（HQ Design）在設計意圖定案階段確認四項：設計目標、品牌語彙、關鍵視覺與使用情境。全案設計施工模式下，業主自參數化方案中選定並在此定案；設計意圖來自外部團隊時，同一節點改為設計意圖審閱（Design Intent Review），惠強自此理解設計目標後接手技術執行。",
  quote2="定案的設計意圖是後續技術驗證、BIM 協調、施工圖說與交付的共同對照，也是「設計意圖可被建造」的起點。",
  qen="Design Intent Review: understand design goals, brand language, key visuals and use scenarios — the same node whether the intent is produced in-house or received from an external design team.",
  how_h2="設計意圖定案要確認哪四件事？",
  how=[
    ("Goals","設計目標","空間要解決什麼：人數、協作模式、營運效率或品牌體驗——用可驗證的條件寫下來，而非形容詞。",
     "公司簡介協作流程 01 Design Intent Review：「理解設計目標、品牌語彙、關鍵視覺與使用情境」四項。"),
    ("Brand Language","品牌語彙","材料、比例、識別系統如何落地為空間規則，讓連鎖或多據點可複製。",
     "「品牌特徵成為可複製的空間系統」（公司簡介 AI Advantage）。"),
    ("Key Visuals","關鍵視覺","接待、主要動線與代表性場景的視覺定案，作為完工後對照的依據。",
     "完工實景以「AS-BUILT」標示，與設計階段視覺分開標註，供業主自行比對。"),
    ("Scenarios","使用情境","日常、尖峰、活動與成長後的使用情境，決定彈性配置的邊界。",
     "「同一需求可快速驗證多種使用情境」（公司簡介 AI Advantage）。"),
  ],
  fig=fig_intent, fig_lab="FIG · 03",
  cap=["OPTIONS → INTENT → 4 ITEMS","<span class='cjk'>多組方案收斂為一個定案節點，展開為四項確認；底部虛線為外部設計意圖接入審閱的路徑（第二委任模式）。</span>"],
  why_h2="設計意圖定案對業主的意義是什麼？",
  why=[("Reference Point","後續每一段都以此為對照","技術驗證、BIM 協調與施工圖說都對照同一份定案意圖，設計品質可被建造、可被驗收。"),
       ("Reusable System","品牌特徵成為可複製的空間系統","定案的語彙與規則可延伸至其他據點，不必每次重新定義。"),
       ("Open Entry","外部設計也能在此接入","設計已由其他團隊完成時，惠強在同一節點審閱意圖，自技術驗證接手。")],
  ev_h2="有哪些案件可以對照？",
  ev=[KIMPTON],
  ev_foot="金普頓大安酒店（2022）在此僅說明「外部設計意圖接入審閱」的委任模式，不作為參數化或 AI 流程的證據。",
),
"technical-validation": dict(
  title="技術驗證｜尺度、材料、法規與施工可行性｜惠強 HQ Design",
  desc="方案能不能蓋，什麼時候知道？技術驗證確認尺度、材料、法規、預算與施工可行性五項；100% 設計施工一體，驗證者就是施工者。外部設計自此接手。",
  h1="方案能不能蓋，什麼時候知道？",
  lede="能不能蓋、多少錢、合不合法，在進入 BIM 與施工圖之前確認，而不是在工地。",
  gloss="Technical Validation — dimensions, materials, regulations, budget and construction feasibility confirmed before BIM coordination.",
  inp="定案設計意圖（惠強產出或外部團隊提供）、預算範圍、大樓規範與消防／機電既有條件。",
  out="五項驗證結論（尺度、材料、法規、預算、施工可行性）與需調整項目清單，交 05 BIM 協調。",
  q="設計圖很漂亮，但預算、法規和現場真的做得到嗎？",
  quote="惠強室內裝修（HQ Design）在技術驗證階段確認五項：尺度、材料、法規、預算與施工可行性。惠強設計與施工 100% 由同一團隊完成，執行驗證的即是之後進場施工的團隊。設計意圖來自外部團隊時，惠強自此階段接手；2022 年金普頓大安酒店公共區域與客房走廊施工即為此模式。",
  quote2="一般流程中「問題常在現場才被發現」；技術驗證把可行性、預算與法規的判斷提前到施工圖之前。",
  qen="Confirm dimensions, materials, regulations, budget and construction feasibility. Because HQ Design builds what it designs, the team validating is the team that will build.",
  how_h2="惠強室內裝修在技術驗證階段確認哪五項？",
  how=[
    ("Scale &amp; Material","尺度與材料","關鍵尺寸、淨高、材料規格與接合方式是否成立；材料工法對照既有案件紀錄。",
     "材料工法為惠強 AI 可用資料庫的六類內容之一（設計決策、材料工法、估價與發包、施工節點、品質管理、風險控管）。"),
    ("Code","法規","建築、機電、消防與設備界面的法規與大樓規範核對，需要調整的項目在此列出。",
     "服務項目「機電消防整合」：建築、機電、消防與設備界面協調。"),
    ("Budget","預算","以模型與材料清單對照預算範圍，取捨在定案後、施工圖前完成。",
     "BIM 報價整合為 2026 年 4 月導入項目；估價與發包紀錄為資料庫內容之一。"),
    ("Buildability","施工可行性","施工順序、分區與營運限制是否可執行——由之後進場的工程團隊判斷。",
     "惠強設計施工 <b>100%</b> 一體化：驗證者就是施工者。"),
  ],
  fig=fig_validation, fig_lab="FIG · 04",
  cap=["03 INTENT → 5 CHECKS → 05 BIM","<span class='cjk'>定案設計依序通過五道檢核閘門；左下虛線為外部設計意圖自此接手的路徑（金普頓大安酒店，2022）。</span>"],
  why_h2="技術驗證對業主的意義是什麼？",
  why=[("Before Site","問題在進場前被看見","可行性、預算與法規的取捨在施工圖之前完成，不在工地。"),
       ("Same Team","驗證者就是施工者","100% 設計施工一體，判斷「做得到」的人就是之後做的人。"),
       ("Aligned Budget","預算依據與模型一致","模型、圖面與報價依據更容易維持一致。")],
  ev_h2="有哪些案件可以對照？",
  ev=[KIMPTON],
  ev_foot="金普頓大安酒店（2022）為「外部設計意圖自技術驗證接手」的委任模式證據，不作為 AI 流程證據；2024 年前完成之案件不列為 AI 流程證據。",
),
"bim": dict(
  title="BIM 室內裝修協調｜衝突在模型裡被找到，不在工地｜惠強 HQ Design",
  desc="撞管誰付錢？惠強在 BIM 協調階段把建築、機電、設備與現場條件整合於同一套模型，衝突在進場前辨識而非在工地發現。了解整合對象與你拿到什麼。",
  h1="撞管誰付錢？何時發現？",
  lede="衝突在模型裡被找到，不在工地被找到。設計、機電、設備與現場條件先在同一套模型中整合。",
  gloss="BIM Coordination — architecture, MEP, equipment and site conditions integrated in one model; clashes identified before construction.",
  inp="定案設計與技術驗證結論、機電／消防／IT／保全等指定廠商圖面、大樓既有系統資料。",
  out="整合後的 BIM 模型、衝突清單與解決方案、與模型一致的報價依據，交 06 施工圖說。",
  q="進場後才發現風管撞到樑、灑水頭撞到燈，誰付錢、誰延誤？",
  quote="惠強室內裝修（HQ Design）在 BIM 協調階段將建築、機電、設備與現場條件整合於同一套模型，使跨專業衝突在進場前被辨識，而非在工地被發現。CAD→BIM 與 BIM 報價整合兩項自 2026 年 4 月起導入。",
  quote2="一般流程中問題常在現場才被發現，返工與工期風險由業主承擔；BIM 協調把發現階段提前到進場前，模型、圖面與報價依據也更容易維持一致。",
  qen="Design, MEP, equipment and site conditions are coordinated in one model, so conflicts surface early — reducing rework and information gaps.",
  how_h2="惠強室內裝修在 BIM 協調階段做哪四件事？",
  how=[
    ("One Model","同一套模型","建築、機電、設備與專業界面整合於同一套模型，而非各自維護的圖面。",
     "整合對象 <b>4</b> 類：建築、機電（MEP）、設備、專業界面（公司簡介協作流程 03 BIM Coordination）。"),
    ("Clash Detection","預先辨識衝突","風管與樑、灑水頭與燈具、設備與淨高等衝突在模型中標記並解決。",
     "發現階段：進場前。對照一般流程「問題常在現場才被發現」（公司簡介 The Difference）。"),
    ("Interfaces","專業廠商對接","建築、機電、IT／保全與業主指定廠商的界面在模型中協調，責任邊界在施工前釐清。",
     "2025 年 SECOM 南港總部 <b>5,940 sqm</b>：高度保全需求的企業總部，保全與營運系統界面於施工前協調。"),
    ("Quantities","BIM 報價整合","報價依據由模型而來，模型改、數量改、報價改，三者一致。",
     "2026 年 4 月導入項目之一，與 CAD→BIM、參數化多方案並列。"),
  ],
  fig=fig_bim, fig_lab="FIG · 05",
  cap=["3 LAYERS · 1 MODEL","<span class='cjk'>建築、機電、設備三層在同一套模型中疊合；貫穿三層的虛線於機電層標記衝突點——在模型中辨識，而非在工地。示意圖，不含特定案件衝突數。</span>"],
  why_h2="BIM 協調對業主的意義是什麼？",
  why=[("Buildable Design Intent","設計意圖可被建造","細節與責任界面在施工前被釐清。"),
       ("Less Rework","減少返工","跨專業衝突可在進場前被發現。"),
       ("Aligned Information","資訊更一致","模型、圖面與報價依據更容易維持一致。")],
  ev_h2="有哪些案件可以對照？",
  ev=[dict(SECOM, claim_t="技術協調：建築、機電、IT／保全與指定廠商界面",
           claim="在持續營運且具高度保全需求的企業總部中，協調施工區隔、保全與營運系統界面，完成接待、開放辦公、會議與主管空間的整合翻新；零重大缺失驗收。",
           mode="完工實景 · AS-BUILT · 2025")],
  ev_foot="本頁不列出具名案件的衝突計數；惠強尚未公開該統計，將於整理後補列，而非以推估數字取代。",
),
"construction-docs": dict(
  title="施工圖說與深化設計｜你會拿到的完整文件｜惠強 HQ Design",
  desc="完工時你手上會有什麼？施工圖說階段依六步深化：技術詳圖到竣工交付，業主最終取得竣工圖、操作手冊、保固書與驗收文件四類。看完整清單。",
  h1="完工時你手上會有什麼？",
  lede="你收到的不只是完工，是可稽核的一整套文件：竣工圖、操作手冊、保固書、驗收文件。",
  gloss="Construction Documentation — six steps from technical detailing to handover; what you receive at each step.",
  inp="整合後的 BIM 模型與衝突解決結論、材料選樣的最終決定、關鍵區域的樣板確認。",
  out="施工圖說全套（平面、立面、剖面、大樣、工序）、樣板確認紀錄；完工後取得竣工圖、操作手冊、保固書與驗收文件。",
  q="這疊圖跟我有什麼關係？完工後我拿到的是什麼？",
  quote="惠強室內裝修（HQ Design）在施工圖說階段依六個步驟深化：技術詳圖、施工文件、材料協調、樣板確認、現場品管、竣工交付。業主最終收到四類文件：竣工圖、操作手冊、保固書與驗收文件。",
  quote2="施工圖說是現場執行的依據：節點、收邊、材料接合與施工順序在圖上定案，關鍵區域先做實體樣板確認再施作。",
  qen="Six steps — technical detailing, construction documentation, material coordination, mock-up verification, site quality control and handover documentation — each with a deliverable you receive.",
  how_h2="施工深化六步，各步你會拿到什麼？",
  how=[
    ("Steps 01–02","技術詳圖與施工文件","節點、收邊、材料接合與施工順序圖說；平面、立面、剖面、大樣與工序文件——現場執行的依據。",
     "公司簡介施工深化六步之 01 Technical Detailing、02 Construction Documentation。"),
    ("Steps 03–04","材料協調與樣板確認","材料選樣、供應商確認與交期管控；關鍵區域製作實體樣板，由你在現場確認後才施作。",
     "六步之 03 Material Coordination、04 Mock-up Verification：「關鍵區域實體樣板製作與確認」。"),
    ("Steps 05–06","現場品管與竣工交付","品質查核、進度追蹤與安全管理紀錄；完工時交付竣工圖、操作手冊、保固書與驗收文件。",
     "六步之 05 Site Quality Control、06 Handover Documentation；最終文件 <b>4</b> 類。"),
  ],
  fig=fig_docs, fig_lab="FIG · 06",
  cap=["6 STEPS → YOU RECEIVE","<span class='cjk'>六步時間軸，每步下方為業主實際拿到的文件；末端竣工交付以品牌色與 60° 網線標示四類文件。</span>"],
  why_h2="施工圖說對業主的意義是什麼？",
  why=[("Auditable Set","可稽核的一整套文件","竣工圖、操作手冊、保固書與驗收文件，營運與後續維護有據可查。"),
       ("Mock-up First","樣板先確認再施作","關鍵區域以實體樣板確認，減少完工後的認知落差。"),
       ("Site Reference","圖說即現場執行依據","節點、收邊與工序在圖上定案，現場不憑口頭。")],
  ev_h2="有哪些案件可以對照？",
  ev=[dict(SECOM, claim_t="品質驗收移交",
           claim="如期完成交付，並達成零重大缺失驗收；竣工圖、操作手冊、保固書與驗收文件隨移交提供。",
           mode="完工實景 · AS-BUILT · 2025")],
  ev_foot="2024 年前完成之案件不列為本階段證據。",
),
"delivery": dict(
  title="交付與 AI 專案管理｜營運不中斷的分區施工｜惠強 HQ Design",
  desc="施工期間營運會停嗎？惠強 2025 年完成 SECOM 南港總部 5,940 sqm：分區施工、營運不中斷、零重大缺失驗收。AI 專案管理試行中。",
  h1="施工期間營運會停嗎？",
  lede="分區進場、營運不中斷地完成，如期驗收移交。單一合約、單一窗口對業主負責。",
  gloss="Site Delivery &amp; AI PM — phased construction, quality control, acceptance, as-built documents and warranty under one accountable team.",
  inp="營運時段與管制條件、保全／IT 規範、業主指定廠商窗口、驗收與移交的時程要求。",
  out="分區施工計畫、品質與進度紀錄、驗收與竣工文件、保固服務；單一窗口對業主負責。",
  q="總部一邊上班一邊施工，做得到嗎？誰來協調保全、進料和動線？",
  quote="惠強室內裝修（HQ Design）於 2025 年完成中興保全 SECOM 南港總部 5,940 sqm 全案設計施工：在持續營運且具高度保全需求的企業總部中分區施工，協調施工區隔、非核心時段進料與安全動線，維持日常營運不中斷，如期交付並達成零重大缺失驗收。",
  quote2="惠強室內裝修（HQ Design）正將 30 年的施工節點、品質管理與風險控管紀錄整理為 AI 可用的資料庫，作為專案管理的依據；AI 專案管理自 2026 年 4 月起導入，目前為試行階段，本頁不陳述其成效數字。",
  qen="Phased site works keep the client's operations running; quality control, schedule coordination, acceptance and as-built handover are delivered by the same team that designed the space.",
  how_h2="惠強室內裝修在交付階段做哪四件事？",
  how=[
    ("Phased Construction","分區施工","樓層與區域分期進場，維持企業日常營運、人員通行與工作連續性。",
     "2025 年 SECOM 南港總部 <b>5,940 sqm</b>，於營運中總部分區完成接待、開放辦公、會議與主管空間翻新。"),
    ("Security &amp; Operations","保全與營運整合","協調施工區隔、非核心時段進料與安全動線；建築、機電、IT／保全與指定廠商由同一窗口對接。",
     "SECOM 為具高度保全需求的企業總部；技術協調範圍見服務項目 04 Technical Coordination。"),
    ("Quality Handover","品質驗收移交","品質管控、進度協調、驗收、竣工文件與保固——單一合約、單一窗口對業主負責。",
     "SECOM 南港總部如期完成交付，<b>零重大缺失</b>驗收。"),
    ("AI PM · Pilot","AI 專案管理（試行中）","把 30 年的施工節點、品質管理與風險控管紀錄整理為 AI 可用資料庫，供進度、變更與風險判斷參考。",
     "2026 年 4 月起導入，目前為試行階段；成效數字待首批案件完成後再公開，不預先陳述。"),
  ],
  fig=fig_delivery, fig_lab="FIG · 07",
  cap=["PHASED · OPERATION CONTINUES","<span class='cjk'>左：樓板分四區輪替施工（60° 網線為施工中區域，其餘維持營運）；右：各區依序進場的分期時程，底部品牌色線為整個工期中持續的營運。示意圖。</span>"],
  why_h2="交付與專案管理對業主的意義是什麼？",
  why=[("Operations Continue","營運不中斷","分區進場維持日常營運、人員通行與工作連續性。"),
       ("One Contract","單一合約，單一窗口","設計、專案、技術與現場由同一團隊統籌，對業主負責的只有一個窗口。"),
       ("Complete Handover","驗收移交完整文件","竣工圖、操作手冊、保固書與驗收文件。")],
  ev_h2="有哪些案件可以對照？",
  ev=[dict(SECOM, claim_t="分區施工 · 營運不中斷 · 零重大缺失驗收",
           claim="在持續營運且具高度保全需求的企業總部中，以分區施工完成接待、開放辦公、會議與主管空間的整合翻新——維持日常營運不中斷，如期交付，零重大缺失驗收。",
           mode="完工實景 · AS-BUILT · 2025")],
  ev_foot="AI 專案管理自 2026 年 4 月起試行，SECOM（2025）為分區施工與驗收移交的證據，不作為 AI 專案管理的成效證據。",
),
}

# ────────────────────────────────────────────────────────────────
# 版型
# ────────────────────────────────────────────────────────────────
def head(title, desc, path, og_image=None, jsonld=None):
    url = BASE + path
    og_img = f'<meta property="og:image" content="{BASE}{og_image}">\n' if og_image else ""
    return f"""<!DOCTYPE html>
<html lang="zh-TW">
<head>
{HEAD_PARTIAL.rstrip()}
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="zh_TW">
<meta property="og:site_name" content="惠強室內裝修 HQ Design">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
{og_img}<meta name="twitter:card" content="summary">
<script type="application/ld+json">{json.dumps(jsonld, ensure_ascii=False)}</script>
<style>{CSS}</style>
</head>
<body>
"""

def jsonld_page(title, desc, path, crumbs):
    url = BASE + path
    return {"@context":"https://schema.org","@graph":[
        {"@type":"WebPage","@id":url,"url":url,"name":title,"description":desc,"inLanguage":"zh-TW",
         "isPartOf":{"@id":BASE+"/#website"},"publisher":{"@id":BASE+"/#org"}},
        {"@type":"BreadcrumbList","itemListElement":[
            {"@type":"ListItem","position":i+1,"name":n,"item":BASE+p} for i,(n,p) in enumerate(crumbs)]}]}

def rail(current=None):
    a=[]
    for s in STAGES:
        on=' class="on"' if s["slug"]==current else ""
        a.append(f'<a{on} href="/process/{s["slug"]}/">{s["idx"]}<span> {s["zh"]}</span></a>')
    return '<div class="wrap"><nav class="rail" aria-label="七段流程">'+"".join(a)+'</nav></div>\n'

def cta():
    return """<section class="cta hair" id="contact">
  <div class="wrap">
    <div class="grid">
      <div class="l">
        <div class="eyebrow"><span class="n">→</span><span>Start a Project</span></div>
        <h2 class="cjk">告訴我們人數、面積、時程與營運限制。</h2>
        <p class="lede cjk">第一次提案就帶著多組參數化方案與可建造性的初步驗證來。設計已定案、只找執行夥伴，也從第 04 段開始談。</p>
      </div>
      <div class="r">
        <a class="btn" href="/contact/">洽詢專案 <span class="ar">→</span></a>
        <a class="btn ghost" href="/process/">回流程總覽 <span class="ar">→</span></a>
        <p class="small mono">TAIPEI, TAIWAN · EST. 1995</p>
      </div>
    </div>
  </div>
</section>
"""

def stage_page(slug):
    s=BY_SLUG[slug]; c=CONTENT[slug]; i=STAGES.index(s)
    prev_=STAGES[i-1] if i>0 else None; next_=STAGES[i+1] if i<len(STAGES)-1 else None
    path=f"/process/{slug}/"
    tag=f' · {s["tag"].upper()}' if s["tag"] else ""
    jl=jsonld_page(c["title"],c["desc"],path,[("首頁","/"),("設計流程","/process/"),(f'{s["idx"]} {s["zh"]}',path)])
    og_img="/assets/img/work/secom-nangang-complex/secom-nangang-complex-hero-01.jpg" if slug=="delivery" else None
    o=[head(c["title"],c["desc"],path,og_img,jl), NAV, rail(slug)]
    # hero
    o.append(f"""
<header class="phero">
  <div class="wrap">
    <div class="grid">
      <div class="copy">
        <div class="eyebrow rv"><span class="n">{s["idx"]}</span><span>{s["zh"]} · {s["en"]}</span></div>
        <h1 class="cjk rv">{c["h1"]}</h1>
        <p class="lede cjk rv">{c["lede"]}</p>
        <p class="gloss rv">{c["gloss"]}</p>
      </div>
      <aside class="io aside rv">
        <div class="note">
          <div class="blk"><b>Input · 你提供</b><span class="cjk">{c["inp"]}</span></div>
          <div class="blk"><b>Output · 你拿到</b><span class="cjk">{c["out"]}</span></div>
          <div class="blk"><b>Stage</b><span class="mono">{s["idx"]} / 07{tag}</span></div>
        </div>
      </aside>
    </div>
  </div>
</header>
""")
    # owner question
    o.append(f"""
<section class="thesis q" id="question">
  <div class="wrap">
    <div class="grid">
      <div class="l">
        <div class="eyebrow"><span class="n">Q</span><span>業主的問題</span></div>
        <h2 class="cjk">「{c["q"]}」</h2>
      </div>
      <div class="r">
        <p class="cjk">{c["quote"]}</p>
        <p class="cjk">{c["quote2"]}</p>
        <p class="en">{c["qen"]}</p>
      </div>
    </div>
  </div>
</section>
""")
    # how
    n=len(c["how"]); cls="c4" if n==4 else "c3"
    items=[]
    for k,(en,zh,desc,fact) in enumerate(c["how"],1):
        items.append(f"""      <div class="step">
        <div class="idx">{s["idx"]}.{k}</div>
        <div class="en">{en}</div>
        <h3 class="cjk">{zh}</h3>
        <p class="cjk">{desc}</p>
        <div class="fact cjk"><span class="k">依據</span>{fact}</div>
      </div>""")
    o.append(f"""
<section class="how hair" id="how">
  <div class="wrap">
    <div class="eyebrow"><span class="n">{s["idx"]}</span><span>How · 我們怎麼做</span></div>
    <h2 class="cjk">{c["how_h2"]}</h2>
    <div class="items {cls}">
{chr(10).join(items)}
    </div>
  </div>
</section>
""")
    # diagram
    o.append(f"""
<section class="dia hair" id="diagram">
  <div class="wrap">
    <figure>
      <div class="lab"><span class="n">{c["fig_lab"]}</span><span>{s["en"]}</span></div>
      <div class="frame">{c["fig"]()}</div>
      <figcaption><span>{c["cap"][0]}</span>{c["cap"][1]}</figcaption>
    </figure>
  </div>
</section>
""")
    # why
    w=[f"""      <div class="it"><div class="k">{k}</div><h3 class="cjk">{zh}</h3><p class="cjk">{p}</p></div>""" for k,zh,p in c["why"]]
    o.append(f"""
<section class="why" id="why">
  <div class="wrap">
    <div class="eyebrow"><span class="n">{s["idx"]}</span><span>Why it matters · 對業主的意義</span></div>
    <h2 class="cjk">{c["why_h2"]}</h2>
    <div class="grid3">
{chr(10).join(w)}
    </div>
  </div>
</section>
""")
    # evidence
    ev=[]
    for e in c["ev"]:
        ev.append(f"""      <a class="card2" href="{e["href"]}">
        <div class="t cjk">{e["t"]}<span class="en">{e["en"]}</span></div>
        <div class="d">{e["d"]}</div>
        <div class="claim cjk"><b>{e["claim_t"]}</b>{e["claim"]}</div>
        <span class="mode">{e["mode"]}</span>
      </a>""")
    ev_html = f'<div class="cards">\n{chr(10).join(ev)}\n    </div>' if ev else f'<div class="none cjk">{c["ev_none"]}</div>'
    foot = f'<p class="foot cjk">{c["ev_foot"]}</p>' if c.get("ev_foot") else ""
    o.append(f"""
<section class="ev hair" id="evidence">
  <div class="wrap">
    <div class="eyebrow"><span class="n">{s["idx"]}</span><span>Evidence · 證據</span></div>
    <h2 class="cjk">{c["ev_h2"]}</h2>
    {ev_html}
    {foot}
    <p class="foot cjk">全部案例見 <a href="/work/" style="color:var(--fg);border-bottom:1px solid var(--line-strong)">實績</a>；本頁只列與此階段直接相關、且 2024 年後完成的案件。</p>
  </div>
</section>
""")
    # prev/next
    def pn_link(st, label, fallback):
        if st: return f'<a href="/process/{st["slug"]}/"><span class="k">{label}</span><span class="t cjk">{st["idx"]} {st["zh"]}<span class="en">{st["en"]}</span></span></a>'
        return fallback
    prev_html = pn_link(prev_,"← 上一段",'<a href="/process/"><span class="k">← 總覽</span><span class="t cjk">流程總覽<span class="en">Process Overview</span></span></a>')
    next_html = pn_link(next_,"下一段 →",'<a href="/process/"><span class="k">總覽 →</span><span class="t cjk">回到七段流程<span class="en">Process Overview</span></span></a>')
    o.append(f"""
<section class="pnw" id="nav" style="padding-top:0">
  <div class="wrap">
    <nav class="pn" aria-label="前後段">
      {prev_html}
      {next_html}
    </nav>
  </div>
</section>
""")
    o.append(cta()); o.append(FOOTER); o.append("</body>\n</html>\n")
    return "".join(o)

BENEFIT = {
 "site-survey":"後續每一段都以同一份現況為準。",
 "parametric":"條件改一次，方案與圖面一起更新。",
 "design-intent":"你在這裡拍板：目標、語彙、視覺、情境。",
 "technical-validation":"能不能蓋、多少錢、合不合法，在這裡確認。",
 "bim":"衝突在模型裡被找到，不在工地被找到。",
 "construction-docs":"你收到的不只是完工，是可稽核的一整套文件。",
 "delivery":"營運不中斷地完成，如期驗收移交。",
}

def overview():
    title="AI 室內設計流程｜從現況掃描到交付的七個階段｜惠強 HQ Design"
    desc="你的案子會走過哪七個階段？惠強以現況掃描、參數化方案、BIM 協調到交付的七段流程把 AI 接進交付；30 年、1,600+ 件。設計定案後可從 04 接手。"
    path="/process/"
    jl=jsonld_page(title,desc,path,[("首頁","/"),("設計流程",path)])
    jl["@graph"].append({"@type":"ItemList","name":"惠強室內裝修七段設計施工流程","itemListOrder":"https://schema.org/ItemListOrderAscending",
        "itemListElement":[{"@type":"ListItem","position":i+1,"name":f'{s["idx"]} {s["zh"]} · {s["en"]}',"url":f'{BASE}/process/{s["slug"]}/'} for i,s in enumerate(STAGES)]})
    o=[head(title,desc,path,None,jl),NAV,rail(None)]
    o.append("""
<header class="phero">
  <div class="wrap">
    <div class="grid">
      <div class="copy">
        <div class="eyebrow rv"><span class="n">Process</span><span>七段流程 · From Site Survey to Delivery</span></div>
        <h1 class="cjk rv">你的案子會走過哪七個階段？</h1>
        <p class="lede cjk rv">AI 不只畫圖，而是提升整個交付。一般設計流程仰賴人工反覆重畫；惠強把 AI、參數化設計與 BIM 接進決策流程，讓方案更快比較、資訊更一致、風險更早被看見。</p>
        <p class="gloss rv">AI-enabled design, from first idea to final delivery. Human-led, system-assisted.</p>
      </div>
      <aside class="io aside rv">
        <div class="note">
          <div class="blk"><b>HQ Design · 惠強室內裝修</b><span class="cjk">惠強室內裝修（HQ Design）1995 年創立於台北，累積 1,600+ 件商業空間案件，設計與施工 100% 由同一團隊完成。2026 年 4 月起導入 AI 識圖丈量、CAD→BIM、參數化多方案與 BIM 報價整合四項，接進七段設計施工流程。</span></div>
          <div class="blk"><b>Stages</b><span class="mono">07 · AI / PARAMETRIC / BIM / AI PM</span></div>
        </div>
      </aside>
    </div>
  </div>
</header>
""")
    steps=[]
    for s in STAGES:
        tag=f'<span class="tag">{s["tag"]}</span>' if s["tag"] else ""
        ai=" ai" if s["tag"] else ""
        steps.append(f"""      <a class="step{ai}" href="/process/{s["slug"]}/">
        <div class="idx" aria-hidden="true"></div>
        <div class="num">{s["idx"]}</div>
        <div class="en">{s["en"]}</div>
        <h3 class="cjk">{s["zh"]}</h3>
        <p class="cjk">{BENEFIT[s["slug"]]}</p>
        {tag}
        <span class="go">READ →</span>
      </a>""")
    o.append(f"""
<section class="proc tl" id="stages">
  <div class="wrap">
    <div class="eyebrow"><span class="n">01</span><span>Seven Stages · 七段時間軸</span></div>
    <h2 class="cjk">七個階段，<br>各自解決你的哪個問題？</h2>
    <div class="steps">
{chr(10).join(steps)}
      <div class="asset"><span>DESIGN ASSET LAYER · 02 → 07</span><span class="cjk">設計資產層：品牌特徵成為可複製的空間系統，橫跨 02 至 07，不是獨立的一段。</span></div>
    </div>
    <p class="foot cjk">惠強室內裝修（HQ Design）的七段流程中，AI、參數化與 BIM 直接介入 4 段：01 現況掃描、02 參數化方案、05 BIM 協調、07 交付與專案管理；03 設計意圖定案、04 技術驗證、06 施工圖說由設計、技術與工程團隊判斷與執行。AI 負責加速運算，專業團隊負責判斷與落地。</p>
  </div>
</section>
""")
    chainA="".join(f'<span class="on">{s["idx"]}</span>' for s in STAGES)
    chainB="".join(f'<span class="{"on" if int(s["idx"])>=4 else ""}">{s["idx"]}</span>' for s in STAGES)
    o.append(f"""
<section class="modes hair" id="modes">
  <div class="wrap">
    <div class="eyebrow"><span class="n">02</span><span>Two Engagement Models · 兩種委任模式</span></div>
    <h2 class="cjk">你從哪一段進來？</h2>
    <div class="dia" style="padding:var(--s8) 0 0">
      <figure>
        <div class="lab"><span class="n">FIG · 00</span><span>Engagement Models</span></div>
        <div class="frame">{fig_modes()}</div>
        <figcaption><span>A · FROM 01 &nbsp;/&nbsp; B · FROM 04</span><span class="cjk">全案設計施工自 01 起沿主線進行；設計意圖來自外部團隊時，自 04 技術驗證接入主線。品牌色節點為 AI、參數化、BIM 直接介入的 4 段。</span></figcaption>
      </figure>
    </div>
    <div class="two">
      <div class="m">
        <div class="k">A · Full Design &amp; Build</div>
        <h3 class="cjk">全案設計施工</h3>
        <span class="en">Enter at 01 Site Survey. One contract, one accountable team.</span>
        <p class="cjk">評估選址、總部翻新、連鎖拓點——從現況掃描開始，參數化方案與設計意圖由惠強產出，同一團隊接續技術驗證、BIM 協調、施工圖說到交付。單一合約、單一窗口對業主負責。</p>
        <div class="chain">{chainA}</div>
      </div>
      <div class="m">
        <div class="k">B · Technical Partner</div>
        <h3 class="cjk">設計已定案，找執行夥伴</h3>
        <span class="en">Enter at 04 Technical Validation. Design intent from an external team.</span>
        <p class="cjk">設計意圖來自業主指定的設計團隊時，惠強在 03 的節點審閱意圖，自 04 技術驗證接手：確認尺度、材料、法規、預算與施工可行性，再經 BIM 協調、施工圖說到現場交付，負責把設計品質建造出來並可被驗收。</p>
        <div class="chain">{chainB}</div>
      </div>
    </div>
    <div class="cite">
      <p class="cjk">惠強室內裝修（HQ Design）提供兩種委任模式：全案設計施工自 01 現況掃描開始；設計意圖來自外部團隊時，自 04 技術驛證接手，負責技術驗證、BIM 協調、施工圖說與現場交付。2022 年金普頓大安酒店公共區域與客房走廊施工即為第二種模式。</p>
      <p class="small cjk">金普頓大安酒店（2022）在此僅說明委任模式，不作為 AI 流程證據。案例頁：<a href="/work/kimpton/" style="color:var(--fg);border-bottom:1px solid var(--line-strong)">金普頓大安酒店 Kimpton</a></p>
    </div>
  </div>
</section>
""".replace("技術驛證","技術驗證"))
    o.append("""
<section class="diff hair" id="difference">
  <div class="wrap">
    <div class="eyebrow"><span class="n">03</span><span>The Difference · 對照</span></div>
    <h2 class="cjk">一般流程與惠強流程，<br>差在哪裡？</h2>
    <div class="cmp">
      <div class="row head"><div>Conventional Workflow · 一般設計流程</div><div class="vs"></div><div>HQ AI-Integrated · AI + Rules + BIM</div></div>
      <div class="row">
        <div><div class="k">Options · 方案</div><div class="v cjk">單一方案，改一次重畫一次；人數或動線一變，等下一版。</div></div><div class="vs"></div>
        <div><div class="k">Options · 方案</div><div class="v cjk">多方案快速比較；一個條件改變，整套空間同步更新，每組附座位數、會議室數與使用率。</div></div>
      </div>
      <div class="row">
        <div><div class="k">Consistency · 一致性</div><div class="v cjk">平面、立面、剖面與報價數據各自維護，版本容易不一致，對不上的在現場才發現。</div></div><div class="vs"></div>
        <div><div class="k">Consistency · 一致性</div><div class="v cjk">設計規則同步更新；平立剖與報價數據來自同一套模型，2026 年 4 月起以 BIM 報價整合串接。</div></div>
      </div>
      <div class="row">
        <div><div class="k">Risk · 發現階段</div><div class="v cjk">問題常在現場才被發現；返工與工期風險由業主承擔。</div></div><div class="vs"></div>
        <div><div class="k">Risk · 發現階段</div><div class="v cjk">施工前先驗證：設計、機電、設備在同一套 BIM 模型中協調，衝突在進場前找出，不在工地。</div></div>
      </div>
    </div>
    <div class="foot cjk">
      <span><b>人做決策，系統做運算。</b> 設計團隊掌握方向與判斷，AI 與規則負責加速推演與一致性。</span>
      <span class="en" style="color:var(--fg-3)">Human-led, system-assisted.</span>
    </div>
  </div>
</section>
""")
    o.append("""
<section class="thesis ai" id="ai">
  <div class="wrap">
    <div class="grid">
      <div class="l">
        <div class="eyebrow"><span class="n">04</span><span>AI in the Process · AI 介入哪幾段</span></div>
        <h2 class="cjk">AI 用在室內設計，<br>只是出圖比較快嗎？</h2>
      </div>
      <div class="r">
        <p class="cjk">惠強室內裝修（HQ Design）把 AI 用在四個位置：01 現況掃描以 AI 識圖丈量與 CAD→BIM 建立基準；02 參數化方案以條件驅動多組方案；05 BIM 協調以同一套模型整合建築、機電、設備並串接報價；07 交付以 30 年施工節點、品質管理與風險控管紀錄作為專案管理資料庫（試行中）。</p>
        <p class="cjk">這四項自 2026 年 4 月起導入。AI 專案管理目前為試行階段，本站不以完成式陳述其成效；分區施工、營運不中斷與零重大缺失驗收的實績，見 <a href="/process/delivery/" style="color:var(--fg);border-bottom:1px solid var(--line-strong)">07 交付與專案管理</a>。</p>
        <p class="en">AI accelerates computation; the professional team makes the decisions and builds. Four of seven stages are directly AI-, parametric- or BIM-driven; the other three are human judgement and execution.</p>
      </div>
    </div>
  </div>
</section>
""")
    o.append(cta()); o.append(FOOTER); o.append("</body>\n</html>\n")
    return "".join(o)

# ────────────────────────────────────────────────────────────────
# 輸出
# ────────────────────────────────────────────────────────────────
def write(path, html):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh: fh.write(html)

out=[]
write(f"{SITE}/process/index.html", overview()); out.append("process/index.html")
for s in STAGES:
    write(f"{SITE}/process/{s['slug']}/index.html", stage_page(s["slug"])); out.append(f"process/{s['slug']}/index.html")

# 檢核：description 長度、禁用詞、色碼
BAD = ["賦能","無縫","次世代","顛覆性"]
print("written:", len(out))
for slug,c in CONTENT.items():
    print(f"  {slug:22s} desc={len(c['desc']):3d} chars  h1={c['h1']}")
for p in out:
    h=rd(f"{SITE}/{p}")
    hexes=[m for m in re.findall(r"#[0-9A-Fa-f]{3,6}\b", h.split("<body>")[0].split("<style>")[1] if "<style>" in h else "")]
    bad=[w for w in BAD if w in h]
    emoji=re.findall(r"[\U0001F300-\U0001FAFF☀-➿]", h)
    print(f"  {p:38s} hex-in-style={len(hexes)} banned={bad} emoji={len(emoji)} size={len(h)//1024}KB")
