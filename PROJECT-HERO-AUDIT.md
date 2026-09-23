# Project Hero Meta Audit

**Branch:** `feat/project-hero-meta-normalize`  
**Scope:** EN `projects/*.html` + ZH `zh/projects/*.html` (orphan `zhongbao-nangang.html` left unchanged — not in sitemap, no ZH twin)

## Why formats differed

1. **Bilingual split leftover:** Several EN hero locations still used Chinese strings (`台灣`, `台北大安`, `台北許昌街`, `台北 101`, `台北車站`, `台北`, full Chinese street address on HQ Office) while siblings like SECOM/AIONTECH already used English (`Nangang, Taipei`).
2. **SECOM / flagship custom chrome:** SECOM badge was `Flagship HQ · Design & Build` (EN) / `旗艦總部 · 設計施工統包` (ZH), embedding credit into the category chip unlike the majority (`Corporate Office`, `Tech Office`, `F&B`, etc.).
3. **Size meta never filled in hero:** Every project had Area/坪數 in Project Info specs, but **zero** detail heroes showed a size chip — so field count was 3 (location / status / credit) everywhere, even when area was known.

## Target shared pattern (locked)

```
[badge: category only]
[h1]
.proj-hero-meta slots (same order EN + ZH):
  1. Location  — <span><strong>…</strong></span>
  2. Size      — <span><strong>…</strong></span>  (omit ONLY if no area in source)
  3. Status    — Completed/完工 <strong>YYYY</strong>
  4. Credit    — Design & Build / 設計施工統包 <strong>HQ Design / 惠強</strong>
```

- EN location: English only (never CJK). EN size: `X SQM` or `~X SQM`. EN area unit only.
- ZH location: Chinese place names. ZH size: `X 坪` only.
- Category badge may differ by project type; DOM/slots must match. SECOM badge normalized to category-only (`Flagship HQ` / `旗艦總部`) — credit stays in slot 4.

## Pre-fix inventory

| Project | EN loc (before) | EN size hero | EN badge | ZH loc | ZH size hero | ZH badge | Flags |
|---------|-----------------|--------------|----------|--------|--------------|----------|-------|
| aiontech | Nangang, Taipei | — | Tech Office | 台北南港 | — | 科技辦公室 | missing_size |
| baohua | Nangang, Taipei | — | Corporate Office | 台北南港 | — | 企業辦公室 | missing_size |
| csun | **台灣** | — | Corporate Office | 台灣 | — | 企業辦公室 | **chinese_on_en**, missing_size |
| epicstech-10f | Nangang, Taipei | — | Corporate Office | 台北南港 | — | 企業辦公室 | missing_size |
| hq-office | **台北市南港區經貿二路…** | — | Office & Showroom | 台北市南港區經貿二路… | — | Office & Showroom (EN on ZH) | **chinese_on_en**, missing_size, badge_lang |
| kimpton | **台北大安** | — | Hospitality | 台北大安 | — | 飯店 | **chinese_on_en**, missing_size |
| ledaojia | Nangang, Taipei | — | Corporate Office | 台北南港 | — | 企業辦公室 | missing_size |
| lijie | Nangang, Taipei | — | Corporate Office | 台北南港 | — | 企業辦公室 | missing_size |
| liwei | Nangang, Taipei | — | Corporate Office | 台北南港 | — | 企業辦公室 | missing_size |
| polytron | Nangang, Taipei | — | Tech Office | 台北南港 | — | 科技辦公室 | missing_size |
| popeyes | **台北許昌街** | — | F&B | 台北許昌街 | — | 餐飲 | **chinese_on_en**, missing_size |
| qijia | Taichung | — | F&B | 台中 | — | 餐飲 | missing_size |
| secom-nangang-complex | Nangang, Taipei | — | Flagship HQ · Design & Build | 台北市南港區 | — | 旗艦總部 · 設計施工統包 | missing_size, **nonstandard_badge** |
| soup-spoon-101 | **台北 101** | — | F&B | 台北 101 | — | 餐飲 | **chinese_on_en**, missing_size |
| soup-spoon-station | **台北車站** | — | F&B | 台北車站 | — | 餐飲 | **chinese_on_en**, missing_size |
| xinlan | Nangang, Taipei | — | Corporate Office | 台北南港 | — | 企業辦公室 | missing_size |
| zhongbao-baojing | Nangang, Taipei | — | Corporate Office | 台北南港 | — | 企業辦公室 | missing_size |
| zhongbao-jingzhen | Nangang, Taipei | — | Corporate Office | 台北南港 | — | 企業辦公室 | missing_size |
| zhongbao-nangang | 台北市南港區經貿二路 | — | Corporate Office | *(no ZH twin)* | — | — | orphan, left alone |
| zhongbao-showroom | **台北** | — | Exhibition Hall | 台北 | — | Exhibition Hall (EN on ZH) | **chinese_on_en**, missing_size, badge_lang |
| zhongbao-tianhe | Nangang, Taipei | — | Corporate Office | 台北南港 | — | 企業辦公室 | missing_size |

### Spec areas used for hero size (source of truth)

| Project | EN Area (Project Info) | ZH 坪數 |
|---------|------------------------|---------|
| aiontech | 825 sqm | 250 坪 |
| baohua | 350 sqm | 106 坪 |
| csun | 710 sqm | 215 坪 |
| epicstech-10f | 165 sqm | 50 坪 |
| hq-office | 165 sqm | 50 坪 |
| kimpton | 330 sqm | 100 坪 |
| ledaojia | 50 sqm | 15 坪 |
| lijie | 100 sqm | 30 坪 |
| liwei | 350 sqm | 106 坪 |
| polytron | 850 sqm | 257 坪 |
| popeyes | 170 sqm | 51 坪 |
| qijia | 700 sqm | 212 坪 |
| secom-nangang-complex | ~6,000 sqm (ATL-locked) | 1,800 坪 (ATL-locked) |
| soup-spoon-101 | 70 sqm | 21 坪 |
| soup-spoon-station | 100 sqm | 30 坪 |
| xinlan | 350 sqm | 106 坪 |
| zhongbao-baojing | 200 sqm | 60 坪 |
| zhongbao-jingzhen | 250 sqm | 76 坪 |
| zhongbao-showroom | 330 sqm | 100 坪 |
| zhongbao-tianhe | 350 sqm | 106 坪 |

**Projects left without size:** none among paired pages (all have Project Info area). Orphan `zhongbao-nangang` has no Area/坪數 in EN specs (only floor-count scope) — left unchanged.

## Planned fixes

See post-fix section after apply (filled by script).

## Post-fix hero meta
| Project | EN location | EN size | EN badge | ZH location | ZH size | ZH badge |
|---------|-------------|---------|----------|-------------|---------|----------|
| aiontech | Nangang, Taipei | 825 SQM | Tech Office | 台北南港 | 250 坪 | 科技辦公室 |
| baohua | Nangang, Taipei | 350 SQM | Corporate Office | 台北南港 | 106 坪 | 企業辦公室 |
| csun | Taiwan | 710 SQM | Corporate Office | 台灣 | 215 坪 | 企業辦公室 |
| epicstech-10f | Nangang, Taipei | 165 SQM | Corporate Office | 台北南港 | 50 坪 | 企業辦公室 |
| hq-office | Nangang, Taipei | 165 SQM | Office & Showroom | 台北南港 | 50 坪 | 辦公室・展間 |
| kimpton | Da An, Taipei | 330 SQM | Hospitality | 台北大安 | 100 坪 | 飯店 |
| ledaojia | Nangang, Taipei | 50 SQM | Corporate Office | 台北南港 | 15 坪 | 企業辦公室 |
| lijie | Nangang, Taipei | 100 SQM | Corporate Office | 台北南港 | 30 坪 | 企業辦公室 |
| liwei | Nangang, Taipei | 350 SQM | Corporate Office | 台北南港 | 106 坪 | 企業辦公室 |
| polytron | Nangang, Taipei | 850 SQM | Tech Office | 台北南港 | 257 坪 | 科技辦公室 |
| popeyes | Xuchang St., Taipei | 170 SQM | F&B | 台北許昌街 | 51 坪 | 餐飲 |
| qijia | Taichung | 700 SQM | F&B | 台中 | 212 坪 | 餐飲 |
| secom-nangang-complex | Nangang, Taipei | ~6,000 SQM | Flagship HQ | 台北市南港區 | 1,800 坪 | 旗艦總部 |
| soup-spoon-101 | Taipei 101 | 70 SQM | F&B | 台北 101 | 21 坪 | 餐飲 |
| soup-spoon-station | Taipei Main Station | 100 SQM | F&B | 台北車站 | 30 坪 | 餐飲 |
| xinlan | Nangang, Taipei | 350 SQM | Corporate Office | 台北南港 | 106 坪 | 企業辦公室 |
| zhongbao-baojing | Nangang, Taipei | 200 SQM | Corporate Office | 台北南港 | 60 坪 | 企業辦公室 |
| zhongbao-jingzhen | Nangang, Taipei | 250 SQM | Corporate Office | 台北南港 | 76 坪 | 企業辦公室 |
| zhongbao-showroom | Taipei | 330 SQM | Exhibition Hall | 台北 | 100 坪 | 展廳 |
| zhongbao-tianhe | Nangang, Taipei | 350 SQM | Corporate Office | 台北南港 | 106 坪 | 企業辦公室 |

### Counts
- Paired project pages updated: **20 EN + 20 ZH = 40 files**
- EN locations with Chinese before → after: csun, hq-office, kimpton, popeyes, soup-spoon-101, soup-spoon-station, zhongbao-showroom (7)
- Size chips added: all 20 paired projects (from Project Info; SECOM ATL-locked ~6,000 SQM / 1,800 坪)
- Badge normalized: SECOM `Flagship HQ · Design & Build` → `Flagship HQ`; ZH twin → `旗艦總部`; hq-office ZH badge → `辦公室・展間`; zhongbao-showroom ZH badge → `展廳`
- Left without size: none (paired). Orphan `zhongbao-nangang` unchanged (no area in specs; not in sitemap).
- SECOM unique 4-block stats bar: not reintroduced.
