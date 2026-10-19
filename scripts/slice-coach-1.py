from pathlib import Path

import numpy as np
from PIL import Image

# Original download filename in Downloads. Output folder is Coach 1.
src = Path(r"C:\Users\user\Downloads\Senior_Black_Coach_HEX_Character_Sheet.png")
out = Path(r"C:\Users\user\.cursor\SULLYS\apps\web\public\rive\characters\coach-1")
out.mkdir(parents=True, exist_ok=True)

im = Image.open(src).convert("RGBA")
arr = np.array(im)
rgb = arr[:, :, :3].astype(np.int16)
white = (rgb[:, :, 0] > 248) & (rgb[:, :, 1] > 248) & (rgb[:, :, 2] > 248)
mask = ~white
h, w = mask.shape
mask[: int(h * 0.18), :] = False
mask[int(h * 0.88) :, :] = False
mask[:, int(w * 0.72) :] = False

col = mask.any(axis=0)
groups = []
in_run = False
start = 0
for i, v in enumerate(col):
    if v and not in_run:
        start = i
        in_run = True
    elif not v and in_run:
        groups.append((start, i))
        in_run = False
if in_run:
    groups.append((start, w))

# Keep the three widest figure groups.
groups = sorted(groups, key=lambda g: g[1] - g[0], reverse=True)[:3]
groups = sorted(groups, key=lambda g: g[0])
print("x groups", groups)

names = ["01-bare-hands", "02-boxing-gloves", "03-training-pads"]
for name, (x0, x1) in zip(names, groups):
    sub = mask[:, x0:x1]
    ys = sub.any(axis=1)
    y0 = int(ys.argmax())
    y1 = int(len(ys) - ys[::-1].argmax())
    pad = 24
    crop = im.crop((max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)))
    c = np.array(crop)
    near = (c[:, :, 0] > 248) & (c[:, :, 1] > 248) & (c[:, :, 2] > 248)
    c[near, 3] = 0
    Image.fromarray(c).save(out / f"{name}.png")
    print(name, crop.size)

print("wrote", out)
