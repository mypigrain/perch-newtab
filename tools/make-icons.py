"""生成图标：极光渐变底 + 白色透镜环。

用法：python tools/make-icons.py
输出：icons/icon16.png icon32.png icon48.png icon128.png

只依赖 Pillow。改设计后重跑即可。
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "icons"
SIZES = [16, 32, 48, 128]
SS = 4  # 超采样倍数

STOPS = [
    (0.00, (0xD3, 0xE8, 0xE3)),
    (0.45, (0x9D, 0xB7, 0xDC)),
    (0.78, (0xC9, 0xB6, 0xD8)),
    (1.00, (0xEC, 0xCB, 0xC1)),
]


def _lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def _at(t):
    for i in range(len(STOPS) - 1):
        t0, c0 = STOPS[i]
        t1, c1 = STOPS[i + 1]
        if t0 <= t <= t1:
            return _lerp(c0, c1, (t - t0) / (t1 - t0))
    return STOPS[-1][1]


def render(size: int) -> Image.Image:
    s = size * SS

    # 1. 对角渐变（先在 64×64 算好再放大，避免逐像素大图）
    small = Image.new("RGB", (64, 64))
    px = small.load()
    for y in range(64):
        for x in range(64):
            px[x, y] = _at((x + y) / 126)
    bg = small.resize((s, s), Image.BICUBIC).convert("RGBA")

    # 2. 圆角遮罩
    mask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, s - 1, s - 1], radius=round(s * 0.225), fill=255
    )
    bg.putalpha(mask)

    # 3. 透镜环
    layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx = cy = s / 2
    r = s * 0.275
    ring = s * 0.030
    # 玻璃面：极淡的白
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 58))
    # 外环
    d.ellipse(
        [cx - r, cy - r, cx + r, cy + r],
        outline=(255, 255, 255, 235),
        width=max(1, round(ring)),
    )
    # 内侧高光弧（左上）
    hr = r * 0.62
    d.arc(
        [cx - hr - r * 0.18, cy - hr - r * 0.18, cx + hr - r * 0.18, cy + hr - r * 0.18],
        start=196,
        end=320,
        fill=(255, 255, 255, 170),
        width=max(1, round(s * 0.016)),
    )

    out = Image.alpha_composite(bg, layer)
    return out.resize((size, size), Image.LANCZOS)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for size in SIZES:
        img = render(size)
        path = OUT / f"icon{size}.png"
        img.save(path, optimize=True)
        print(f"{path.relative_to(ROOT)}  {img.size[0]}×{img.size[1]}")


if __name__ == "__main__":
    main()
