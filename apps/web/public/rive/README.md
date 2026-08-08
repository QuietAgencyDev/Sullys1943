# Floor TV Rive assets

Drop brand `.riv` files here. Filenames are fixed — swap art without changing code.

| File | Used for |
|------|----------|
| `celebration.riv` | `achievement`, `class_complete` |
| `teams.riv` | `teams` |
| `phase.riv` | work ↔ rest punch |
| `challenge.riv` | `challenge` / `leaderboard` (optional; falls back to celebration) |

## Expected state machine (recommended)

**Name:** `TV` (or first state machine in the file)

| Input | Type | When fired |
|-------|------|------------|
| `celebrate` | Trigger | achievement / class_complete enter |
| `teamsReveal` | Trigger | teams mode enter |
| `challenge` | Trigger | challenge mode enter |
| `phasePunch` | Trigger | work ↔ rest transition |
| `mode` | Number (optional) | 0=timer, 1=celebrate, 2=teams, 3=challenge |
| `teamColor` | Number (optional) | 0–1 hue hint for teams art |

If the file has no state machine, the runtime autoplays the default artboard animation and remounts on mode change.

## Kill switch

- URL: `/tv/floor?rive=0`
- Or `localStorage.setItem('sullys_tv_rive', 'off')`

When Rive fails to load (missing file), the TV keeps CSS celebration fallbacks — never a blank hero.
