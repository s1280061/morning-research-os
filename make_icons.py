"""PWA用アイコン生成（朝日モチーフ）。一度実行すればOK。"""
import math
from PIL import Image, ImageDraw


def make(size):
    img = Image.new("RGB", (size, size), "#0f0f1a")
    d = ImageDraw.Draw(img)
    cx, cy = size // 2, int(size * 0.46)
    r = int(size * 0.20)
    # blue glow
    for i in range(6, 0, -1):
        rr = r + i * int(size * 0.018)
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(79, 142, 247))
    # sun
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 210, 90))
    # rays
    for k in range(12):
        ang = math.radians(k * 30)
        x1 = cx + math.cos(ang) * r * 1.4
        y1 = cy + math.sin(ang) * r * 1.4
        x2 = cx + math.cos(ang) * r * 1.85
        y2 = cy + math.sin(ang) * r * 1.85
        d.line([x1, y1, x2, y2], fill=(255, 210, 90), width=max(2, size // 55))
    img.save(f"icons/icon-{size}.png")
    print(f"icons/icon-{size}.png")


if __name__ == "__main__":
    make(192)
    make(512)
