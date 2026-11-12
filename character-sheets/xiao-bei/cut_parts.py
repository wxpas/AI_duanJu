#!/usr/bin/env python3
"""把 source/ 里的 5 张生成图和 face.jpg 裁成 sheet.html 用的 parts/。

    pip install pillow numpy scipy
    python3 cut_parts.py

所有坐标都是按当前这几张图量出来的（单位：原图像素）。
换了 source/ 里的图，要重新量下面 CONFIG 里的数字。

和 lu-chen/cut_parts.py 不一样的地方：
- 这套衣服是深色的，但 T 恤下摆、袜子、鞋头和鞋底是白色的，和白背景连在一起。
  抠人物时先按「深色或有颜色」找出人物，再把上下被人物夹住的白色部分补回来。
- 鞋头和鞋底是白的，抠不出准确的轮廓，所以脚边 14 像素以内整圈按原图保留，再往外渐变成纯白。
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

ROOT = Path(__file__).resolve().parent
SRC, OUT = ROOT / "source", ROOT / "parts"

CONFIG = {
    # turnaround.png
    "gap_columns": [(0, 30), (334, 408), (624, 695), (999, 1024)],   # 三个人物之间和两侧的空白列，用来量每一行的背景亮度
    "head_top": 95,                # 头顶所在的行（量身高的位置：发圈下沿，不算丸子头）
    "feet": 989,                   # 鞋底所在的行
    "white_rows": [(552, 592), (895, 995)],   # 白色衣物所在的行：T 恤下摆；袜子和鞋
    "shadow_from": 880,            # 从这一行往下 30 行，地面阴影的保留范围逐渐放宽到下面两个数
    "shadow_full": 14,             # 脚边这么多像素以内按原图保留
    "shadow_reach": 40,            # 到这么远完全变白
    "rows": (40, 1012),
    "views": {"front": (29, 335), "side": (408, 625), "back": (695, 1000)},
    "figure_css_height": 720,      # 头顶到鞋底在 sheet.html 里的高度（css px），图片按 2 倍输出
    # emoji-sheet.png：4 列 × 3 行，每行头发顶端所在的行、每个人物头部的水平中心
    "emoji_row_top": [19, 309, 601],
    "emoji_center_x": [[161, 452, 750, 1038], [158, 450, 746, 1044], [156, 451, 747, 1044]],
    "emoji_size": 296,
    "emoji_names": ["smile", "laugh", "puzzled", "angry", "sad", "shocked",
                    "terrified", "breakdown", "frozen-smile", "shh", "determined", "tired"],
    # items.png：每件单品的外接框 (x0, y0, x1, y1)
    "items": {
        "hoodie": (32, 12, 309, 322), "tee": (375, 27, 654, 316), "joggers": (777, 18, 930, 323),
        "headphones": (58, 376, 282, 649), "bag": (440, 363, 642, 664), "bell": (823, 410, 881, 615),
        "scrunchie": (57, 746, 283, 961), "socks": (404, 727, 625, 983), "sneakers": (711, 794, 996, 961),
    },
    # details.png：2 × 2 四格，每格的范围（避开白线和紧贴白线的几个像素）、每个圆形特写的圆心和半径
    "detail_panels": {"bun": (0, 0, 506, 506), "headphones": (517, 0, 1024, 506),
                      "bag": (0, 517, 506, 1024), "shoes": (517, 517, 1024, 1024)},
    "detail_circles": {"bun": (205, 160, 160), "headphones": (765, 205, 190),
                       "bag": (240, 790, 190), "shoes": (762, 850, 235)},
    "detail_size": 420,
    # face.jpg：酒窝特写的圆心和半径
    "dimple_circle": (452, 580, 115),
    # fabrics.png：三块面料各取一块 385 × 250
    "fabrics": {"hoodie": (16, 30), "joggers": (440, 30), "bag": (864, 60)},
}


def load(path):
    return np.asarray(Image.open(path).convert("RGB")).astype(np.float32) / 255.0


def to_img(arr):
    return Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8))


def cut_views(cfg):
    src = load(SRC / "turnaround.png")

    # 1. 背景修成纯白：背景上下不均匀（地面偏灰），逐行量出背景亮度再除掉
    gap = np.concatenate([np.arange(a, b) for a, b in cfg["gap_columns"]])
    backdrop = np.percentile(src[:, gap], 85, axis=1)
    backdrop = ndi.uniform_filter1d(backdrop, size=31, axis=0, mode="nearest")
    norm = np.clip(src / backdrop[:, None, :] / 0.99, 0, 1)
    lo, hi = norm.min(2), norm.max(2)

    # 2. 背景 = 与图片边缘连通的、明亮且无彩色的区域；其余是人物（去掉背景里的噪点）
    labels, _ = ndi.label((lo > 0.78) & ((hi - lo) < 0.07))
    edge = np.unique(np.r_[labels[0], labels[-1], labels[:, 0], labels[:, -1]])
    background = np.isin(labels, edge[edge > 0])
    blobs, count = ndi.label(~background)
    sizes = ndi.sum(~background, blobs, index=np.arange(1, count + 1))
    figure = np.isin(blobs, np.where(sizes >= 400)[0] + 1)

    # 3. 白色的衣物会被第 2 步当成背景：在它们所在的行里，把上下都被人物夹住的白色（T 恤下摆、袜子、鞋底）补回人物
    closed = ndi.binary_closing(figure, structure=np.ones((31, 1), bool))
    for y0, y1 in cfg["white_rows"]:
        figure[y0:y1] |= closed[y0:y1]

    # 4. 人物以外：紧贴人物的一圈按原图保留（发丝；脚边 full 像素内的鞋头、鞋底和地面阴影），
    #    再往外渐变成纯白，到 reach 像素处完全变白。脚部以上 full = 0、reach = 10
    foot = np.clip((np.arange(src.shape[0])[:, None] - cfg["shadow_from"]) / 30.0, 0, 1)
    full, reach = cfg["shadow_full"] * foot, 10 + (cfg["shadow_reach"] - 10) * foot
    t = np.clip((reach - ndi.distance_transform_edt(~figure)) / (reach - full), 0, 1)
    bottom = np.clip((cfg["rows"][1] - 1 - np.arange(src.shape[0])) / 12.0, 0, 1)[:, None]
    t = np.where(figure, 1.0, t * bottom)                         # 阴影在裁切范围的下边缘收到 0，不留一条切边
    weight = (t * t * (3 - 2 * t))[..., None]
    clean = 1 - (1 - norm) * weight
    alpha = np.where(figure, 1.0, 1 - clean.min(2))               # 人物以外的白色变透明，身高标尺才能画在人物后面
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
        xs = np.where(figure[y0:y1, x0:x1].any(0))[0]                         # 人物在图内的左右边界，排版时用
        print(f"view-{name}.png  css {size[0] / 2} x {size[1] / 2}  人物在图内 css x {xs[0] * scale / 2:.1f}..{(xs[-1] + 1) * scale / 2:.1f}")
    print(f"头顶线在图内 css y {(cfg['head_top'] - y0) * scale / 2:.1f}，鞋底线 {(cfg['feet'] - y0) * scale / 2:.1f}")


def cut_emoji(cfg):
    sheet = np.clip(load(SRC / "emoji-sheet.png") / (250 / 255), 0, 1)     # 背景不是纯白（254 左右），先提到纯白
    ink = sheet.min(2) < 0.93
    size = cfg["emoji_size"]
    # 每一块墨迹归属离它最近的那个表情，裁切时把别人的墨迹涂白
    labels, count = ndi.label(ndi.binary_dilation(ink, iterations=2))
    owner = np.zeros(count + 1, int)
    for i, (cy, cx) in enumerate(ndi.center_of_mass(ink, labels, index=np.arange(1, count + 1)), 1):
        row = int(np.argmin([abs(cy - (top + 140)) for top in cfg["emoji_row_top"]]))
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
    sheet = np.clip(load(SRC / "items.png") / (250 / 255), 0, 1)
    pad = 8
    for name, (x0, y0, x1, y1) in cfg["items"].items():
        to_img(sheet[max(y0 - pad, 0):y1 + pad + 1, max(x0 - pad, 0):x1 + pad + 1]).save(OUT / f"item-{name}.png", optimize=True)


def cut_details(cfg):
    sheet = load(SRC / "details.png")
    size = cfg["detail_size"]

    def circle(img, cx, cy, radius):
        padded = np.pad(img, ((radius, radius), (radius, radius), (0, 0)), mode="edge")   # 圆超出照片的部分用边缘的颜色补
        below = padded[radius + img.shape[0]:]                             # 超出下边的部分：把补出来的竖条纹抹平
        below[:] = ndi.uniform_filter1d(below, size=81, axis=1, mode="nearest")
        return to_img(padded[cy:cy + 2 * radius, cx:cx + 2 * radius]).resize((size, size), Image.LANCZOS)

    for name, (cx, cy, radius) in cfg["detail_circles"].items():
        x0, y0, x1, y1 = cfg["detail_panels"][name]
        circle(sheet[y0:y1, x0:x1], cx - x0, cy - y0, radius).save(OUT / f"detail-{name}.jpg", quality=93)

    cx, cy, radius = cfg["dimple_circle"]
    circle(load(ROOT / "face.jpg"), cx, cy, radius).save(OUT / "detail-dimple.jpg", quality=93)


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
