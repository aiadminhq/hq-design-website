#!/usr/bin/env python3
"""以 OpenAI images/edits 從乾淨構圖參考重生成超擬真照片，輸出 WebP（長邊 2400、品質 85、<600KB）。
金鑰：由執行環境提供（OPENAI_API_KEY，或 Claude Code 環境 proxy 注入）；repo 不存任何金鑰。
路線：job["route"] = enhance（預設，high＋場景描述）| edit（medium＋通用清理）| upscale（本機放大，不呼叫 API）
用法：python3 regen.py jobs.json <ref_dir> <out_dir> [--only slug:out ...]
"""
import base64, io, json, os, sys, time, urllib.request, uuid
from pathlib import Path
from PIL import Image

API = "https://api.openai.com/v1/images/edits"
EDIT_PROMPT = ("Turn this interior design image into a full-bleed photorealistic architectural photograph of the same space "
               "({view}). Keep the exact layout, camera angle, furniture, materials and colours. Remove any floor-plan inset, "
               "logo watermark, white margins or presentation frame. Make lighting, materials and shadows look like a real "
               "photograph, not a 3D render. No people. No legible text or logos anywhere.")
QUALITY = {"enhance": "high", "edit": "medium", "skill-enhance": "high"}


def skill_prompt(j):
    """photo-enhance-render skill §4：cg-render／interior／final；signage 旗標加逐字保留句。"""
    parts = [
        f'Edit IMAGE 1, a 3D render of a {j["space"]}, into a real photograph of the same space — remove every trace of the CG look.',
        "Keep the design exactly as modeled: geometry, layout, furniture, material colors, and detailing. Change only how it is lit "
        "and photographed: one clear dominant light source with natural falloff and soft bounce light; tight contact shadows where "
        "objects meet floors and walls; physically correct material response with subtle roughness variation, Fresnel reflections, "
        "real-world texture scale, and faint imperfections — no plastic sheen; shot on a full-frame camera with a 35mm lens at eye "
        "level, slight depth of field, subtle sensor grain.",
        "Lighting: daytime; soft daylight from the windows as in IMAGE 1, with neutral 4000K office ceiling lights on.",
        "Keep the camera position, angle, lens, perspective, vanishing points, and framing identical to IMAGE 1. Do not add, remove, "
        "move, or resize any wall, opening, structural element, furniture, fixture, or decorative object.",
    ]
    if j.get("signage"):
        parts.append("Keep all signage text and logos exactly as written, character by character, including Chinese characters; "
                     "render them crisp and legible.")
    if j.get("extra"):
        parts.append(j["extra"])
    parts.append("The result must look like a professional interior design photograph taken on site, not a render or an AI image: "
                 "natural, restrained color, no oversaturation, no oversharpening. Match IMAGE 1's framing; extend the scene only "
                 "minimally where needed to fill a 3:2 frame. No added text, borders, or watermarks. No people.")
    return "\n".join(parts)


def multipart(fields, files):
    b = uuid.uuid4().hex; body = io.BytesIO()
    for k, v in fields.items():
        body.write(f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    for k, (fn, data, ct) in files.items():
        body.write(f'--{b}\r\nContent-Disposition: form-data; name="{k}"; filename="{fn}"\r\nContent-Type: {ct}\r\n\r\n'.encode())
        body.write(data); body.write(b"\r\n")
    body.write(f"--{b}--\r\n".encode())
    return body.getvalue(), f"multipart/form-data; boundary={b}"


def to_webp(png_bytes, dst, max_kb=600):
    im = Image.open(io.BytesIO(png_bytes)).convert("RGB")
    if max(im.size) != 2400:
        s = 2400 / max(im.size); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    for q in (85, 82, 80, 78, 75):
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=q, method=6)
        if buf.tell() <= max_kb * 1024: break
    dst.write_bytes(buf.getvalue()); return im.size, q, buf.tell() // 1024


def main():
    cfg = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    ref_dir, out_dir = Path(sys.argv[2]), Path(sys.argv[3]); out_dir.mkdir(parents=True, exist_ok=True)
    only = {a for a in sys.argv[4:] if a != "--only"}
    key = os.environ.get("OPENAI_API_KEY", "proxy-injected")
    log = []
    for j in cfg["jobs"]:
        tag = f'{j["slug"]}:{j["out"]}'
        if only and tag not in only: continue
        ref = ref_dir / f'{j["slug"]}-{j["ref"].split("-")[1]}.png'
        route = j.get("route", "enhance")
        if route == "upscale":
            im = Image.open(ref).convert("RGB"); buf = io.BytesIO(); im.save(buf, "PNG")
            size, q, kb = to_webp(buf.getvalue(), out_dir / f'{j["slug"]}-{j["out"]}.webp')
            print(json.dumps({"job": tag, "route": route, "size": size, "kb": kb})); continue
        if route == "edit":
            prompt = EDIT_PROMPT.format(view=j["view"])
        elif route == "skill-enhance":
            prompt = skill_prompt(j)
        else:
            scene = j.get("scene") or (f'Space: {j["view"]}. Keep any signage text exactly as it reads in the reference '
                                       'if clearly legible; if it is not clearly legible, leave the sign panel blank.')
            prompt = f'{scene}\n\n{cfg["style"]}'
        body, ct = multipart({"model": j.get("model") or cfg["model"], "prompt": prompt, "size": cfg["size"],
                              "quality": j.get("quality") or QUALITY.get(route, "high"), "n": 1},
                             {"image[]": (ref.name, ref.read_bytes(), "image/png")})
        req = urllib.request.Request(API, data=body, headers={"Content-Type": ct, "Authorization": f"Bearer {key}"})
        t = time.time()
        try:
            with urllib.request.urlopen(req, timeout=600) as r: d = json.load(r)
        except urllib.error.HTTPError as e:
            print(tag, "HTTP", e.code, e.read()[:400].decode(errors="ignore")); continue
        png = base64.b64decode(d["data"][0]["b64_json"])
        (out_dir / f'{j["slug"]}-{j["out"]}.png').write_bytes(png)
        size, q, kb = to_webp(png, out_dir / f'{j["slug"]}-{j["out"]}.webp')
        rec = {"job": tag, "route": route, "view": j["view"], "secs": round(time.time() - t), "size": size, "q": q, "kb": kb, "usage": d.get("usage")}
        print(json.dumps(rec, ensure_ascii=False)); log.append(rec)
    with (out_dir / "log.jsonl").open("a") as fh:
        for r in log: fh.write(json.dumps(r, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
