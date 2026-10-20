"""Edge-only background knockout so shirt logos stay opaque."""

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ASSETS = Path(
    r"C:\Users\user\.cursor\projects\c-Users-user-cursor-SULLYS\assets"
)
OUT = Path(r"C:\Users\user\.cursor\SULLYS\apps\web\public\tv\cast")

JOBS = [
    (
        "Cel-shaded_George_Chuvalo_cutout-5f525bb8-8ff5-4383-a0fb-e0a4f35f5567.png",
        "george-chuvalo-guard",
    ),
]


def find_src(suffix: str) -> Path:
    matches = list(ASSETS.glob(f"*{suffix}"))
    if not matches:
        raise FileNotFoundError(suffix)
    return matches[0]


def is_white(pixel: np.ndarray, thresh: int) -> bool:
    r, g, b, a = (int(v) for v in pixel)
    if a < 10:
        return True
    return r >= thresh and g >= thresh and b >= thresh


def knock_edge_white(arr: np.ndarray, thresh: int = 244) -> np.ndarray:
    h, w = arr.shape[:2]
    seen = np.zeros((h, w), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    def seed(y: int, x: int) -> None:
        if 0 <= y < h and 0 <= x < w and not seen[y, x] and is_white(arr[y, x], thresh):
            queue.append((y, x))

    for x in range(w):
        seed(0, x)
        seed(h - 1, x)
    for y in range(h):
        seed(y, 0)
        seed(y, w - 1)

    while queue:
        y, x = queue.popleft()
        if y < 0 or x < 0 or y >= h or x >= w or seen[y, x]:
            continue
        if not is_white(arr[y, x], thresh):
            continue
        seen[y, x] = True
        arr[y, x, 3] = 0
        queue.extend(((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)))

    # Strip a 1px near-white halo on the silhouette only — keep interior logos.
    opaque = arr[:, :, 3] > 16
    empty = arr[:, :, 3] == 0
    neighbor = np.zeros_like(opaque)
    neighbor[1:] |= empty[:-1]
    neighbor[:-1] |= empty[1:]
    neighbor[:, 1:] |= empty[:, :-1]
    neighbor[:, :-1] |= empty[:, 1:]
    fringe = opaque & neighbor
    white = (arr[:, :, 0] >= 232) & (arr[:, :, 1] >= 232) & (arr[:, :, 2] >= 232)
    arr[:, :, 3] = np.where(fringe & white, 0, arr[:, :, 3])
    return arr


def process(src: Path, stem: str) -> None:
    im = Image.open(src).convert("RGBA")
    arr = knock_edge_white(np.array(im))
    ys, xs = np.where(arr[:, :, 3] > 12)
    pad_x = 16
    pad_top = 40
    pad_bot = 16
    fig = Image.fromarray(arr).crop(
        (
            max(0, int(xs.min()) - pad_x),
            max(0, int(ys.min()) - pad_top),
            min(arr.shape[1], int(xs.max()) + 1 + pad_x),
            min(arr.shape[0], int(ys.max()) + 1 + pad_bot),
        )
    )
    # Hi-def display: 2x LANCZOS so shirt type stays crisp on the TV.
    fig = fig.resize((fig.width * 2, fig.height * 2), Image.Resampling.LANCZOS)
    cut = OUT / f"{stem}.png"
    fig.save(cut, optimize=True)

    stage = Image.new("RGBA", (1600, 900), (0, 0, 0, 0))
    target_h = 700
    ratio = target_h / fig.height
    target_w = int(fig.width * ratio)
    placed = fig.resize((target_w, target_h), Image.Resampling.LANCZOS)
    x = 1600 - target_w - 36
    y = 900 - target_h - 48
    stage.paste(placed, (x, y), placed)
    stage.save(OUT / f"{stem}-stage.png", optimize=True)
    print(f"{stem}: cut {fig.size} stage@({x},{y}) {target_w}x{target_h}")


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for suffix, stem in JOBS:
        process(find_src(suffix), stem)


if __name__ == "__main__":
    main()
