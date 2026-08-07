# MoSCoW Prioritization

Prioritization for **flagship single-location launch through Phase 4**, with clear deferrals. Revisit after each phase exit.

---

## Must Have (P0) — Launch Blocking

Without these, the gym cannot retire paper / spreadsheets safely. Aligns with [Day-One Member Experience](../02-domain/15-day-one-member-experience.md).

| Area | Items |
|------|-------|
| Platform | Multi-tenant org/location · Auth · Staff MFA · RBAC · Audit log · Feature flags |
| Waivers | Templates · Versioning · E-sign · Minor/parent · Emergency contacts · Validity gate at check-in |
| Membership | Monthly · Trial · Drop-in · Punch · Youth · Family · Entitlements · Stripe billing · Dunning · Renewals · Payment history |
| Profile | Member profile management · Coach profiles |
| Classes | Programs · Schedule · Booking · Capacity · Waitlist · Cancellation policy |
| Calendar | Member agenda hub (classes + events + closures) · not grid-only |
| Check-in | QR credential · **Digital membership card** · Desk scanner · Attendance ledger + history · Coach roster |
| Youth core | Parent–child link · Age eligibility · Parent notifications (cancel/check-in) |
| Comms | Push notifications · Announcements · In-app messaging (staff/coach ↔ member/parent) |
| Owner | MRR · Active members · Attendance today · Failed payments · Waiver compliance % |
| Admin | Notification templates (email) · Membership product config · Role assignment |
| Website | Premium public site on same platform · **Online join funnel** · Live class spots (Phase 3) · Brand hero (badge/video) |
| Security | Encryption in transit · Encrypted document storage · RLS/tenant isolation · Backup |
| Quality | Staging env · Critical path E2E tests · Error monitoring |

---

## Should Have (P1) — Soon After Launch

| Area | Items |
|------|-------|
| Membership | Annual · Unlimited · Pause · Scholarship · Corporate skeleton · VIP |
| Calendar | Nutrition/kitchen layers · Challenges/achievements layers · Coach ops calendar · Owner ops calendar (thin) · ICS export |
| Check-in | Late arrival · Auto XP on check-in · Streaks foundation · Presence for Command Center |
| Coach | Notes · Basic workout templates · Private lessons on calendar · Vacation requests · Cert expiry reminders |
| Boxing Progression | Levels · Boxing ranks · Skill trees · Personal bests · Milestones · Weekly quests · Points balance · **Boxing Passport MVP** |
| Legacy | **Legacy Wall MVP** · coach bios upgrade · counters on homepage |
| Rewards | Small catalog redemptions (meals, wraps, % off) |
| Events | Create event · Ticket pay · Event waiver · RSVP · live events on website |
| Nutrition | Plan assign · Recipe view · Shopping list (MVP) · Calendar reminders |
| Kitchen | Menu · Pre-order · Allergen flags · Simple KDS · Pickup on calendar |
| Owner | Retention/churn · Class utilization · Coach attendance load · Payroll/renewal reminders on owner calendar |
| Displays | Reception + Floor TV schedule/leaderboard boards (no sensitive PII) · signage rotation soft |
| Store | Limited merch SKUs pickup |

---

## Could Have (P2) — Differentiating Polish

| Area | Items |
|------|-------|
| Gamification | Season passes · Mystery boxes · Daily rewards · Referral XP · prestige seasonal rankings |
| Nutrition | Courses · Videos · Supplement tracking · Hydration · Meal prep calendar depth |
| Kitchen | Meal prep subscription · Inventory lots · Waste log · Nutrition facts deep link |
| Kids | Report cards · Full skill trees · Birthday party packages · Youth nutrition lessons · Camp registrations polish |
| Community Feed | Achievements, fight photos, coach tips, recipes, specials, challenges, merch, event reminders (if moderation ready) |
| Legacy | **Digital Trophy Room / Hall of Fame** depth · member memory submissions |
| Calendar | Equipment bookings · Sparring sessions · Full owner maintenance/marketing timeline |
| Displays | Full five-TV network · **Gym Command Center** · Owner Office TV · kitchen/kids profiles |
| PT | Full package management |
| Owner | Forecasting · Marketing attribution · Inventory valuation · heat maps |
| UX | Advanced animations · Personalized home recommendations · website video CMS |

---

## Future / Won't Have Now (P3)

| Area | Items |
|------|-------|
| Access | NFC · Bluetooth beacons · Apple/Google Wallet passes |
| AI | **Sully AI** full tool-calling concierge · retention narratives |
| Franchise | HQ console · GTA+ location tree rollup · cross-location billing productization |
| Social | Public discovery · Open Discord-like channels · DMs between members |
| Hardware | Custom turnstiles · Biometric check-in · Smart equipment |
| Wearables | HR / punch overlays on Floor TV |
| Clinical | Medical diagnosis · Physiotherapy EMR |
| Commerce | Full Shopify-equivalent · Marketplace for third-party coaches |
| POS | Full Square/Toast replacement (integrate instead) |
| Media | Live-stream classes at scale |

---

## Challenge: Scope Improvements vs Original Ask

| Original Ask | Recommendation |
|--------------|----------------|
| Build all 10 phases as one vision | Keep vision; **sequence ruthlessly** — Phases 1–3 are the product; rest are expansions |
| Community like Discord early | **Defer UGC** until moderation + minor rules ship; ship Announcements earlier |
| AI throughout | **AI last** — otherwise garbage-in coaching |
| Lifetime membership | Support as product type early, but **actuarial/finance review** before selling |
| Kitchen + Nutrition together | Nutrition plans can soft-launch before full KDS; **allergens are Must** whenever food is sold |
| Native iOS/Android day one | Prefer **PWA / responsive** first unless budget funds parallel native |
| Glassmorphism everywhere | Use selectively — prioritize **contrast & speed** in gym lighting over aesthetic haze |

---

## Missing Features Identified (Add to Backlog)

1. **Incident / injury report workflow** (non-clinical) — staff log + parent notify
2. **Lost & found** digital board
3. **Equipment checkout** (loaner wraps/gloves) — also on coach calendar as resource booking
4. **Locker rental** management
5. **Staff shift scheduling / payroll export** (owner calendar reminders)
6. **Member freeze for medical** with doctor note upload (privacy-sensitive)
7. **Competition weigh-in & bout sheets** for fight night
8. **Content localization** (EN/FR for Canada)
9. **Offline-capable desk mode** for internet blips
10. **Data subject request portal** (GDPR/PIPEDA access/erasure)
11. **Coach certification expiry tracking** (coach calendar)
12. **Capacity & HVAC-safe occupancy** live counter for fire code (Command Center)
13. **Gym TV sponsor CMS**
14. **Presence auto-checkout** tuning for Command Center accuracy

---

## Automation Opportunities (High ROI)

| Trigger | Automation |
|---------|------------|
| Waiver expiring in 14 days | Email/SMS re-sign link |
| Payment failed | Dunning sequence + access grace policy |
| Class canceled | Notify booked + waitlist; offer alternatives; update calendar + TV |
| Child checked in | Parent push |
| No visit in 14 days | Retention outreach task for staff |
| Punch card ≤ 2 | Upsell membership |
| Kitchen order ready | Member push + calendar item |
| Leaderboard week end | Summary + badge grants + TV rotate |
| New legal waiver version | Block check-in until signed |
| Cert expiry 30 days | Coach calendar reminder |
| Payroll / month-end | Owner calendar reminder |

---

## Prioritization Rules of Thumb

1. **Safety & compliance > revenue features > delight**
2. **If it doesn't create or consume attendance data, question Phase ≤ 3 placement**
3. **Anything touching minors defaults to Must for privacy controls, Could for enrichment**
4. **Configurable > hardcoded even if slower initially**
5. **One vertical slice beats three half-modules**
6. **Day-one member checklist is the Phase 3 exit gate** — see Day-One Member Experience
7. **Calendar stays one hub** — never ship a second competing schedule app per module
8. **TV/Command Center share the realtime bus** — no shadow databases for screens