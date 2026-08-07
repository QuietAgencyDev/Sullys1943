# Deployment & Operations Plan

## Goals

Reliable deploys, fast rollback, observable systems, and environments that mirror production closely enough to catch billing/check-in bugs before members do.

---

## Environments

| Env | URL pattern | Data | Stripe |
|-----|-------------|------|--------|
| Local | localhost | Seed | Test |
| Staging | staging.sullys.example | Anonymized-like seed | Test |
| Production | app.sullys.example | Real | Live |

Separate AWS accounts / GCP projects for prod vs non-prod recommended.

---

## Hosting Topology (Recommended)

```
Cloudflare (DNS, CDN, WAF)
    ├── Vercel/Cloud Run: Next.js web + staff
    ├── Cloud Run / ECS / Fly: Nest API (min 2 tasks)
    ├── Cloud Run worker: BullMQ consumers
    ├── RDS Postgres (Multi-AZ)
    ├── ElastiCache Redis
    └── S3/R2 buckets (docs, media)
```

---

## CI/CD Pipeline (GitHub Actions)

1. **PR:** lint, typecheck, unit, contract tests  
2. **Main:** build containers, migrate (forward-only), deploy staging  
3. **Prod:** manual approval or protected environment  
4. **Post-deploy:** smoke Playwright (login, book, check-in sandbox user)  
5. **Rollback:** previous container tag + feature flag kill switches  

Migrations: expand → deploy → contract. Never drop columns in same release as code removal.

---

## Infrastructure as Code

Terraform or CDK for: network, DB, Redis, buckets, IAM, alerts.  
Secrets in SSM/GSM/Secrets Manager.

---

## Scaling & Capacity

| Component | Scale trigger |
|-----------|---------------|
| API | CPU/RPS / p95 latency |
| Workers | Queue depth |
| DB | CPU, connections, disk; add replica for analytics |
| Redis | Memory |

Peak: weekday 5–8pm local — load test check-in at 10× expected.

---

## Backup & DR

| Asset | RPO | RTO | Method |
|-------|-----|-----|--------|
| Postgres | ≤ 5 min | ≤ 1 hour | Continuous backup + PITR |
| Redis | Best-effort | Minutes | Rebuild from DB |
| Object storage | ≤ 24h | Hours | Versioning + cross-region replication |
| Config | Git | Minutes | IaC |

**Quarterly restore drill** to isolated environment.

---

## Monitoring & Alerting

- **Sentry:** exceptions, release health  
- **OTel traces:** check-in, booking, webhook paths  
- **Metrics:** request rate, error %, queue lag, Stripe webhook failures, check-in p95  
- **Uptime:** /health and /ready  
- **On-call:** PagerDuty/Opsgenie for P1  

### Alert Examples
- Stripe webhook error rate > 1%  
- Check-in p95 > 500ms for 5m  
- DLQ depth > 0 critical jobs  
- DB storage > 80%  

---

## Logging

Structured JSON: `requestId`, `orgId`, `userId` (where safe), `route`, `latency`.  
PII scrubbers mandatory.

---

## Release Strategy

- Feature flags for module rollout  
- Canary 5% staff → 25% members → 100%  
- Maintenance windows only for hard DB locks (rare)  

---

## Desktop/Mobile App Stores (Future)

- Separate pipeline for Capacitor/RN  
- OTA updates policy careful with native check-in scanners  

---

## Cost Guardrails

- Budgets on cloud account  
- Image retention policies  
- Lifecycle rules on old media drafts  
- AI spend caps per org (Phase 9)  

---

## Runbooks (Create in Phase 1)

1. Deploy / rollback  
2. Stripe webhook replay  
3. Database failover  
4. Suspected data breach  
5. Check-in outage desk mode  
6. Rotate compromised secret  
