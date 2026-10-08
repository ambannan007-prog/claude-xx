"""Extract the Jazara logo strokes onto a transparent background.

Alpha is derived from distance-to-white so the antialiased brush edges stay
intact; RGB is set to the sampled brand turquoise so the mark is pixel-true.
"""
import sys
import numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
# Brand turquoise sampled as the median of the solid stroke pixels.
solid = im[im[..., 0] < 140]
brand = np.median(solid, axis=0)
print("brand turquoise:", "#%02X%02X%02X" % tuple(int(v) for v in brand))
# Alpha: how far the red channel (most distinct vs white) falls toward the stroke colour.
a = np.clip((255 - im[..., 0]) / (255 - brand[0]), 0, 1)
a[a < 0.04] = 0
out = np.zeros((*a.shape, 4), np.uint8)
out[..., :3] = brand.astype(np.uint8)
out[..., 3] = (a * 255).astype(np.uint8)
img = Image.fromarray(out, "RGBA")
# Upscale 3x (Lanczos) so the mark stays smooth on large displays.
img = img.resize((img.width * 3, img.height * 3), Image.LANCZOS)
img.save(dst)
