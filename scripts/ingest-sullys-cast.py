from pathlib import Path
import shutil
import numpy as np
from PIL import Image

ASSETS = Path(r"C:\Users\user\.cursor\projects\c-Users-user-cursor-SULLYS\assets")
ROOT = Path(r"C:\Users\user\.cursor\SULLYS\apps\web\public\rive\characters")
BRAND = Path(r"C:\Users\user\.cursor\SULLYS\apps\web\public\brand")
BRAND.mkdir(parents=True, exist_ok=True)

# Dest folders are numbered (coach-1, kid-1, …). Values are original download filenames.
FILES = {
    "coach-2/01-gloves.png": "Young_White_Coach_Boxing_Gloves_4K-e8c7e9b1",
    "coach-3/00-sheet.png": "Female_Boxer_Sheet_4K-dab636e3",
    "coach-3/01-gloves.png": "Female_Boxer_Selected-c099d002",
    "coach-3/04-orthodox-guard.png": "Female_Boxer_Anime_Guard-fa53831f",
    "coach-3/08-hex-sheet.png": "Female_Boxer_HEX_Character_Sheet-093d645c",
    "coach-1/06-pads-sheet.png": "Senior_Black_Coach_Sheet_4K-20cb1caf",
    "coach-1/07-gloves-stand.png": "Senior_Black_Coach_Boxing_Gloves_4K-ebeac9f3",
    "kid-1/00-sheet.png": "K01_Black_Boy_Character_Sheet_4K-6f0c3823",
    "kid-2/00-sheet.png": "K02_White_Boy_Character_Sheet_4K-0724890a",
    "kid-3/00-sheet.png": "K03_Hispanic_Boy_Character_Sheet_4K-4b37e632",
    "kid-4/00-sheet.png": "K04_Black_Girl_Character_Sheet_4K-54cc9063",
    "kid-5/00-sheet.png": "K05_Hispanic_Girl_Character_Sheet_4K-062ecb4e",
}

VIEWS = ["01-front", "02-three-quarter", "03-side", "04-back"]


def find(token: str) -> Path:
    matches = [p for p in ASSETS.iterdir() if token in p.name]
    if not matches:
        raise FileNotFoundError(token)
    return matches[0]


def split_sheet(src: Path, dest_dir: Path) -> None:
    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    rgb = arr[:, :, :3].astype(np.int16)
    vis = (arr[:, :, 3] > 24) & ((rgb[:, :, 0] > 18) | (rgb[:, :, 1] > 18) | (rgb[:, :, 2] > 18))
    h, w = vis.shape
    vis[: int(h * 0.04), :] = False
    vis[int(h * 0.96) :, :] = False
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
    groups = sorted(groups, key=lambda g: g[1] - g[0], reverse=True)[:4]
    groups = sorted(groups, key=lambda g: g[0])
    for name, (x0, x1) in zip(VIEWS, groups):
        sub = vis[:, x0:x1]
        ys = np.where(sub.any(axis=1))[0]
        if len(ys) == 0:
            continue
        y0, y1 = int(ys.min()), int(ys.max())
        pad = 16
        crop = im.crop(
            (max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad))
        )
        c = np.array(crop)
        near = (c[:, :, 0] < 8) & (c[:, :, 1] < 8) & (c[:, :, 2] < 8)
        c[near, 3] = 0
        Image.fromarray(c).save(dest_dir / f"{name}.png")
        print(" ", name, crop.size)


copied = []
for rel, token in FILES.items():
    dest = ROOT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    src = find(token)
    shutil.copy2(src, dest)
    copied.append(str(dest))
    print("copied", dest.relative_to(ROOT.parent))
    if dest.name == "00-sheet.png" or dest.name.endswith("-sheet.png"):
        print(" split", dest.parent.name)
        split_sheet(dest, dest.parent)

logo_src = find("Sully_s_Boxing_Gym_Heritage_Shield-d577e0ba")
logo_dest = BRAND / "sullys-heritage-shield.png"
shutil.copy2(logo_src, logo_dest)
print("logo", logo_dest)
print("done", len(copied), "masters")
