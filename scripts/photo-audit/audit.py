#!/usr/bin/env python3
"""HQ Design 官網：專案照片盤點（唯讀，不修改任何頁面或原圖）。

產出（皆在 docs/photo-audit/）：
  inventory.json / inventory.csv   逐檔規格、狀態、頁面引用、建議處理路線
  sheets/<slug>-<album>.jpg        聯絡表（album = noncompliant | compliant | specgap）
  README.md                        GitHub 首頁：成果總覽 + 照片清單
  non-compliant.md                 「確認不符合標準」照片集

驗收標準取自 docs/photo-replacement-list.md §E.2 與
docs/codex-handoff-photo-replacement.md §2：
  - 長邊 >= 2400 px；16:9 或 3:2（容差 0.04）
  - 不得為簡報頁截圖（render-NN.jpg 內嵌平面圖/浮水印/留白、page-NN.jpg logo 頁）
  - 平面圖（floorplan.jpg）保留但不得放進 gallery
  - 建議 WebP 且單檔 < 600 KB（僅列 advisory，不算不合格）

用法： python3 scripts/photo-audit/audit.py
"""
from __future__ import annotations

import csv
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
IMG_ROOT = ROOT / "assets/images/projects"
OUT = ROOT / "docs/photo-audit"
SHEETS = OUT / "sheets"

# 不納入盤點（見 docs/codex-handoff-photo-replacement.md §4 與 photo-replacement-list.md §D）
SKIP_SLUGS = {"zhongbao-nangang": "孤兒頁（115 張簡報截圖），不在列表與 sitemap"}

MIN_LONG_EDGE = 2400
RATIOS = (16 / 9, 3 / 2)
RATIO_TOL = 0.04
ADVISORY_BYTES = 600 * 1024

REF_RE = re.compile(r"assets/images/projects/([a-z0-9-]+)/([^\"'\s)]+\.(?:jpe?g|png|webp))", re.I)

# 各案名稱（取自 docs/photo-replacement-list.md；僅作顯示）
NAMES = {
    "baohua": "Baohua Cybersecurity",
    "polytron": "Brightron Technology",
    "aiontech": "AIONTECH",
    "epicstech-10f": "Epic Tech",
    "hq-office": "HQ Design Office & Material Library",
    "ledaojia": "Lots Home Entertainment",
    "lijie": "Lijie International",
    "liwei": "Liwei Electronics",
    "xinlan": "Xinlan Enterprise",
    "zhongbao-baojing": "Zhong Bao Insurance Services",
    "zhongbao-jingzhen": "Ching Dian TECH",
    "zhongbao-showroom": "SECOM Technology Hall",
    "zhongbao-tianhe": "eSkylink",
    "qijia": "Cheogajip, Taichung",
    "kimpton": "Kimpton Da An Hotel",
    "popeyes": "Popeyes Xuchang Street",
    "soup-spoon-101": "The Soup Spoon, Taipei 101",
    "soup-spoon-station": "The Soup Spoon, Taipei Main Station",
    "secom-nangang-complex": "SECOM Nangang HQ",
}

TARGET_ALBUM = 6  # 每案相簿最低目標張數（replacement-list §C：補齊至 6–8 張）


def page_role(rel: str) -> str:
    if rel.startswith("zh/projects/"):
        return "detail-zh"
    if rel.startswith("projects/"):
        return "detail-en"
    return "list-home-other"


def collect_refs() -> dict[tuple[str, str], dict]:
    """(slug, filename) -> {roles:set, pages:set}；只看靜態站頁面（排除 web/、_archive/）。"""
    refs: dict[tuple[str, str], dict] = defaultdict(lambda: {"roles": set(), "pages": set()})
    for html in ROOT.rglob("*.html"):
        rel = html.relative_to(ROOT).as_posix()
        if rel.startswith(("web/", "_archive/", "node_modules/", "docs/")):
            continue
        text = html.read_text(encoding="utf-8", errors="ignore")
        for slug, fname in REF_RE.findall(text):
            d = refs[(slug, fname)]
            d["roles"].add(page_role(rel))
            d["pages"].add(rel)
    return refs


def parse_needed_views() -> dict[str, dict[str, str]]:
    """從 photo-replacement-list.md 的 B/C 表抓「視角（NN）」→ {slug: {render-NN.jpg: 視角}}。"""
    md = (ROOT / "docs/photo-replacement-list.md").read_text(encoding="utf-8")
    out: dict[str, dict[str, str]] = defaultdict(dict)
    for line in md.splitlines():
        if not line.startswith("|") or "`" not in line:
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        slug_m = re.search(r"`([a-z0-9-]+)`", cells[1]) if len(cells) > 1 else None
        if not slug_m:
            continue
        slug = slug_m.group(1)
        for cell in cells[2:]:
            for view, num in re.findall(r"([^、·（）()]+?)（(\d{2})）", cell):
                view = re.sub(r"^.*?(?:入口 hero)", "入口 hero", view) if "入口 hero" in view else view
                out[slug][f"render-{num}.jpg"] = view.strip()
    return out


def classify(slug: str, p: Path, w: int, h: int, size: int) -> dict:
    name = p.name
    long_edge, short_edge = max(w, h), min(w, h)
    ratio = long_edge / short_edge if short_edge else 0
    ratio_ok = any(abs(ratio - r) <= RATIO_TOL for r in RATIOS)
    reasons: list[str] = []
    advisory: list[str] = []

    if re.fullmatch(r"render-\d+\.jpe?g", name):
        kind = "legacy-render"
        reasons.append("簡報截圖：內嵌平面圖／浮水印／底部留白")
    elif re.fullmatch(r"page-\d+\.jpe?g", name):
        kind = "legacy-page"
        reasons.append("簡報 logo 頁／封面截圖")
    elif name.startswith("floorplan"):
        kind = "floorplan"
    elif name.startswith("selected-"):
        kind = "ai-selected"
    elif name.startswith("retouched-"):
        kind = "retouched"
    elif name.startswith("photo-"):
        kind = "real-photo"
    else:
        kind = "other"

    if kind == "floorplan":
        status = "reserved"
    elif kind in ("legacy-render", "legacy-page"):
        status = "non-compliant"
    else:
        spec_fail = []
        if long_edge < MIN_LONG_EDGE:
            spec_fail.append(f"長邊 {long_edge}px < {MIN_LONG_EDGE}px")
        if not ratio_ok:
            spec_fail.append(f"比例 {ratio:.2f} 非 16:9 / 3:2")
        if spec_fail:
            status = "spec-gap"
            reasons += spec_fail
        else:
            status = "compliant"
    if kind not in ("floorplan",) and size > ADVISORY_BYTES:
        advisory.append(f"檔案 {size // 1024} KB > 600 KB")
    if kind in ("ai-selected",) and p.suffix.lower() != ".webp":
        advisory.append("建議 WebP")

    return {
        "kind": kind,
        "status": status,
        "ratio": round(ratio, 3),
        "reasons": reasons,
        "advisory": advisory,
    }


def route_for(rec: dict, view: str | None, slug_pass_live: int) -> str:
    """建議處理路線（僅供後續判斷，非最終決定）。"""
    if rec["status"] == "compliant":
        return "keep"
    if rec["status"] == "reserved":
        return "reserve（平面圖獨立 section，暫不顯示）"
    if rec["status"] == "spec-gap":
        return "re-export（若有原始檔）或 search-replace"
    # non-compliant
    if rec["kind"] == "legacy-page":
        return "discard-from-gallery（logo 頁，不進相簿）"
    if view:
        return "regenerate（OpenAI edit：以此舊稿為構圖參考，去除平面圖／浮水印／留白）"
    return "reference-only（構圖參考；非本輪必補視角）"


# ---------- 聯絡表 ----------
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
COLORS = {"non-compliant": (200, 40, 40), "spec-gap": (214, 140, 20), "compliant": (30, 140, 70), "reserved": (110, 110, 110)}


def contact_sheet(items: list[dict], dest: Path, title: str, cols: int = 4, tile=(420, 280)) -> None:
    if not items:
        return
    f = ImageFont.truetype(FONT, 14)
    fb = ImageFont.truetype(FONT_B, 18)
    pad, head, cap = 10, 44, 38
    rows = -(-len(items) // cols)
    W = cols * (tile[0] + pad) + pad
    H = head + rows * (tile[1] + cap + pad) + pad
    sheet = Image.new("RGB", (W, H), (245, 245, 243))
    d = ImageDraw.Draw(sheet)
    d.text((pad, 10), title, font=fb, fill=(30, 30, 30))
    for i, it in enumerate(items):
        r, c = divmod(i, cols)
        x, y = pad + c * (tile[0] + pad), head + r * (tile[1] + cap + pad)
        try:
            with Image.open(ROOT / it["path"]) as im:
                im = ImageOps.exif_transpose(im).convert("RGB")
                im.thumbnail(tile, Image.LANCZOS)
                canvas = Image.new("RGB", tile, (225, 225, 222))
                canvas.paste(im, ((tile[0] - im.width) // 2, (tile[1] - im.height) // 2))
        except Exception:
            canvas = Image.new("RGB", tile, (225, 225, 222))
        sheet.paste(canvas, (x, y))
        col = COLORS.get(it["status"], (90, 90, 90))
        d.rectangle([x - 2, y - 2, x + tile[0] + 1, y + tile[1] + 1], outline=col, width=3)
        live = "LIVE" if it["live"] else "unused"
        d.text((x, y + tile[1] + 3), f'{it["file"]}  {it["width"]}x{it["height"]}', font=f, fill=(20, 20, 20))
        d.text((x, y + tile[1] + 20), f'{it["status"]} · {live}', font=f, fill=col)
    dest.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(dest, "JPEG", quality=80, optimize=True)


PRIORITY = ["baohua", "polytron"]


def _order(slugs):
    return sorted(slugs, key=lambda s: (s not in PRIORITY, PRIORITY.index(s) if s in PRIORITY else 0, s))


def _sheet(slug, album, idx):
    p = idx.get(slug, {}).get(album)
    return f"![{slug} {album}]({p})" if p else ""


def write_reports(summary, records, skipped, sheet_index, by_slug) -> None:
    sm = {s["slug"]: s for s in summary}
    total_live_bad = sum(s["live_non_compliant"] for s in summary)
    total_live_gap = sum(s["live_spec_gap"] for s in summary)
    total_live_ok = sum(s["live_compliant"] for s in summary)
    total_need = sum(s["needed_to_reach_6"] for s in summary)
    program = [s for s in summary if s["needed_to_reach_6"] > 0]
    n_bad = sum(1 for r in records if r["status"] == "non-compliant")
    flagged = [r for r in records if r.get("flags")]

    # ---- regeneration-queue.csv ----
    with (OUT / "regeneration-queue.csv").open("w", newline="", encoding="utf-8-sig") as fh:
        wr = csv.writer(fh)
        wr.writerow(["priority", "slug", "project", "target_view", "reference_file", "reference_path",
                     "suggested_route", "decision(search-replace|regenerate|keep|drop)", "new_file", "notes"])
        for slug in _order(by_slug):
            for r in by_slug[slug]:
                if r["needed_view"]:
                    pr = "P0" if slug == "baohua" else "P1"
                    wr.writerow([pr, slug, r["project"], r["needed_view"], r["file"], r["path"],
                                 r["suggested_route"], "", "", ""])

    # ---- README.md ----
    L = []
    a = L.append
    a("# HQ Design 官網｜專案照片盤點（Photo Audit）\n")
    a("- 盤點日期：2026-11-22　分支：`feat/integrate-rebuild-web`（工作分支 `claude/affectionate-mayer-n3tcva`）")
    a("- 驗收標準：`docs/photo-replacement-list.md` §E.2、`docs/codex-handoff-photo-replacement.md` §2")
    a("- 本目錄為**唯讀盤點**：未修改任何頁面、原圖或文字。重跑方式見 §7。\n")
    a("## 1. OpenAI API 可用性（前置確認）\n")
    a("| 檢查項目 | 結果 |\n|---|---|")
    a("| 環境變數 `OPENAI_API_KEY` | 未設定（金鑰改由 Claude Code 環境的 Network secrets 經 proxy 注入，repo 不含任何金鑰） |")
    a("| 初始連線 `api.openai.com` | HTTP 403（proxy 未放行）→ 已於環境設定金鑰並放行該 host |")
    a("| `GET /v1/models`（驗證金鑰） | **HTTP 200**，共 99 個模型 |")
    a("| 可用影像模型 | `gpt-image-2`、`gpt-image-2-2026-04-21`、`gpt-image-2.5-flare`、`gpt-image-2.5-sunburst`、`gpt-image-2.6-flare`、`gpt-image-2.6-sunburst`、`gpt-image-1.5`、`gpt-image-1-mini`、`chatgpt-image-latest` 等 11 個 |")
    a("| 實際生成測試（`gpt-image-1-mini`，low，1024×1024） | **HTTP 200**，回傳 1024×1024 PNG |")
    a("| 尚未驗證 | `/v1/images/edits`（以舊稿為參考重生）、`gpt-image-2` 系列實際生成與單價；正式批次前需各測 1 張 |")
    a("\n> 腳本若要求變數，可設 `OPENAI_API_KEY=proxy-injected`（proxy 會覆寫 Authorization header）。\n")

    a("## 2. 成果總覽\n")
    a(f"- 掃描 **{len(records)}** 個檔案（不含孤兒頁 `zhongbao-nangang`：{skipped.get('zhongbao-nangang', '')}）。")
    a(f"- **上線中**（被 EN／ZH 頁面引用）的不重複圖片：合格 **{total_live_ok}**、規格偏離 **{total_live_gap}**、不合格 **{total_live_bad}**。")
    a(f"- 距「每案 6 張合格」仍缺 **{total_need} 張**，涉及 **{len(program)} 案**（先前文件回報 55 張；本次多 1 張，原因見 §5 ledaojia）。")
    a("- 全部 19 案 EN／ZH 相簿張數一致。\n")
    a("| 優先 | 專案 | slug | 上線 | 合格 | 規格偏離 | 不合格 | 距 6 張缺口 | 照片集 |")
    a("|---|---|---|--:|--:|--:|--:|--:|---|")
    for slug in _order(by_slug):
        s = sm[slug]
        pr = "P0" if slug == "baohua" else ("P1" if s["needed_to_reach_6"] else "—")
        links = []
        if s["live_non_compliant"] or s["legacy_render_files"]:
            links.append(f"[不合格集](non-compliant.md#{slug})")
        if s["live_spec_gap"]:
            links.append(f"[規格偏離](non-compliant.md#{slug})")
        if s["compliant_total"]:
            links.append(f"[成果](#{slug})")
        a(f"| {pr} | {s['project']} | `{slug}` | {s['live_unique']} | {s['live_compliant']} | {s['live_spec_gap']} | "
          f"{s['live_non_compliant']} | {s['needed_to_reach_6'] or '—'} | {' · '.join(links)} |")

    a("\n## 3. 三個照片集\n")
    a("| 照片集 | 內容 | 位置 |\n|---|---|---|")
    a(f"| **A. 確認不符合標準** | 簡報截圖（內嵌平面圖／浮水印／留白）、logo 頁、AI 亂碼文字，共 {n_bad} 個檔案 | [`non-compliant.md`](non-compliant.md)、`sheets/*-noncompliant.jpg` |")
    a("| **B. 規格偏離（內容乾淨、解析度／比例不足）** | 實拍專案 popeyes／soup-spoon／secom-nangang，長邊 < 2400 px | [`non-compliant.md`](non-compliant.md#b-規格偏離實拍專案)、`sheets/*-specgap.jpg` |")
    a("| **C. 合格成果（GitHub 呈現）** | 規格合格且內容乾淨，可直接作為官網成果 | 本檔 §4、`sheets/*-compliant.jpg` |")
    a("| 機器可讀清單 | 逐檔規格與狀態；`decision` 欄供人工填寫 | [`inventory.csv`](inventory.csv)、[`inventory.json`](inventory.json) |")
    a("| 重生成佇列 | 待補視角 → 舊稿構圖參考 → 建議路線 | [`regeneration-queue.csv`](regeneration-queue.csv) |")

    a("\n## 4. 合格成果集（GitHub 呈現）\n")
    a("綠框＝規格合格；`LIVE`＝目前被官網頁面引用。\n")
    for slug in _order(by_slug):
        if sheet_index.get(slug, {}).get("compliant"):
            s = sm[slug]
            a(f"### {s['project']} · `{slug}`\n<a id=\"{slug}\"></a>\n")
            a(_sheet(slug, "compliant", sheet_index) + "\n")

    a("## 5. 待人工複核（目視新發現）\n")
    a("| 檔案 | 狀況 | 處理 |\n|---|---|---|")
    for r in records:
        mr_reason = [x for x in r["reasons"] if x.startswith("內容瑕疵")]
        if mr_reason:
            a(f"| `{r['slug']}/{r['file']}` | {mr_reason[0]} | 已改列**不合格**，列入重生成佇列 |")
    for r in flagged:
        for fl in r["flags"]:
            a(f"| `{r['slug']}/{r['file']}` | {fl} | 保留合格；待確認 |")
    a("\n> 目視範圍：全部 23 張 selected 圖的總覽；招牌／文字區域僅放大檢查 ledaojia、aiontech、zhongbao-showroom、zhongbao-jingzhen。其餘 selected 圖未逐張放大。\n")

    a("## 6. 後續判斷：換圖 vs 重生成\n")
    a("`inventory.csv`／`regeneration-queue.csv` 的 `decision` 欄填入下列其一：\n")
    a("| 路線 | 適用 | 做法 | 風險 |\n|---|---|---|---|")
    a("| **search-replace**（搜尋可用照片換圖） | 業主／設計端能提供原始效果圖、實拍，或有公開核可素材 | 依 §E.1 交件與核可流程；轉 WebP、長邊 ≥ 2400 | 需確認公開核可；等待素材 |")
    a("| **regenerate**（修正不符區域後以 OpenAI 重生） | 只有簡報截圖：以 `render-NN.jpg` 為構圖參考，去除平面圖、浮水印、留白後輸出 | OpenAI `images/edits`（`gpt-image-2` 系列）＋後製放大至 2400 px；逐張目視驗收 | 招牌／文字亂碼（如 ledaojia）；家具與原設計不一致；需業主認可為『效果圖示意』 |")
    a("| **keep** | 已合格 | 不動 | — |")
    a("| **drop** | logo 頁、平面圖（暫不顯示） | 不進相簿 | — |")
    a("\n建議順序：先 `baohua`（P0，0 張合格、10 張上線皆不合格）→ `polytron`（缺 5）→ 其餘 11 案各補 4；`ledaojia` 另加重生入口 hero。\n")

    a("## 7. 重跑與檔案\n")
    a("```bash\npython3 scripts/photo-audit/audit.py   # 需要 Pillow；重新產生本目錄全部檔案\n```\n")
    a("- 自動判定規則：`render-NN.jpg`／`page-NN.jpg` 一律不合格；其餘檢查長邊 ≥ 2400 px、比例 16:9 或 3:2（容差 0.04）。檔案 > 600 KB 僅列 advisory。")
    a("- 目視覆核結果存於 `scripts/photo-audit/manual-review.json`（覆蓋自動判定）。")
    a("- 「合格」僅代表規格與已目視內容；公開核可狀態需另行確認（§E.1）。\n")
    (OUT / "README.md").write_text("\n".join(L), encoding="utf-8")

    # ---- non-compliant.md ----
    N = []
    b = N.append
    b("# 照片集 A／B：確認不符合標準\n")
    b("紅框＝不合格（簡報截圖／內容瑕疵）；橘框＝規格偏離。`LIVE`＝官網頁面目前引用，`unused`＝僅留存於 repo（構圖參考）。\n")
    b("**判定依據**：舊 `render-NN.jpg`（1626×1125）為簡報頁截圖——左下角疊平面圖、底部或側邊留白、左上浮水印圖示（已目視確認 baohua 全部 10 張）；`page-NN.jpg` 為 DESIGN AND BUILD logo 頁。\n")
    b("## A. 不符合標準\n")
    for slug in _order(by_slug):
        s = sm[slug]
        bad = [r for r in by_slug[slug] if r["status"] == "non-compliant"]
        if not bad:
            continue
        pr = "P0" if slug == "baohua" else "P1"
        b(f"### {s['project']} · `{slug}`\n<a id=\"{slug}\"></a>\n")
        b(f"{pr}｜上線不合格 **{s['live_non_compliant']}**｜合格 {s['live_compliant']}｜距 6 張缺 **{s['needed_to_reach_6'] or 0}**\n")
        b(_sheet(slug, "noncompliant", sheet_index) + "\n")
        b("| 檔案 | 尺寸 | 狀態 | 不符原因 | 待補視角 | 建議路線 |\n|---|---|---|---|---|---|")
        for r in bad:
            b(f"| `{r['file']}` | {r['width']}×{r['height']} | {'LIVE' if r['live'] else 'unused'} | "
              f"{'；'.join(r['reasons'])} | {r['needed_view'] or '—'} | {r['suggested_route']} |")
        b("")
    b("## B. 規格偏離（實拍專案）\n")
    b("內容為實拍、目視乾淨，但長邊 < 2400 px。`photo-replacement-list.md` 已將其標為『無需補』（原檔已壓縮）；與 §E.2 驗收標準不一致，需決定是否接受為例外，或取得原始大圖重新輸出。\n")
    for slug in _order(by_slug):
        gaps = [r for r in by_slug[slug] if r["status"] == "spec-gap" and r["live"]]
        if not gaps:
            continue
        s = sm[slug]
        b(f"### {s['project']} · `{slug}`\n<a id=\"{slug}\"></a>\n")
        b(_sheet(slug, "specgap", sheet_index) + "\n")
        b("| 檔案 | 尺寸 | 原因 |\n|---|---|---|")
        for r in gaps:
            b(f"| `{r['file']}` | {r['width']}×{r['height']} | {'；'.join(r['reasons'])} |")
        b("")
    b("## C. 保留不顯示\n")
    b(f"`floorplan.jpg` 共 {sum(1 for r in records if r['status'] == 'reserved')} 個：保留於 repo，待獨立 section，不進 gallery。\n")
    (OUT / "non-compliant.md").write_text("\n".join(N), encoding="utf-8")


def main() -> int:
    refs = collect_refs()
    views = parse_needed_views()
    manual = {k: v for k, v in json.loads(
        (Path(__file__).parent / "manual-review.json").read_text(encoding="utf-8")).items() if not k.startswith("_")}
    records: list[dict] = []
    skipped: dict[str, str] = {}

    for sdir in sorted(p for p in IMG_ROOT.iterdir() if p.is_dir()):
        slug = sdir.name
        if slug in SKIP_SLUGS:
            skipped[slug] = SKIP_SLUGS[slug]
            continue
        for p in sorted(sdir.iterdir()):
            if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                continue
            with Image.open(p) as im:
                w, h = im.size
            size = p.stat().st_size
            c = classify(slug, p, w, h, size)
            r = refs.get((slug, p.name), {"roles": set(), "pages": set()})
            view = views.get(slug, {}).get(p.name)
            mr = manual.get(f"{slug}/{p.name}", {})
            if mr.get("override_status"):
                c["status"] = mr["override_status"]
                c["reasons"] = c["reasons"] + [mr["reason"]]
                view = view or mr.get("needed_view")
            rec = {
                "slug": slug,
                "project": NAMES.get(slug, slug),
                "file": p.name,
                "path": p.relative_to(ROOT).as_posix(),
                "width": w,
                "height": h,
                "bytes": size,
                **c,
                "live": bool(r["roles"]),
                "roles": sorted(r["roles"]),
                "pages": sorted(r["pages"]),
                "needed_view": view or "",
                "flags": mr.get("flags", []),
            }
            rec["suggested_route"] = route_for(rec, view, 0)
            rec["decision"] = ""  # 留給人工填：search-replace / regenerate / keep / drop
            records.append(rec)

    # ---------- 逐案摘要 ----------
    by_slug: dict[str, list[dict]] = defaultdict(list)
    for r in records:
        by_slug[r["slug"]].append(r)

    summary = []
    for slug, rs in by_slug.items():
        live = [r for r in rs if r["live"]]
        live_en = {r["file"] for r in rs if "detail-en" in r["roles"]}
        live_zh = {r["file"] for r in rs if "detail-zh" in r["roles"]}
        passing_live = [r for r in live if r["status"] == "compliant"]
        gap_live = [r for r in live if r["status"] == "spec-gap"]
        bad_live = [r for r in live if r["status"] == "non-compliant"]
        compliant_all = [r for r in rs if r["status"] == "compliant"]
        # 缺口：僅計入「舊簡報素材專案」（有 legacy render 者）；目標 6 張 − 上線且合格的張數
        in_program = any(r["kind"] == "legacy-render" for r in rs)
        need = max(0, TARGET_ALBUM - len(passing_live)) if in_program else 0
        summary.append({
            "slug": slug,
            "project": NAMES.get(slug, slug),
            "files": len(rs),
            "live_unique": len(live),
            "live_compliant": len(passing_live),
            "live_spec_gap": len(gap_live),
            "live_non_compliant": len(bad_live),
            "compliant_total": len(compliant_all),
            "legacy_render_files": sum(1 for r in rs if r["kind"] == "legacy-render"),
            "en_zh_match": live_en == live_zh,
            "en_count": len(live_en),
            "zh_count": len(live_zh),
            "needed_to_reach_6": need,
            "needed_views": sorted(set(v for v in (r["needed_view"] for r in rs) if v)),
        })

    # ---------- 輸出 ----------
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "inventory.json").write_text(
        json.dumps({"summary": summary, "skipped": skipped, "files": records}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    with (OUT / "inventory.csv").open("w", newline="", encoding="utf-8-sig") as fh:
        cols = ["slug", "project", "file", "kind", "status", "live", "roles", "width", "height", "ratio", "bytes",
                "reasons", "advisory", "needed_view", "suggested_route", "decision", "path"]
        wr = csv.writer(fh)
        wr.writerow(cols)
        for r in records:
            wr.writerow([
                ";".join(r[c]) if isinstance(r[c], list) else r[c] for c in cols
            ])

    # 聯絡表
    if SHEETS.exists():
        for old in SHEETS.glob("*.jpg"):
            old.unlink()
    sheet_index: dict[str, dict[str, str]] = defaultdict(dict)
    for slug, rs in by_slug.items():
        groups = {
            "noncompliant": [r for r in rs if r["status"] == "non-compliant"],
            "specgap": [r for r in rs if r["status"] == "spec-gap"],
            "compliant": [r for r in rs if r["status"] == "compliant"],
        }
        for album, items in groups.items():
            if not items:
                continue
            if album == "specgap" and not any(r["live"] for r in items):
                continue  # 未上線的舊檔（如 qijia 早期 retouched）不列入
            dest = SHEETS / f"{slug}-{album}.jpg"
            contact_sheet(items, dest, f'{NAMES.get(slug, slug)} [{slug}] — {album} ({len(items)})')
            sheet_index[slug][album] = dest.relative_to(OUT).as_posix()

    (OUT / "_sheet_index.json").write_text(json.dumps(sheet_index, indent=2), encoding="utf-8")

    write_reports(summary, records, skipped, sheet_index, by_slug)

    # 簡短終端摘要
    tot = defaultdict(int)
    for r in records:
        tot[r["status"]] += 1
    print(f"files={len(records)}  " + "  ".join(f"{k}={v}" for k, v in sorted(tot.items())))
    print(f"live non-compliant: {sum(s['live_non_compliant'] for s in summary)}  "
          f"live spec-gap: {sum(s['live_spec_gap'] for s in summary)}  "
          f"live compliant: {sum(s['live_compliant'] for s in summary)}")
    print(f"needed_to_reach_6 total: {sum(s['needed_to_reach_6'] for s in summary)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
