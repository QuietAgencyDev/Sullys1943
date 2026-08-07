# Analytics Strategy

## Purpose

Measure what drives **WATM**, retention, revenue, and operational excellence — and feed Owner Dashboard + product decisions.

---

## Dual Track

| Track | Tooling | Use |
|-------|---------|-----|
| Product analytics | PostHog (or Amplitude) | Funnels, adoption, feature flags |
| Business metrics | Stripe + Postgres rollups (+ warehouse later) | MRR, LTV, kitchen |
| Marketing | UTM + ad pixels careful with consent | Acquisition |

---

## North Star & Guarding Metrics

- **NSM:** Weekly Active Training Members  
- **Guards:** Churn, waiver compliance, check-in p95, payment success, NPS  

---

## Event Taxonomy (Draft)

Naming: `domain.object.action`  

| Event | Properties (sample) |
|-------|---------------------|
| `auth.user.registered` | method |
| `waiver.packet.signed` | template_type, is_minor |
| `membership.checkout.started` | product_code |
| `membership.activated` | product_code, mrr_delta |
| `booking.created` | program_id, session_id |
| `booking.cancelled` | reason |
| `checkin.succeeded` | method, late |
| `checkin.denied` | reason |
| `calendar.item.opened` | kind |
| `calendar.booked_from_hub` | program_id |
| `membership_card.viewed` | — |
| `xp.awarded` | amount, reason |
| `quest.completed` | quest_id |
| `rewards.redeemed` | sku |
| `nutrition.meal.logged` | status |
| `kitchen.order.placed` | aov |
| `message.sent` | role_pair |
| `event.ticket.purchased` | event_id |
| `announcement.viewed` | announcement_id |
| `display.playlist.served` | profile |
| `command_center.opened` | location_id |

**PII:** do not send medical text or full names to product analytics if avoidable — use IDs.

---

## Funnels

1. Visit → trial book → waiver → pay → first check-in  
2. Trial → membership convert (7/14/30 day)  
3. Kitchen: check-in → order same day  
4. Parent: invite → child active → 4-week retention  

---

## Metric Dictionary (Owner Dashboard)

Every KPI needs: name, SQL/definition, owner, refresh cadence.  
Example: **MRR** = sum of active subscription normalized monthly amount at location, excluding one-time, at period end snapshot.

Avoid two charts disagreeing — single dictionary in repo `docs` or `packages/metrics`.

---

## Consent & Privacy

- Cookie/consent banner where required  
- Respect Do Not Track / PostHog opt-out  
- Minors: analytics minimal; parent events preferred  

---

## Experimentation

- Feature flags + A/B for onboarding, XP rates, pricing display  
- Never experiment with safety gates (waivers)  

---

## Reporting Cadence

| Audience | Cadence | Content |
|----------|---------|---------|
| Owner | Daily brief + weekly review | Revenue, retention, ops |
| Product | Weekly | Funnel, adoption |
| Coaches | Weekly | Class fill, attendance |
| Franchise | Monthly | Benchmarks |
