from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path(r"apps/web/public/rive/characters/coach-1/04-orthodox-guard.png")
OUT = Path(r"apps/web/public/rive/characters/coach-1/parts")
OUT.mkdir(parents=True, exist_ok=True)

im = Image.open(SRC).convert("RGBA")
arr = np.array(im)
h, w = arr.shape[:2]
rgb = arr[:, :, :3].astype(np.int16)
alpha = arr[:, :, 3] > 20

# Seed points on the 576x1024 orthodox-guard still.
SEEDS = {
    "02-head": [(260, 80), (260, 160), (240, 120)],
    "05-body": [(260, 400), (320, 400), (300, 360)],
    "00-glove-r": [(200, 160), (190, 200), (210, 180)],
    "03-glove-l": [(320, 240), (380, 240), (360, 260)],
    "04-arm-r": [(140, 320), (170, 340), (200, 320)],
    "06-arm-l": [(440, 320), (420, 340), (400, 300)],
    "09-leg-r": [(200, 560), (220, 640), (200, 720)],
    "08-leg-l": [(380, 560), (380, 640), (380, 720)],
    "10-shoe-r": [(200, 800), (220, 820)],
    "10b-shoe-l": [(440, 880), (440, 960)],
}


def neighbors(y: int, x: int):
    for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        ny, nx = y + dy, x + dx
        if 0 <= ny < h and 0 <= nx < w:
            yield ny, nx


def flood(seeds: list[tuple[int, int]], thresh: int) -> np.ndarray:
    mask = np.zeros((h, w), dtype=bool)
    stack = []
    seed_colors = []
    for x, y in seeds:
        if alpha[y, x]:
            stack.append((y, x))
            mask[y, x] = True
            seed_colors.append(rgb[y, x])
    if not seed_colors:
        return mask
    target = np.mean(seed_colors, axis=0)
    while stack:
        y, x = stack.pop()
        for ny, nx in neighbors(y, x):
            if mask[ny, nx] or not alpha[ny, nx]:
                continue
            dist = int(np.abs(rgb[ny, nx].astype(np.int16) - target).sum())
            if dist <= thresh:
                mask[ny, nx] = True
                stack.append((ny, nx))
    return mask


def save(name: str, mask: np.ndarray) -> None:
    ys, xs = np.where(mask)
    if len(ys) == 0:
        print("empty", name)
        return
    pad = 6
    yy0, yy1 = max(0, int(ys.min()) - pad), min(h, int(ys.max()) + pad + 1)
    xx0, xx1 = max(0, int(xs.min()) - pad), min(w, int(xs.max()) + pad + 1)
    crop = arr[yy0:yy1, xx0:xx1].copy()
    crop[~mask[yy0:yy1, xx0:xx1], 3] = 0
    Image.fromarray(crop).save(OUT / f"{name}.png")
    print(name, crop.shape[1], "x", crop.shape[0], "px", int(mask.sum()))


THRESH = {
    "02-head": 90,
    "05-body": 35,
    "00-glove-r": 70,
    "03-glove-l": 70,
    "04-arm-r": 70,
    "06-arm-l": 70,
    "09-leg-r": 80,
    "08-leg-l": 80,
    "10-shoe-r": 80,
    "10b-shoe-l": 80,
}

masks = {name: flood(seeds, THRESH[name]) for name, seeds in SEEDS.items()}

# Keep body as torso plate: remove head/gloves/arms.
masks["05-body"] = masks["05-body"] & ~masks["02-head"] & ~masks["00-glove-r"] & ~masks["03-glove-l"] & ~masks["04-arm-r"] & ~masks["06-arm-l"]

# Split pants by x so each leg is a separate bone texture.
pant = (masks["09-leg-r"] | masks["08-leg-l"]) & (np.arange(h)[:, None] >= 470)
masks["09-leg-r"] = pant & (np.arange(w)[None, :] < 300)
masks["08-leg-l"] = pant & (np.arange(w)[None, :] >= 300)

# Left shoe from the remaining low-right cluster.
low = alpha & (np.arange(h)[:, None] >= 850) & (np.arange(w)[None, :] >= 360)
masks["10b-shoe-l"] = low

for name, mask in masks.items():
    save(name, mask)

# Contact sheet for Rive import.
parts = sorted(OUT.glob("*.png"))
cell = 280
cols = 5
rows = int(np.ceil(len(parts) / cols))
sheet = Image.new("RGBA", (cols * cell, rows * cell), (16, 12, 10, 255))
for i, path in enumerate(parts):
    if path.name.startswith("_"):
        continue
    piece = Image.open(path).convert("RGBA")
    piece.thumbnail((cell - 24, cell - 24))
    x = (i % cols) * cell + (cell - piece.width) // 2
    y = (i // cols) * cell + (cell - piece.height) // 2
    sheet.paste(piece, (x, y), piece)
sheet.save(OUT / "_cut-sheet.png")
print("wrote", OUT.resolve())
