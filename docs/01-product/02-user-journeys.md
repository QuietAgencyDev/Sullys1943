# User Journeys & Complete Workflows

This document defines end-to-end experiences per user type. Each journey lists entry, steps, systems touched, edge cases, and success criteria.

---

## 1. Guest Visitor

### J-G1 — Discover & Book Trial
1. Land on marketing site (SEO / referral / QR poster)
2. Browse schedule (public classes marked "trial-eligible")
3. View coach profiles and gym story
4. Select trial slot → Create account (email/phone + password or OAuth)
5. Complete profile basics + emergency contact
6. Sign trial waiver (versioned) + photography consent optional
7. Pay trial fee (or $0 promo) via Stripe
8. Receive confirmation + Wallet pass option (future) + calendar invite
9. Pre-visit reminder (24h / 2h)

**Edge cases:** Waitlist; age gate for youth trials (route to parent flow); expired promo codes; duplicate accounts.

**Success:** Trial on calendar; waiver on file; staff sees "Trial — First Visit" badge.

### J-G2 — Convert Trial → Membership
1. Post-trial push/email: "Ready to join?"
2. Choose membership (Monthly / Youth / Family / etc.)
3. Sign membership waiver + policies
4. Payment method + first invoice
5. Welcome pack: QR membership credential, dashboard tour, book first week

---

## 2. Member (Adult)

### J-M1 — Daily Training Loop
1. Open app → **Calendar / Home hub**: today's schedule, nutrition pickups, challenges, streaks
2. Open **digital membership card** → QR check-in (or Wallet later) → XP awarded → presence + capacity updated → TV/Command Center ticker
3. Train; coach marks attendance if needed (reconciliation)
4. Optional: log RPE / workout notes / personal best
5. Optional: kitchen pre-order pickup (shows on calendar)
6. End of day: streak confirmation + tomorrow on calendar

### J-M2 — Book Class (via Calendar Hub)
1. Calendar → filter program / coach / time / kinds
2. See capacity + eligibility (membership entitlements)
3. Book or waitlist → calendar item + push reminder
4. Cancel within policy window (waitlist auto-promote)

### J-M3 — Nutrition & Kitchen (Calendar-Integrated)
1. View assigned meal plan / goals
2. See Mon/Tue style blocks on calendar (meal prep, smoothie, class, grocery reminder)
3. Open today's meals → mark complete / swap recipe
4. Generate shopping list
5. Order from Sully's Kitchen
6. Nutrition coach feedback thread

### J-M4 — Progress & Rewards (Boxing Progression)
1. Ranks, skill trees, personal bests, milestones
2. Achievements unlock → celebrate; calendar nudge
3. Redeem points in Rewards Store
4. Join challenge / season pass (visible on calendar)

### J-M5 — Community, Messaging & Events
1. Announcements + feed (when enabled): achievements, fight photos, tips, recipes, specials, merch, challenges
2. Message coach in-app
3. RSVP events; pay tickets; event waivers; appears on calendar
4. View coach profiles

### J-M6 — Account & Billing
1. Profile management
2. Membership status / renewals
3. Payment history
4. Family account switcher (if parent)

---

## 3. Parent

### J-P1 — Onboard Child
1. Parent creates/logs in
2. Add child profile (DOB, medical flags, emergency contacts)
3. Sign minor consent + medical + photo + privacy
4. Purchase youth / family membership
5. Link to classes; set notification preferences

### J-P2 — Weekly Parent Loop
1. Parent hub: schedule & attendance
2. Waiver status chips per child
3. Coach feedback / skill progression
4. Nutrition lessons (age-appropriate)
5. Camp registrations & upcoming events
6. Pay fees / outstanding balance
7. Message coach (templated topics + free text, audited)
8. Receive announcements & push on check-in / cancel

### J-P3 — Multi-Child Family
1. Family switcher in nav
2. Combined billing + payment history
3. Per-child waiver status chips
4. Shared calendar export (family ICS)

---

## 4. Child Member

### J-C1 — Class Day (Mediated)
1. Parent or front desk / coach checks child in
2. Child may see simple "You're here!" + badge progress on coach tablet or parent phone
3. Post-class: skill stamps / stickers digital
4. Parent notified of attendance + highlight

**Principle:** Children are data subjects with heightened protection — default minimal UI surface.

---

## 5. Teen Member

### J-T1 — Semi-Autonomous Training
1. Teen logs in (parent-approved account)
2. Check-in with QR
3. Book classes if policy allows; else request → parent approve
4. Join team challenges; view leaderboard (age-bracketed)
5. Purchases above threshold require parent approval
6. Community: view + react; posting may require coach approval (config)

---

## 6. Coach

### J-CO0 — Coach Calendar Day
1. Open coach calendar: classes, private lessons, sparring, nutrition consults, kitchen workshops
2. Equipment bookings for rings/bags as needed
3. Vacation request / certification expiry reminders
4. Team meetings

### J-CO1 — Run a Class
1. Open Today's Classes from calendar
2. See roster (booked, checked-in, late, walk-in)
3. One-tap attendance; add drop-in if entitled
4. Capacity warning if over
5. Mid/post class: quick notes / skill stamps
6. End class: attendance finalize → XP batch → parent notifications (youth)

### J-CO2 — Athlete Development
1. Member profile → progress, attendance, notes history, goals
2. Assign skill focus / workout plan
3. Message member or parent
4. Flag injury concern → notify front desk / owner (workflow, not diagnosis)

### J-CO3 — Workout Builder
1. Create template (rounds, stations, media)
2. Attach to class or assign to athlete
3. Publish to library (location or org scoped)

### J-CO4 — Scheduling
1. Request schedule changes / substitutions
2. Owner/admin approves
3. Members auto-notified on cancellations

---

## 7. Nutrition Coach

### J-N1 — Assign Plan
1. Select member → goals/allergens/preferences
2. Choose template plan or generate (AI later)
3. Customize macros / meals
4. Publish → member notified; shopping list generated
5. Weekly check-in review adherence + kitchen orders

---

## 8. Kitchen Staff

### J-K1 — Service Window
1. Open Kitchen Display System (KDS)
2. Incoming pre-orders sorted by pickup time
3. Allergen badges prominent
4. Mark prep → ready → picked up
5. Stockout → 86 item → members notified if ordered

### J-K2 — Inventory
1. Receive delivery → update lots
2. Low-stock alerts
3. Waste log
4. Sync nutrition facts / recipes to menu items

---

## 9. Front Desk

### J-F1 — Peak Check-In Fallback
1. Search member / scan QR
2. Validate membership + waiver
3. Check in; sell drop-in if needed
4. Upsell trial conversion scripts (prompts, not hard sell)

### J-F2 — Guest Walk-In
1. Create guest → waiver on tablet → trial or drop-in payment → check-in

---

## 10. Personal Trainer

### J-PT1 — Session Lifecycle
1. Package sold (desk/app) → sessions credited
2. Book session on calendar
3. Complete session → decrement → notes → client signature optional
4. Package low → auto upsell prompt to member

---

## 11. Owner

### J-O0 — Owner Calendar
1. Overlay: membership renewals, staff schedules, payroll reminders, equipment maintenance, inventory deliveries, marketing campaigns, events, financial deadlines, building maintenance
2. Drill into Command Center or analytics from any item

### J-O1 — Morning Command Brief
1. Dashboard / **Command Center**: MRR, yesterday attendance, kitchen revenue, failed payments, at-risk churn, members in gym, active classes
2. Drill into class utilization heatmap
3. Approve schedule changes / refunds / vacation requests above threshold
4. Review coach performance cards weekly

### J-O2 — Membership Ops
1. Create promo / scholarship membership
2. Review corporate accounts
3. Forecast capacity for camp season
4. Monitor renewals on owner calendar

---

## 15. Front Desk — Command Center Mode

### J-F3 — Live Facility Board
1. 75" Command Center behind desk: presence, check-in ticker, revenue today, kitchen queue, leaderboard, birthdays, streaks, upcoming bookings, equipment status
2. Post announcement to TVs + apps
3. Raise / ack emergency alert (staff only — never public TV)

---

## 12. Administrator

### J-A1 — Configure Location
1. Programs, rooms, capacity defaults
2. Membership products & entitlements
3. Waiver templates & required set per product
4. Roles & staff invites
5. Notification templates
6. Feature flags per module
7. Brand theme tokens

---

## 13. Developer

### J-D1 — Safe Release
1. Feature flag default off
2. Deploy → enable for staff → % rollout → GA
3. Monitor Sentry/metrics; rollback via flag

---

## 14. Franchise Manager (Future)

### J-FR1 — Multi-Location Oversight
1. Portfolio KPI board
2. Push program template to locations
3. Audit brand compliance (theme, waiver versions)
4. Compare retention / kitchen margins

---

## Cross-Cutting State Machines

### Membership Status
`draft → pending_payment → active → past_due → paused → cancelled → expired`  
(+ `scholarship`, `comp`, `frozen`)

### Waiver Status
`required → presented → signed → valid → expiring_soon → expired → superseded`

### Booking Status
`held → confirmed → checked_in → completed | cancelled | no_show | waitlisted → promoted`

### Kitchen Order Status
`placed → accepted → preparing → ready → completed | cancelled | refunded`

See also: [Workflows Diagrams](../diagrams/workflows.md)
