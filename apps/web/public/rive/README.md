# Floor TV Rive assets

Drop brand `.riv` files here. Filenames are fixed — swap art without changing code.
Until files land, the TV uses an **AAA CSS celebration layer** (boxing gloves, XP pops, confetti, work/rest jabs).

| File | Used for |
|------|----------|
| `celebration.riv` | `achievement`, `class_complete` |
| `teams.riv` | `teams` |
| `phase.riv` | work ↔ rest punch |
| `challenge.riv` | `challenge` / `leaderboard` |
| `xp.riv` | `xp_bonus` XP burst moments |

## Expected state machine (recommended)

**Name:** `TV`

| Input | Type | When fired |
|-------|------|------------|
| `celebrate` | Trigger | achievement / class_complete enter |
| `teamsReveal` | Trigger | teams mode enter |
| `challenge` | Trigger | challenge / leaderboard enter |
| `phasePunch` | Trigger | work ↔ rest transition |
| `xpBurst` | Trigger | XP bonus / class complete XP |
| `mode` | Number (optional) | 0=timer, 1=celebrate, 2=teams, 3=challenge, 4=xp |
| `teamColor` | Number (optional) | 0–1 hue hint for teams art |

Suggested artboards: animated gloves, XP chip fly-up, confetti, bell flash.

If the file has no state machine, the runtime autoplays the default artboard and remounts on mode change.

## Preview

- `/tv/floor?demo=celebrate` — cycles achievement → XP → teams → challenge → leaderboard → class complete → timer
- `/tv/floor?rive=0` — disable Rive host (CSS layer still runs)
- `localStorage.setItem('sullys_tv_rive', 'off')` — same kill switch

## Coach triggers

Staff / phone Live → **Show achievement**, **Class complete**, TV modes — floor polls every 1s while coach is live.
