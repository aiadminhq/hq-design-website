#!/usr/bin/env python3
"""把 gen_work.py 的 CASES 與 build_process.py 的 CONTENT 抽成 content/ 下的 JSON。

為什麼要截斷載入：兩支腳本都沒有 __main__ 守衛，直接 import 會在頂層把
site/ 的 42 個頁面整批覆寫。這裡只 exec 到「寫檔區」之前，取得資料就停。

用法：python3 scripts/site/export_content.py [--dry-run]
"""
import json, os, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
os.chdir(ROOT)
DRY = "--dry-run" in sys.argv

# gen_work.py 的寫檔區起點；build_process.py 的輸出區起點
CUT = {
    "scripts/site/gen_work.py": "# ---------------------------------------------------------------- write",
    "scripts/site/build_process.py": "\nout=[]\n",
}


def load(path):
    src = pathlib.Path(path).read_text(encoding="utf-8")
    marker = CUT[path]
    if marker not in src:
        sys.exit(f"❌ {path} 找不到截斷點，腳本結構已改變，請重新確認後再跑")
    ns = {"__name__": "__export__", "__file__": str(ROOT / path)}
    exec(compile(src[: src.index(marker)], path, "exec"), ns)
    return ns


# ---------------------------------------------------------------- 來源標示
# gen_work 的 provenance 有 4 個值，網站對外只有 4 類標示，對應不是一對一：
#   photo-original / photo-retouch-pending → photo（完工實景）
#   design-render                          → viz  （設計提案視覺）
#   ai-enhanced-photo                      → enh  （實拍 · AI 光影強化）
#   space_zh == 平面圖                      → drawing（設計圖面）
PROV = {
    "photo-original": "photo",
    "photo-retouch-pending": "photo",
    "design-render": "viz",
    "ai-enhanced-photo": "enh",
}


def prov_of(im):
    if im.get("space_zh") == "平面圖":
        return "drawing"
    p = PROV.get(im.get("provenance"))
    if not p:
        sys.exit(f"❌ 未知的 provenance：{im.get('provenance')}（{im.get('file')}）")
    return p


def bi(zh, en=None):
    """雙語欄位。en 缺席時留 None，由前端 fallback 到 zh 並標記待譯。"""
    return {"zh": zh, "en": en}


AREA_SQM = re.compile(r"([\d,]+(?:\.\d+)?)\s*sqm")
AREA_PING = re.compile(r"([\d,]+(?:\.\d+)?)\s*坪")
YEAR = re.compile(r"(19|20)\d{2}")


def facts_from_specs(specs):
    """從 specs 三元組抽出可稽核事實。抽不到就留空，不推估、不編造。"""
    f, review = {}, []
    for label_zh, _label_en, value in specs:
        if label_zh == "面積":
            if m := AREA_SQM.search(value):
                f["areaSqm"] = float(m.group(1).replace(",", ""))
            if m := AREA_PING.search(value):
                f["areaPing"] = float(m.group(1).replace(",", ""))
            f["areaRaw"] = value
        elif label_zh == "年份":
            if m := YEAR.search(value):
                f["year"] = int(m.group(0))
            f["yearRaw"] = value
        elif label_zh == "地點":
            f["locationZh"] = value
        elif label_zh in ("客戶", "業主"):
            f["client"] = value
        elif label_zh == "類別":
            f["typeZh"] = value

    for k in ("areaSqm", "year", "locationZh"):
        if k not in f:
            review.append(k)
    return f, review


def to_project(slug, c):
    imgs = []
    for im in c["images"]:
        imgs.append(
            {
                "order": im["order"],
                "role": im["role"],
                "grade": im["grade"],
                "prov": prov_of(im),
                # stem 不含副檔名與尺寸；loader 補成 /media/work/<slug>/<stem>-<w>.webp
                "stem": pathlib.Path(im["file"]).stem,
                "sourceFile": im["file"],
                "width": im["w"],
                "height": im["h"],
                "spaceZh": im.get("space_zh", ""),
                "alt": bi(im.get("alt_zh", "")),
                "retouch": im.get("retouch", "none"),
                "retouchNote": im.get("retouch_note", ""),
                "risks": list(im.get("risks") or []),
            }
        )

    facts, review = facts_from_specs(c["specs"])
    note = c.get("note")

    # gen_work.py 的 diptych：完工實景那半是 detail 角色的實圖，
    # 設計視覺那半刻意留空（「渲染影像到位前，此處保留結構、不放替代圖」）。
    # 保住這個誠實的選擇——intent 給 None，不要為了湊對而塞圖。
    pairs = []
    if c.get("diptych"):
        hero = c["hero"]
        rest = [im for im in c["images"] if im is not hero]
        as_built = next((im for im in rest if im["role"] == "detail"), rest[-1] if rest else None)
        if as_built:
            pairs.append({
                "intent": None,
                "asBuilt": pathlib.Path(as_built["file"]).stem,
                "note": "對照組需同機位、同視角的渲染圖與完工攝影配對；渲染影像尚未到位。",
            })

    return {
        "schemaVersion": 1,
        "slug": slug,
        "category": c["cat"],
        "weight": c["weight"],
        "name": bi(c["name"]),
        "gloss": c["gloss"],
        "lede": bi(c["lede"]),
        "specs": [
            {"labelZh": a, "labelEn": b, "value": v, "verified": True}
            for a, b, v in c["specs"]
        ],
        "cardMeta": list(c["card_d"]),
        "note": {"title": bi(note[0]), "body": bi(note[1])} if note else None,
        "images": imgs,
        "facts": facts,
        # 使用者已裁示：缺漏數據可先暫填以豐富內容，但必須可回溯。
        # verified=false 的欄位不得進入 JSON-LD / llms.txt / OG。
        "dataQuality": {
            "source": "gen_work.py CASES（人工策展）",
            "factsVerified": len(review) == 0,
            "missingFacts": review,
            "provisionalFields": [],
            "needsHumanReview": review,
        },
        "pairs": pairs,
        "relatedSlugs": [],
    }


def main():
    G = load("scripts/site/gen_work.py")
    cases, order = G["CASES"], G["ORDER"]

    out_p = ROOT / "content" / "projects"
    projects = {s: to_project(s, cases[s]) for s in order}

    # 流程頁：CONTENT dict + 8 張以 60° 幾何 helper 產生的 SVG 製圖
    B = load("scripts/site/build_process.py")
    stages = {}
    figs = {}
    for slug, d in B["CONTENT"].items():
        d = dict(d)
        fig = d.pop("fig", None)
        if callable(fig):
            figs[slug] = fig()
        stages[slug] = d

    if DRY:
        print(f"[dry-run] 專案 {len(projects)} 案｜流程 {len(stages)} 段｜製圖 {len(figs)} 張")
        need = [s for s, p in projects.items() if p["dataQuality"]["needsHumanReview"]]
        print(f"[dry-run] 需人工核對的案子 {len(need)} 個：{need}")
        return

    out_p.mkdir(parents=True, exist_ok=True)
    for s, p in projects.items():
        (out_p / f"{s}.json").write_text(
            json.dumps(p, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    out_s = ROOT / "content" / "process"
    (out_s / "figures").mkdir(parents=True, exist_ok=True)
    for s, d in stages.items():
        (out_s / f"{s}.json").write_text(
            json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
    for s, svg in figs.items():
        (out_s / "figures" / f"{s}.svg").write_text(svg, encoding="utf-8")

    # 待核對總表，供後續人工確認
    review = {
        s: p["dataQuality"]["needsHumanReview"]
        for s, p in projects.items()
        if p["dataQuality"]["needsHumanReview"]
    }
    (ROOT / "content" / "NEEDS-REVIEW.json").write_text(
        json.dumps(
            {
                "generatedAt": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
                "note": "缺漏的可稽核事實。暫填值一律 verified=false，人工確認後才可進 JSON-LD／llms.txt／OG。",
                "cases": review,
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

    print(f"✅ 專案 {len(projects)} 案 → content/projects/")
    print(f"✅ 流程 {len(stages)} 段 + 製圖 {len(figs)} 張 → content/process/")
    print(f"⚠️  需人工核對 {len(review)} 案 → content/NEEDS-REVIEW.json")


if __name__ == "__main__":
    main()
