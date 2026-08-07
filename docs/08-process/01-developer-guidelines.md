# Developer Guidelines

## Working Agreements

1. Read `/docs` for your domain before coding  
2. Prefer vertical slices behind feature flags  
3. No tenant-unsafe queries — always include org scope / RLS  
4. Payments, waivers, minors: require second reviewer  
5. Update OpenAPI + docs with behavioral changes  
6. Do not commit secrets; use `.env.example` only  

---

## Branching

- `main` protected  
- `feat/`, `fix/`, `chore/` short-lived branches  
- Squash or rebase per team norm; keep history understandable  

---

## PR Standards

- Why > what in description  
- Screenshots for UI  
- Test plan checklist  
- Flag risk level (payments/minors/PII)  
- Link epic/story ID  

---

## Local Development

```bash
pnpm i
pnpm dev          # turbo: web + api + worker
pnpm db:migrate
pnpm db:seed
```

Docker required for Postgres + Redis.  
Mailhog for email. Stripe CLI for webhooks.

---

## Feature Flags

- New modules default **off** in production  
- Name `module.x` or `experiment.y`  
- Remove stale flags within 60 days of GA  

---

## Code Ownership (Suggested)

| Area | Owners |
|------|--------|
| Billing & membership | Backend lead + owner stakeholder |
| Check-in | Backend + mobile |
| Design system | Frontend lead |
| Youth/privacy | Security + product |
| Kitchen | Full-stack pair |

---

## On-Call Expectations

- Engineers rotate after Phase 3 launch  
- Runbooks first  
- Customer-facing status updates via owner/admin  

---

## Documentation Hygiene

- ADRs in `docs/adr/` (create when first code lands)  
- Changelog user-facing via staff "What's New" (Could)  
