#!/usr/bin/env python3
"""把 source/ 里的 5 张生成图和 face.jpg 裁成 sheet.html 用的 parts/。

    pip install pillow numpy scipy
    python3 cut_parts.py

所有坐标都是按当前这几张图量出来的（单位：原图像素）。
换了 source/ 里的图，要重新量下面 CONFIG 里的数字。

和 lu-chen/cut_parts.py 不一样的地方：
- 这套衣服是白色的，和白背景分不开，所以三视图不抠人物轮廓，
  只按每一行的左右边界生成透明通道（身高标尺画在人物后面时不会透出来）。
- 单品图是浅灰底的卡片，白色单品要靠这层底色才看得清，所以整格保留，不抠成白底。
- 有 4 个 Q 版表情漏画了左眼下的小痣，这里补上。
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent
SRC, OUT = ROOT / "source", ROOT / "parts"

CONFIG = {
    # turnaround.png
    "gap_columns": [(0, 22), (346, 396), (642, 692), (1008, 1024)],  # 三个人物之间和两侧的空白列，用来量每一行的背景亮度
    "head_top": 90,                # 头顶所在的行（量身高的位置：发簪下方，不算发髻和头发的厚度）
    "feet": 1004,                  # 鞋底所在的行
    "shadow_from": 925,            # 从这一行往下，裙摆四周有地面阴影
    "floor_from": 975,             # 裙摆以下的行：这里只有鞋和阴影，只把青色的鞋算作人物
    "rows": (56, 1020),
    "views": {"front": (3, 353), "side": (370, 666), "back": (674, 1024)},
    "figure_css_height": 704,      # 头顶到鞋底在 sheet.html 里的高度（css px），图片按 2 倍输出
    # emoji-sheet.png：4 列 × 3 行，每行头发顶端所在的行、每个人物的水平中心
    "emoji_row_top": [23, 314, 610],
    "emoji_center_x": [[153, 458, 749, 1045], [154, 452, 750, 1047], [156, 449, 750, 1048]],
    "emoji_size": 296,
    "emoji_names": ["happy", "laugh", "calm", "angry", "sad", "shocked",
                    "scared", "smitten", "thinking", "smug", "speechless", "tired"],
    # 漏画小痣的表情：编号 → 小痣圆心。位置参照其余 8 个表情（外眼角下方的脸颊上）
    "emoji_add_mole": {2: (500.5, 159.0), 5: (205.5, 474.5), 10: (504.0, 747.0), 12: (1092.0, 775.5)},
    # items.png：3 × 3 格，行和列的起止位置相同（避开格子之间的白线）
    "item_cells": [(2, 336), (345, 679), (688, 1022)],
    "item_names": [["top", "inner", "skirt"], ["sash", "shawl", "pendant"], ["hairpin", "earrings", "shoes"]],
    "item_card_grey": 0.957,       # 9 张卡片统一成这个底色（#F4F4F4）
    # details.png：2 × 2 四格，每格的范围（避开白线和紧贴白线的 3 个像素）、每个圆形特写的圆心和半径
    "detail_panels": {"hairpin": (7, 7, 507, 507), "collar": (517, 7, 1017, 507),
                      "pendant": (7, 517, 507, 1017), "shoes": (517, 517, 1017, 1017)},
    "detail_circles": {"hairpin": (255, 165, 160), "collar": (765, 235, 200),
                       "pendant": (305, 800, 200), "shoes": (760, 838, 232)},
    "detail_size": 420,
    # face.jpg：小痣特写的圆心和半径
    "mole_circle": (535, 470, 120),
    # fabrics.png：三块面料各取一块 385 × 250
    "fabrics": {"skirt": (15, 300), "shawl": (440, 300), "shoes": (865, 230)},
}


def load(path):
    return np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255.0


def to_img(arr):
    return Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8))


def cut_views(cfg):
    src = load(SRC / "turnaround.png")
    height = src.shape[0]

    # 1. 背景修成纯白：背景上暗下亮不均匀，逐行量出背景亮度再除掉
    gap = np.concatenate([np.arange(a, b) for a, b in cfg["gap_columns"]])
    backdrop = np.percentile(src[:, gap], 85, axis=1)
    backdrop = ndi.uniform_filter1d(backdrop, size=31, axis=0, mode="nearest")
    norm = np.clip(src / backdrop[:, None, :] / 0.99, 0, 1)

    # 2. 找出人物：明显比背景暗或带颜色的像素算人物，和它们连在一起的浅色像素（白衣服）也算
    lo, hi = norm.min(2), norm.max(2)
    chroma = hi - lo
    floor = np.arange(height)[:, None] >= cfg["floor_from"]
    strong = np.where(floor, chroma > 0.05, (lo < 0.93) | (chroma > 0.035))
    weak = np.where(floor, chroma > 0.05, (lo < 0.97) | (chroma > 0.02))
    labels, _ = ndi.label(weak)
    keep = np.unique(labels[strong])
    figure = np.isin(labels, keep[keep > 0])
    blobs, count = ndi.label(figure)
    sizes = ndi.sum(figure, blobs, index=np.arange(1, count + 1))
    figure = np.isin(blobs, np.where(sizes >= 300)[0] + 1)

    # 3. 每一行从人物最左到最右的像素之间都算不透明，白衣服内部不会漏
    hull = np.zeros_like(figure)
    for x0, x1 in cfg["views"].values():
        for y in np.where(figure[:, x0:x1].any(1))[0]:
            xs = np.where(figure[y, x0:x1])[0]
            hull[y, x0 + xs[0]:x0 + xs[-1] + 1] = True
    hull = ndi.binary_dilation(hull, iterations=2)

    # 4. 人物以外：只保留紧贴人物的一圈（裙摆下的阴影），再远的全部变成纯白
    reach = np.where(np.arange(height)[:, None] >= cfg["shadow_from"], 30.0, 10.0)
    t = np.clip(1 - ndi.distance_transform_edt(~hull) / reach, 0, 1)
    weight = (t * t * (3 - 2 * t))[..., None]
    clean = np.where(hull[..., None], norm, 1 - (1 - norm) * weight)
    alpha = np.where(hull, 1.0, 1 - clean.min(2))
    to_img(clean).save(OUT / "three-views.png", optimize=True)      # 纯白底三视图，可直接当参考图上传

    y0, y1 = cfg["rows"]
    scale = cfg["figure_css_height"] * 2 / (cfg["feet"] - cfg["head_top"])
    for name, (x0, x1) in cfg["views"].items():
        size = (round((x1 - x0) * scale), round((y1 - y0) * scale))
        colour = to_img(clean[y0:y1, x0:x1]).resize(size, Image.LANCZOS)
        colour = colour.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))
        matte = Image.fromarray((alpha[y0:y1, x0:x1] * 255 + 0.5).astype(np.uint8)).resize(size, Image.LANCZOS)
        c = np.asarray(colour).astype(np.float32) / 255
        a = np.asarray(matte).astype(np.float32) / 255
        a = np.maximum(a, 1 - c.min(2))[..., None]                            # 透明度至少要盖得住这个像素的深浅
        rgb = np.where(a > 0.004, (c - (1 - a)) / np.maximum(a, 1e-3), 1.0)   # 叠回白底时与 colour 完全一致
        rgba = np.dstack([np.clip(rgb, 0, 1), a])
        Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), "RGBA").save(OUT / f"view-{name}.png", optimize=True)
        xs = np.where(hull[y0:cfg["shadow_from"], x0:x1].any(0))[0]         # 不算阴影的人物宽度，排版时用
        print(f"view-{name}.png  css {size[0] / 2} x {size[1] / 2}  人物在图内 css x {xs[0] * scale / 2:.1f}..{(xs[-1] + 1) * scale / 2:.1f}")
    print(f"头顶线在图内 css y {(cfg['head_top'] - y0) * scale / 2:.1f}，鞋底线 {(cfg['feet'] - y0) * scale / 2:.1f}")


def add_mole(sheet, x, y, radius=2.6, colour=(0.10, 0.06, 0.06)):
    """在 (x, y) 画一个抗锯齿的小圆点。"""
    r = int(radius) + 2
    top, left = int(round(y)) - r, int(round(x)) - r
    yy, xx = np.mgrid[top:top + 2 * r + 1, left:left + 2 * r + 1]
    cover = np.zeros(yy.shape, np.float32)
    for dy in (-0.375, -0.125, 0.125, 0.375):                       # 每个像素取 16 个采样点
        for dx in (-0.375, -0.125, 0.125, 0.375):
            cover += (xx + dx - x) ** 2 + (yy + dy - y) ** 2 <= radius ** 2
    cover = (cover / 16)[..., None]
    patch = sheet[top:top + 2 * r + 1, left:left + 2 * r + 1]
    patch[:] = patch * (1 - cover) + np.array(colour, np.float32) * cover


def cut_emoji(cfg):
    sheet = np.clip(load(SRC / "emoji-sheet.png") / (250 / 255), 0, 1)     # 背景不是纯白（254 左右），先提到纯白
    for x, y in cfg["emoji_add_mole"].values():
        add_mole(sheet, x, y)
    ink = sheet.min(2) < 0.93
    size = cfg["emoji_size"]
    # 每一块墨迹归属离它最近的那个表情，裁切时把别人的墨迹涂白
    labels, count = ndi.label(ndi.binary_dilation(ink, iterations=2))
    owner = np.zeros(count + 1, int)
    for i, (cy, cx) in enumerate(ndi.center_of_mass(ink, labels, index=np.arange(1, count + 1)), 1):
        row = int(np.argmin([abs(cy - (top + 130)) for top in cfg["emoji_row_top"]]))
        col = int(np.argmin([abs(cx - v) for v in cfg["emoji_center_x"][row]]))
        owner[i] = row * 4 + col + 1
    owned = owner[labels]
    for index, name in enumerate(cfg["emoji_names"], 1):
        row, col = divmod(index - 1, 4)
        x0 = cfg["emoji_center_x"][row][col] - size // 2
        y0 = cfg["emoji_row_top"][row] - 12
        sx0, sy0 = max(x0, 0), max(y0, 0)
        sx1, sy1 = min(x0 + size, sheet.shape[1]), min(y0 + size, sheet.shape[0])
        patch = sheet[sy0:sy1, sx0:sx1].copy()
        mine = owned[sy0:sy1, sx0:sx1]
        patch[(mine != index) & (mine != 0)] = 1.0
        canvas = np.ones((size, size, 3), np.float32)
        canvas[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = patch
        to_img(canvas).save(OUT / f"emoji-{index:02d}-{name}.png", optimize=True)


def cut_items(cfg):
    sheet = load(SRC / "items.png")
    for row, (y0, y1) in enumerate(cfg["item_cells"]):
        for col, (x0, x1) in enumerate(cfg["item_cells"]):
            card = sheet[y0:y1, x0:x1]
            border = np.concatenate([card[:10].reshape(-1, 3), card[-10:].reshape(-1, 3),
                                     card[:, :10].reshape(-1, 3), card[:, -10:].reshape(-1, 3)])
            card = card * (cfg["item_card_grey"] / np.median(border, axis=0))
            to_img(card).save(OUT / f"item-{cfg['item_names'][row][col]}.jpg", quality=93)


def cut_details(cfg):
    sheet = load(SRC / "details.png")
    size = cfg["detail_size"]

    def circle(img, cx, cy, radius):
        padded = np.pad(img, ((radius, radius), (radius, radius), (0, 0)), mode="edge")
        below = padded[radius + img.shape[0]:]                             # 圆超出照片下边的部分：把补出来的竖条纹抹平
        below[:] = ndi.uniform_filter1d(below, size=81, axis=1, mode="nearest")
        return to_img(padded[cy:cy + 2 * radius, cx:cx + 2 * radius]).resize((size, size), Image.LANCZOS)

    for name, (cx, cy, radius) in cfg["detail_circles"].items():
        x0, y0, x1, y1 = cfg["detail_panels"][name]
        circle(sheet[y0:y1, x0:x1], cx - x0, cy - y0, radius).save(OUT / f"detail-{name}.jpg", quality=93)   # 圆超出格子的部分用边缘的颜色补

    cx, cy, radius = cfg["mole_circle"]
    circle(load(ROOT / "face.jpg"), cx, cy, radius).save(OUT / "detail-mole.jpg", quality=93)


def cut_fabrics(cfg):
    sheet = load(SRC / "fabrics.png")
    for name, (x0, y0) in cfg["fabrics"].items():
        to_img(sheet[y0:y0 + 250, x0:x0 + 385]).save(OUT / f"fabric-{name}.jpg", quality=92)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    cut_views(CONFIG)
    cut_emoji(CONFIG)
    cut_items(CONFIG)
    cut_details(CONFIG)
    cut_fabrics(CONFIG)
    print(f"{len(list(OUT.iterdir()))} files in {OUT}")
