# User Personas

Personas are archetypes for design and prioritization — not demographic stereotypes. Each includes goals, frustrations, jobs-to-be-done, and success criteria.

---

## Persona Index

| ID | Persona | Primary Surfaces |
|----|---------|------------------|
| P-GUEST | Guest Visitor | Marketing web, trial booking |
| P-MEM | Adult Member | Mobile app, member web |
| P-PAR | Parent / Guardian | Parent hub (mobile + web) |
| P-CHILD | Child Member (under ~12) | Limited / coach-mediated |
| P-TEEN | Teen Member (~13–17) | Constrained mobile |
| P-COACH | Boxing Coach | Coach console + mobile |
| P-NUT | Nutrition Coach | Nutrition console |
| P-KIT | Kitchen Staff | Kitchen tablet / POS view |
| P-FD | Front Desk Staff | Desk console + tablet |
| P-PT | Personal Trainer | Trainer console |
| P-OWN | Owner | Executive dashboard |
| P-ADM | Administrator | Admin settings |
| P-DEV | Developer | Admin + feature flags + logs |
| P-FRAN | Franchise Manager | Multi-location console |

---

## P-GUEST — Guest Visitor

**Who:** Prospective member exploring Sully's online or after a walk-in referral.  
**Goals:** Understand vibe, coaches, schedule, pricing; book a trial with low friction.  
**Frustrations:** Opaque pricing, phone-tag booking, paper forms on first visit.  
**JTBD:** "Help me confidently start boxing without feeling sold to or confused."  
**Key flows:** Browse classes → Coach bios → Trial book → Register → Waiver → Pay deposit (if any).  
**Success:** Trial booked in < 5 minutes; waiver ready before arrival.

---

## P-MEM — Adult Member

**Who:** Paying adult training 2–5×/week. Ages ~18–55.  
**Goals:** Book classes, check in fast, track progress, nutrition support, feel progress.  
**Frustrations:** Full classes, forgotten payments, unclear progress, generic fitness apps.  
**JTBD:** "Help me train consistently and see that I'm getting better."  
**Key flows:** Login → Dashboard → QR check-in → Book → Workouts → Nutrition → Rewards → Store → Community/Events.  
**Success:** Check-in < 5 seconds; always know next class; streak visible.

---

## P-PAR — Parent / Guardian

**Who:** Parent of child/teen member; may or may not train themselves.  
**Goals:** Safety, schedule clarity, payments, coach communication, proof of progress.  
**Frustrations:** "What did they do today?", missed announcements, paper permission slips.  
**JTBD:** "Help me manage my kid's boxing life without calling the front desk."  
**Key flows:** Linked accounts → Attendance → Book kids classes → Pay → Waivers/consents → Announcements → Achievements → Report cards → Message coach.  
**Success:** Sees attendance same day; signs all docs digitally; one invoice for family.

---

## P-CHILD — Child Member

**Who:** Youth athlete ~5–12. Limited direct app use.  
**Goals:** Fun, badges, coach praise, know when class is.  
**Frustrations:** Complex UIs; privacy risk if full social access.  
**JTBD:** "Make class exciting and show my badges."  
**Key flows:** Coach/parent mediated check-in; kid-safe progress view (optional PIN/parent unlock); achievements.  
**Constraints:** COPPA/PIPEDA-aware; no public messaging; no open community posting; photo rules via consent.  
**Success:** Feels rewarded; parent remains control plane.

---

## P-TEEN — Teen Member

**Who:** ~13–17 competitive or recreational.  
**Goals:** Independence (booking, check-in), status (ranks), team belonging.  
**Frustrations:** Being treated like a little kid; blocked features without explanation.  
**JTBD:** "Let me manage my training like an adult, with my parent still able to help."  
**Key flows:** Check-in, book (policy-dependent), workouts, challenges, limited community, nutrition with parental visibility options.  
**Constraints:** Parent linkage required; messaging moderated; purchase limits configurable.  
**Success:** Autonomy within guardrails; clear path to adult membership.

---

## P-COACH — Boxing Coach

**Who:** Floor coaches running classes and teams.  
**Goals:** Roster, attendance, notes, progress, messaging, workout plans.  
**Frustrations:** Spreadsheets, verbal-only notes, no show surprises.  
**JTBD:** "Give me a live roster and a place to record what matters about each athlete."  
**Key flows:** Today's classes → Attendance → Member progress → Workout builder → Notes → Reports → Scheduling requests.  
**Success:** Take attendance in under 60 seconds for a class of 20.

---

## P-NUT — Nutrition Coach

**Who:** Staff or contractor delivering meal plans and education.  
**Goals:** Assign plans, review adherence, feedback, courses, kitchen coordination.  
**Frustrations:** PDF meal plans that go unread; no visibility into kitchen orders.  
**JTBD:** "Help members follow a plan I can adjust based on real behavior."  
**Success:** Sees adherence signals; can push plan updates that sync to shopping lists.

---

## P-KIT — Kitchen Staff

**Who:** Prep and service staff during peak hours.  
**Goals:** Clear orders, allergen flags, inventory, pickup times.  
**Frustrations:** Illegible tickets, surprise allergens, stockouts.  
**JTBD:** "Show me what to cook next and what could hurt someone."  
**Success:** Order queue never ambiguous; allergens loud and clear.

---

## P-FD — Front Desk Staff

**Who:** First human contact for guests and members.  
**Goals:** Fast check-in fallback, sales, guest → member conversion, waiver status.  
**Frustrations:** Slow search, expired waivers discovered too late, payment chaos.  
**JTBD:** "Help me resolve any member issue at the desk in under a minute."  
**Success:** Find member by name/phone/QR; see status, balance, waiver, next class.

---

## P-PT — Personal Trainer

**Who:** Delivers 1:1 or small-group paid sessions.  
**Goals:** Calendar, packages, session notes, client progress, billing linkage.  
**JTBD:** "Manage my book and client history without fighting the gym system."  
**Success:** Package remaining sessions visible; notes private to authorized roles.

---

## P-OWN — Owner

**Who:** Location owner / operator.  
**Goals:** Revenue truth, retention, coach performance, kitchen margins, growth.  
**Frustrations:** Lagging reports, surprise churn, inventory guesswork.  
**JTBD:** "Tell me what needs attention today and why money moved."  
**Success:** Morning brief: MRR delta, at-risk members, today's capacity, kitchen sales.

---

## P-ADM — Administrator

**Who:** Trusted ops admin (may be owner-adjacent).  
**Goals:** Roles, settings, templates, feature flags, brand, notifications.  
**JTBD:** "Configure the gym without deploying code."  
**Success:** New membership type and waiver template live without engineering.

---

## P-DEV — Developer / Platform Engineer

**Who:** Internal or contracted engineers.  
**Goals:** Safe deploys, observability, flags, audit, local DX.  
**JTBD:** "Ship features without breaking billing or exposing minors' data."  
**Success:** Staging parity; feature flags; clear audit trails.

---

## P-FRAN — Franchise Manager (Future)

**Who:** Regional / brand operator across locations.  
**Goals:** Benchmark locations, enforce standards, roll out programs, brand compliance.  
**JTBD:** "Compare locations and push playbooks without shadow IT."  
**Success:** Cross-location KPIs; template distribution; local overrides where allowed.

---

## Persona Relationships

```
Guest ──registers──► Member
Parent ──links──► Child / Teen
Coach ──trains──► Member / Child / Teen
Nutrition Coach ──plans──► Member (optional Teen)
Kitchen ──fulfills──► Member / Staff orders
Front Desk ──supports──► All on-site personas
Owner / Admin ──configures──► Location
Franchise Manager ──oversees──► Locations[]
```

---

## Accessibility & Inclusive Design Notes

- Assume low literacy / non-native English for some parents — plain language, large tap targets.
- Color is not the only status signal (waiver expired, capacity full).
- Kid-facing UI: larger type, fewer words, celebration animations — never dark patterns.
- Staff tablets: glove-friendly hit areas; high contrast for gym lighting.
