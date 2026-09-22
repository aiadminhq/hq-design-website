# -*- coding: utf-8 -*-
"""Generate /work/ list page + case detail pages for HQ Design site.
Content sources: cms-import-payload.json, cms/data/projects/*.json, NEW-CASES-DATA-NEEDED.md
(suggested values), site/index.html (approved copy). No invented facts.
"""
import json, os, html, subprocess, re

ROOT = "/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website"
SITE = f"{ROOT}/site"
PAYLOAD = f"{ROOT}/.workflow/active/WFS-hq-website-reset/.process/cms-import-payload.json"
CMS = f"{ROOT}/cms/data/projects"
IMG_ROOT = f"{SITE}/assets/img/work"
ORIGIN = "https://www.hqdesign.tw"

payload = json.load(open(PAYLOAD))["cases"]
NAV = open(f"{SITE}/_partials/nav.html").read().rstrip("\n")
FOOTER = open(f"{SITE}/_partials/footer.html").read().rstrip("\n")

def esc(s): return html.escape(s, quote=True)

def dims(path):
    out = subprocess.run(["sips","-g","pixelWidth","-g","pixelHeight",path],capture_output=True,text=True).stdout
    w = int(re.search(r"pixelWidth: (\d+)",out).group(1)); h = int(re.search(r"pixelHeight: (\d+)",out).group(1))
    return w,h

# ---------------------------------------------------------------- categories
CATS = {
 "office":      {"zh":"企業總部／辦公空間","en":"Corporate & Office"},
 "hospitality": {"zh":"國際飯店","en":"Hospitality"},
 "fb":          {"zh":"連鎖餐飲","en":"Chain F&B"},
 "showroom":    {"zh":"展示與訓練空間","en":"Showroom & Training"},
 "lounge":      {"zh":"航空貴賓室","en":"Airline Lounge"},
 "other":       {"zh":"其他工程能力","en":"Other Capabilities"},
}

# ---------------------------------------------------------------- corrected file mapping
# The payload assigned local_path by alphabetical sort; the exported files are named
# <slug>-<role>-<NN>.jpg with NN = sequential index after sorting by (grade, order).
def resolve_images(slug):
    imgs = payload[slug]["images"]
    srt = sorted(imgs, key=lambda im:(im["grade"], im["order"]))
    out = []
    for i, im in enumerate(srt, 1):
        fn = f"{slug}-{im['role']}-{i:02d}.jpg"
        p = f"{IMG_ROOT}/{slug}/{fn}"
        assert os.path.exists(p), p
        w,h = dims(p)
        out.append(dict(im, file=fn, src=f"/assets/img/work/{slug}/{fn}", w=w, h=h,
                        payload_file=im["local_path"].split("/")[-1]))
    out.sort(key=lambda im: im["order"])
    return out


# ---------------------------------------------------------------- AI-visualisation cases
# 影像來源：_EXCHANGE/ai-renders/v3/*.png（Higgsfield 重製，2026-09-04 匯入 2560px）
# 對照清單：_EXCHANGE/website-asset-manifest.md（依 Figma 公司簡介實際採用照片回推）
# alt 為準確但不具體之描述——33 張 AI 圖的實際畫面內容尚未逐張人工判讀，見 STATUS.md 待補項。
def viz_images(slug, name, n, prov="visualisation", spaces=None, alts=None):
    out=[]
    for i in range(1, n+1):
        role = "hero" if i==1 else "gallery"
        fn = f"{slug}-{role}-{i:02d}.jpg"
        sp = (spaces or {}).get(i, "室內空間")
        al = (alts or {}).get(i) or f"{name}｜{sp}設計提案視覺"
        out.append(dict(order=i, role=role, grade="A", retouch="none", retouch_note="",
                        space_zh=sp, file=fn, alt_zh=al, risks=[], prov=prov))
    return out

VIZ_NOTE = ("Visual · 影像性質",
  "本案頁面影像為設計提案視覺（design visualisation），由設計圖面經 AI 重製產出，"
  "用於呈現空間設計意圖與材質配置；並非完工實景攝影。完工攝影安排後將替換。")
ENH_NOTE = ("Visual · 影像性質",
  "本案頁面影像以完工實拍為底，經 AI 進行色溫校正與光影重建、材料樣板補齊與現場雜物移除，"
  "與原始實拍已有差異，性質介於完工實景與設計提案視覺之間。")

# ---------------------------------------------------------------- curated case data
# Only sourced facts. `lede` = payload Text / cms descriptionZh / NEW-CASES suggested one-liner.
CASES = {}
def C(slug, **kw): CASES[slug] = dict(slug=slug, **kw)

C("secom-nangang-complex", cat="office", weight="lead",
  name="中興保全 SECOM 南港總部", gloss="Corporate HQ · Full Design &amp; Build",
  lede="在持續營運且具高度保全需求的企業總部中，以分區施工完成接待、開放辦公、會議與主管空間的整合翻新——維持日常營運不中斷，零重大缺失驗收。",
  specs=[("業主","Client","中保集團 SECOM Group"),("地點","Location","台北市南港區"),("面積","Area","5,940 sqm · 1,797 坪"),
         ("年份","Year","2025"),("範圍","Scope","設計施工統包"),("類別","Type","企業總部"),("樓層","Floors","7F–14F"),("工法","Method","分層分區同步施工")],
  card_d=("<b>5,940</b> sqm","NANGANG · 2025"),
  # not in payload — hand-labelled from the six exported photographs
  images=[
    dict(order=1,role="hero",grade="A",retouch="none",retouch_note="",space_zh="接待大廳",file="secom-nangang-complex-hero-01.jpg",alt_zh="中興保全 SECOM 南港總部｜接待大廳 — 木紋牆面、白色人造石櫃台與集團識別",risks=[]),
    dict(order=2,role="gallery",grade="A",retouch="none",retouch_note="",space_zh="電梯廳",file="secom-nangang-complex-gallery-02.jpg",alt_zh="中興保全 SECOM 南港總部｜電梯廳 — 深灰石紋地坪、深色石牆與 LED 影像牆",risks=[]),
    dict(order=3,role="gallery",grade="A",retouch="light",retouch_note="人員入鏡：上線前需確認肖像權，或修圖去識別化（本頁標註為人工判讀，非選片資料）",space_zh="接待大廳",file="secom-nangang-complex-gallery-03.jpg",alt_zh="中興保全 SECOM 南港總部｜接待大廳 — 櫃台側視與等候區",risks=["portrait"]),
    dict(order=4,role="gallery",grade="A",retouch="none",retouch_note="",space_zh="主管會客區",file="secom-nangang-complex-gallery-04.jpg",alt_zh="中興保全 SECOM 南港總部｜主管會客區 — 沙發組、電視牆與展示櫃",risks=[]),
    dict(order=5,role="gallery",grade="A",retouch="none",retouch_note="",space_zh="主管會客區",file="secom-nangang-complex-gallery-05.jpg",alt_zh="中興保全 SECOM 南港總部｜主管會客區 — 落地窗與城市景觀",risks=[]),
    dict(order=6,role="gallery",grade="A",retouch="none",retouch_note="",space_zh="廊道",file="secom-nangang-complex-gallery-06.jpg",alt_zh="中興保全 SECOM 南港總部｜廊道 — 木皮牆面、掛畫與玻璃隔間",risks=[]),
  ], deferred=[])

C("kimpton", cat="hospitality", weight="lead",
  name="金普頓大安酒店", gloss="Kimpton Da An · Public Areas &amp; Guest Corridors Construction",
  lede="台北大安 Kimpton Da An Hotel 國際飯店裝修工程，由惠強承攬公共區域與客房走廊施工，以精細木作與品牌美學呈現國際精品飯店水準。",
  specs=[("客戶","Client","Kimpton Da An Hotel"),("地點","Location","台北市大安區"),("面積","Area","100 坪"),("年份","Year","2022"),
         ("範圍","Scope","公共區域、客房走廊施工"),("類別","Type","國際精品飯店")],
  note=("Scope · 承攬範圍","本案設計意圖由外部團隊提出，惠強承攬公共區域與客房走廊的施工，自技術驗證階段接手，負責把設計品質建造出來並可被驗收。頁面影像均為惠強施作範圍內之空間。"),
  card_d=("<b>100</b> 坪","DA'AN · TAIPEI · 2022"))

C("zhongbao-smart-facility", cat="showroom", weight="w4",
  name="中保智慧設施訓練基地", gloss="Smart Facility Training Base &amp; Showroom",
  lede="中保集團設於中國科技大學的智慧設施訓練與展示基地。",
  specs=[("客戶","Client","中保集團"),("地點","Location","新北市"),("類別","Type","展示與訓練空間")],
  card_d=("SHOWROOM","NEW TAIPEI"))

C("qijia", cat="fb", weight="w6",
  name="起家雞 台中店", gloss="Chicken Up · Chain F&amp;B · Design &amp; Build",
  lede="起家雞台中店餐飲空間設計施工，以韓式炸雞品牌風格為設計基調，呈現活潑品牌個性，並兼顧高效翻桌與舒適用餐體驗。",
  specs=[("客戶","Client","起家雞 Chicken Up"),("地點","Location","台中"),("面積","Area","212 坪 · 約 700 sqm"),("年份","Year","2019"),
         ("範圍","Scope","餐飲空間設計施工"),("類別","Type","連鎖餐飲")],
  card_d=("<b>212</b> 坪","TAICHUNG · 2019"))

C("soup-spoon-station", cat="fb", weight="w6",
  name="The Soup Spoon 台北車站店", gloss="Singapore F&amp;B Brand · Taipei Main Station",
  lede="The Soup Spoon 台北車站店設計施工，位於高人流交通樞紐，空間規劃強調快速翻桌動線與視覺識別，同時符合車站商場施工規範。",
  specs=[("客戶","Client","The Soup Spoon"),("地點","Location","台北車站商場"),("面積","Area","30 坪"),("年份","Year","2023"),
         ("範圍","Scope","餐飲空間設計施工"),("類別","Type","連鎖餐飲"),("特色","Notes","高人流動線規劃、捷運商場施工規範")],
  card_d=("<b>30</b> 坪","TAIPEI STATION · 2023"))

C("popeyes", cat="fb", weight="w6",
  name="Popeyes 許昌店", gloss="International Chain F&amp;B · Design &amp; Build",
  lede="Popeyes 許昌店餐飲空間設計施工，以美式炸雞品牌識別為核心，規劃符合高翻桌率的高效動線，兼顧品牌個性與施工精度。",
  specs=[("客戶","Client","Popeyes Taiwan"),("地點","Location","台北市許昌街"),("面積","Area","51 坪"),("年份","Year","2024"),
         ("範圍","Scope","餐飲空間設計施工"),("類別","Type","連鎖餐飲")],
  card_d=("<b>51</b> 坪","XUCHANG ST. · TAIPEI · 2024"))

C("airport-lounges", cat="lounge", weight="w6",
  name="桃園機場航空貴賓室", gloss="Airline Lounges · Taoyuan International Airport",
  lede="桃園國際機場內兩家航空公司貴賓室之室內裝修工程。本頁影像以其中一案為主：接待大廳、貴賓室、備餐區與衣帽區。",
  specs=[("地點","Location","桃園市 · 桃園國際機場"),("類別","Type","航空貴賓室")],
  card_d=("AIRLINE LOUNGE","TAOYUAN AIRPORT"))

C("budaejjigae", cat="fb", weight="w4",
  name="部隊鍋", gloss="Korean F&amp;B",
  lede="韓式餐飲空間。",
  specs=[("類別","Type","連鎖餐飲")],
  card_d=("KOREAN F&amp;B",""))

C("guochan-showroom", cat="showroom", weight="w4",
  name="國產建材情境展示間", gloss="Building Materials Showroom · Residential Vignettes",
  lede="建材情境展示空間：以玄關、餐廚、客廳、臥室與衛浴等居家情境陳列建材。",
  specs=[("類別","Type","展示與訓練空間")],
  card_d=("SHOWROOM",""))

C("zhongbao-store-daan", cat="showroom", weight="w4",
  name="中保無限家生活館 大安店", gloss="Smart-Home Lifestyle Store · Da'an",
  lede="復古工業／咖啡館語彙的智慧居家門店。",
  specs=[("地點","Location","台北市大安區"),("類別","Type","展示與訓練空間")],
  card_d=("LIFESTYLE STORE","DA'AN · TAIPEI"), diptych=True)

C("zhongbao-store-zhuangjing", cat="showroom", weight="w4",
  name="中保無限家生活館 莊敬店", gloss="Smart-Home Lifestyle Store · Zhuangjing",
  lede="明亮便利店語彙的智慧居家門店。",
  specs=[("地點","Location","台北市"),("類別","Type","展示與訓練空間")],
  card_d=("LIFESTYLE STORE","TAIPEI"))

C("guochan-office", cat="office", weight="w4",
  name="國產建材總部辦公", gloss="Corporate Office · Boardroom &amp; Executive Suite",
  lede="企業辦公空間：辦公區、會議室與主管辦公室。",
  specs=[("類別","Type","企業總部／辦公空間")],
  card_d=("CORPORATE OFFICE",""))

C("soup-spoon-101", cat="fb", weight="w4",
  name="The Soup Spoon 台北 101 店", gloss="Singapore F&amp;B Brand · Taipei 101",
  lede="The Soup Spoon 台北 101 旗艦店設計施工，於台灣最高地標商場打造符合品牌質感的用餐環境，工程精度與施工速度並重。",
  specs=[("客戶","Client","The Soup Spoon"),("地點","Location","台北 101 購物中心"),("面積","Area","21 坪"),("年份","Year","2023"),
         ("範圍","Scope","餐飲空間設計施工"),("類別","Type","連鎖餐飲")],
  card_d=("<b>21</b> 坪","TAIPEI 101 · 2023"))

C("secom-reception", cat="office", weight="reg",
  name="中興保全接待大廳", gloss="Corporate Reception",
  lede="企業接待大廳：企業識別牆、接待櫃台與垂直綠化。",
  specs=[("地點","Location","台北市"),("類別","Type","企業總部／辦公空間")],
  card_d=("RECEPTION","TAIPEI"))

C("longteng-travel", cat="office", weight="reg",
  name="龍騰旅行社", gloss="Travel Agency Office",
  lede="旅行社辦公空間。",
  specs=[("類別","Type","企業總部／辦公空間")],
  card_d=("OFFICE",""))

C("burger-ray", cat="fb", weight="reg",
  name="Burger-Ray", gloss="Burger Restaurant",
  lede="漢堡餐飲空間。目前僅有一張走廊局部影像，其餘完工攝影待後製後補上。",
  specs=[("類別","Type","連鎖餐飲")],
  card_d=("F&amp;B",""))

C("transasia-bakery-chunri", cat="fb", weight="reg",
  name="復興航棧 春日店", gloss="Bakery &amp; Gift Retail",
  lede="復興航空體系烘焙／伴手禮零售門市。",
  specs=[("地點","Location","桃園市"),("類別","Type","連鎖餐飲 · 烘焙零售")],
  card_d=("BAKERY RETAIL","TAOYUAN"))

C("transasia-bakery-dayuan", cat="fb", weight="reg",
  name="復興航棧 大園店", gloss="Bakery &amp; Gift Retail",
  lede="復興航空體系烘焙／伴手禮零售門市。目前僅有平面圖可供檢視，完工攝影待後製後補上。",
  specs=[("地點","Location","桃園市大園區"),("類別","Type","連鎖餐飲 · 烘焙零售")],
  card_d=("BAKERY RETAIL","DAYUAN · TAOYUAN"))

# ---- AI-visualisation cases（資料源：_EXCHANGE/website-asset-manifest.md §1）----
C("polytron", cat="office", weight="w4",
  name="保創科技 POLYTRON", gloss="POLYTRON · Corporate Office",
  lede="企業辦公空間設計，以參數化方案比較配置後定案。",
  specs=[("地點","Location","台北市"),("面積","Area","850 sqm"),("年份","Year","2025"),("類別","Type","企業辦公")],
  card_d=("<b>850</b> sqm","2025"), note=VIZ_NOTE,
  images=viz_images("polytron","保創科技 POLYTRON",2), deferred=[])

C("csun", cat="office", weight="w4",
  name="志聖工業 C.SUN", gloss="C.SUN INDUSTRIAL · Corporate Office",
  lede="上市製造企業辦公空間，配合企業規模與品牌形象規劃管理階層需求與整體動線。",
  specs=[("地點","Location","台北市南港區"),("面積","Area","711 sqm"),("年份","Year","2026"),("類別","Type","企業辦公")],
  card_d=("<b>711</b> sqm","NANGANG · 2026"), note=VIZ_NOTE,
  images=viz_images("csun","志聖工業 C.SUN",2), deferred=[])

C("liwei", cat="office", weight="w4",
  name="立偉電子 LIWEI", gloss="LIWEI ELECTRONICS · Corporate Office",
  lede="精簡辦公空間規劃與統包設計施工。",
  specs=[("地點","Location","台北市南港區"),("面積","Area","350 sqm"),("年份","Year","2025"),("類別","Type","企業辦公")],
  card_d=("<b>350</b> sqm","NANGANG · 2025"), note=VIZ_NOTE,
  images=viz_images("liwei","立偉電子 LIWEI",2), deferred=[])

C("xinlan", cat="office", weight="w4",
  name="欣蘭企業 XINLAN", gloss="XINLAN ENTERPRISE · Corporate Office",
  lede="企業辦公空間設計，整合品牌識別與工作動線。",
  specs=[("地點","Location","台北市"),("面積","Area","350 sqm"),("年份","Year","2025"),("類別","Type","企業辦公")],
  card_d=("<b>350</b> sqm","2025"), note=VIZ_NOTE,
  images=viz_images("xinlan","欣蘭企業 XINLAN",2), deferred=[])

C("zhongbao-tianhe", cat="office", weight="w4",
  name="天河電訊 eSkylink", gloss="ESKYLINK · Corporate Office",
  lede="電訊企業辦公空間設計。",
  specs=[("地點","Location","台北市南港區"),("面積","Area","350 sqm"),("年份","Year","2025"),("類別","Type","企業辦公")],
  card_d=("<b>350</b> sqm","NANGANG · 2025"), note=VIZ_NOTE,
  images=viz_images("zhongbao-tianhe","天河電訊 eSkylink",2), deferred=[])

C("zhongbao-jingzhen", cat="office", weight="w4",
  name="京琠科技 CHING DIAN TECH", gloss="CHING DIAN TECH · Corporate Office",
  lede="科技企業辦公空間設計。",
  specs=[("地點","Location","台北市南港區"),("面積","Area","250 sqm"),("年份","Year","2025"),("類別","Type","企業辦公")],
  card_d=("<b>250</b> sqm","NANGANG · 2025"), note=VIZ_NOTE,
  images=viz_images("zhongbao-jingzhen","京琠科技 CHING DIAN TECH",3), deferred=[])

C("zhongbao-baojing", cat="office", weight="w4",
  name="中保保經 ZHONG BAO INSURANCE", gloss="ZHONG BAO INSURANCE · Corporate Office",
  lede="保險經紀企業辦公空間設計。",
  specs=[("地點","Location","台北市南港區"),("面積","Area","200 sqm"),("年份","Year","2025"),("類別","Type","企業辦公")],
  card_d=("<b>200</b> sqm","NANGANG · 2025"), note=VIZ_NOTE,
  images=viz_images("zhongbao-baojing","中保保經 ZHONG BAO INSURANCE",2), deferred=[])

C("epicstech-10f", cat="office", weight="w4",
  name="史詩科技 EPICSTECH", gloss="EPICSTECH · Corporate Office",
  lede="科技辦公空間翻新，以精準空間配置與品牌色系整合規劃高效能工作環境。",
  specs=[("地點","Location","台北市南港區"),("面積","Area","165 sqm"),("年份","Year","2025"),("類別","Type","企業辦公")],
  card_d=("<b>165</b> sqm","NANGANG · 2025"), note=VIZ_NOTE,
  images=viz_images("epicstech-10f","史詩科技 EPICSTECH",3), deferred=[])

C("lijie", cat="office", weight="w4",
  name="立捷國際 LIJIE INTERNATIONAL", gloss="LIJIE INTERNATIONAL · Corporate Office",
  lede="企業辦公空間設計，整合集團識別與接待動線。",
  specs=[("地點","Location","台北市南港區"),("面積","Area","99 sqm"),("年份","Year","2024"),("類別","Type","企業辦公")],
  card_d=("<b>99</b> sqm","NANGANG · 2024"), note=VIZ_NOTE,
  images=viz_images("lijie","立捷國際 LIJIE INTERNATIONAL",2), deferred=[])

C("ledaojia", cat="office", weight="w4",
  name="樂到家國際娛樂 LOTS HOME", gloss="LOTS HOME ENTERTAINMENT · Corporate Office",
  lede="娛樂產業辦公空間設計。",
  specs=[("地點","Location","台北市南港區"),("面積","Area","50 sqm"),("年份","Year","2025"),("類別","Type","企業辦公")],
  card_d=("<b>50</b> sqm","NANGANG · 2025"), note=VIZ_NOTE,
  images=viz_images("ledaojia","樂到家國際娛樂 LOTS HOME",3), deferred=[])

C("aiontech", cat="office", weight="w4",
  name="博訊科技 AIONTECH", gloss="AIONTECH · Corporate Office",
  lede="科技辦公空間規劃，含會議支援與彈性工作環境配置。",
  specs=[("地點","Location","台北市南港區"),("面積","Area","825 sqm"),("年份","Year","2025"),("類別","Type","企業辦公")],
  card_d=("<b>825</b> sqm","NANGANG · 2025"), note=VIZ_NOTE,
  images=viz_images("aiontech","博訊科技 AIONTECH",2), deferred=[])

C("baohua", cat="office", weight="w4",
  name="保華資安 BAOHUA", gloss="BAOHUA CYBERSECURITY · Corporate Office",
  lede="資安產業辦公空間設計，以穩重、精準的空間語彙呈現企業專業定位。",
  specs=[("地點","Location","台北市"),("年份","Year","2025"),("類別","Type","企業辦公")],
  card_d=("OFFICE","2025"), note=VIZ_NOTE,
  images=viz_images("baohua","保華資安 BAOHUA",2), deferred=[])

C("zhongbao-showroom", cat="showroom", weight="w4",
  name="中保科技展示廳 SECOM TECHNOLOGY HALL", gloss="SECOM TECHNOLOGY HALL · Showroom",
  lede="中保集團科技展示廳，以 LED 影像牆研討區與企業沿革弧牆呈現集團技術脈絡。",
  specs=[("業主","Client","中保集團 SECOM Group"),("地點","Location","台北市南港區"),("面積","Area","331 sqm"),
         ("年份","Year","2025"),("類別","Type","企業展示廳")],
  card_d=("<b>331</b> sqm","NANGANG · 2025"), note=VIZ_NOTE,
  images=viz_images("zhongbao-showroom","中保科技展示廳 SECOM TECHNOLOGY HALL",2,
                    spaces={1:"LED 影像牆研討區",2:"企業沿革弧牆"},
                    alts={1:"中保科技展示廳｜LED 影像牆研討區設計提案視覺",
                          2:"中保科技展示廳｜企業沿革弧牆設計提案視覺"}), deferred=[])

C("hq-office", cat="showroom", weight="w4",
  name="惠強室內裝修 HQ DESIGN & BUILD", gloss="HQ DESIGN &amp; BUILD · Own Office &amp; Material Library",
  lede="惠強自有辦公室與材料展示空間，作為設計提案與材質選樣的實體場域。",
  specs=[("地點","Location","台北市南港區經貿二路 135 號 9F"),("面積","Area","165 sqm"),
         ("年份","Year","2025"),("類別","Type","自有辦公與材料庫")],
  card_d=("<b>165</b> sqm","NANGANG · 2025"), note=ENH_NOTE,
  images=viz_images("hq-office","惠強室內裝修 HQ DESIGN & BUILD",4, prov="enhanced",
                    spaces={1:"材料展示與洽談區",2:"主管辦公室"},
                    alts={1:"惠強室內裝修｜材料展示與洽談區，實拍經 AI 光影強化",
                          2:"惠強室內裝修｜主管辦公室，實拍經 AI 光影強化"}), deferred=[])

C("staff-facility", cat="other", weight="other",
  name="員訓中心濕區工程", gloss="Wet-Area Works · Client Training Centre",
  lede="客戶端員工訓練中心之濕區工程：三溫暖濕區、室內按摩池與外接庭園。",
  specs=[("類別","Type","其他工程能力 · 濕區工程")],
  card_d=("WET-AREA WORKS",""))

ORDER = list(CASES.keys())

# attach images
for slug, c in CASES.items():
    if "images" in c:   # secom (hand-labelled)
        for im in c["images"]:
            p = f"{IMG_ROOT}/{slug}/{im['file']}"; assert os.path.exists(p), p
            im["w"], im["h"] = dims(p); im["src"] = f"/assets/img/work/{slug}/{im['file']}"
            im["in_scope"] = True; im["payload_file"] = im["file"]
            im["provenance"] = {"visualisation":"design-render","enhanced":"ai-enhanced-photo"}.get(im.get("prov"),"photo-original")
        c.setdefault("deferred", [])
    else:
        c["images"] = [im for im in resolve_images(slug) if im.get("in_scope", True)]
        c["deferred"] = payload[slug].get("deferred_heavy_retouch", [])
    heroes = [im for im in c["images"] if im["role"] == "hero"]
    c["hero"] = heroes[0] if heroes else c["images"][0]

def is_drawing(im): return im["space_zh"] == "平面圖"
def src_label(im):
    """影像來源標示。prov 由 C() 的 images 逐張指定；未指定者依既有規則。
    visualisation = AI 重製的設計提案視覺（非完工實景）
    enhanced      = 實拍經 AI 光影／材質強化，與原始實拍已有差異"""
    prov = im.get("prov")
    if prov == "visualisation": return ("設計提案視覺 · DESIGN VISUALISATION","viz")
    if prov == "enhanced":      return ("實拍 · AI 光影強化 · AI-ENHANCED","enh")
    return ("設計圖面 · FLOOR PLAN","drawing") if is_drawing(im) else ("完工實景 · AS-BUILT","photo")

# ---------------------------------------------------------------- head
def head(title, desc, path, og_img):
    return f"""<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{ORIGIN}{path}">
<meta property="og:type" content="website">
<meta property="og:locale" content="zh_TW">
<meta property="og:site_name" content="HQ Design 惠強室內裝修">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{ORIGIN}{path}">
<meta property="og:image" content="{ORIGIN}{og_img}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Geist+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/assets/css/hq.css">"""

# ---------------------------------------------------------------- shared CSS (tokens only)
SHARED_CSS = """
/* ── work pages · page-level rules · hq.css tokens only ── */
.wk h1{font-size:clamp(34px,4.4vw,64px);line-height:1.08}
.wk h1 .gloss{display:block;font-family:var(--f-en);font-weight:500;font-size:clamp(15px,1.25vw,20px);letter-spacing:.005em;color:var(--fg-3);margin-top:var(--s3)}
.crumb{display:flex;flex-wrap:wrap;align-items:center;gap:var(--s3) var(--s4);font-family:var(--f-mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-3)}
.crumb a{display:inline-flex;align-items:center;min-height:var(--s7);color:var(--fg-2);transition:color .2s}
.crumb a:hover{color:var(--fg)}
.crumb .sep{width:1px;height:1em;background:var(--line-strong);transform:rotate(30deg)}
.fig{margin:0;position:relative}
.fig img{width:100%;height:auto;aspect-ratio:3/2;object-fit:cover}
.wk img,.wl img{height:auto}
.fig figcaption{display:flex;flex-wrap:wrap;gap:var(--s2) var(--s5);margin-top:var(--s3);font-family:var(--f-mono);font-size:12px;color:var(--fg-3);letter-spacing:.02em;line-height:1.7}
.fig .src{display:inline-flex;align-items:center;gap:var(--s2);white-space:nowrap}
.fig .src::before{content:"";width:12px;height:1px;background:var(--brand);transform:rotate(-60deg)}
.fig[data-provenance="drawing"] .src::before{background:var(--fg-3)}
.fig[data-provenance="viz"] .src::before,.fig[data-provenance="enh"] .src::before{background:var(--fg-3)}
.fig[data-provenance="viz"] .src,.fig[data-provenance="enh"] .src{color:var(--fg-3)}
.fig[data-provenance="viz"] img,.fig[data-provenance="enh"] img{border:1px solid var(--line)}
.fig[data-provenance="drawing"] img,.reg .im[data-provenance="drawing"] img,.wgrid .case[data-provenance="drawing"] img{border:1px solid var(--line)}
.fig .sp{color:var(--fg-2)}
/* review layer — hidden unless <body class="review"> (add ?review to the URL) */
body.review .fig[data-retouch]::after{content:"RETOUCH · " attr(data-retouch) " — " attr(data-note);display:block;margin-top:var(--s2);padding-left:var(--s3);border-left:1px solid var(--fg-3);font-family:var(--f-mono);font-size:12px;line-height:1.6;color:var(--fg-2);letter-spacing:.02em}
body.review .fig[data-retouch="none"][data-note=""]::after{content:"RETOUCH · none"}
body.review .fig[data-retouch="heavy"]::after{border-left-color:var(--brand);color:var(--brand)}
body.review .fig[data-orient="portrait"] .sp::after{content:" · PORTRAIT ORIGINAL, CSS-CROPPED"}
"""

DETAIL_CSS = SHARED_CSS + """
.wk .hero .copy{display:flex;flex-direction:column;gap:var(--s5)}
.wk .hero .lede{margin:0}
.wk .hero .media{margin-top:var(--s7)}
.wk .hero .aside{grid-column:1/span 12;display:flex;flex-direction:column;gap:var(--s5)}
@media (min-width:1000px){.wk .hero .media{grid-column:1/span 9;margin-top:var(--s8)}.wk .hero .aside{grid-column:10/span 3;margin-top:var(--s8);align-self:end}}
.spec{margin:0}
.spec>div{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:var(--s3);padding:var(--s3) 0;border-top:1px solid var(--line)}
.spec>div:first-child{border-top-color:var(--line-ink)}
.spec dt{margin:0;font-family:var(--f-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-3);line-height:1.6;padding-top:2px}
.spec dt small{display:block;font-size:11px;letter-spacing:.06em;color:var(--fg-3);text-transform:none;font-family:var(--f-cjk);font-weight:500}
.spec dd{margin:0;font-size:14px;font-weight:500;color:var(--fg);line-height:1.6;font-feature-settings:"tnum" 1}
.wk-story .grid{align-items:start}
.wk-story .l{grid-column:1/span 12}.wk-story .r{grid-column:1/span 12}
@media (min-width:900px){.wk-story .l{grid-column:1/span 5}.wk-story .r{grid-column:7/span 6}}
.wk-story h2{margin-top:var(--s5)}
.wk-gal h2{margin-top:var(--s5)}
.gal{margin-top:var(--s8);display:grid;grid-template-columns:1fr;gap:var(--s7) var(--gutter)}
@media (min-width:700px){.gal{grid-template-columns:repeat(6,1fr)}}
@media (min-width:1000px){.gal{grid-template-columns:repeat(12,1fr)}}
.gal .grp{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:baseline;gap:var(--s2) var(--s4);padding-top:var(--s5);border-top:1px solid var(--line-ink)}
.gal .grp h3{font-size:18px;font-weight:700;letter-spacing:0;line-height:1.3}
.gal .grp .n{font-family:var(--f-mono);font-size:12px;color:var(--fg-3);letter-spacing:.06em}
.gal .grp+.fig{margin-top:calc(var(--s7) * -1 + var(--s5))}
@media (min-width:700px){.gal .g9,.gal .g6,.gal .g4{grid-column:span 3}.gal .g9{grid-column:1/-1}}
@media (min-width:1000px){.gal .g6{grid-column:span 6}.gal .g4{grid-column:span 4}
  .gal .g9{grid-column:1/-1;display:grid;grid-template-columns:repeat(12,1fr);gap:var(--gutter);align-items:end}
  .gal .g9 img{grid-column:1/span 9}
  .gal .g9 figcaption{grid-column:10/span 3;margin:0;flex-direction:column;align-items:flex-start;gap:var(--s2);border-left:1px solid var(--line);padding-left:var(--s4)}
  body.review .gal .g9::after{grid-column:10/span 3}}
.deferred{margin-top:var(--s7);padding-top:var(--s5);border-top:1px solid var(--line);font-size:12px;letter-spacing:.04em;line-height:1.9}
/* drafting diptych — Level A, pure CSS */
.wk-dip h2{margin-top:var(--s5)}
.dip{margin-top:var(--s8);display:grid;grid-template-columns:1fr;gap:var(--s6)}
@media (min-width:800px){.dip{grid-template-columns:minmax(0,1fr) 1px minmax(0,1fr);gap:0 var(--s6);align-items:start}}
.dip .vs{position:relative;height:1px;background:linear-gradient(to right,var(--line-ink) 0 42%,transparent 42% 58%,var(--line-ink) 58% 100%)}
.dip .vs::after{content:"";position:absolute;left:50%;top:50%;width:var(--s4);height:1px;background:var(--brand);transform:translate(-50%,-50%) rotate(30deg)}
@media (min-width:800px){.dip .vs{height:auto;align-self:stretch;background:linear-gradient(to bottom,var(--line-ink) 0 42%,transparent 42% 58%,var(--line-ink) 58% 100%)}.dip .vs::after{transform:translate(-50%,-50%) rotate(-60deg)}}
.dip .lab{display:flex;align-items:center;gap:var(--s2);margin-bottom:var(--s3);font-family:var(--f-mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-3)}
.dip .lab::before{content:"";width:12px;height:1px;background:var(--fg-3);transform:rotate(-60deg)}
.dip .as .lab::before{background:var(--brand)}
.dip .empty{aspect-ratio:3/2;border:1px solid var(--line);display:flex;align-items:center;justify-content:center;text-align:center;padding:var(--s5);font-family:var(--f-mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-3);line-height:1.8}
.dip .fig figcaption{margin-top:var(--s3)}
.dip .foot{grid-column:1/-1;margin-top:var(--s5);font-size:14px;color:var(--fg-2);max-width:44em}
/* adjacent cases */
.wk-adj .top{display:flex;justify-content:space-between;align-items:end;gap:var(--s6);flex-wrap:wrap}
.wk-adj h2{margin-top:var(--s5)}
.adj{margin-top:var(--s7);display:grid;grid-template-columns:1fr;gap:0 var(--gutter);border-top:1px solid var(--line-ink)}
@media (min-width:800px){.adj{grid-template-columns:1fr 1fr}}
.adj a{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,3fr);gap:var(--s4);padding:var(--s5) 0;border-bottom:1px solid var(--line);align-items:center}
.adj a img{width:100%;aspect-ratio:3/2;object-fit:cover}
.adj .k{font-family:var(--f-mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--fg-3)}
.adj .t{font-weight:500;font-size:17px;line-height:1.35;margin-top:var(--s2)}
.adj .t .en{display:block;font-size:13px;color:var(--fg-3);font-weight:400;margin-top:2px}
.adj a.next{grid-template-columns:minmax(0,3fr) minmax(0,2fr);text-align:right}
.adj a.next img{order:2}
.adj .acts{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:var(--s3);padding-top:var(--s7)}
"""

LIST_CSS = SHARED_CSS + """
.wl .hero .copy{display:flex;flex-direction:column;gap:var(--s5)}
.wl .hero .lede{margin:0}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
.filters{display:flex;flex-wrap:wrap;gap:var(--s2);margin-top:var(--s6)}
.filters label{display:inline-flex;align-items:center;gap:var(--s2);min-height:var(--s7);padding:0 var(--s4);border:1px solid var(--line-strong);font-family:var(--f-mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--fg-2);cursor:pointer;transition:color .2s,border-color .2s,background .2s}
.filters label::before{content:"";width:12px;height:1px;background:transparent;transform:rotate(-60deg)}
.filters label:hover{color:var(--fg);background:var(--bg-sunken)}
.filters label b{font-weight:500;color:var(--fg-3)}
.filters label .cjk{letter-spacing:.06em;text-transform:none}
#f-all:checked ~ .filters label[for="f-all"],#f-office:checked ~ .filters label[for="f-office"],#f-hospitality:checked ~ .filters label[for="f-hospitality"],#f-fb:checked ~ .filters label[for="f-fb"],#f-showroom:checked ~ .filters label[for="f-showroom"],#f-lounge:checked ~ .filters label[for="f-lounge"]{border-color:var(--line-ink);color:var(--fg)}
#f-all:checked ~ .filters label[for="f-all"]::before,#f-office:checked ~ .filters label[for="f-office"]::before,#f-hospitality:checked ~ .filters label[for="f-hospitality"]::before,#f-fb:checked ~ .filters label[for="f-fb"]::before,#f-showroom:checked ~ .filters label[for="f-showroom"]::before,#f-lounge:checked ~ .filters label[for="f-lounge"]::before{background:var(--brand)}
#f-all:focus-visible ~ .filters label[for="f-all"],#f-office:focus-visible ~ .filters label[for="f-office"],#f-hospitality:focus-visible ~ .filters label[for="f-hospitality"],#f-fb:focus-visible ~ .filters label[for="f-fb"],#f-showroom:focus-visible ~ .filters label[for="f-showroom"],#f-lounge:focus-visible ~ .filters label[for="f-lounge"]{outline:2px solid var(--brand);outline-offset:3px}
#f-office:checked ~ .wgrid>[data-cat]:not([data-cat="office"]),#f-office:checked ~ .reg [data-cat]:not([data-cat="office"]),
#f-hospitality:checked ~ .wgrid>[data-cat]:not([data-cat="hospitality"]),#f-hospitality:checked ~ .reg [data-cat]:not([data-cat="hospitality"]),
#f-fb:checked ~ .wgrid>[data-cat]:not([data-cat="fb"]),#f-fb:checked ~ .reg [data-cat]:not([data-cat="fb"]),
#f-showroom:checked ~ .wgrid>[data-cat]:not([data-cat="showroom"]),#f-showroom:checked ~ .reg [data-cat]:not([data-cat="showroom"]),
#f-lounge:checked ~ .wgrid>[data-cat]:not([data-cat="lounge"]),#f-lounge:checked ~ .reg [data-cat]:not([data-cat="lounge"]){display:none}
#f-hospitality:checked ~ .reg,#f-showroom:checked ~ .reg,#f-lounge:checked ~ .reg{display:none}
.wgrid{margin-top:var(--s8);display:grid;grid-template-columns:1fr;gap:var(--s7) var(--gutter);grid-auto-flow:dense}
@media (min-width:700px){.wgrid{grid-template-columns:repeat(6,1fr)}.wgrid>.case.w6,.wgrid>.case.w4{grid-column:span 3}.wgrid>.note-slot{grid-column:1/-1}}
@media (min-width:1000px){.wgrid{grid-template-columns:repeat(12,1fr)}.wgrid>.case.w6{grid-column:span 6}.wgrid>.case.w4{grid-column:span 4}.wgrid>.note-slot{grid-column:9/span 4;align-self:end}}
.wgrid .case .src.drawing::before,.wgrid .case .src.viz::before,.wgrid .case .src.enh::before{background:var(--fg-3)}
.wgrid .case .src.viz,.wgrid .case .src.enh{color:var(--fg-3)}
.note-slot{display:flex;flex-direction:column;gap:var(--s5)}
.reg{margin-top:var(--s9);border-top:1px solid var(--line-ink);padding-top:var(--s5)}
.reg .eyebrow+p{margin-top:var(--s3);font-size:14px;color:var(--fg-2);max-width:44em}
.reg .rows{margin-top:var(--s5)}
.reg a.row{display:grid;grid-template-columns:1fr;gap:var(--s4);padding:var(--s5) 0;border-top:1px solid var(--line);align-items:center}
@media (min-width:700px){.reg a.row{grid-template-columns:repeat(12,1fr);gap:var(--gutter)}.reg .im{grid-column:span 3}.reg .tx{grid-column:span 5}.reg .d{grid-column:span 2}.reg .s{grid-column:span 2;justify-self:end}}
.reg img{width:100%;aspect-ratio:3/2;object-fit:cover;transition:transform .6s var(--ease)}
.reg a.row:hover img{transform:scale(1.015)}
.reg .im{overflow:hidden}
.reg .t{font-weight:500;font-size:17px;line-height:1.35}
.reg .t .en{display:block;font-size:13px;color:var(--fg-3);font-weight:400;margin-top:2px}
.reg .d{font-family:var(--f-mono);font-size:12px;color:var(--fg-3);line-height:1.7;letter-spacing:.02em}
.reg .d b{color:var(--fg);font-weight:500}
.reg .s{font-family:var(--f-mono);font-size:11px;letter-spacing:.06em;color:var(--fg-3);display:inline-flex;align-items:center;gap:var(--s2);white-space:nowrap}
.reg .s::before{content:"";width:12px;height:1px;background:var(--brand);transform:rotate(-60deg)}
.reg .s.drawing::before,.reg .s.viz::before,.reg .s.enh::before{background:var(--fg-3)}
.vizsec{margin-top:var(--s10);padding-top:var(--s7);border-top:1px solid var(--line-ink)}
.vizsec h2{margin-top:var(--s5);font-size:clamp(24px,2.6vw,36px);max-width:26em}
.vizsec>p{margin-top:var(--s5);color:var(--fg-2);max-width:46em;font-size:15px}
.other{background:var(--bg-sunken)}
.other .grid{align-items:center}
.other .l{grid-column:1/span 12}.other .r{grid-column:1/span 12}
@media (min-width:900px){.other .l{grid-column:1/span 7}.other .r{grid-column:9/span 4}}
.other h2{margin-top:var(--s5);font-size:clamp(20px,1.9vw,26px);font-weight:500;line-height:1.3;letter-spacing:0}
.other p{margin-top:var(--s4);font-size:14px;color:var(--fg-2);max-width:44em}
.other .r a{display:block}
.other .r img{width:100%;aspect-ratio:3/2;object-fit:cover}
.other .r .src{margin-top:var(--s3);font-family:var(--f-mono);font-size:11px;letter-spacing:.06em;color:var(--fg-3);display:inline-flex;align-items:center;gap:var(--s2)}
.other .r .src::before{content:"";width:12px;height:1px;background:var(--brand);transform:rotate(-60deg)}
"""

REVIEW_JS = """<script>if(/[?&]review(=|&|$)/.test(location.search))document.body.classList.add('review');</script>"""

# ---------------------------------------------------------------- helpers
def fig_html(im, cls="", cap_extra=None, lazy=True, hero=False):
    label, prov = src_label(im)
    orient = "portrait" if im["h"] > im["w"] else "landscape"
    note = im.get("retouch_note") or ""
    sp = im["space_zh"] + (f" · {cap_extra}" if cap_extra else "")
    attrs = f'data-retouch="{esc(im["retouch"])}" data-note="{esc(note)}"'
    ld = "" if not lazy else ' loading="lazy"'
    figcls = ("fig " + cls).strip()
    return f"""<figure class="{figcls}" data-provenance="{prov}" data-orient="{orient}" {attrs}>
  <img src="{im['src']}" alt="{esc(im['alt_zh'])}" width="{im['w']}" height="{im['h']}"{ld} {attrs}>
  <figcaption><span class="src">{label}</span><span class="sp">{esc(sp)}</span></figcaption>
</figure>"""

def spans_for(n):
    """9/6/4-column rhythm for a group of n gallery images (never 8)."""
    if n == 1: return [9]
    if n == 2: return [6,6]
    if n == 3: return [4,4,4]
    if n == 5: return [6,6,4,4,4]
    out = [9]; r = n-1
    while r > 0:
        if r >= 5: out += [6,6,4,4,4]; r -= 5
        elif r == 4: out += [6,6,6,6]; r = 0
        elif r == 3: out += [4,4,4]; r = 0
        elif r == 2: out += [6,6]; r = 0
        else: out += [9]; r = 0
    return out

def adjacent(slug):
    i = ORDER.index(slug); cat = CASES[slug]["cat"]
    pub = [s for s in ORDER if CASES[s]["weight"] != "other"]  # staff-facility only reachable from list footer
    if slug not in pub: pub = ORDER
    j = pub.index(slug); n = len(pub)
    def pick(step):
        # same sector first, walking in the given direction; fall back to global neighbour
        for k in range(1, n):
            s = pub[(j + step*k) % n]
            if CASES[s]["cat"] == cat: return s
        return pub[(j + step) % n]
    prv, nxt = pick(-1), pick(1)
    if prv == nxt and n > 2:  # two-member sector: keep sector for next, global for prev
        prv = pub[(j - 1) % n]
        if prv == nxt: prv = pub[(j - 2) % n]
    return prv, nxt

# ---------------------------------------------------------------- detail page
def detail_page(slug):
    c = CASES[slug]; cat = CATS[c["cat"]]
    hero = c["hero"]
    gallery = [im for im in c["images"] if im is not hero]
    dip_img = None
    if c.get("diptych"):
        # use the custom display fixture (detail-06) as the AS-BUILT half; remove it from the gallery
        dip_img = next((im for im in gallery if im["role"] == "detail"), gallery[-1])
        gallery = [im for im in gallery if im is not dip_img]

    title = f"{c['name']}｜實績｜惠強室內裝修 HQ Design"
    desc = re.sub(r"<[^>]+>", "", c["lede"])
    path = f"/work/{slug}/"
    out = [head(title, desc, path, hero["src"]), f"<style>{DETAIL_CSS}</style>", "</head>", '<body class="wk">', NAV]

    # ---- hero
    spec_rows = "".join(f'<div><dt>{esc(en)}<small>{esc(zh)}</small></dt><dd>{esc(v)}</dd></div>' for zh,en,v in c["specs"])
    out.append(f"""
<header class="hero" id="top">
  <div class="wrap">
    <div class="grid">
      <div class="copy rv">
        <nav class="crumb" aria-label="路徑"><a href="/work/">← 全部實績</a><span class="sep" aria-hidden="true"></span><span>{esc(cat['en'])} · {esc(cat['zh'])}</span></nav>
        <h1><span class="cjk">{esc(c['name'])}</span><span class="gloss">{c['gloss']}</span></h1>
        <p class="lede cjk">{c['lede']}</p>
      </div>
      {fig_html(hero, cls="media rv", lazy=False, hero=True)}
      <aside class="aside rv">
        <dl class="spec">{spec_rows}</dl>
      </aside>
    </div>
  </div>
</header>""")

    sec = 1
    # ---- scope / note section (only when extra sourced content exists)
    if c.get("note"):
        k, txt = c["note"]
        out.append(f"""
<section class="wk-story hair">
  <div class="wrap">
    <div class="grid">
      <div class="l">
        <div class="eyebrow"><span class="n">{sec:02d}</span><span>Scope</span></div>
        <h2 class="cjk">承攬範圍，<br>如實標示。</h2>
      </div>
      <div class="r">
        <div class="aside"><div class="note"><b>{esc(k)}</b><span class="cjk">{esc(txt)}</span></div></div>
      </div>
    </div>
  </div>
</section>"""); sec += 1

    # ---- gallery grouped by space (order of first appearance)
    groups = []
    for im in gallery:
        for g in groups:
            if g[0] == im["space_zh"]: g[1].append(im); break
        else: groups.append([im["space_zh"], [im]])
    gal_items = []
    for space, ims in groups:
        gal_items.append(f'<div class="grp"><h3 class="cjk">{esc(space)}</h3><span class="n">{len(ims):02d} IMG</span></div>')
        for im, sp in zip(ims, spans_for(len(ims))):
            extra = "右後方為展示佈景" if (slug=="zhongbao-smart-facility" and "全區廣角" in im["space_zh"]) else None
            gal_items.append(fig_html(im, cls=f"g{sp}", cap_extra=extra))
    deferred_html = ""
    if c.get("deferred"):
        spaces = []
        for d in c["deferred"]:
            s = d["space"]
            if s not in spaces: spaces.append(s)
        deferred_html = f'<p class="deferred small mono">另有 {len(c["deferred"])} 張完工攝影待後製後補上 · {esc("、".join(spaces))}</p>'
    if gallery or deferred_html:
        n_all = len(c["images"])
        out.append(f"""
<section class="wk-gal hair">
  <div class="wrap">
    <div class="eyebrow"><span class="n">{sec:02d}</span><span>Gallery · {n_all:02d} images</span></div>
    <h2 class="cjk">完工實景</h2>
    {'<div class="gal">' + chr(10).join(gal_items) + '</div>' if gallery else '<p class="lede cjk" style="margin-top:var(--s6)">本案目前僅有上方一張影像可供檢視。</p>'}
    {deferred_html}
  </div>
</section>"""); sec += 1

    # ---- diptych (zhongbao-store-daan only)
    if dip_img:
        out.append(f"""
<section class="wk-dip hair">
  <div class="wrap">
    <div class="eyebrow"><span class="n">{sec:02d}</span><span>Design Intent → As-Built</span></div>
    <h2 class="cjk">設計視覺化與完工實景，<br>同機位並置。</h2>
    <div class="dip">
      <div class="di">
        <div class="lab">設計視覺化 · Design Intent</div>
        <div class="empty" aria-label="設計視覺化影像待補">設計視覺化 · 待補</div>
      </div>
      <div class="vs" aria-hidden="true"></div>
      <div class="as">
        <div class="lab">完工實景 · As-Built</div>
        {fig_html(dip_img)}
      </div>
      <p class="foot cjk">對照組需同機位、同視角的渲染圖與完工攝影配對；左側渲染影像到位前，此處保留結構、不放替代圖。</p>
    </div>
  </div>
</section>"""); sec += 1

    # ---- adjacent
    prv, nxt = adjacent(slug)
    def adj_card(s, cls, k):
        cc = CASES[s]; h = cc["hero"]
        return f"""<a class="{cls}" href="/work/{s}/">
        <img src="{h['src']}" alt="{esc(h['alt_zh'])}" width="{h['w']}" height="{h['h']}" loading="lazy">
        <div><div class="k">{k}</div><div class="t cjk">{esc(cc['name'])}<span class="en">{cc['gloss']}</span></div></div>
      </a>"""
    out.append(f"""
<section class="wk-adj hair">
  <div class="wrap">
    <div class="top">
      <div>
        <div class="eyebrow"><span class="n">{sec:02d}</span><span>More Work</span></div>
        <h2 class="cjk">相鄰案例</h2>
      </div>
      <a class="btn ghost" href="/work/">全部實績 <span class="ar">→</span></a>
    </div>
    <div class="adj">
      {adj_card(prv, "prev", "← Prev · " + esc(CATS[CASES[prv]['cat']]['en']))}
      {adj_card(nxt, "next", "Next · " + esc(CATS[CASES[nxt]['cat']]['en']) + " →")}
      <div class="acts">
        <a class="btn" href="/contact/">洽詢類似專案 <span class="ar">→</span></a>
        <a class="btn ghost" href="/process/">看設計流程 <span class="ar">→</span></a>
      </div>
    </div>
  </div>
</section>""")
    out += [FOOTER, REVIEW_JS, "</body>", "</html>"]
    return "\n".join(out) + "\n"

# ---------------------------------------------------------------- list page
def card_html(slug, cls):
    c = CASES[slug]; h = c["hero"]; label, prov = src_label(h)
    d1, d2 = c["card_d"]
    d = d1 + (f"<br>{d2}" if d2 else "")
    return f"""<a class="case {cls}" href="/work/{slug}/" data-cat="{c['cat']}" data-provenance="{prov}">
        <div class="imgw"><img src="{h['src']}" alt="{esc(h['alt_zh'])}" width="{h['w']}" height="{h['h']}" loading="lazy"></div>
        <div class="meta">
          <div class="t cjk">{esc(c['name'])}<span class="en">{c['gloss']}</span></div>
          <div class="d">{d}</div>
          <div class="src{(' '+prov) if prov in ('drawing','viz','enh') else ''}">{label}</div>
        </div>
      </a>"""

def reg_row(slug):
    c = CASES[slug]; h = c["hero"]; label, prov = src_label(h)
    d1, d2 = c["card_d"]
    d = d1 + (f"<br>{d2}" if d2 else "")
    return f"""<a class="row" href="/work/{slug}/" data-cat="{c['cat']}">
        <div class="im" data-provenance="{prov}"><img src="{h['src']}" alt="{esc(h['alt_zh'])}" width="{h['w']}" height="{h['h']}" loading="lazy"></div>
        <div class="tx"><div class="t cjk">{esc(c['name'])}<span class="en">{c['gloss']}</span></div></div>
        <div class="d">{d}</div>
        <div class="s{(' '+prov) if prov in ('drawing','viz','enh') else ''}">{label}</div>
      </a>"""

def list_page():
    pub = [s for s in ORDER if CASES[s]["weight"] != "other"]
    counts = {k: sum(1 for s in pub if CASES[s]["cat"]==k) for k in CATS}
    title = "實績｜商業空間設計施工案例｜惠強室內裝修 HQ Design"
    desc = f"惠強室內裝修 {len(pub)} 件有完工實景的商業空間案例：企業總部與辦公空間、國際飯店、連鎖餐飲、展示與訓練空間、航空貴賓室。每張影像逐一標示來源。"
    out = [head(title, desc, "/work/", CASES["secom-nangang-complex"]["hero"]["src"]), f"<style>{LIST_CSS}</style>", "</head>", '<body class="wl">', NAV]
    filt_defs = [("all","全部","All",len(pub))] + [(k, CATS[k]["zh"], CATS[k]["en"], counts[k]) for k in ("office","hospitality","fb","showroom","lounge")]
    inputs = "\n    ".join(f'<input class="vh" type="radio" name="f" id="f-{k}"{" checked" if k=="all" else ""}>' for k,_,_,_ in filt_defs)
    labels = "\n      ".join(f'<label for="f-{k}"><span class="cjk">{esc(zh)}</span><span>{esc(en)}</span><b>{n}</b></label>' for k,zh,en,n in filt_defs)
    secom = CASES["secom-nangang-complex"]
    grid = [
      card_html("secom-nangang-complex","lead"),
      f"""<div class="note-slot" data-cat="office">
        <div class="aside"><div class="note"><b>Featured · 旗艦案</b><span class="cjk">{esc(secom['lede'])}</span></div></div>
        <a class="btn ghost" href="/work/secom-nangang-complex/">看旗艦案 <span class="ar">→</span></a>
      </div>""",
      card_html("kimpton","lead"),
      card_html("zhongbao-smart-facility","w4"),
      card_html("qijia","w6"), card_html("soup-spoon-station","w6"),
      card_html("popeyes","w6"), card_html("airport-lounges","w6"),
      card_html("budaejjigae","w4"), card_html("guochan-showroom","w4"), card_html("zhongbao-store-daan","w4"),
      card_html("zhongbao-store-zhuangjing","w4"), card_html("guochan-office","w4"), card_html("soup-spoon-101","w4"),
    ]
    regs = [reg_row(s) for s in ("secom-reception","longteng-travel","burger-ray","transasia-bakery-chunri","transasia-bakery-dayuan")]
    # 設計提案視覺（AI 重製）— 與實拍分區，依面積遞減
    VIZ = ("polytron","aiontech","csun","liwei","xinlan","zhongbao-tianhe","zhongbao-jingzhen",
           "zhongbao-baojing","epicstech-10f","lijie","ledaojia","baohua")
    viz_cards = [card_html(x,"w4") for x in VIZ]
    viz_show  = [card_html(x,"w6") for x in ("zhongbao-showroom","hq-office")]
    sf = CASES["staff-facility"]; sfh = sf["hero"]
    out.append(f"""
<header class="hero" id="top">
  <div class="wrap">
    <div class="grid">
      <div class="copy rv">
        <div class="eyebrow"><span class="n">Selected Work</span><span>{len(pub)} cases · 5 sectors · Source-labelled imagery</span></div>
        <h1><span class="row cjk">實績</span><span class="row cjk" style="font-size:.42em;margin-top:.35em;color:var(--fg-2)">每張影像都標示來源——完工實景、設計提案視覺或設計圖面。</span></h1>
        <p class="lede cjk">{len(pub)} 件商業空間案例，依業種分類。上半為完工實景案例，下半為尚未安排完工攝影、以設計提案視覺呈現的案例——兩者分區呈現，每張影像逐一標示性質。</p>
      </div>
    </div>
  </div>
</header>

<section class="work" id="cases" style="padding-top:var(--s8)">
  <div class="wrap">
    {inputs}
    <div class="filters" role="group" aria-label="依業種篩選">
      {labels}
    </div>
    <div class="wgrid">
      {chr(10).join(grid)}
    </div>
    <div class="vizsec">
      <div class="eyebrow"><span class="n">Design Visualisation</span><span>設計提案視覺 · 尚未完工攝影</span></div>
      <h2 class="cjk">以下案例的影像為設計提案視覺，不是完工實景。</h2>
      <p class="cjk">這些案子都已完工，但尚未安排完工攝影。頁面影像由設計圖面經 AI 重製產出，用於呈現空間設計意圖與材質配置。完工攝影安排後將逐案替換——每張影像的性質都標示在圖說上。</p>
      <div class="wgrid" style="margin-top:var(--s7)">
        {chr(10).join(viz_show)}
        {chr(10).join(viz_cards)}
      </div>
    </div>
    <div class="reg">
      <div class="eyebrow"><span class="n">Further Work</span><span>影像數量有限的案例</span></div>
      <p class="cjk">以下案例目前可公開的完工影像僅 1–3 張，先以列表呈現；其餘攝影待後製後補上。</p>
      <div class="rows">
        {chr(10).join(regs)}
      </div>
    </div>
  </div>
</section>

<section class="other hair" id="other-capabilities">
  <div class="wrap">
    <div class="grid">
      <div class="l">
        <div class="eyebrow"><span class="n">Other Capabilities</span><span>其他工程能力</span></div>
        <h2 class="cjk">濕區工程 · 客戶端員工訓練中心</h2>
        <p class="cjk">{esc(sf['lede'])}此為客戶端設施的工程實績，作為濕區工程技術能力的佐證，不列入主要案例。</p>
      </div>
      <div class="r">
        <a href="/work/staff-facility/" aria-label="員訓中心濕區工程">
          <img src="{sfh['src']}" alt="{esc(sfh['alt_zh'])}" width="{sfh['w']}" height="{sfh['h']}" loading="lazy">
          <span class="src">完工實景 · AS-BUILT</span>
        </a>
      </div>
    </div>
  </div>
</section>

<section class="cta hair" id="contact">
  <div class="wrap">
    <div class="grid">
      <div class="l">
        <div class="eyebrow"><span class="n">Start a Project</span><span>洽詢</span></div>
        <h2 class="cjk">同業種的案子，<br>從第一次會議就用同一套模型談。</h2>
        <p class="lede cjk">告訴我們人數、面積、時程與營運限制。我們會在第一次提案就帶著多組參數化方案與可建造性的初步驗證來。</p>
      </div>
      <div class="r">
        <a class="btn" href="/contact/">洽詢專案 <span class="ar">→</span></a>
        <a class="btn ghost" href="/process/">看設計流程 <span class="ar">→</span></a>
        <p class="small mono">TAIPEI, TAIWAN · EST. 1995</p>
      </div>
    </div>
  </div>
</section>""")
    out += [FOOTER, REVIEW_JS, "</body>", "</html>"]
    return "\n".join(out) + "\n"

# ---------------------------------------------------------------- write
os.makedirs(f"{SITE}/work", exist_ok=True)
open(f"{SITE}/work/index.html","w",encoding="utf-8").write(list_page())
for slug in ORDER:
    os.makedirs(f"{SITE}/work/{slug}", exist_ok=True)
    open(f"{SITE}/work/{slug}/index.html","w",encoding="utf-8").write(detail_page(slug))
print("written:", 1 + len(ORDER), "files")

# mapping report for the parent
mis = 0
for slug in ORDER:
    for im in CASES[slug]["images"]:
        if im["file"] != im["payload_file"]: mis += 1
print("images whose payload local_path pointed at a different file:", mis)
