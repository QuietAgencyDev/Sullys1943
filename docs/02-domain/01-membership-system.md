# Membership System

## Purpose

Configurable membership products that grant **entitlements** (what you can book/buy/access) — never hardcode plan names in application logic.

---

## Product Types (First-Class, Data-Driven)

| Code | Type | Billing | Typical Entitlements |
|------|------|---------|----------------------|
| `monthly` | Monthly | Recurring | Unlimited or capped class credits |
| `annual` | Annual | Recurring yearly / prepaid | Same + loyalty bonus XP |
| `family` | Family | Recurring | N linked members under one payer |
| `youth` | Youth | Recurring | Age-gated programs only |
| `corporate` | Corporate | Invoice / seat-based | Domain or company code eligibility |
| `unlimited` | Unlimited | Recurring | All standard classes |
| `punch` | Punch Card | Prepaid credits | N check-ins / class visits |
| `drop_in` | Drop-In | One-time | Single visit entitlement |
| `trial` | Trial | One-time / $0 | Time-boxed + class caps |
| `scholarship` | Scholarship | $0 / partial | Manual approval; full audit |
| `vip` | VIP | Recurring premium | Priority booking, guest passes |
| `lifetime` | Lifetime | One-time | Permanent active (finance-reviewed) |
| `custom` | Future types | Config | Extensible via admin |

---

## Domain Model (Logical)

- **MembershipProduct** — sellable offering (name, description, price, billing interval, trial days)
- **MembershipPlanVersion** — immutable price/terms version for audits
- **EntitlementPolicy** — rules: program IDs allowed, booking window, guest passes, kitchen discount %, freeze allowed
- **Membership** — instance binding user(s) to product version
- **MembershipMember** — for family: which profiles are covered
- **CreditLedger** — punch/drop-in remaining
- **MembershipStatusHistory** — status transitions
- **PromoCode** / **ScholarshipGrant**

---

## Status Lifecycle

```
draft → pending_payment → active ⇄ past_due
                      ↘ paused
                      ↘ cancelled → expired
comp / scholarship may skip payment but still require waivers
```

**Access decision:** `has_valid_membership && has_valid_required_waivers && !suspended`

---

## Family & Youth Rules

1. Payer (parent) owns Stripe customer; dependents are covered profiles.
2. Youth products enforce `min_age` / `max_age` on booking.
3. Removing a child from family requires confirmation; waivers remain archived.
4. Teen may have own login but billing stays on payer unless emancipated policy (rare, manual).

---

## Corporate

- Company account with seat licenses OR shared discount code.
- Admin at company can be external later; v1 = gym admin assigns seats.
- Invoicing: net-30 optional via Stripe Invoicing.

---

## Freeze / Pause

- Member or staff initiates with reason + end date.
- Billing: pause collection (Stripe pause) or credit extension — **policy configurable**.
- Access: blocked during freeze unless "medical freeze allows nutrition-only" config.

---

## Entitlements Engine (Pseudologic)

```
canBook(user, session):
  membership = activeMemberships(user, session.location)
  if none: deny
  if session.program not in membership.allowedPrograms: deny
  if credits required and credits < 1: deny
  if booking outside window: deny
  if capacity full: waitlist or deny
  if age ineligible: deny
  allow
```

Store rules as data (JSON policy documents validated by schema), versioned with plan versions.

---

## Front Desk Flows

- Sell drop-in / punch / upgrade
- Apply scholarship (owner permission)
- Comp day pass (audited)
- Transfer remaining punches (policy)

---

## Reporting Hooks

- New / churned / reactivated memberships
- MRR movement by product
- Trial conversion rate
- Punch utilization

---

## Legal / Ops Notes

- Lifetime: require written finance policy; consider non-refundable terms in waiver/contract template.
- Scholarships: document criteria; prevent quiet indefinite comps without owner role.
- Taxes: configure per location jurisdiction (Canada GST/HST/PST).

---

## Phase Mapping

- **Must:** monthly, trial, drop-in, punch, youth, family, entitlements, Stripe
- **Should:** annual, unlimited, pause, scholarship, VIP
- **Future:** sophisticated corporate portals, multi-gym passport memberships
