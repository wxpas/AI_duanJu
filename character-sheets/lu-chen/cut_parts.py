#!/usr/bin/env python3
"""把 source/ 里的 5 张生成图和 face.jpg 裁成 sheet.html 用的 parts/。

    pip install pillow numpy scipy
    python3 cut_parts.py

所有坐标都是按当前这几张图量出来的（单位：原图像素）。
换了 source/ 里的图，要重新量下面 CONFIG 里的数字。
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent
SRC, OUT = ROOT / "source", ROOT / "parts"

CONFIG = {
    # turnaround.png：三个人物之间的分界列、头顶 / 鞋底所在的行、每个视图的裁切范围
    "panels": [(0, 385), (385, 658), (658, 1024)],
    "head_top": 53,
    "feet": 991,
    "rows": (44, 1014),
    "views": {"front": (34, 340), "side": (430, 625), "back": (692, 996)},
    "figure_css_height": 746,      # 人物在 sheet.html 里的高度（css px），图片按 2 倍输出
    # emoji-sheet.png：4 列 × 3 行，每行人物头顶所在的行、每个人物的水平中心
    "emoji_row_top": [17, 316, 614],
    "emoji_center_x": [[153, 455, 744, 1040], [151, 449, 742, 1038], [150, 445, 745, 1042]],
    "emoji_size": 296,
    "emoji_names": ["happy", "laugh", "smirk", "angry", "sad", "shocked",
                    "scared", "shy", "thinking", "enduring", "domineering", "tired"],
    # items.png：每件单品的外接框 (x0, y0, x1, y1)
    "items": {
        "jacket": (46, 45, 312, 397), "shirt": (376, 41, 652, 393), "trousers": (785, 43, 924, 426),
        "tie": (154, 430, 204, 727), "belt": (399, 508, 630, 619), "socks": (754, 459, 951, 707),
        "glasses": (33, 821, 323, 938), "watch": (442, 731, 591, 990), "shoes": (707, 808, 1000, 967),
    },
    # details.png：2 × 2 四格，每个圆形特写的圆心和半径
    "detail_panels": {"tie": (0, 0, 510, 510), "watch": (514, 0, 1024, 510),
                      "belt": (0, 514, 510, 1024), "shoes": (514, 514, 1024, 1024)},
    "detail_circles": {"tie": (256, 236, 205), "watch": (776, 246, 205),
                       "belt": (254, 770, 205), "shoes": (762, 850, 240)},
    "detail_size": 420,
    # face.jpg：眼镜特写的圆心和半径
    "glasses_circle": (665, 815, 270),
    # fabrics.png：三块面料各取一块 385 × 250
    "fabrics": {"suit": (14, 330), "shirt": (436, 300), "tie": (862, 250)},
}


def load(path):
    return np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255.0


def to_img(arr):
    return Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8))


def backdrop_to_white(img, white_point=0.965, percentile=96, smooth=31):
    """逐行估计背景亮度并除掉，让略灰的摄影棚背景变成纯白。"""
    backdrop = np.percentile(img, percentile, axis=1)
    backdrop = ndi.uniform_filter1d(backdrop, size=smooth, axis=0, mode="nearest")
    return np.clip(img / backdrop[:, None, :] / white_point, 0, 1)


def split_figure(img, min_bright, max_chroma, min_area):
    """返回 (人物蒙版, 背景蒙版)。背景 = 与图片边缘连通的、明亮且无彩色的区域。"""
    lo, hi = img.min(2), img.max(2)
    labels, _ = ndi.label((lo > min_bright) & ((hi - lo) < max_chroma))
    edge = np.unique(np.r_[labels[0], labels[-1], labels[:, 0], labels[:, -1]])
    background = np.isin(labels, edge[edge > 0])
    blobs, count = ndi.label(~background)
    sizes = ndi.sum(~background, blobs, index=np.arange(1, count + 1))
    figure = np.isin(blobs, np.where(sizes >= min_area)[0] + 1)      # 去掉背景里的噪点
    return figure, ~figure


def keep_contact_shadow(img, background, reach):
    """背景只保留紧贴人物的一圈（鞋底的接触阴影），其余全部变成纯白。"""
    dist = ndi.distance_transform_edt(background)
    t = np.clip(1 - dist / reach, 0, 1)
    weight = t * t * (3 - 2 * t)
    out = img.copy()
    out[background] = (1 - (1 - img) * weight[..., None])[background]
    return out


def cut_views(cfg):
    src = load(SRC / "turnaround.png")
    height = src.shape[0]
    norm = np.empty_like(src)
    for x0, x1 in cfg["panels"]:
        norm[:, x0:x1] = backdrop_to_white(src[:, x0:x1])
    figure, background = split_figure(norm, 0.78, 0.07, 400)
    reach = np.where(np.arange(height)[:, None] > 940, 16.0, 10.0)
    clean = keep_contact_shadow(norm, background, reach)
    to_img(clean).save(OUT / "three-views.png", optimize=True)        # 纯白底三视图，可直接当参考图上传

    # 人物以外的白色变透明，身高标尺才能画在人物后面
    alpha = np.where(figure, 1.0, 1 - clean.min(2))
    y0, y1 = cfg["rows"]
    scale = cfg["figure_css_height"] * 2 / (cfg["feet"] - cfg["head_top"])
    for name, (x0, x1) in cfg["views"].items():
        size = (round((x1 - x0) * scale), round((y1 - y0) * scale))
        colour = to_img(clean[y0:y1, x0:x1]).resize(size, Image.LANCZOS)
        colour = colour.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))
        matte = Image.fromarray((alpha[y0:y1, x0:x1] * 255 + 0.5).astype(np.uint8)).resize(size, Image.LANCZOS)
        c = np.asarray(colour).astype(np.float32) / 255
        a = (np.asarray(matte).astype(np.float32) / 255)[..., None]
        rgb = np.where(a > 0.004, (c - (1 - a)) / np.maximum(a, 1e-3), 1.0)   # 叠回白底时与 colour 完全一致
        rgba = np.dstack([np.clip(rgb, 0, 1), a])
        Image.fromarray((rgba * 255 + 0.5).astype(np.uint8), "RGBA").save(OUT / f"view-{name}.png", optimize=True)
        print(f"view-{name}.png  {size[0]}x{size[1]} px  ->  css {size[0] / 2} x {size[1] / 2}")


def cut_emoji(cfg):
    sheet = np.clip(load(SRC / "emoji-sheet.png") / (250 / 255), 0, 1)
    ink = sheet.min(2) < 0.93
    size = cfg["emoji_size"]
    # 每一块墨迹归属离它最近的那个表情，裁切时把别人的墨迹涂白
    labels, count = ndi.label(ndi.binary_dilation(ink, iterations=2))
    owner = np.zeros(count + 1, int)
    for i, (cy, cx) in enumerate(ndi.center_of_mass(ink, labels, index=np.arange(1, count + 1)), 1):
        row = int(np.argmin([abs(cy - (top + 137)) for top in cfg["emoji_row_top"]]))
        col = int(np.argmin([abs(cx - v) for v in cfg["emoji_center_x"][row]]))
        owner[i] = row * 4 + col + 1
    owned = owner[labels]
    for index, name in enumerate(cfg["emoji_names"], 1):
        row, col = divmod(index - 1, 4)
        x0 = cfg["emoji_center_x"][row][col] - size // 2
        y0 = cfg["emoji_row_top"][row] - 8
        sx0, sy0 = max(x0, 0), max(y0, 0)
        sx1, sy1 = min(x0 + size, sheet.shape[1]), min(y0 + size, sheet.shape[0])
        patch = sheet[sy0:sy1, sx0:sx1].copy()
        mine = owned[sy0:sy1, sx0:sx1]
        patch[(mine != index) & (mine != 0)] = 1.0
        canvas = np.ones((size, size, 3), np.float32)
        canvas[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = patch
        to_img(canvas).save(OUT / f"emoji-{index:02d}-{name}.png", optimize=True)


def cut_items(cfg):
    sheet = np.clip(load(SRC / "items.png") / (248 / 255), 0, 1)
    pad = 8
    for name, (x0, y0, x1, y1) in cfg["items"].items():
        to_img(sheet[max(y0 - pad, 0):y1 + pad + 1, max(x0 - pad, 0):x1 + pad + 1]).save(OUT / f"item-{name}.png", optimize=True)


def cut_details(cfg):
    sheet = load(SRC / "details.png")
    size = cfg["detail_size"]

    def circle(img, cx, cy, radius):
        padded = np.pad(img, ((radius, radius), (radius, radius), (0, 0)), mode="edge")
        return to_img(padded[cy:cy + 2 * radius, cx:cx + 2 * radius]).resize((size, size), Image.LANCZOS)

    for name, (cx, cy, radius) in cfg["detail_circles"].items():
        x0, y0, x1, y1 = cfg["detail_panels"][name]
        panel = sheet[y0:y1, x0:x1]
        if name == "shoes":
            # 地面变纯白、只留鞋底阴影，再向下补一段白，圆框才装得下两只鞋
            panel = backdrop_to_white(panel, percentile=97, smooth=41)
            _, background = split_figure(panel, 0.72, 0.08, 300)
            panel = keep_contact_shadow(panel, background, 22.0)
            panel = np.pad(panel, ((0, 120), (0, 0), (0, 0)), mode="constant", constant_values=1.0)
        circle(panel, cx - x0, cy - y0, radius).save(OUT / f"detail-{name}.jpg", quality=93)

    cx, cy, radius = cfg["glasses_circle"]
    circle(load(ROOT / "face.jpg"), cx, cy, radius).save(OUT / "detail-glasses.jpg", quality=93)


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
