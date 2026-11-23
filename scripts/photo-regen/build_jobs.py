#!/usr/bin/env python3
"""由 docs/photo-audit/regeneration-queue.csv 產生分流後的 jobs JSON。
路線（route）：
  upscale  內容已乾淨擬真、只缺尺寸 → 本機放大，不呼叫 API
  edit     一般空間、無招牌／密集文字 → images/edits medium＋通用清理提示詞
  enhance  入口／接待／展示／公告等含文字或首圖 → images/edits high＋場景描述
可在 queue 的 notes 欄寫 route=edit|enhance|upscale 手動覆寫。
用法：python3 build_jobs.py <date YYYYMMDD> <out.json>
"""
import csv, json, re, sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ENHANCE_KW = ("入口", "門廳", "接待", "展", "公告", "互動牆", "hero")


def route_for(row):
    m = re.search(r"route=(upscale|edit|enhance)", row.get("notes", ""))
    if m:
        return m.group(1)
    return "enhance" if any(k in row["target_view"] for k in ENHANCE_KW) else "edit"


def next_index(slug, date):
    d = ROOT / "assets/images/projects" / slug
    used = [int(m.group(1)) for p in d.glob(f"selected-{date}-*.webp") if (m := re.search(r"-(\d+)\.webp$", p.name))]
    # 既有 selected-*（任何日期）之後接續，避免覆蓋
    allsel = [int(m.group(1)) for p in d.glob("selected-*.webp") if (m := re.search(r"-(\d+)\.webp$", p.name))]
    return max(allsel + used + [0]) + 1


def main():
    date, out = sys.argv[1], Path(sys.argv[2])
    rows = list(csv.DictReader((ROOT / "docs/photo-audit/regeneration-queue.csv").open(encoding="utf-8-sig")))
    counters = defaultdict(int)
    jobs = []
    for r in rows:
        if r.get("decision") and r["decision"] not in ("regenerate", ""):
            continue
        slug = r["slug"]
        n = next_index(slug, date) + counters[slug]; counters[slug] += 1
        jobs.append({"slug": slug, "ref": Path(r["reference_file"]).stem, "out": f"selected-{date}-{n:02d}",
                     "view": r["target_view"], "route": route_for(r), "scene": ""})
    tpl = json.loads((Path(__file__).parent / "jobs-20261122.json").read_text(encoding="utf-8"))
    cfg = {"date": date, "model": tpl["model"], "size": tpl["size"], "style": tpl["style"], "jobs": jobs}
    out.write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")
    c = defaultdict(int)
    for j in jobs: c[j["route"]] += 1
    print(len(jobs), dict(c))


if __name__ == "__main__":
    main()
