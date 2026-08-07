# Implementation Sequence

## Objective

Minimize technical debt and maximize maintainability by laying **tenant-safe foundations** first, then shipping the **heartbeat** (membership → waiver → class → check-in), then layering engagement and ancillary revenue.

---

## Phase 0 — Spec Freeze & Foundations (No Product Features)

**Duration:** 2–4 weeks  

### Work
1. Legal: waiver templates + privacy policy draft  
2. Brand: official logo locked; cream / classic red / chocolate brown tokens; type pairing approved  
3. ADRs: auth vendor, hosting, ORM, monolith  
4. Create monorepo skeleton + CI + staging  
5. Threat model v1  
6. Metric dictionary stub  
7. Stripe account + tax settings  
8. Hire/assign module owners  

### Exit Criteria
- [ ] Phase 1–3 Must Have signed by Owner + Product + Arch + Security  
- [ ] Design tokens approved  
- [ ] Environments reachable  
- [ ] Blueprint **v1.1** accepted (day-one checklist, calendar hub, TV/Command Center, modular map)
**Do not write feature code until exit criteria met.**

---

## Recommended Build Order (Within & Across Phases)

```
0. Tooling & tenancy skeleton
1. Identity / RBAC / audit / flags + **marketing website shell** (hero, brand, counters)
2. Profiles + guardianship + coach profiles
3. Document/waiver engine
4. Membership products + entitlements + renewals + payment history
5. Stripe billing + webhooks + **online join funnel on web**
6. Programs / sessions / booking / waitlist
7. Calendar Hub projection service (classes + events + closures)
8. QR check-in + digital membership card + attendance + desk tools
9. Push + announcements + in-app messaging
10. Coach calendar (thin) + owner calendar (thin) + owner core KPIs
11. Realtime channel foundation + **live class spots on website**
12. === DAY-ONE MEMBER EXPERIENCE + LIVE WEB EXIT ===
13. Boxing Progression + **Passport MVP** + Legacy Wall start + Welcome XP
14. Events MVP deepen + rewards catalog thin + signage soft launch
15. Nutrition MVP + calendar nutrition layers
16. Kitchen MVP + calendar pickups + KDS + Kitchen TV
17. Kids depth + Kids TV
18. Community feed + Trophy Room depth
19. Full TV network + Command Center
20. Sully AI
21. Franchise HQ rollup (GTA+ tree)
```

---

## Parallelization Guide (Multi-Developer)

Once Phase 1 APIs exist, parallel streams:

| Stream A | Stream B | Stream C | Stream D |
|----------|----------|----------|----------|
| Billing + membership | Waivers + PDF | Scheduling + **Calendar Hub** | Design system + staff shell |
| Then Check-in + **digital card** | Then Desk scanner + messaging | Then Booking + waitlist UI | Then Marketing + coach profiles |

After day-one exit:

| Stream A | Stream B | Stream C | Stream D |
|----------|----------|----------|----------|
| Boxing Progression | Nutrition → Kitchen | Kids depth | TV + Command Center + Community |

**Contract:** agree OpenAPI stubs first; mock servers unblocking frontend. Calendar `kinds` enum is a shared package contract.

---

## Dependency Rules

1. No booking without entitlements service  
2. No check-in without waiver gate  
3. No XP without attendance events  
4. No kitchen without allergen model  
5. No community UGC without moderation  
6. No AI without data quality gate  
7. No franchise UI without proven multi-location seed tenant test  
8. No Gym TV PII tiles without privacy profile review  
9. Calendar Hub ships extensible in Phase 3 — domains add layers, don't fork calendars  
10. Command Center consumes same realtime events as app/TV — no parallel data hacks  

---

## Debt-Minimizing Engineering Practices

- Shared `packages/types` for DTOs early  
- Policy engines data-driven from first membership type  
- Every table ships with `organization_id` + RLS test  
- Feature flags for all modules Phase ≥ 4  
- Expand/contract migrations only  
- One notification dispatcher — don't N+1 Twilio calls per feature  
- One calendar projection pipeline — don't embed schedule UIs per module  
- One realtime gateway for app, TV, KDS, Command Center  

---

## Go-Live Recommendation (Public Members)

**Minimum Lovable Launch:** end of Phase 3 meeting the [Day-One Member Experience](../02-domain/15-day-one-member-experience.md) checklist (+ thin owner dashboard + calendar hub for classes/events/closures).

Boxing Progression soft-launches 2–4 weeks later.  
Nutrition/Kitchen when kitchen ops staff trained (calendar layers included).  
Youth marketing push when parent hub polished.  
Gym TV / Command Center when realtime presence is trustworthy.

---

## First 90 Days Post-Launch Focus

1. Stabilize check-in, billing, calendar booking  
2. Train staff SOPs (desk card + Command Center lite if ready)  
3. Watch funnel analytics weekly  
4. Kill paper completely  
5. Then unlock Phase 4 Boxing Progression flags  

---

## Handoff Package for Engineering Teams

Give every developer:
1. [Blueprint README](../README.md)  
2. [Day-One Member Experience](../02-domain/15-day-one-member-experience.md)  
3. [Calendar Hub](../02-domain/16-calendar-hub.md)  
4. [Modular Architecture](../02-domain/18-modular-architecture.md)  
5. Their domain doc in `02-domain/`  
6. [API Design](../03-architecture/06-api-design.md)  
7. [Permissions Matrix](../03-architecture/05-permissions-matrix.md)  
8. [Coding Standards](./02-coding-standards.md)  
9. OpenAPI stub for their module  
10. Figma (when available) mapped to design tokens  

---

## Success Definition for Blueprint Phase

Multiple developers can implement different modules **without re-litigating** tenancy, authz, membership configuration, calendar projection, or minor privacy — because those decisions are documented here.

### Exit Criteria update
- [ ] Blueprint **v1.1** accepted (includes calendar hub, day-one checklist, TV/Command Center, modular map)