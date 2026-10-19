"""
Cut every character pose into parts, fill occluded interiors, and
store them in that character's folder.

  characters/<id>/parts/          bind set from the best arms-down still
  characters/<id>/cuts/<pose>/    every other pose still, same part names
"""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(r"C:\Users\user\.cursor\SULLYS\apps\web\public\rive\characters")

CHARACTERS = [
    "coach-1",
    "coach-2",
    "coach-3",
    "kid-1",
    "kid-2",
    "kid-3",
    "kid-4",
    "kid-5",
]

PRIMARY = {
    "coach-1": "02-boxing-gloves.png",
    "coach-2": "01-gloves.png",
    "coach-3": "01-gloves.png",
    "kid-1": "01-front.png",
    "kid-2": "01-front.png",
    "kid-3": "01-front.png",
    "kid-4": "01-front.png",
    "kid-5": "01-front.png",
}

SKIP_STILLS = {"00-sheet.png", "06-pads-sheet.png", "08-hex-sheet.png"}


def knock_bg(arr: np.ndarray) -> np.ndarray:
    out = arr.copy()
    rgb = out[:, :, :3].astype(np.int16)
    white = (rgb[:, :, 0] > 248) & (rgb[:, :, 1] > 248) & (rgb[:, :, 2] > 248)
    out[white | (out[:, :, 3] < 24), 3] = 0
    return out


def visible_mask(arr: np.ndarray) -> np.ndarray:
    rgb = arr[:, :, :3].astype(np.int16)
    a = arr[:, :, 3]
    return (a > 24) & ((rgb[:, :, 0] > 16) | (rgb[:, :, 1] > 16) | (rgb[:, :, 2] > 16))


def keep_largest(vis: np.ndarray) -> np.ndarray:
    try:
        from scipy import ndimage

        labeled, n = ndimage.label(vis)
        if n == 0:
            return vis
        sizes = ndimage.sum(vis, labeled, index=range(1, n + 1))
        return labeled == (int(np.argmax(sizes)) + 1)
    except Exception:
        pass
    h, w = vis.shape
    seen = np.zeros((h, w), dtype=bool)
    best_n = 0
    best_cells: list[tuple[int, int]] = []
    ys, xs = np.where(vis)
    for y, x in zip(ys.tolist(), xs.tolist()):
        if seen[y, x]:
            continue
        q = deque([(y, x)])
        seen[y, x] = True
        cells = [(y, x)]
        while q:
            cy, cx = q.popleft()
            for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                if 0 <= ny < h and 0 <= nx < w and vis[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True
                    q.append((ny, nx))
                    cells.append((ny, nx))
        if len(cells) > best_n:
            best_n = len(cells)
            best_cells = cells
    out = np.zeros_like(vis)
    if best_cells:
        yy, xx = zip(*best_cells)
        out[yy, xx] = True
    return out


def fill_behind(crop: np.ndarray, radius: int = 7) -> np.ndarray:
    im = Image.fromarray(crop)
    alpha = im.split()[-1]
    closed = alpha.filter(ImageFilter.MaxFilter(radius)).filter(
        ImageFilter.MinFilter(max(3, radius - 2))
    )
    closed_a = np.array(closed)
    painted = Image.fromarray(crop[:, :, :3])
    blur_rgb = np.array(
        painted.filter(ImageFilter.GaussianBlur(radius=3)).filter(
            ImageFilter.GaussianBlur(radius=5)
        )
    ).astype(np.float32)
    out = crop.copy()
    holes = (closed_a > 40) & (crop[:, :, 3] < 20)
    if not holes.any():
        return out
    out[holes, :3] = blur_rgb[holes]
    weak = holes & (out[:, :, :3].sum(axis=2) < 25)
    if weak.any():
        opaque = crop[:, :, 3] > 40
        if opaque.any():
            out[weak, :3] = np.median(crop[opaque, :3], axis=0)
    out[holes, 3] = 255
    return out


def save_part(out_dir: Path, name: str, arr: np.ndarray, mask: np.ndarray) -> None:
    ys, xs = np.where(mask)
    if len(ys) < 30:
        print("    skip", name)
        return
    pad = 8
    h, w = mask.shape
    y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + pad + 1)
    x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + pad + 1)
    crop = arr[y0:y1, x0:x1].copy()
    local = mask[y0:y1, x0:x1]
    crop[~local, 3] = 0
    crop = fill_behind(crop)
    Image.fromarray(crop).save(out_dir / f"{name}.png")
    print("   ", name, crop.shape[1], "x", crop.shape[0])


def cut_pose(src: Path, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("*.png"):
        old.unlink()
    arr = knock_bg(np.array(Image.open(src).convert("RGBA")))
    vis = keep_largest(visible_mask(arr))
    ys, xs = np.where(vis)
    if len(ys) == 0:
        print("    empty", src.name)
        return
    y0, y1 = int(ys.min()), int(ys.max())
    x0, x1 = int(xs.min()), int(xs.max())
    ch, cw = y1 - y0 + 1, x1 - x0 + 1
    yy = np.arange(arr.shape[0])[:, None]
    xx = np.arange(arr.shape[1])[None, :]
    cx = x0 + cw / 2
    rgb = arr[:, :, :3].astype(np.int16)

    head = vis & (yy <= y0 + ch * 0.22)
    torso = vis & (yy >= y0 + ch * 0.16) & (yy <= y0 + ch * 0.52)
    body = torso & (np.abs(xx - cx) < cw * 0.32)
    arm_band = vis & (yy >= y0 + ch * 0.18) & (yy <= y0 + ch * 0.54)
    arm_l = arm_band & (xx < cx - cw * 0.15)
    arm_r = arm_band & (xx > cx + cw * 0.15)
    red = vis & (rgb[:, :, 0] > 140) & (rgb[:, :, 1] < 115) & (rgb[:, :, 2] < 115)
    glove_l = red & arm_l
    glove_r = red & arm_r
    if glove_l.sum() < 80:
        glove_l = arm_l & (yy >= y0 + ch * 0.38)
    if glove_r.sum() < 80:
        glove_r = arm_r & (yy >= y0 + ch * 0.38)
    arm_l = arm_l & ~glove_l
    arm_r = arm_r & ~glove_r
    body = body & ~head & ~arm_l & ~arm_r & ~glove_l & ~glove_r
    legs = vis & (yy >= y0 + ch * 0.50) & (yy <= y0 + ch * 0.88)
    legs = legs & ~arm_l & ~arm_r & ~glove_l & ~glove_r
    leg_l = legs & (xx < cx)
    leg_r = legs & (xx >= cx)
    shoes = vis & (yy >= y0 + ch * 0.80)
    shoe_l = shoes & (xx < cx)
    shoe_r = shoes & (xx >= cx)

    save_part(out_dir, "02-head", arr, head)
    save_part(out_dir, "05-body", arr, body)
    save_part(out_dir, "04-arm-r", arr, arm_l)
    save_part(out_dir, "06-arm-l", arr, arm_r)
    save_part(out_dir, "00-glove-r", arr, glove_l)
    save_part(out_dir, "03-glove-l", arr, glove_r)
    save_part(out_dir, "09-leg-r", arr, leg_l)
    save_part(out_dir, "08-leg-l", arr, leg_r)
    save_part(out_dir, "10-shoe-r", arr, shoe_l)
    save_part(out_dir, "10b-shoe-l", arr, shoe_r)


def contact_sheet(out_dir: Path) -> None:
    parts = sorted(p for p in out_dir.glob("*.png") if not p.name.startswith("_"))
    if not parts:
        return
    cell = 240
    cols = 5
    rows = int(np.ceil(len(parts) / cols))
    sheet = Image.new("RGBA", (cols * cell, rows * cell), (12, 10, 8, 255))
    for i, path in enumerate(parts):
        piece = Image.open(path).convert("RGBA")
        piece.thumbnail((cell - 20, cell - 20))
        x = (i % cols) * cell + (cell - piece.width) // 2
        y = (i // cols) * cell + (cell - piece.height) // 2
        sheet.paste(piece, (x, y), piece)
    sheet.save(out_dir / "_cut-sheet.png")


def pose_stills(folder: Path):
    for path in sorted(folder.glob("*.png")):
        if path.name in SKIP_STILLS or path.name.startswith("_"):
            continue
        yield path


for folder_name in CHARACTERS:
    folder = ROOT / folder_name
    print(folder_name)
    if not folder.is_dir():
        print("  missing folder")
        continue
    primary_name = PRIMARY.get(folder_name)
    for src in pose_stills(folder):
        dest = folder / "cuts" / src.stem
        print(" ", src.name)
        cut_pose(src, dest)
        contact_sheet(dest)
        if src.name == primary_name:
            bind = folder / "parts"
            print("  bind -> parts/")
            cut_pose(src, bind)
            contact_sheet(bind)
print("done")
