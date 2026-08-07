# Security & Compliance Plan

## Security Objectives

Protect member PII, minor data, medical disclosures, payment-adjacent data, and business integrity while enabling fast gym-floor operations.

---

## Control Framework (Mapped Practically)

Align with SOC 2-inspired controls and readiness for **GDPR** (if EU users) + **PIPEDA** (Canada). Not a certification plan by itself — a build standard.

---

## Identity & Access

- RBAC + least privilege (see Permissions Matrix)
- MFA mandatory for staff privileged roles
- Short staff sessions; device lock on desk tablets
- Break-glass impersonation audited
- Quarterly access reviews for staff accounts

---

## Application Security

| Control | Implementation |
|---------|----------------|
| Input validation | Zod/class-validator at boundary |
| Output encoding | React defaults + CSP |
| CSRF | SameSite cookies + tokens where needed |
| SSRF | Block internal URL fetches from user input |
| SQLi | Parameterized ORM/SQL |
| XSS | CSP `default-src` strict; sanitize CMS HTML |
| RCE | No user-powered eval/PDF HTML without sanitize |
| File uploads | Type sniff, size limits, malware scan, separate bucket |
| Secrets | Vault / cloud secret manager; never in git |
| Dependencies | Dependabot + npm audit gate |

---

## Multi-Tenant Isolation

- `organization_id` mandatory
- Postgres **RLS** enabled on tenant tables
- Integration tests attempting cross-tenant reads must fail
- Storage keys prefixed by org; signed URLs scoped

---

## Encryption

| Data | Control |
|------|---------|
| In transit | TLS 1.2+ |
| At rest DB | Cloud provider encryption |
| Waiver PDFs | SSE-S3/R2 + KMS |
| Medical narrative | Field-level encryption recommended |
| Backups | Encrypted |
| Devices | Advise staff MDM for tablets |

**Payments:** Stripe Elements / Checkout — no raw PAN storage (PCI SAQ A).

---

## Digital Documents

- Immutable signed artifacts (hash stored)
- View audit for sensitive docs
- Legal hold flag blocking erasure
- Version supersession without deleting history

---

## Privacy: GDPR / PIPEDA Considerations

| Principle | Product Behavior |
|-----------|----------------|
| Consent | Privacy notice + photography separate |
| Purpose limitation | Use data for gym ops; AI opt-in |
| Access | DSAR export endpoint / admin tool |
| Correction | Profile edit + staff assist |
| Deletion | Anonymize where liability allows |
| Breach notify | Incident runbook + counsel |
| Cross-border | Prefer Canadian/US region clarity in DPA |
| Children | Heightened consent; minimize; no sale of data |

**French/English** privacy content for Canadian users (Should).

---

## Minors Hardening

- Default deny community posting
- Parent routing for messages
- No public profiles
- Photo consent enforcement
- Staff training checklist in ops docs
- Rate-limit and monitor anomalous access to child records

---

## Logging & Audit

- Security-relevant events immutable
- No secrets/PII in application logs (token redaction)
- SIEM-ish alerting on: mass export, permission changes, failed MFA spikes

---

## Backup & Disaster Recovery

See Deployment Plan for RPO/RTO.  
Security requirement: tested restore quarterly; backup access restricted.

---

## Secure SDLC

1. Threat model per phase (STRIDE light)
2. PR review required
3. SAST (Semgrep/CodeQL)
4. Dependency scanning
5. Secrets scanning (gitleaks)
6. Penetration test before Phase 3 go-live and annually
7. Bug bounty later (Could)

---

## Incident Response (Draft Roles)

1. Detect (Sentry/WAF/user report)  
2. Triage severity (P1 data breach vs P3 bug)  
3. Contain (revoke sessions, rotate keys, flag off)  
4. Eradicate & recover  
5. Notify (legal, users if required)  
6. Postmortem (blameless)  

---

## Third-Party Risk

Vendors: Auth, Stripe, Twilio, email, AI, hosting  
Require DPA, SSO/MFA for vendor consoles, least-scope API keys.

---

## AI Security (Phase 9)

- Prompt injection defenses; tool allowlists  
- No training on customer data without contract  
- Output filters for medical/legal overreach  
- Full audit of AI admin actions  

---

## Physical / Gym Floor

- Desk tablets enrolled; remote wipe  
- Shared scanner accounts without personal email when possible  
- Shoulder-surfing awareness for member QR screens  

---

## Compliance Checklist Before Launch

- [ ] Privacy policy + terms live  
- [ ] Waiver counsel approval  
- [ ] Stripe production checklist  
- [ ] MFA staff enforced  
- [ ] RLS tests green  
- [ ] Backup restore drill documented  
- [ ] Incident contacts listed  
- [ ] Minor data flows reviewed  
