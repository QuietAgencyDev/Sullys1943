# Community

## Purpose

A **private, gym-scoped social network** — belonging without the toxicity of public social platforms. Announcements first; UGC only with moderation.

---

## Features

| Feature | Notes |
|---------|-------|
| Posts | Text + media |
| Photos / Videos | Consent-aware; compressed |
| Likes / Reactions | Simple set |
| Comments | Nested one level |
| Coach Posts | Verified badge — tips, technique |
| Announcements | Pinned, push-enabled, program-targeted (ships day one) |
| Member achievements | Celebrate levels, streaks, milestones (opt-in) |
| Fight photos / results | Structured + consent |
| Healthy recipes | From Nutrition CMS |
| Kitchen specials | Deep link to order |
| Challenge updates | Gamification hooks |
| New merchandise | Store teasers |
| Event reminders | Fight night, BBQ, camps |
| Community Events | Deep link to Events |
| Gym Challenges | Deep link to Boxing Progression |

**Product intent:** Give members a reason to open the app **even when they're not training**.

---

## Safety Architecture (Launch Gate)

1. **Roles:** member post permission configurable (default: coaches/staff only at soft launch)
2. **Minor rules:** children cannot post; teens optional with approval queue
3. **Moderation:** report, hide, remove, ban; audit log
4. **Photo consent:** filter faces of non-consenting / minors without release
5. **Profanity / spam filters** baseline
6. **No DMs between members in v1** (reduce grooming risk) — coach/parent messaging uses Messaging module

---

## Feed Ranking

v1: reverse chronological + pinned announcements  
v2: engagement lightly weighted; never hide safety notices

---

## Moderation Console

- Queue for reported content
- Shadow mute
- Keyword alerts
- SLA for staff response

---

## Phase Guidance

- **Should early:** Announcements center (can live outside full community)
- **Phase 8:** Full feed after tools proven
- **Could:** Stories-style ephemeral highlights
