# Gamification & Boxing Progression

## Purpose

Make training feel rewarding like Duolingo — **without guilt dark patterns**. XP and rewards must map to real gym behavior. This is the **beyond Glofox** progression layer that turns Sully's into an athlete development platform, not just a booking app.

Progression signals also project onto the [Unified Calendar Hub](./16-calendar-hub.md) (challenges, streaks, level-up nudges) and can appear on [Gym TV / Command Center](./17-gym-tv-command-center.md) leaderboards.

---

## Boxing Progression Systems

| System | Description |
|--------|-------------|
| **XP** | Points from real training actions |
| **Levels** | Soft progression from XP |
| **Boxing ranks** | Named tiers (e.g., Prospect → Contender → Champion) — brandable |
| **Skill trees** | Technique / values trees coaches stamp |
| **Personal bests** | Bag rounds, sparring rounds, attendance PBs — member-owned |
| **Milestones** | Career moments (first fight night, 100 check-ins, camp complete) |
| Achievements | One-time unlocks |
| Badges | Display collectibles |
| Season Passes | Time-boxed track with milestones |
| Challenges | Personal/team/gym goals (e.g., Heavy Bag Challenge) |
| Leaderboards | Opt-in; age-bracketed; privacy-safe; TV-safe aggregates |
| Streaks | Consecutive training days/weeks |
| Rewards Store | Spend points (see separate doc) |
| Mystery Boxes | Randomized rewards (Could; ethical caps) |
| Referral Rewards | Invite → trial → join |
| Daily Rewards | Light login bonus (cap abuse) |
| Weekly Quests | e.g., "Attend 3 classes" / Weekly Attendance Goal |
| Monthly Events | Gym-wide themes |
| Seasonal Competitions | Larger prizes |

---

## XP Rule Engine

Rules as data:

```json
{
  "event": "attendance.checked_in",
  "xp": 10,
  "filters": { "min_session_minutes": 0 },
  "limits": { "per_day": 30, "per_session": 1 }
}
```

Sources: check-in, class complete, nutrition adherence, referrals, challenges, kitchen healthy order (careful), quest claims, skill stamps, personal bests.

**Anti-patterns to avoid:** XP for opening the app only; punishing missed days harshly for youth.

---

## Skill Trees & Personal Bests

- Skill trees align with Kids Program stamps and adult technique tracks  
- Coaches grant proficiency; members see calendar nudge when a milestone is near  
- Personal bests are never shaming — private by default; share opt-in to feed/TV  

---

## Streaks

- Define streak unit: calendar days with valid attendance OR weekly "trained this week"  
- Freezes: membership pause, medical, scheduled vacation passes (limited)  
- Youth: prefer weekly streaks to reduce pressure  
- Calendar shows streak status under Achievements layer  

---

## Leaderboards

- Scopes: class, program, location, friends  
- Opt-in default off for minors; parents enable  
- Hide exact XP optional; show rank only  
- Reset periods: weekly/monthly/season  
- **Gym TV:** aggregate / first-name styles only per privacy profile  

---

## Economy Balance

- Points sink via Rewards Store must match earn rate  
- Owner dashboard: inflation metrics  
- Manual grant (staff) fully audited  

---

## Celebration UX

- Level-up modal (respect reduced-motion) — cream/red heritage celebration, not neon  
- Badge unlock animation  
- Home rings / streak flame (subtle; brand red)  
- Calendar achievement chip when level-up is imminent  
- Check-in success may use glove glyph pulse

---

## Phase Mapping

- **Must with Phase 4:** XP, levels, boxing ranks, streaks, basic achievements, anti-abuse  
- **Should:** quests, challenges, skill trees, personal bests, milestones, badges, leaderboards opt-in, rewards wallet, calendar layers  
- **Could/Future:** mystery boxes, season pass cosmetics, cross-location leagues  

---

## Change Log

- **2026-08-07:** Renamed/expanded as Boxing Progression; calendar + TV hooks; skill trees, PBs, milestones explicit.
