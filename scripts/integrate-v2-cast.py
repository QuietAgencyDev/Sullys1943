"""Copy missing v2 zip assets and place tonight's stills as numbered cast."""

from __future__ import annotations

import shutil
import zipfile
from pathlib import Path

from PIL import Image

ZIP = Path(r"C:\Users\user\Downloads\Sullys_Live_Gym_Board_Anime_Assets_v2 (1).zip")
ROOT = Path(r"C:\Users\user\.cursor\SULLYS")
WEB = ROOT / "apps" / "web" / "public"
CAST = WEB / "tv" / "cast"
ICONS = WEB / "tv" / "icons"
NOTES = WEB / "tv" / "notes"
POPUPS = WEB / "tv" / "popups"
CHARS = WEB / "rive" / "characters"
BRAND = WEB / "brand"
ASSETS = Path(
    r"C:\Users\user\.cursor\projects\c-Users-user-cursor-SULLYS\assets"
)

PROTECTED_NAMES = {
    "coach-1-guard.png",
    "coach-1-guard-stage.png",
    "coach-1-jab.png",
    "coach-1-jab-stage.png",
    "coach-1-victory.png",
    "coach-1-victory-stage.png",
}

FLOOR_MAP = {
    "floor-achievement": "achievement",
    "floor-announcement": "announcement",
    "floor-birthday": "birthday",
    "floor-challenge": "challenge",
    "floor-challenge_winner": "challenge_winner",
    "floor-check_in": "check_in",
    "floor-class-complete": "class_complete",
    "floor-class_starting": "class_starting",
    "floor-combo": "combo",
    "floor-first_visit": "first_visit",
    "floor-heritage": "heritage",
    "floor-kids": "kids",
    "floor-kids_complete": "kids_complete",
    "floor-last_spots": "last_spots",
    "floor-leaderboard": "leaderboard",
    "floor-level_up": "level_up",
    "floor-pads": "pads",
    "floor-session_mvp": "session_mvp",
    "floor-sparring": "sparring",
    "floor-streak": "streak",
    "floor-teams": "teams",
    "floor-timer": "timer",
    "floor-welcome_back": "welcome_back",
    "floor-xp-bonus": "xp_bonus",
}

CANVAS = (1600, 900)


def protected(dest: Path) -> bool:
    try:
        dest.resolve().relative_to((CHARS / "coach-2").resolve())
        return True
    except ValueError:
        pass
    if dest.resolve() == (BRAND / "sullys-heritage-shield.png").resolve():
        return dest.exists()
    return dest.name in PROTECTED_NAMES and dest.parent.resolve() == CAST.resolve()


def copy_missing_from_zip() -> tuple[int, int]:
    copied = 0
    skipped = 0
    with zipfile.ZipFile(ZIP) as z:
        for info in z.infolist():
            if info.is_dir():
                continue
            name = info.filename.replace("\\", "/")
            prefix = "Sullys_Live_Gym_Board_Anime_Assets_v2/"
            if not name.startswith(prefix):
                continue
            rel = name[len(prefix) :]
            dest: Path | None = None

            if rel.startswith("01_Icons/1024/") and rel.lower().endswith(".png"):
                dest = ICONS / Path(rel).name
            elif rel.startswith("03_Rive_Layers/"):
                parts = rel.split("/")
                if len(parts) < 3:
                    continue
                mode = FLOOR_MAP.get(parts[1])
                if not mode:
                    continue
                dest = POPUPS / mode / parts[2]
            elif rel.startswith("03b_Notifications/") and (
                rel.lower().endswith(".png") or rel.lower().endswith(".json")
            ):
                dest = NOTES / Path(rel).name
            elif rel.startswith("04_Shared_Art/"):
                rest = rel[len("04_Shared_Art/") :]
                if rest == "sullys-heritage-shield.png":
                    dest = BRAND / "sullys-heritage-shield.png"
                elif "/" not in rest and rest.lower().endswith(".png"):
                    dest = CAST / rest
                else:
                    continue
            else:
                continue

            if dest is None:
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            if dest.exists() or protected(dest):
                skipped += 1
                continue
            with z.open(info) as src, open(dest, "wb") as out:
                shutil.copyfileobj(src, out)
            copied += 1
    return copied, skipped


def crop_alpha(im: Image.Image) -> Image.Image:
    rgba = im.convert("RGBA")
    bbox = rgba.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    return rgba.crop(bbox) if bbox else rgba


def place_stage(cut: Image.Image, *, duo: bool = False) -> Image.Image:
    stage = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    max_h = 820
    max_w = 980 if duo else 720
    w, h = cut.size
    scale = min(max_w / w, max_h / h)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    fitted = cut.resize((nw, nh), Image.Resampling.LANCZOS)
    x = 1600 - 36 - nw
    y = 900 - 28 - nh
    stage.paste(fitted, (x, y), fitted)
    return stage


def save_cast(cut: Image.Image, stem: str, *, duo: bool = False) -> None:
    CAST.mkdir(parents=True, exist_ok=True)
    png = CAST / f"{stem}.png"
    stage = CAST / f"{stem}-stage.png"
    if protected(png) or protected(stage):
        print(f"skip protected {stem}")
        return
    cut.save(png, "PNG")
    place_stage(cut, duo=duo).save(stage, "PNG")
    print(f"wrote {stem} {cut.size} -> stage")


def still(name_part: str) -> Path:
    matches = [p for p in ASSETS.glob("*.png") if name_part in p.name]
    if not matches:
        raise FileNotFoundError(name_part)
    return matches[0]


def copy_character(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        return
    shutil.copy2(src, dest)


def place_stills() -> None:
    mapping = [
        (
            "Child_boxer_in_high_defensive_guard",
            "kid-2-guard",
            CHARS / "kid-2" / "05-guard.png",
            False,
        ),
        (
            "Sully_s_Boxing_Coach_with_Focus_Mitts",
            "coach-1-pads",
            CHARS / "coach-1" / "07-pads.png",
            False,
        ),
        (
            "Coach_2_in_orthodox_boxing_guard",
            "coach-2-guard",
            None,
            False,
        ),
        (
            "Sully_s_Coach_in_Quiet_Rest_Pose",
            "coach-1-rest",
            CHARS / "coach-1" / "06-rest.png",
            False,
        ),
        (
            "Young_boxer__compact_uppercut_pose",
            "kid-1-jab",
            CHARS / "kid-1" / "06-uppercut.png",
            False,
        ),
        (
            "Two_children_in_anime_sparring_gear",
            "kids-sparring-1",
            None,
            True,
        ),
        (
            "Anime_sparring_duo_in_headguards",
            "kids-sparring-2",
            None,
            True,
        ),
        (
            "Anime_Kids_Sparring_with_Heritage_Shields",
            "kids-sparring-3",
            None,
            True,
        ),
        (
            "Young_Boxing_Champion_Victory_Pose",
            "kid-4-celebrate",
            CHARS / "kid-4" / "08-victory.png",
            False,
        ),
        (
            "Athletic_Boxing_Coach_in_Orthodox_Guard",
            "coach-3-guard",
            CHARS / "coach-3" / "05-guard-still.png",
            False,
        ),
    ]
    for part, stem, char_path, duo in mapping:
        src = still(part)
        cut = crop_alpha(Image.open(src))
        save_cast(cut, stem, duo=duo)
        if char_path is not None:
            copy_character(src, char_path)


def main() -> None:
    if not ZIP.exists():
        raise SystemExit(f"missing zip: {ZIP}")
    copied, skipped = copy_missing_from_zip()
    print(f"zip copied={copied} skipped_existing={skipped}")
    place_stills()
    print("cast now:", sorted(p.name for p in CAST.glob("*.png")))
    print("new icons:", sorted(p.name for p in ICONS.glob("*.png")))
    print("notes:", sorted(p.name for p in NOTES.glob("*")) if NOTES.exists() else [])


if __name__ == "__main__":
    main()
