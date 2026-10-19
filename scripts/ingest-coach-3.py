from pathlib import Path
import shutil
import numpy as np
from PIL import Image

ASSETS = Path(r"C:\Users\user\.cursor\projects\c-Users-user-cursor-SULLYS\assets")
OUT = Path(r"C:\Users\user\.cursor\SULLYS\apps\web\public\rive\characters\coach-3")
OUT.mkdir(parents=True, exist_ok=True)

FILES = {
    "08-hex-sheet.png": "Female_Boxer_HEX_Character_Sheet-093d645c",
    "04-orthodox-guard.png": "Female_Boxer_Anime_Guard-fa53831f",
    "01-gloves.png": "Female_Boxer_Selected-c099d002",
}


def find(token: str) -> Path:
    matches = [p for p in ASSETS.iterdir() if token in p.name]
    if not matches:
        raise FileNotFoundError(token)
    return matches[0]


for name, token in FILES.items():
    src = find(token)
    dest = OUT / name
    shutil.copy2(src, dest)
    print("copied", name, src.name)


def split_hex(src: Path) -> None:
    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    rgb = arr[:, :, :3].astype(np.int16)
    vis = (arr[:, :, 3] > 24) & (
        (rgb[:, :, 0] > 18) | (rgb[:, :, 1] > 18) | (rgb[:, :, 2] > 18)
    )
    h, w = vis.shape
    vis[: int(h * 0.18), :] = False
    vis[int(h * 0.88) :, :] = False
    vis[:, int(w * 0.72) :] = False
    col = vis.any(axis=0)
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
    groups = [g for g in groups if g[1] - g[0] > 80]
    groups = sorted(groups, key=lambda g: g[1] - g[0], reverse=True)[:3]
    groups = sorted(groups, key=lambda g: g[0])
    print("x groups", groups)
    names = ["01-bare-hands", "02-boxing-gloves", "03-gloves-alt"]
    for name, (x0, x1) in zip(names, groups):
        sub = vis[:, x0:x1]
        ys = np.where(sub.any(axis=1))[0]
        if len(ys) == 0:
            continue
        y0, y1 = int(ys.min()), int(ys.max())
        pad = 24
        crop = im.crop(
            (max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad))
        )
        c = np.array(crop)
        near = (c[:, :, 0] < 10) & (c[:, :, 1] < 10) & (c[:, :, 2] < 10)
        c[near, 3] = 0
        Image.fromarray(c).save(OUT / f"{name}.png")
        print(" ", name, crop.size)


split_hex(OUT / "08-hex-sheet.png")
print("wrote", OUT)
