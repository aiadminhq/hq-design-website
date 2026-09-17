import json, os, glob, re, unicodedata

R="/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/.workflow/active/WFS-hq-website-reset/.process"
REVIEW=os.path.join(R,"photo-review")

# ── 目錄 → 案例對映。排除規則來自各組以 MD5 實證的重複判定 ──────────────
EXCLUDE_DIR = {
 "金普頓拍照":         "40 張全為 700px 縮圖，逐張對應金普頓目錄的 2000x1333 母檔（B 組確認）；且無空拍素材",
 "許昌街POPEYES":      "全數重複於 POPEYES許昌街店（C 組 MD5 10/10 相符）",
 "餐廳":               "Burger-Ray 的重複匯出（C 組 MD5 逐一對應）",
 "起家雞":             "完全重複於 起家雞台中勤美店（D 組 MD5 12 組相符）",
 "起家雞台中":         "完全重複於 起家雞台中勤美店（D 組 MD5 確認）",
 "展示間":             "100% 重複於 國產展示間（F 組 MD5 8 張全同）",
 "新增資料夾":         "4 張全為既有目錄檔案的位元組複本（F 組 MD5 確認）",
 "其他":               "7 張已辨識歸屬至既有目錄（F 組）",
 "台北市林宅":         "住宅案、定位不符、含住戶個資（F 組建議排除）",
 "宜蘭員訓KTV":        "疑為渲染圖或提案圖翻拍、僅 700×467（F 組建議先確認來源）",
}

DIR2CASE = {
 "中保總部 2026":                 ("__PENDING_TENANT_SPLIT__","中保南港總部（多租戶，待拆分）"),
 "中興保全接待大廳":               ("secom-reception","中興保全接待大廳"),
 "金普頓":                        ("kimpton","金普頓大安酒店"),
 "金普頓拍照":                     ("kimpton","金普頓大安酒店"),
 "POPEYES許昌街店":                ("popeyes","POPEYES 許昌街店"),
 "起家雞台中勤美店":               ("qijia","起家雞台中勤美店"),
 "部隊鍋":                        ("budaejjigae","部隊鍋"),
 "Burger-Ray":                    ("burger-ray","Burger-Ray"),
 "復航貴賓室":                     ("airport-lounges","桃園機場航空貴賓室"),
 "泰航貴賓室":                     ("airport-lounges","桃園機場航空貴賓室"),
 "復興航棧大園店":                 ("transasia-bakery-dayuan","復興航棧大園店"),
 "復興航棧春日店":                 ("transasia-bakery-chunri","復興航棧春日店"),
 "復興航棧":                      ("__PARENT_DEDUP__","復興航棧（母目錄，需去重）"),
 "國產辦公室":                     ("guochan-office","國產建材總部辦公"),
 "國產會議室":                     ("guochan-office","國產建材總部辦公"),
 "國產總裁辦公室":                 ("guochan-office","國產建材總部辦公"),
 "國產展示間":                     ("guochan-showroom","國產建材情境展示間"),
 "Vair威航辦公室":                 ("vair-office","威航辦公室"),
 "龍騰旅行社":                     ("longteng-travel","龍騰旅行社"),
 "中保無限家生活館大安店":          ("zhongbao-store-daan","中保無限家生活館 大安店"),
 "中保無限家生活館莊敬店":          ("zhongbao-store-zhuangjing","中保無限家生活館 莊敬店"),
 "中國科大":                       ("zhongbao-smart-facility","中保智慧設施訓練基地（中國科大）"),
 "員工休閒會所":                   ("staff-facility","員訓中心濕區（客戶端）"),
}

# 匙碗湯依 rel 子路徑拆店
def soup_spoon_case(rel):
    if "起家雞" in rel: return (None,"誤置的起家雞照片，應歸 qijia（C 組 MD5 確認）")
    if "臺北火車站" in rel or "台北火車站" in rel: return ("soup-spoon-station","匙碗湯 台北車站店")
    if "101" in rel: return ("soup-spoon-101","匙碗湯 台北 101 店")
    return ("soup-spoon-101","匙碗湯 台北 101 店")   # 母層 3 張經 MD5 確認為 101 重複

# ── 風險關鍵詞偵測 ─────────────────────────────────────────────
RISK = {
 "portrait":   ["人員","人物","顧客","行人","肖像","側臉","坐姿","制服","身影","模糊處理"],
 "confidential":["機密","白板","螢幕","標價","價格","電話","聯絡","徵才","看板紅字","內部工作"],
 "thirdparty": ["畫作","掛軸","掛畫","藝術","電視畫面","第三方"],
 "housekeeping":["標籤","塑膠膜","膠帶","紙箱","垃圾","花籃","保鮮膜","立牌","促銷","未清場","雜物","陳列架","電源線"],
}
def risks(issues, fix, note):
    blob=" ".join([*(issues or []), fix or "", note or ""])
    out=[]
    for k,kws in RISK.items():
        if any(w in blob for w in kws): out.append(k)
    return out

# ── 讀取六組 ────────────────────────────────────────────────────
buckets={}   # slug -> {"label":..., "items":[...]}
excluded=[]
for f in sorted(glob.glob(os.path.join(REVIEW,"*.json"))):
    if "tenant-split" in f: continue
    d=json.load(open(f,encoding='utf-8'))
    for dirname, c in (d.get("cases") or {}).items():
        base=dirname.split("/")[0]
        if base in EXCLUDE_DIR:
            n=len([p for p in (c.get("picks") or []) if not p.get("duplicate")])
            excluded.append((base, EXCLUDE_DIR[base], n)); continue
        for pk in (c.get("picks") or []):
            if pk.get("duplicate"): continue
            g=(pk.get("grade") or "").upper()
            if g not in ("A","B","C"): continue          # D 級不入選
            rel=pk.get("rel","")
            if base=="匙碗湯":
                slug,label=soup_spoon_case(rel)
                if slug is None: excluded.append((rel,label,1)); continue
            else:
                slug,label=DIR2CASE.get(base,(None,None))
                if slug is None: excluded.append((base,"未在對映表中",1)); continue
            it=dict(rel=rel, grade=g, role=pk.get("role") or "gallery",
                    space=pk.get("space") or "", issues=pk.get("issues") or [],
                    fix=pk.get("fix") or "", note=pk.get("note") or "",
                    src_dir=base,
                    is_hero_cand=rel in (c.get("hero_candidates") or []))
            it["in_scope"]=pk.get("in_scope", True)
            if it["in_scope"] is False:
                excluded.append((it["rel"],"明確落在承攬範圍外（B 組判定），不可主張為自家實績",1)); continue
            it["risks"]=risks(it["issues"], it["fix"], it["note"])
            if it["in_scope"]=="uncertain": it["risks"]=it["risks"]+["scope_uncertain"]
            b=buckets.setdefault(slug, {"label":label,"items":[]})
            b["items"].append(it)

# ── 每案挑最多 10 張：1 hero + 至多 6 gallery + 至多 3 detail ────────
GRADE_RANK={"A":0,"B":1,"C":2}
RETOUCH={"A":"none","B":"light","C":"heavy"}
def pick10(items):
    # hero：優先 hero_candidate 且等級最高
    hero=sorted([i for i in items if i["is_hero_cand"] or i["role"]=="hero"],
                key=lambda x:(1 if x.get("in_scope")=="uncertain" else 0,
                              GRADE_RANK[x["grade"]], len(x["risks"]), len(x["issues"])))
    chosen=[]
    if hero: chosen.append(hero[0]); hero[0]["assigned_role"]="hero"
    rest=[i for i in items if i not in chosen]
    rest.sort(key=lambda x:(1 if x.get("in_scope")=="uncertain" else 0,
                            GRADE_RANK[x["grade"]], len(x["risks"]), len(x["issues"])))
    det=[i for i in rest if i["role"]=="detail"][:3]
    for i in det: i["assigned_role"]="detail"
    gal=[i for i in rest if i not in det][:6]
    for i in gal: i["assigned_role"]="gallery"
    chosen += gal + det
    # 若不足 10，從剩餘補齊
    if len(chosen)<10:
        for i in rest:
            if i in chosen: continue
            i["assigned_role"]=i["role"] if i["role"] in ("gallery","detail","context") else "gallery"
            chosen.append(i)
            if len(chosen)>=10: break
    return chosen[:10]

out={"generated":"2026-09-03","policy":"每案最多 10 張｜A 優先、B 次之、C 僅補足｜D 級不入選｜duplicate 已排除",
     "cases":{}, "excluded_dirs":[], "pending":[]}
for slug,b in sorted(buckets.items()):
    sel=pick10(b["items"])
    gc={g:sum(1 for i in sel if i["grade"]==g) for g in "ABC"}
    rec=dict(label=b["label"], candidate_pool=len(b["items"]), selected=len(sel),
             grade_counts=gc,
             ready_to_publish=sum(1 for i in sel if i["grade"]=="A"),
             needs_light_retouch=gc["B"], needs_heavy_retouch=gc["C"],
             blocking_risks=sorted({r for i in sel for r in i["risks"]}),
             scope_uncertain=sum(1 for i in sel if i.get("in_scope")=="uncertain"),
             photos=[dict(rel=i["rel"], role=i.get("assigned_role",i["role"]), grade=i["grade"],
                          space=i["space"], retouch=RETOUCH[i["grade"]],
                          retouch_note=i["fix"], issues=i["issues"], risks=i["risks"],
                          in_scope=i.get("in_scope",True),
                          source_dir=i["src_dir"]) for i in sel])
    if slug.startswith("__"): out["pending"].append({slug:rec})
    else: out["cases"][slug]=rec
seen=set()
for e in excluded:
    k=(e[0],e[1])
    if k in seen: continue
    seen.add(k); out["excluded_dirs"].append({"dir":e[0],"reason":e[1]})

json.dump(out, open(os.path.join(R,"photo-selection.json"),"w",encoding='utf-8'),
          ensure_ascii=False, indent=1)

# ── 摘要 ────────────────────────────────────────────────────────
print(f"{'案例 slug':<30}{'標籤':<26}{'池':>4}{'選':>4}  {'A':>3}{'B':>3}{'C':>3}  風險")
tot=dict(pool=0,sel=0,A=0,B=0,C=0)
for slug,r in out["cases"].items():
    g=r["grade_counts"]; tot['pool']+=r['candidate_pool']; tot['sel']+=r['selected']
    for k in "ABC": tot[k]+=g[k]
    print(f"{slug:<30}{r['label'][:24]:<26}{r['candidate_pool']:>4}{r['selected']:>4}  {g['A']:>3}{g['B']:>3}{g['C']:>3}  {','.join(r['blocking_risks']) or '—'}")
print(f"\n{'合計':<56}{tot['pool']:>4}{tot['sel']:>4}  {tot['A']:>3}{tot['B']:>3}{tot['C']:>3}")
print(f"\n可直接發佈（A，免修圖）: {tot['A']} 張")
print(f"需輕度修圖（B）        : {tot['B']} 張")
print(f"需重度修圖（C）        : {tot['C']} 張")
print(f"\n待處理: {[list(p.keys())[0] for p in out['pending']]}")
print(f"已排除目錄: {len(out['excluded_dirs'])} 個")
