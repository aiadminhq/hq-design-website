#!/usr/bin/env python3
"""把驗收通過的新圖附加到 EN／ZH 專案頁相簿尾端（hero 與縮圖不動）。
alt 沿用該頁最後一張的前綴，編號接續。已存在的引用不重複加入。
用法：python3 integrate.py <slug>:<file.webp> [...]
"""
import re, sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ITEM = re.compile(r'^( *)<div class="gallery-item"><img src="([^"]*?)assets/images/projects/[^"]+" alt="(.*?) (\d+)" loading="lazy"></div>$')

add = defaultdict(list)
for a in sys.argv[1:]:
    slug, f = a.split(":"); add[slug].append(f)

for slug, files in add.items():
    for page in (ROOT / f"projects/{slug}.html", ROOT / f"zh/projects/{slug}.html"):
        lines = page.read_text(encoding="utf-8").split("\n")
        idx = [i for i, l in enumerate(lines) if ITEM.match(l)]
        assert idx, page
        indent, prefix, alt, num = ITEM.match(lines[idx[-1]]).groups()
        n = int(num); new = []
        for f in files:
            if f"projects/{slug}/{f}" in "\n".join(lines): continue
            n += 1
            new.append(f'{indent}<div class="gallery-item"><img src="{prefix}assets/images/projects/{slug}/{f}" alt="{alt} {n}" loading="lazy"></div>')
        lines[idx[-1] + 1:idx[-1] + 1] = new
        page.write_text("\n".join(lines), encoding="utf-8")
        print(page.relative_to(ROOT), f"+{len(new)}")
