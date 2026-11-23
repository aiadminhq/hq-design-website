#!/usr/bin/env python3
"""實拍照片最低尺寸補足：長邊 < 2000px 的上線實拍圖（photo-NN.*）以 Lanczos 放大至長邊 2000px，
再加輕微 UnsharpMask，同檔名覆寫（原檔留在 git 歷史）。已達標者不動。
用法：python3 scripts/photo-audit/upscale_real_photos.py [--dry-run]
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
MIN = 2000
dry = "--dry-run" in sys.argv
inv = json.loads((ROOT / "docs/photo-audit/inventory.json").read_text(encoding="utf-8"))
todo = [r for r in inv["files"] if r["kind"] == "real-photo" and r["live"] and max(r["width"], r["height"]) < MIN]
for r in todo:
    p = ROOT / r["path"]
    im = Image.open(p); fmt = im.format; im = im.convert("RGB")
    s = MIN / max(im.size); new = (round(im.width * s), round(im.height * s))
    print(f'{r["path"]}: {im.size} -> {new}' + (" (dry-run)" if dry else ""))
    if dry: continue
    im = im.resize(new, Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
    im.save(p, fmt, quality=85, **({"method": 6} if fmt == "WEBP" else {"optimize": True, "progressive": True}))
print(f"{len(todo)} file(s) below {MIN}px")
