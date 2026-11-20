#!/usr/bin/env python3
"""組裝視覺提案：把 proposal.template.html 的佔位換成 base64／inline SVG，輸出單檔 HTML。

用法（在 repo 根或任何地方）：
    python3 design/proposal/src/assemble.py            # 輸出 design/proposal/hq-design-visual-proposal.html
    python3 design/proposal/src/assemble.py out.html   # 指定輸出檔

資源來源（全部在 repo 內，不依賴 scratchpad）：
- {{FONT_SATOSHI}}  ← .workflow/active/WFS-hq-website-reset/codex-out/satoshi/Satoshi-Variable.woff2（原檔 base64，不 subset 不轉檔）
- {{IMG:slug}}      ← site/assets/img/work/<slug>/<slug>-hero-01.jpg → 720×480 3:2 縮圖（用 macOS sips；快取在 src/thumbs/）
- {{ISO:x}} {{CMP:x}} ← src/figma/iso-*.png、cmp-*.png（Figma 簡介 p07/p08/p32 裁切）
- {{PAT:name}}      ← src/figma/pattern-<name>.svg（inline，currentColor）
"""
import base64, pathlib, re, subprocess, sys

SRC = pathlib.Path(__file__).resolve().parent
ROOT = SRC.parents[2]                      # repo 根（design/proposal/src → ../../..）
TPL = SRC / "proposal.template.html"
FONT = ROOT / ".workflow/active/WFS-hq-website-reset/codex-out/satoshi/Satoshi-Variable.woff2"
WORK = ROOT / "site/assets/img/work"
THUMBS = SRC / "thumbs"; THUMBS.mkdir(exist_ok=True)
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else SRC.parent / "hq-design-visual-proposal.html"

missing: list[str] = []
def b64(p: pathlib.Path) -> str:
    return base64.b64encode(p.read_bytes()).decode("ascii")

def thumb(slug: str) -> pathlib.Path | None:
    dst = THUMBS / f"{slug}.jpg"
    if dst.exists(): return dst
    cands = sorted((WORK / slug).glob(f"{slug}-hero-01.jpg")) or sorted((WORK / slug).glob("*.jpg"))
    if not cands: return None
    dst.write_bytes(cands[0].read_bytes())
    # 縮到 720 寬再置中裁成 720×480（3:2）
    subprocess.run(["sips", "-Z", "720", str(dst)], check=True, capture_output=True)
    subprocess.run(["sips", "-c", "480", "720", str(dst)], check=True, capture_output=True)
    return dst

out = TPL.read_text(encoding="utf-8")
if FONT.exists(): out = out.replace("{{FONT_SATOSHI}}", b64(FONT))
else: missing.append(str(FONT))

def img(m):
    p = thumb(m.group(1))
    if not p: missing.append(f"thumb:{m.group(1)}"); return ""
    return b64(p)
out = re.sub(r"\{\{IMG:([a-z0-9-]+)\}\}", img, out)

def png(prefix):
    def f(m):
        p = SRC / "figma" / f"{prefix}-{m.group(1)}.png"
        if not p.exists(): missing.append(str(p)); return ""
        return b64(p)
    return f
out = re.sub(r"\{\{ISO:([a-z])\}\}", png("iso"), out)
out = re.sub(r"\{\{CMP:([a-z]+)\}\}", png("cmp"), out)

def pat(m):
    p = SRC / "figma" / f"pattern-{m.group(1)}.svg"
    if not p.exists(): missing.append(str(p)); return ""
    return p.read_text(encoding="utf-8")
out = re.sub(r"\{\{PAT:([a-z0-9-]+)\}\}", pat, out)

left = re.findall(r"\{\{[A-Z_]+(?::[a-z0-9-]+)?\}\}", out)
OUT.write_text(out, encoding="utf-8")
print(f"wrote {OUT} ({OUT.stat().st_size/1024/1024:.2f} MB)")
if missing: print("MISSING:", *missing, sep="\n  ")
if left: print("UNRESOLVED:", left)
sys.exit(1 if (missing or left) else 0)
