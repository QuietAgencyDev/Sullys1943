# Feature Roadmap

Phased delivery maximizes early operational value (waivers, memberships, check-in) while keeping the schema franchise-ready. Dates are relative; calibrate to team size.

---

## Roadmap Overview

```
Phase 0  Foundations (legal, brand/logo, platform skeleton)
Phase 1  Foundation + Marketing Website shell (auth, tenancy, public face)
Phase 2  Membership, Billing, Waivers, Online Join Funnel
Phase 3  Check-In, Calendar Hub, Day-One Glofox Parity+, Live web widgets
Phase 4  Boxing Progression + Passport MVP + Legacy Wall start
Phase 5  Nutrition Center (calendar-integrated)
Phase 6  Sully's Kitchen + Kitchen TV
Phase 7  Kids Program depth + Kids TV
Phase 8  Community Feed + Full TV Network + Command Center + Trophy Room depth
Phase 9  Sully AI
Phase 10 Franchise Platform (multi-location rollup)
```

**Phase 1–3 = Match (and exceed) Glofox core experience** with calendar hub + digital card + live website.  
**Phase 4+ = Beyond Glofox** (progression, legacy, nutrition/kitchen, smart gym, AI, franchise).

Youth basics begin in Phases 1–3 — Phase 7 deepens report cards and camps.

Live site to evolve: [https://www.sullysboxinggym.com](https://www.sullysboxinggym.com) — see [Website & Public Platform](../02-domain/19-website-public-platform.md).


---

## Phase 0 — Pre-Build Foundations (2–4 weeks)

**Outcomes**
- Legal review of waiver templates & minor consent
- Brand & design system tokens approved
- Architecture ADRs signed
- Environments: local, staging, prod accounts
- Analytics taxonomy draft
- Threat model v1

**Exit criteria:** Spec freeze for Phase 1–3 Must Haves; Stripe account; domain & app identities.

---

## Phase 1 — Foundation Platform + Public Website Shell

**Theme:** Identity, tenancy, staff admin, **premium marketing site** as platform front door.

| Module | Deliverables |
|--------|--------------|
| Auth | Register, login, MFA for staff, password reset, session management |
| Tenancy | Organization, Location, rooms |
| RBAC | Roles, permissions, staff invites |
| Profiles | Member/staff profiles, emergency contacts, coach profile stubs |
| Admin | Settings shell, audit log viewer, feature flags |
| Design | App shells + **logo-locked design tokens** |
| Website | Hero video-ready layout, brand badge hero, about/history/contact preserved & elevated, counters section, memberships teaser |
| Comms | Email provider + transactional templates baseline |

**Dependencies:** None  
**Risks:** Overbuilding admin before member value; website redesign without join funnel (funnel lands Phase 2)

**Exit:** Public site feels like Sully's (not generic template); auth + tenancy solid.

---

## Phase 2 — Membership & Billing

| Deliverables |
|--------------|
| Membership products (monthly, annual, youth, family, punch, drop-in, trial, unlimited, corporate skeleton) |
| Entitlements engine |
| Stripe subscriptions + one-time payments |
| Invoices, receipts, failed payment dunning, **payment history**, **renewals** |
| Pause/cancel flows |
| Digital waiver gate before activation |
| Front desk sell flows |
| **Online join funnel on website:** choose plan → waiver → pay → welcome |

**Exit:** New member can go trial → paid fully online from [sullysboxinggym.com](https://www.sullysboxinggym.com) paths; desk can sell drop-in.

---

## Phase 3 — Check-In, Classes & Calendar Hub

| Deliverables |
|--------------|
| Class programs & schedules |
| Booking + waitlist + capacity |
| **Member calendar hub (day/agenda)** — classes, events, closures |
| QR credential + **digital membership card** |
| Scanner (desk + coach) |
| Attendance ledger + history |
| Late flags |
| Coach profiles (public member view) |
| Announcements center + push notifications |
| In-app messaging (member/parent ↔ coach) |
| Parent attendance notifications (youth) |
| **Coach calendar (thin):** classes, private lessons, vacation requests |
| **Owner calendar (thin):** renewals, events, staff schedule reminders |
| Owner utilization widgets |
| Realtime channel foundation (for TV / Command Center later) |

**Exit:** ≥ peak hour check-in median < 5s; paper attendance retired; member calendar is primary home surface; **website shows live class spots** from same API.

**Day-one contract:** See [Day-One Member Experience](../02-domain/15-day-one-member-experience.md).

---

## Phase 4 — Boxing Progression + Legacy Start

| Deliverables |
|--------------|
| XP rules engine (check-in, class complete, streaks) |
| Levels / **boxing ranks** |
| Skill trees + milestones + personal bests |
| Achievements / badges / digital trophies |
| Daily/weekly quests / challenges |
| Leaderboards (opt-in, age-safe) |
| Anti-abuse rules |
| Rewards wallet (points balance) |
| **Calendar layers:** challenges, achievement nudges, streak goals |
| **Boxing Passport MVP** (years, coach, XP, attendance, achievements) |
| **Legacy Wall MVP** (timeline CMS + public `/legacy`) |
| Welcome XP on join |
| Reception/Floor TV leaderboard soft launch |

**Exit:** 60%+ of active members earn XP weekly within 30 days; passport viewable in app.
---

## Phase 5 — Nutrition Center

| Deliverables |
|--------------|
| Goals, plans, recipes, shopping lists |
| Habit + hydration tracking |
| Nutrition coach console |
| Courses (CMS-lite) |
| Progress & feedback threads |
| **Nutrition items projected onto member calendar** (classes, grocery reminders) |

**Exit:** Coach can assign plan; member can complete daily checklist; nutrition visible on calendar.

---

## Phase 6 — Sully's Kitchen

| Deliverables |
|--------------|
| Menu, specials, allergens, nutrition facts |
| Pre-order + pickup windows |
| KDS for staff |
| Inventory / 86 |
| Meal packages & prep subscription |
| Owner kitchen KPIs |
| Integration hooks for future POS |
| **Kitchen pickups / smoothie orders on calendar** |
| **Gym TV kitchen specials block** (optional flag) |

**Exit:** Members order post-class pickup; kitchen runs on digital tickets only.

---

## Phase 7 — Kids Program Depth

| Deliverables |
|--------------|
| Skill progression trees |
| Digital report cards / coach feedback |
| Youth nutrition lessons |
| Parent hub polish (bookings, attendance, waiver status, events, camps) |
| Birthday party & camp packages |
| Coach–parent messaging SLAs |

**Note:** Core parent/child identity ships earlier; this phase is the "incredible youth system."

---

## Phase 8 — Community + Facility Displays + Trophy Room

| Deliverables |
|--------------|
| Announcements (already live earlier — deepen) |
| Feed: achievements, fight photos, coach tips, recipes, kitchen specials, challenges, merch, events |
| Moderation + minor protections |
| Fight results & event highlights |
| **Digital Trophy Room / Hall of Fame** depth |
| **Full TV Network:** Reception, Floor, Kitchen, Kids, Owner Office |
| **Digital signage rotation engine** |
| **Gym Command Center** (front desk 75") |

**Gate:** Moderation before UGC; TV privacy profiles before birthdays/leaderboards; owner TV on staff network only.

---

## Phase 9 — Sully AI

| Deliverables |
|--------------|
| Conversational concierge (book, nutrition, rank progress, order, parent schedule, owner expiries) |
| AI Coach suggestions |
| AI meal planner drafts |
| Retention risk scoring |
| Workout generator assists |
| Support assistant with handoff |
| Injury *prevention suggestions* (non-diagnostic) |

**Gate:** Clean attendance + nutrition data; legal review of AI disclaimers.

---

## Phase 10 — Franchise Platform

| Deliverables |
|--------------|
| Franchise / HQ console |
| Cross-location analytics rollup |
| Template distribution (programs, waivers, brand) |
| Per-location calendar, staff, kitchen, inventory, leaderboards, members, events |
| Location billing / entitlements |
| Data residency controls |
| Onboarding playbooks |

### Target location tree (illustrative)

```
Sully's HQ
├── Toronto West
├── Toronto East
├── Mississauga
├── Vaughan
├── Barrie
├── Hamilton
├── Ottawa
└── Future Locations
```

Each location: own calendar, staff, kitchen, inventory, leaderboards, members, events — roll up to corporate dashboard.

---

## Parallel Tracks (Continuous)

| Track | Cadence |
|-------|---------|
| Events module | MVP in Phase 3–4 (RSVP + payment); deepen later |
| Calendar projections | Grow with each domain (nutrition, kitchen, challenges) |
| Store / merch | Soft after Phase 4 rewards; full Shopify-like later |
| Gym TV / Command Center | Soft after Phase 3 realtime; GA with Phase 8 |
| Wallet / NFC | After QR stability |
| Mobile native apps | After mobile web PWA proves flows (or parallel if budget) |
| Accessibility audits | Every major phase |
| Security reviews | Every phase exit |

---

## Release Train Suggestion

- **Biweekly** member-facing releases behind flags
- **Monthly** staff tooling trains
- **Hardening sprint** after Phase 3 before Phase 4 expansion

---

## Beyond Glofox (Differentiation Sequence)

After day-one essentials ([checklist](../02-domain/15-day-one-member-experience.md)) and live website join:

1. Boxing Progression + Passport + Legacy Wall start (Phase 4)  
2. Nutrition + Kitchen on calendar + Kitchen TV (Phases 5–6)  
3. Kids Program depth + Kids TV (Phase 7)  
4. Community Feed + full TV network + Command Center + Trophy Room (Phase 8)  
5. Sully AI (Phase 9)  
6. Franchise HQ rollup (Phase 10)  

See [Modular Architecture](../02-domain/18-modular-architecture.md) and [Digital Performance Platform](../02-domain/00-digital-performance-platform.md).

---

## Roadmap Anti-Patterns to Avoid

1. Building Community before Check-In (no heartbeat data)
2. Building AI before data quality
3. Hardcoding membership types
4. Skipping minor privacy until "later"
5. Single-tenant shortcuts that block Phase 10
6. Treating calendar as classes-only (must be extensible hub from Phase 3)
7. Shipping Gym TV with PII before privacy review
