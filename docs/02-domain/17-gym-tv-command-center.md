# Gym TV Network, Digital Signage & Command Center

**Status:** Blueprint v1.2  
**Differentiator:** Every screen in the building is connected to the same live data platform — facility-as-ecosystem, not booking software with a TV afterthought.

Surfaces: member app · coach tablets · kitchen KDS · owner dashboard · **TV network** · **front-desk Command Center (~75")**.

---

## 1. TV Network (Five Profiles)

| TV | Location | Content |
|----|----------|---------|
| **TV 1 — Reception** | Lobby / front | Welcome members · current check-ins · birthdays · events · sponsors |
| **TV 2 — Training Floor** | Main floor | XP leaderboard · attendance · today's challenge · coach messages · (future: punches/calories if wearables) |
| **TV 3 — Kitchen** | Café / pickup | Today's meals · smoothies · protein specials · pickup queue · nutrition tip |
| **TV 4 — Kids Area** | Youth zone | Current class · achievements · birthday club · parent messages (safe) · upcoming camps |
| **TV 5 — Owner Office** | Private | Revenue · today's sales · check-ins · kitchen revenue · inventory · payroll alerts · analytics |

Profiles are config (`reception`, `training_floor`, `kitchen`, `kids_area`, `owner_office`) — not hardcoded per physical TV.

**Privacy**
- Kids TV: youth-safe only; no adult full-name leaderboards; no financials  
- Owner TV: staff network only; never mirrored to public playlists  
- Reception check-ins: first name or first + last initial; opt-out honored  

---

## 2. Digital Signage Rotation

Playlist engine rotates cards every few seconds (configurable 5–12s):

```
WELCOME Mike          +25 XP
NEW MEMBER Emma
TOP ATTENDANCE Sarah  27 Days
TODAY'S SPECIAL       Chicken Bowl $11.99
Fight Night Friday    7 PM
```

Card types: welcome/check-in XP · new member · streak/attendance · kitchen special · event · sponsor · announcement · challenge · birthday · weather · legacy “on this day”.

Motion: crisp cuts or short fades; respect reduced-motion with longer static holds.

---

## 3. Shared Live Blocks (Any Profile)

| Block | Notes |
|-------|-------|
| Live class schedule | Next N sessions |
| Available spots | Capacity remaining |
| Leaderboard | Opt-in / age-safe |
| Check-ins today | Counts + ticker |
| Upcoming events | Fight night, camps, BBQ |
| Birthdays | Opt-in |
| Kitchen specials | Menu highlights |
| Sponsors | Approved creatives |
| Weather | Local brief |
| Announcements | Staff compose |
| Holiday closures | When relevant |

---

## 4. Gym Command Center (Front Desk ~75")

Operational heartbeat behind the desk:

| Panel | Source |
|-------|--------|
| Members currently in the gym | Presence sessions |
| Active classes | In-progress + fill % |
| New check-ins | Live ticker |
| Today's revenue | Membership + kitchen + store + drop-in |
| Kitchen order queue | KDS summary |
| Leaderboard | Weekly opt-in |
| Birthdays | Opt-in |
| Attendance streaks | Celebrations |
| Upcoming bookings | Next 2–3 hours |
| Equipment status | Maintenance flags |
| Announcements | Compose → fans out to TVs/apps |
| Emergency alerts | **Staff only** — never public TVs |

---

## 5. Connected Screen Matrix

```
                    ┌─────────────────────┐
                    │  Realtime Platform  │
                    │  (API + WS + Redis) │
                    └─────────┬───────────┘
     ┌──────┬──────┬──────┬───┴───┬──────┬──────┐
     v      v      v      v       v      v      v
  Member Coach  Kitchen Owner  TV Net Command Website
   App  Tablet   KDS   Dash   1–5    Center  live widgets
```

Same events: `attendance.checked_in`, `booking.*`, `kitchen.order.*`, `announcement.posted`, `leaderboard.updated`, `xp.awarded`, `emergency.raised`.

---

## 6. Technical

- App: `apps/tv` fullscreen kiosk  
- Device auth: location display token; owner profile requires elevated device role  
- Channels: `tv:{locationId}:{profile}` · `command-center:{locationId}`  
- Fallback: cached playlist / static schedule if socket drops  
- CMS for sponsors + legacy “on this day” cards  

---

## 7. Phase Mapping

| Capability | Priority | Phase |
|------------|----------|-------|
| Realtime foundation | Must | 3 |
| Reception + floor schedule boards | Should | 3–4 |
| Signage rotation engine | Should | 4–5 |
| Kitchen + kids profiles | Should | 6–7 |
| Command Center | Could → Should | 8 (foundation earlier) |
| Owner office TV | Could | 8 |
| Wearable punches/calories on floor TV | Future | 9+ |

---

## Change Log

- **2026-08-07 (v1.2):** Expanded to five-TV network + digital signage rotation examples; owner office profile.
