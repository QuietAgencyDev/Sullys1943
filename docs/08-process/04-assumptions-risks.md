# Assumptions, Risks & Improvements

## Challenged Assumptions

| Assumption in brief | Challenge | Recommendation |
|---------------------|-----------|----------------|
| "Build everything like Apple+Shopify+Discord…" | Unfocused MVP dies | Phases 1–3 only for go-live; rest sequenced |
| Members want a full social network | Moderation + minors risk | Announcements first; UGC gated |
| AI differentiates early | Without data, AI is theater | AI after attendance/nutrition quality |
| Native apps required day one | Costly dual maintain | PWA → native when retention proven |
| Glassmorphism = premium | Hurts contrast in gyms | Elevation + type + motion instead |
| One system replaces POS completely | Restaurant POS is a category | Kitchen MVP + POS adapter later |
| Lifetime membership is just a flag | Financial liability | Finance/legal policy before enabling |
| Coaches will log rich notes daily | Time poverty | Ultra-fast stamps + optional voice notes later |
| Parents want full medical in coach hands | Privacy | Flag-based alerts; minimize narrative access |
| Calendar is just a class grid | Becomes another Glofox clone | Calendar Hub as training/ops life surface from Phase 3 |
| Website redesign as disconnected WordPress forever | Dual systems rot | Same monorepo + same DB live widgets |
| Legacy is just About-page copy | Wastes 80-year moat | Passport + Legacy Wall + Trophy Room as products |
| TVs are static slides | Missed differentiator | Five-profile live TV network + signage rotation |
| AI before ops data | Hallucinated bookings | Sully AI in Phase 9 after check-in quality |

---

## Opportunity Improvements Beyond Ask

1. **Member "Fight Camp Mode"** — temporary intensity plans with coach  
2. **Corporate wellness dashboards** for company accounts  
3. **Alumni membership** light social for past members (careful)  
4. **Open API** for franchisees' accountants  
5. **Hardware kit SKU** — recommended iPad + scanner + TV media player package  
6. **Legacy “On This Day”** signage cards from Trophy Room CMS  
7. **Website video CMS** for hero reels without deploys  

---

## Missing Features (Backlog Additions)

Already listed in MoSCoW; highlights:

1. Incident/injury operational reports  
2. Pickup authorization for kids  
3. Equipment loaner tracking (coach calendar resources)  
4. Locker rentals  
5. Staff shift / payroll export (owner calendar)  
6. Competition weigh-in sheets  
7. EN/FR localization  
8. DSAR portal  
9. Offline desk mode  
10. Coach certification expiry (coach calendar)  
11. Occupancy / fire-code counter (Command Center)  
12. Gym TV sponsor CMS  
13. Presence auto-checkout tuning  
14. Alumni likeness rights workflow for Legacy Wall  
9. Offline desk mode  
10. Coach certification expiry (coach calendar)  
11. Occupancy / fire-code counter (Command Center)  
12. Gym TV sponsor CMS  
13. Presence auto-checkout tuning  

---

## Automation Opportunities (High ROI)

| Priority | Automation |
|----------|------------|
| P0 | Waiver expiry re-sign; payment dunning; class cancel notify (+ calendar/TV); waitlist offer TTL |
| P1 | No-visit 14-day outreach; punch low upsell; parent check-in pings; kitchen ready → calendar |
| P2 | Inventory par alerts; report card reminders; season quest resets; cert expiry; payroll reminders |
| P3 | AI churn outreach drafts (human send); Command Center anomaly alerts |9. Offline desk mode  
10. Coach certification expiry  
11. Occupancy / fire-code counter  
12. Member code of conduct enforcement workflow  

---

## Automation Opportunities (Priority)

| Priority | Automation |
|----------|------------|
| P0 | Waiver expiry re-sign; payment dunning; class cancel notify; waitlist offer TTL |
| P1 | No-visit 14-day outreach tasks; punch low upsell; parent check-in pings |
| P2 | Inventory par alerts; report card generation reminders; season quest resets |
| P3 | AI churn outreach drafts (human send) |

---

## Legal / Privacy / Operational Flags

| Area | Flag |
|------|------|
| Liability waivers | Jurisdiction-specific counsel; minors special form |
| Medical info | Not an EHR; limit collection; secure tightly |
| Photography | Separate consent; fight night broadcasts |
| SMS | TCPA/CASL consent; quiet hours; STOP |
| Payments | PCI via Stripe; refund policy clarity |
| Labor | Coach messaging after hours expectations |
| Food | Allergen disclaimers; local health code |
| AI | Non-medical disclaimers; bias in retention scoring |
| Franchise | Local laws differ; template ≠ legal advice |
| Data residency | Canadian PIPEDA expectations |

---

## Scalability Risks

| Risk | Mitigation |
|------|------------|
| Check-in hotspot | Cache access snapshots; horizontal API; load test |
| Feed media bandwidth | CDN + transcoding + quotas |
| Multi-tenant noisy neighbor | Rate limits per org; queue fairness |
| Analytics heavy queries | Rollups / replica / warehouse |
| Hardcoded location logic | Config + feature flags from day one |
| Microservice sprawl too early | Modular monolith discipline |

---

## Technical Debt Traps to Avoid

1. Single-tenant shortcuts  
2. Enum-hardcoded membership types in UI switches  
3. Mixing marketing CMS with operational DB carelessly  
4. XP rules in code instead of data  
5. Skipping idempotency on webhooks  
6. Community before moderation  
7. Building AI prompts without eval harness  

---

## Opportunity Improvements Beyond Ask

1. **Member "Fight Camp Mode"** — temporary intensity plans with coach  
2. **Corporate wellness dashboards** for company accounts  
3. **Alumni membership** light social for past members (careful)  
4. **Open API** for franchisees' accountants  
5. **Hardware kit SKU** — recommended iPad + scanner stand package  
6. **Coach tip marketplace** (Future ethics review)  
