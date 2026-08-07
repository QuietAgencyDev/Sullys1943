# Testing Strategy

## Goals

Protect money, access control, minors, and check-in reliability. Optimize for **high-value automated tests** over blanket coverage vanity.

---

## Test Pyramid

| Layer | Tools | Focus |
|-------|-------|-------|
| Unit | Vitest | Domain policies: entitlements, XP limits, late flags |
| Integration | Vitest + Testcontainers Postgres | RLS, repositories, Stripe webhook handlers (mocked) |
| Contract | OpenAPI + schemathesis/dredd | API schema adherence |
| E2E | Playwright | Critical journeys |
| Load | k6 | Check-in & booking peaks |
| Security | Semgrep, dependency audit, periodic pen test | |
| Accessibility | axe in Playwright | Member + parent flows |

---

## Critical E2E Journeys (Must Pass on Staging)

1. Register → sign waiver → purchase trial → book class from calendar hub  
2. Member digital card QR check-in → roster shows → XP increments → presence updates  
3. Parent creates child → signs minor waiver → books kids class → receives cancel notify  
4. Punch card decrement  
5. Payment fail → past_due → dunning link updates card → active  
6. Waitlist promote  
7. Staff refund (permissioned)  
8. Kitchen order → KDS status → complete (when module on)  
9. Calendar shows class + event + closure layers for member  
10. Announcement posts and appears for members (push optional)
---

## Data & Fixtures

- Deterministic seed for staging  
- Factory helpers per domain  
- Never use production data in dev  

---

## CI Gates

- Unit + integration required on PR  
- E2E smoke on main → staging  
- Full E2E nightly  
- Coverage thresholds on domain packages (not vanity 100% UI)  

---

## Manual / Exploratory

- Gym-floor usability with real tablets under fluorescent light  
- Glove-on coaching attendance test  
- Youth privacy review checklist each release touching community/messaging  

---

## Chaos / Resilience (Should)

- Kill Redis briefly — check-in degraded path  
- Replay Stripe webhooks  
- Worker downtime — PDF eventually consistent  

---

## Definition of Done Testing Clause

No feature merges without: unit tests for new policy logic, permission tests for new endpoints, and analytics event assertion where required.
