# Product Backlog — Epics & Features

This is the master epic catalog. Stories under each epic are summarized; expand into Jira/Linear during Phase 0.

**Estimate key:** XS < 1d · S 1–3d · M 1–2w · L 2–4w · XL > 4w (team-dependent)

---

## Epic Catalog

### E01 — Platform Foundation
**Goal:** Multi-tenant identity and admin shell.  
**Features:** Org/Location model · Auth · RBAC · Profiles · Audit log · Feature flags · Notification bus · Design system implementation · CI/CD  
**Size:** XL | **Phase:** 1

### E02 — Digital Documents & Waivers
**Goal:** Paperless legal intake with versioning.  
**Features:** Template CMS · Versioning · Signature capture · PDF render · Storage · Minor/parent flows · Medical & emergency fields · Competition/photo/privacy templates · Staff acknowledgements · Expiry & re-sign  
**Size:** L | **Phase:** 1–2

### E03 — Membership & Entitlements
**Goal:** Configurable products controlling access.  
**Features:** Product catalog · Family/youth/corporate · Punch cards · Trials · Scholarships/VIP/lifetime · Pause/cancel · Entitlement rules engine  
**Size:** L | **Phase:** 2

### E04 — Payments & Billing
**Goal:** Reliable money movement.  
**Features:** Stripe Customer/Subscription · One-time · Invoices · Dunning · Refunds · Payouts reporting · Tax config · Family invoices  
**Size:** L | **Phase:** 2

### E05 — Class Catalog & Scheduling
**Goal:** Unlimited programs on one timetable.  
**Features:** Programs · Sessions · Rooms · Coaches assignment · Recurrence · Booking · Waitlist · Policies · Camps/parties as program types  
**Size:** L | **Phase:** 3

### E06 — Check-In & Attendance
**Goal:** Fast, trustworthy presence data.  
**Features:** QR credentials · Scanners · Desk fallback · Late detection · Capacity · Attendance ledger · XP hooks · Future Wallet/NFC interfaces  
**Size:** L | **Phase:** 3

### E07 — Coach Tools
**Goal:** Roster, notes, workouts, messaging.  
**Features:** Live roster · Notes · Workout builder · Progress views · Substitution requests · Basic reports  
**Size:** M–L | **Phase:** 3–4

### E08 — Parent & Youth Core
**Goal:** Safe linked accounts and visibility.  
**Features:** Guardianship links · Consent matrix · Attendance alerts · Youth eligibility · Announcements  
**Size:** M | **Phase:** 2–3

### E09 — Boxing Progression / Gamification Engine
**Goal:** Habit reinforcement + boxing identity from real behavior.  
**Features:** XP rules · Levels · Boxing ranks · Skill trees · Personal bests · Milestones · Badges · Quests · Streaks · Leaderboards · Season passes · Anti-cheat · Points ledger · Calendar challenge/achievement projections  
**Size:** L | **Phase:** 4

### E10 — Rewards Store
**Goal:** Redeem points for tangible perks.  
**Features:** Catalog · Inventory · Redemption · Fulfillment states · Discount coupons · Lesson credits  
**Size:** M | **Phase:** 4–5

### E11 — Nutrition Center
**Goal:** Guided nutrition, not another calorie abyss.  
**Features:** Plans · Recipes · Shopping lists · Habits · Hydration · Goals · Coach feedback · Courses · Supplement log · Videos · **Calendar integration** (meal prep, classes, grocery reminders)  
**Size:** XL | **Phase:** 5

### E12 — Sully's Kitchen
**Goal:** Integrated healthy food operations.  
**Features:** Menu · Specials · Pre-order · Pickup · KDS · Inventory · Allergens · Nutrition facts · Packages · Subscriptions · Future POS adapter · **Pickup/smoothie windows on calendar** · TV specials block  
**Size:** XL | **Phase:** 6

### E13 — Kids Program Depth
**Goal:** Best-in-class youth experience.  
**Features:** Skill trees · Report cards · Coach feedback · Youth nutrition lessons · Party/camp packages · Parent messaging SLAs · Parent hub: bookings, attendance, waiver status, events, camps  
**Size:** L | **Phase:** 7

### E14 — Events
**Goal:** Monetize and organize special occasions.  
**Features:** Event types · Tickets · Waivers · RSVP · Check-in · Seminars/fight nights/BBQs · Calendar + TV projection  
**Size:** M | **Phase:** 3–8 (MVP early)

### E15 — Community Network
**Goal:** Private social layer — reason to open the app off the floor.  
**Features:** Feed · Media · Reactions · Comments · Moderation · Announcements · Fight results · Achievements · Coach tips · Recipes · Kitchen specials · Challenge updates · Merch · Event reminders  
**Size:** L | **Phase:** 8

### E16 — Retail Store
**Goal:** Merch and equipment sales.  
**Features:** Catalog · Variants · Inventory · Checkout · Pickup · Returns  
**Size:** M | **Phase:** 5–8

### E17 — Owner Analytics
**Goal:** Executive reporting (feeds Command Center tiles).  
**Features:** MRR/ARR · Retention · Churn · LTV · Utilization · Kitchen/store · Coach performance · Forecasting · Marketing/referrals · Today's revenue stream  
**Size:** L | **Phase:** 2–10 (incremental)

### E18 — Administration & Comms
**Goal:** Configure without deploys.  
**Features:** Email/SMS/push templates · Themes · Brand settings · Notification preferences · Data export · Announcements admin  
**Size:** M | **Phase:** 1–ongoing

### E19 — AI Systems
**Goal:** Assistive intelligence with guardrails.  
**Features:** Coach · Nutrition · Meal planner · Retention · Workout gen · Support · Injury suggestions (non-clinical)  
**Size:** XL | **Phase:** 9

### E20 — Franchise Control Plane
**Goal:** Multi-location brand operations.  
**Features:** Portfolio KPIs · Template push · Compliance · Location billing · Onboarding kit  
**Size:** XL | **Phase:** 10

### E21 — Messaging
**Goal:** Compliant conversations.  
**Features:** Member↔coach · Parent↔coach · Announcement channels · Audit · Rate limits · Attachment policy  
**Size:** M | **Phase:** 3–7

### E22 — Personal Training
**Goal:** Package-based 1:1 sessions.  
**Features:** Packages · Calendar · Session complete · Notes · Upsell  
**Size:** M | **Phase:** 3–5

### E23 — Referrals & Growth
**Goal:** Member-driven acquisition.  
**Features:** Referral codes · Rewards · Attribution · Corporate lead capture  
**Size:** S–M | **Phase:** 4+

### E24 — Unified Calendar Hub
**Goal:** Calendar as training/ops hub, not classes-only grid.  
**Features:** Member agenda (schedule, nutrition, challenges, achievements, events, closures) · Coach ops calendar · Owner ops calendar · Resource/equipment booking · Preferences · ICS · Projection service  
**Size:** L | **Phase:** 3 (core) → ongoing layers  
**Doc:** [Calendar Hub](../02-domain/16-calendar-hub.md)

### E25 — Gym TV Displays
**Goal:** Floor screens as live brand surface.  
**Features:** Display profiles · Schedule · Spots · Leaderboard · Check-in counts · Events · Birthdays (opt-in) · Kitchen specials · Sponsors · Weather · Announcements · Device tokens  
**Size:** M | **Phase:** 3 soft → 8 GA  
**Doc:** [Gym TV & Command Center](../02-domain/17-gym-tv-command-center.md)

### E26 — Gym Command Center
**Goal:** Front-desk 75" live ops board — facility-as-ecosystem differentiator.  
**Features:** Presence · Active classes · Check-in ticker · Today's revenue · Kitchen queue · Leaderboard · Birthdays · Streaks · Upcoming bookings · Equipment status · Announcements · Staff-only emergency alerts  
**Size:** M–L | **Phase:** 8 (foundation realtime in Phase 3)  
**Doc:** [Gym TV & Command Center](../02-domain/17-gym-tv-command-center.md)

### E27 — Day-One Member Experience Slice
**Goal:** Glofox-parity+ launch contract as one testable vertical.  
**Features:** Auth · Membership · Calendar · Booking/waitlist · QR + digital card · Push · Waivers · Renewals · Payment history · Family · Coach profiles · Attendance history · Announcements · Messaging · Profile  
**Size:** XL (program epic spanning E01–E06, E21, E24) | **Phase:** 1–3  
**Doc:** [Day-One Member Experience](../02-domain/15-day-one-member-experience.md)

### E28 — Public Website & Live Front Door
**Goal:** sullysboxinggym.com as premium sports-org face of the platform.  
**Features:** Video hero · counters · live class spots · live events · join funnel · SEO-preserving IA · coach pages · legacy teaser  
**Size:** L | **Phase:** 1–3  
**Doc:** [Website & Public Platform](../02-domain/19-website-public-platform.md)

### E29 — Legacy Experience
**Goal:** Productize 80+ year heritage.  
**Features:** Boxing Passport · Legacy Wall timeline · Digital Trophy Room / Hall of Fame · coach bios · rights/CMS · “on this day” TV cards  
**Size:** L | **Phase:** 4–8  
**Doc:** [Legacy Experience](../02-domain/20-legacy-experience.md)

### E30 — Sully AI Concierge
**Goal:** Natural-language access to gym life and ops.  
**Features:** Member/parent/owner intents · tool calling · confirmations · audit · FAQ soft-launch  
**Size:** L–XL | **Phase:** 9  
**Doc:** [Sully AI](../02-domain/12-ai-features.md)

---

## Cross-Epic Dependencies (Critical Path)

```
E01 Foundation + E28 Website shell
 ├── E02 Waivers
 ├── E03 Membership ← E04 Payments ← Online join (E28)
 │     └── E08 Youth Core
 ├── E05 Classes ← E24 Calendar Hub ← E06 Check-In
 │         ├── E21 Messaging + Announcements + Push
 │         ├── E27 Day-One Member Experience (exit Phase 3)
 │         ├── Live web widgets (E28)
 │         └── E09 Boxing Progression ← E10 Rewards
 ├── E29 Legacy (Passport with E09; Wall/Trophy deepen later)
 ├── E07 Coach Tools + Coach Calendar
 ├── E14 Events (MVP)
 ├── E17 Owner Analytics (+ Owner Calendar)
 ├── E11 Nutrition ← E12 Kitchen  (both → Calendar + TV)
 ├── E13 Kids Depth
 ├── E15 Community (after moderation)
 ├── E25 Gym TV Network ← realtime from E06
 ├── E26 Command Center ← E17 + E12 + E25
 ├── E30 Sully AI (after data)
 └── E20 Franchise (HQ rollup: Toronto West/East, Mississauga, Vaughan, Barrie, Hamilton, Ottawa, …)
```

See also [Modular Product Architecture](../02-domain/18-modular-architecture.md).

---

## Definition of Ready (Feature)

- User stories with acceptance criteria
- Persona & journey reference
- Permission impact noted
- Analytics events listed
- Design mock or design-system composition
- No open legal blocker for PII/minors/payments
- Calendar projection impact noted if time-bound

## Definition of Done (Feature)

- Tests per Testing Strategy
- Docs updated if contract/API changed
- Flag strategy documented
- Accessibility smoke pass
- Security checklist for sensitive domains
- Staging demo signed by Product
- If member-facing time item: appears correctly on Calendar Hub filters
