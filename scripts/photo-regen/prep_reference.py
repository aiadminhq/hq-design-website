#!/usr/bin/env python3
"""把舊簡報截圖 render-NN.jpg 裁成乾淨構圖參考：去白邊、避開左下平面圖與左上浮水印。
用法：python3 prep_reference.py <src.jpg> <dst.png>
"""
import sys
from PIL import Image
import numpy as np

INSET = (0, 930, 345, 1125)   # 左下平面圖（1626x1125 簡報頁座標）
WM = (45, 35, 155, 120)       # 左上浮水印圖示


def prep(src, dst):
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(int)
    m = a.mean(axis=2) < 238          # 非白
    for x0, y0, x1, y1 in (INSET, WM):
        m[y0:y1, x0:x1] = False
    rows, cols = np.where(m.any(1))[0], np.where(m.any(0))[0]
    # 去掉孤立雜點：要求該列/欄至少 15% 非白
    rows = np.where(m.mean(1) > 0.15)[0]; cols = np.where(m.mean(0) > 0.15)[0]
    L, T, R, B = cols.min(), rows.min(), cols.max() + 1, rows.max() + 1
    for x0, y0, x1, y1 in (INSET, WM):
        if x0 < R and x1 > L and y0 < B and y1 > T:   # 有重疊 → 擇損失較小的方向裁掉
            cut_h = (min(B, y1) - max(T, y0)) and None
            opts = []
            if y0 > T: opts.append(((B - y0) * (R - L), ("B", y0)))
            if y1 < B: opts.append(((y1 - T) * (R - L), ("T", y1)))
            if x1 < R: opts.append(((x1 - L) * (B - T), ("L", x1)))
            side, v = min(opts)[1]
            if side == "B": B = v
            elif side == "T": T = v
            elif side == "L": L = v
    im.crop((L, T, R, B)).save(dst)
    return (L, T, R, B)


if __name__ == "__main__":
    print(prep(sys.argv[1], sys.argv[2]))
