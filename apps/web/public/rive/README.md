# Floor TV Rive assets (placeholders)

Drop brand `.riv` files here using the **exact filenames** below. Code already points at these paths; missing files fall back to the CSS + SVG celebration layer (`/tv/icons/*`).

See [`manifest.json`](./manifest.json) for modes, triggers, and notes.

| File | Modes | Status |
|------|--------|--------|
| `celebration.riv` | achievement, class_complete | placeholder |
| `belt.riv` | leaderboard, achievement | placeholder |
| `teams.riv` | teams | placeholder |
| `challenge.riv` | challenge | placeholder |
| `phase.riv` | timer (work/rest) | placeholder |
| `xp.riv` | xp_bonus | placeholder |
| `gloves.riv` | timer / challenge gloves | placeholder |
| `announcement.riv` | announcement | placeholder |
| `class-complete.riv` | class_complete | placeholder |
| `photo.riv` | photo plate moments | placeholder |
| `confetti.riv` | overlay celebrate | placeholder |
| `bell.riv` | round bell | placeholder |

Each filename also has a `.placeholder` marker in this folder until the real `.riv` is dropped in (delete the marker when you add the file).

## State machine

**Name:** `TV`

| Input | Type | When |
|-------|------|------|
| `celebrate` | Trigger | achievement / class complete |
| `beltReveal` | Trigger | champion belt moments |
| `teamsReveal` | Trigger | teams |
| `challenge` | Trigger | challenge |
| `phasePunch` | Trigger | work ↔ rest |
| `xpBurst` | Trigger | XP bonus |
| `announce` | Trigger | announcement |
| `photoReveal` | Trigger | athlete/gym photo plate |
| `jab` / `bell` | Trigger | gloves / round bell |
| `mode` | Number | 0 timer · 1 celebrate · 2 teams · 3 challenge · 4 xp · 5 belt · 6 photo |
| `teamColor` | Number | 0–1 optional |

## Related assets

- SVG fallbacks: [`../tv/icons/`](../tv/icons/) (`glove-1.svg`, `champion-belt.svg`, …)
- Future photos: [`../tv/photos/`](../tv/photos/)

## Preview / kill switch

- `/tv/floor?demo=celebrate`
- `/tv/floor?rive=0` or `localStorage.sullys_tv_rive=off`
