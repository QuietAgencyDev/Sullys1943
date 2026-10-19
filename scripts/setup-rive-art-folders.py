"""Make an easy-to-open art/rive-cuts folder with junctions to live character art."""
from pathlib import Path
import subprocess

ROOT = Path(r"C:\Users\user\.cursor\SULLYS")
CHAR = ROOT / "apps" / "web" / "public" / "rive" / "characters"
ART = ROOT / "art" / "rive-cuts"

COACHES = ["coach-1", "coach-2", "coach-3"]
KIDS = ["kid-1", "kid-2", "kid-3", "kid-4", "kid-5"]

BIND = """# Bind {title} onto the community Boxer rig

Credit the original: Boxer by Mykhailo_Koniaiev (CC BY).

## In Rive

1. Remix https://rive.app/community/files/24944-46562-boxer/
2. Keep the bones. Do not redraw the skeleton.
3. Replace each image asset with the matching PNG from this folder.

| Rive asset / bone | Our file |
|---|---|
| Head | `02-head.png` |
| Body | `05-body.png` |
| Arm_L | `06-arm-l.png` |
| Arm (right) | `04-arm-r.png` |
| Glove_L Blue | `03-glove-l.png` |
| Glove R Blue | `00-glove-r.png` |
| Leg_L | `08-leg-l.png` |
| Leg_R | `09-leg-r.png` |
| foot / shoe | `10-shoe-r.png` and `10b-shoe-l.png` |
| hand_L / hand_R | keep bone, hide old skin, gloves sit on top |

4. Artboard: duplicate `Instagram post - 1` to `FloorBoxer` at 1920x1080.
5. Export `.riv` to `apps/web/public/rive/{folder}.riv`.
"""


def title_of(folder: str) -> str:
    kind, num = folder.split("-")
    return f"{kind.capitalize()} {num}"


def junction(link: Path, target: Path) -> None:
    if link.exists() or link.is_symlink():
        if link.is_dir() and not link.is_symlink():
            # Existing real dir — leave it; recreate as junction if empty of unique files
            pass
        subprocess.run(["cmd", "/c", "rmdir", str(link)], check=False)
    link.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["cmd", "/c", "mklink", "/J", str(link), str(target)],
        check=True,
    )
    print("link", link, "->", target)


for folder in COACHES + KIDS:
    parts = CHAR / folder / "parts"
    parts.mkdir(parents=True, exist_ok=True)
    (parts / "RIVE-BIND.md").write_text(
        BIND.format(title=title_of(folder), folder=folder),
        encoding="utf-8",
    )

for group, names in (("coaches", COACHES), ("kids", KIDS)):
    for folder in names:
        junction(ART / group / title_of(folder), CHAR / folder)

print("art", ART)
