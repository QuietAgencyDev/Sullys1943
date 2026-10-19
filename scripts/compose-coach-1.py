"""Assemble Coach 1 at original-guard proportions with correct draw order."""
from pathlib import Path

from PIL import Image

ROOT = Path(r"C:\Users\user\.cursor\SULLYS\apps\web\public\rive\characters\coach-1")
PARTS = ROOT / "parts"
OUT = ROOT / "assembled-guard.png"

W, H = 1400, 2600
CX = 700
canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))


def load(name: str) -> Image.Image:
    im = Image.open(PARTS / name).convert("RGBA")
    box = im.getbbox()
    return im.crop(box) if box else im


def place(
    src: Image.Image,
    cx: float,
    cy: float,
    height: int,
    angle: float = 0,
    flip: bool = False,
) -> None:
    im = src.copy()
    if flip:
        im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    width = max(1, int(im.width * (height / im.height)))
    im = im.resize((width, height), Image.Resampling.LANCZOS)
    if angle:
        im = im.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
    canvas.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))


head = load("02-head.png")
body = load("05-body.png")
arm_r = load("04-arm-r.png")
arm_l = load("06-arm-l.png")
glove_r = load("00-glove-r.png")
glove_l = load("03-glove-l.png")
leg_r = load("09-leg-r.png")
leg_l = load("08-leg-l.png")
shoe_r = load("10-shoe-r.png")

# Back → front. Lead shoe is in front of the pant so it is not hidden.
place(shoe_r, CX - 118, 2138, 176, angle=-8)
place(leg_r, CX - 55, 1650, 960, angle=-2)
place(leg_l, CX + 115, 1690, 980, angle=2)
place(shoe_r, CX + 130, 2148, 168, angle=6, flip=True)
place(body, CX + 6, 980, 820)
place(arm_r, CX - 155, 830, 400, angle=10, flip=True)
place(glove_r, CX - 175, 780, 320, angle=-14, flip=True)
place(arm_l, CX + 155, 825, 390, angle=-10)
place(glove_l, CX + 175, 770, 320, angle=12)
place(head, CX - 4, 740, 310)

bbox = canvas.getbbox()
if bbox:
    pad = 36
    x0, y0, x1, y1 = bbox
    crop = (
        max(0, x0 - pad),
        max(0, y0 - pad),
        min(W, x1 + pad),
        min(H, y1 + pad),
    )
    cropped = canvas.crop(crop)
    print("bbox", bbox, "crop", crop)
else:
    cropped = canvas
cropped.save(OUT)
print("wrote", OUT, cropped.size)
