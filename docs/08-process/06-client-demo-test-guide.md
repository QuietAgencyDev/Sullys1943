# Sully’s Client Demo — Full Test Guide

Use this checklist for an end-to-end walkthrough (website → member → coach → floor TV → desk).

**Last updated:** 2026-08-09

---

## 1. Quick links

| Surface | URL |
|--------|-----|
| **Public website** | https://www.sullys1943.com |
| **Coaches page** | https://www.sullys1943.com/coaches |
| **Member login** | https://www.sullys1943.com/app/login |
| **Phone Coach (after coach login)** | https://www.sullys1943.com/app/coach |
| **Floor TV** | https://www.sullys1943.com/tv/floor |
| **TV celebration preview** | https://www.sullys1943.com/tv/floor?demo=celebrate |
| **Staff console** | https://sullys1943-staff.vercel.app |
| **API health** | https://api.sullys1943.com/api/v1/health |

### Today’s Live shortcuts (2026-08-09)

These IDs are seeded for today — if a link 404s later, use Coach home instead.

| Class | Coach Live (phone) | Staff Live |
|-------|--------------------|------------|
| **Demo Live Class** | https://www.sullys1943.com/app/coach/live/cmslw1e2e0003ulgcl7ptkbiy | https://sullys1943-staff.vercel.app/coach/live/cmslw1e2e0003ulgcl7ptkbiy |
| **Beginner Boxing** | https://www.sullys1943.com/app/coach/live/cmslw1e0n0001ulgc3yr7rx1q | https://sullys1943-staff.vercel.app/coach/live/cmslw1e0n0001ulgc3yr7rx1q |

---

## 2. Demo logins

All demo passwords: **`password123`**

| Role | Email | Use for |
|------|-------|---------|
| **Member** | `member@sullys.local` | Book, card, passport (Gavin Sheppard / Gavin S) |
| **Coach** | `coach@sullys.local` | Timer, Live Mode, TV control (**Tony Morrison**) |
| **Front desk** | `desk@sullys.local` | Desk / kiosk / staff hub |
| **Admin** | `admin@sullys.local` | Admin users |
| **Owner** | `owner@sullys.local` | Owner console |

### Important

- Timer **Start / Pause / Reset / Stop** only appear when signed in as **coach** (or admin/owner).
- If you see **“Staff role required”**, you are still on a **member** session → sign out → log in as `coach@sullys.local`.
- On member login page, use **Fill coach demo** when testing Live Mode.
- Prefer **two screens**: one for Coach Live, one for Floor TV.

---

## 3. Prep (2 minutes)

1. Open **Floor TV**: https://www.sullys1943.com/tv/floor  
2. Hard refresh (`Ctrl+Shift+R`).  
3. Tap **Tap for sound / Test sound** once (required for browser audio).  
4. Optional: press **`F`** for fullscreen.  
5. Keep speakers unmuted / volume up.

---

## 4. Full demo script

### A. Public website (brand + photos)

1. Open https://www.sullys1943.com  
2. Confirm homepage **photo carousel** auto-scrolls (youth + Rival + gym shots).  
3. Open https://www.sullys1943.com/coaches — roster shows real trainers (photos show initials until headshots are dropped in).  
4. Briefly show Programs / Join / Contact as needed.

---

### B. Member journey

1. Open https://www.sullys1943.com/app/login  
2. Tap **Fill member demo** (or use `member@sullys.local` / `password123`).  
3. Sign in → Member home (Gavin / member experience).  
4. Walk:
   - **Book a class** (if slots show)
   - **Digital card**
   - **Passport / XP** (level + points)
5. Sign out from **Profile** before switching to coach.

---

### C. Coach Live + Boxing Timer (main demo)

#### Option 1 — Phone coach (member app, coach account)

1. https://www.sullys1943.com/app/login  
2. Tap **Fill coach demo** → `coach@sullys.local` / `password123`  
3. Open https://www.sullys1943.com/app/coach  
4. Tap **Demo Live Class** (or today’s class) → **Open Live Mode**  
   - If no class is listed, open Staff Live (Option 2) or ask eng to seed today’s session.

#### Option 2 — Staff console (tablet / laptop)

1. https://sullys1943-staff.vercel.app  
2. Sign in: `coach@sullys.local` / `password123`  
3. Go to **Coach** → pick today’s class → **Live**

#### Timer test (both options)

With Floor TV open on the second screen:

1. Tap **Demo · 45 / 15 / 3** (fast walkthrough timing).  
2. Optional: **Enable sound** on the coach device too.  
3. Tap **START** — Floor TV countdown should follow.  
4. At **0:10** — hear **wooden double clap** on the TV.  
5. At **0:00** — short end bell; advance / rest as needed.  
6. Test controls:
   - **PAUSE** → clock freezes on TV  
   - **START** (resume) → continues  
   - **RESET** → Round 1, full work, paused  
   - **STOP** → idle (no XP)  
   - **FINISH** → class complete + XP path (use once at end)

#### TV modes / celebrations (coach)

From Live Mode TV strip:

1. **Show achievement** / **XP bonus** / **Class complete**  
2. Confirm Floor TV flips modes (gloves / XP / completion).  
3. Return to **TIMER** for the round clock.

---

### D. Floor TV alone (backup / marketing)

If coach session is not running:

- https://www.sullys1943.com/tv/floor — ambient board + auto round clock  
- https://www.sullys1943.com/tv/floor?demo=celebrate — cycles celebration modes for visuals

---

### E. Front desk (optional)

1. https://sullys1943-staff.vercel.app  
2. Sign in: `desk@sullys.local` / `password123`  
3. Show desk / kiosk path as available in the staff hub.

---

## 5. Pass / fail checklist

| # | Check | Pass? |
|---|--------|-------|
| 1 | Homepage carousel scrolls with gym/youth photos | ☐ |
| 2 | `/coaches` shows Tony, Rico, Winslow, etc. | ☐ |
| 3 | Member login works | ☐ |
| 4 | Coach login works (no “Staff role required”) | ☐ |
| 5 | Live Mode shows START / PAUSE / RESET / STOP | ☐ |
| 6 | Floor TV follows coach timer | ☐ |
| 7 | Sound unlock works; clap at 10 seconds | ☐ |
| 8 | Pause / Reset / Stop update TV | ☐ |
| 9 | Achievement / XP / Class complete show on TV | ☐ |
| 10 | FINISH awards completion moment | ☐ |

---

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| **Staff role required** / no timer buttons | Sign out → log in as `coach@sullys.local` |
| No sound on TV | Tap Test sound on `/tv/floor`; unmute tab/device |
| TV not following timer | Confirm coach **START**ed; hard refresh TV; wait ~1s for poll |
| Staff login fails in browser | Confirm you’re on https://sullys1943-staff.vercel.app (API CORS allows this host) |
| No class on Coach home | Sessions are day-based — use Staff Live or ask eng to seed a “Demo Live Class” for today |
| Coach photos are letters only | Drop JPGs into `apps/web/public/coaches/` per that folder’s README, then redeploy web |

---

## 7. Suggested 8-minute client flow

1. **0:00** — Homepage + carousel  
2. **1:00** — Coaches page  
3. **2:00** — Member login (Gavin) — book / card / passport  
4. **3:30** — Switch to coach login  
5. **4:00** — Live Mode + Floor TV side by side  
6. **4:30** — Demo preset → START → 10s clap  
7. **6:00** — Pause / Reset / celebrations  
8. **7:30** — FINISH / class complete on TV  
9. **8:00** — Q&A / next steps (Helcim, real headshots, Rive art)

---

## 8. Adding content later

| Asset | Where |
|-------|--------|
| Homepage carousel photos | `apps/web/public/carousel/` + list in `apps/web/src/lib/home-carousel.ts` |
| Coach headshots | `apps/web/public/coaches/` (see README there) |
| TV celebration art | `apps/web/public/rive/` + `apps/web/public/tv/` |

---

## 9. Eng notes

- Demo coach account maps to **Tony Morrison**.  
- API: Railway (`api.sullys1943.com`). Web/Staff: Vercel.  
- Floor TV polls ~500ms while coach timer is live.  
- Payments remain **mock** until Helcim keys are configured.
