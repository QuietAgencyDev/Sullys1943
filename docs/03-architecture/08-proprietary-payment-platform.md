# Sully's Gym — Proprietary Payment Platform

**Status:** Architecture approved for phased implementation (no coding until this doc is accepted)  
**Date:** 2026-08-07  
**Rule:** Processor is a **service**. Sully's is the **platform** and source of truth.

Companion Cursor plan: `.cursor/plans/proprietary_payment_platform_sullys.plan.md`

---

## 1. Current Payment Architecture Audit

### What exists today (code + schema)

| Area | Location | Reality |
|------|----------|---------|
| Membership products | `MembershipProduct` | `interval` monthly/annual/one_time; CAD `priceCents`; optional `stripePriceId` |
| Membership instances | `Membership` | statuses: `active \| past_due \| paused \| cancelled \| pending_payment`; family via `MembershipMember` |
| Payment ledger (thin) | `PaymentEvent` | `provider` mock\|stripe; unique `externalId`; type/status/amount; optional `membershipId`; `raw` truncated blob |
| Checkout | `BillingController` `POST /membership/checkout` | Creates Sully membership first (`pending_payment`), then Stripe Checkout **or** mock pay URL |
| Mock pay | `POST /billing/mock-pay` | Completes event + activates membership + welcome XP |
| Stripe confirm | `POST /billing/confirm-checkout` | Browser return path; activates without requiring webhook |
| Stripe portal | `POST /billing/portal-session` | Card/subscription self-serve via Stripe |
| Stripe webhook | `POST /webhooks/stripe` | Signature optional if secret set; idempotent on `externalId`; handles `checkout.session.completed` / `invoice.paid` |
| Member UI | `/app/billing`, `/join` | History from `PaymentEvent`; mode banner mock vs stripe |
| Domain intent | `docs/02-domain/01-membership-system.md` | Rich product types; Stripe assumed in older docs |
| Kitchen | `KitchenOrder` / items | **No payment fields** — fulfillment only |
| Notifications | — | **No** payment failure notification pipeline yet |
| Admin revenue dash | Owner docs exist | **No** payment analytics implementation tied to processor |
| Reconciliation | — | **None** |

### Coupling / debt

1. **Stripe column names on Membership** (`stripeCustomerId`, `stripeSubscriptionId`, `stripeCheckoutId`) — processor-specific; must be generalized or mapped via provider refs without deleting history.
2. **`BillingController` is Stripe-shaped** — no `PaymentProvider` interface; mock is a second path inside the same controller.
3. **`PaymentEvent` is membership-centric** — cannot cleanly model kitchen, merch, events, or PT without a broader `Payment` / `Order` concept.
4. **Webhook comment says “Stripe is production source of truth”** — violates the new architectural rule; Sully membership activation must remain authoritative with processor as confirmation channel.
5. **No tokenized payment-method table** — only Stripe customer/subscription IDs on membership.
6. **No configurable dunning / grace rules** — failure → status changes are incomplete.
7. **Kitchen / POS** not on the payment path yet — same abstraction must cover them later.

### What we will reuse (not rebuild)

- `User`, `Organization`, `Location`
- `MembershipProduct`, `Membership`, `MembershipMember`
- Existing join + waiver gates before checkout
- Existing `PaymentEvent` as seed for a normalized event log (extend, don’t fork)
- XP welcome award path (guard with idempotency keys so webhooks never double-award)

### What we will not do

- Replace Neon/Postgres or rewrite membership domain
- Introduce a second “customer” identity outside `User`
- Store PAN/CVV
- Make Helcim/Moneris own membership status without Sully rules

---

## 2. Recommended Processor

**Primary recommendation for Phase 1: Helcim**

Rationale for Sully’s (single-location Canadian gym, recurring + desk + future kitchen):

- Canadian processor with published interchange-plus economics and **no monthly platform fee** (vs Moneris monthly + typical terminal rental).
- First-class **Recurring API** (plans, subscriptions, retries) and **customer vault / HelcimPay.js** tokenization — fits abstraction methods.
- Modern API (v2 + OpenAPI) and webhooks — better DX for NestJS module than classic Moneris gateway patterns.
- Smart Terminal / card terminal APIs align with front-desk tap/chip later without a second stack.
- Month-to-month commercial terms reduce lock-in while the abstraction layer matures.

**Keep Moneris as Adapter #2** (not discard):

- Strong Interac / Canadian bank-rails brand preference for some operators
- Enterprise terminal ubiquity
- Useful negotiation lever and future switch target

**Stripe stance:** treat current Stripe/mock as **legacy adapter** during dual-run. Do not expand Stripe as the long-term Canadian desk+Interac strategy; migrate memberships onto Helcim behind `PaymentProvider`.

---

## 3. Processor Comparison (Helcim vs Moneris)

| Dimension | Helcim | Moneris | Sully weight |
|-----------|--------|---------|--------------|
| Canadian availability | Yes (CA + US) | Yes (CA flagship) | High |
| Recurring billing | Recurring API (plans/subscriptions/retries) | Vault + recurring profiles; more custom build | High |
| API quality / DX | Modern REST v2, OpenAPI, HelcimPay.js | Gateway mature but heavier / older DX | High |
| Webhooks | Dashboard webhooks, HMAC-style verification | Available; more gateway-era patterns | High |
| Tokenization / vault | Customer + card tokens | Moneris Vault | Critical |
| Online payments | HelcimPay / API | eSELECTplus / Checkout | High |
| In-person terminals | Smart Terminal purchase model | Wide rental/fleet ecosystem | High (desk) |
| Interac | Supported in Canadian acquiring mix; confirm product SKUs for online vs in-person | Very strong Interac positioning | Medium–High |
| Refunds / chargebacks | API + dashboard | API + dashboard | High |
| Reporting / settlement | API + dashboard | Strong bank-grade reporting | Medium |
| Pricing transparency | Published interchange+ | Quote / negotiated; monthly fees common | High |
| Contracts | Typically month-to-month | Multi-year common | Medium |
| Hardware cost model | Buy reader (~low CapEx) | Rental common | Medium |
| Future scalability | SMB → mid-market | Enterprise retail scale | Medium |

### Total effective cost (TEC) — frame (not a signed quote)

Estimate with **Sully’s mix**, not headline % alone. Example monthly mix for modeling:

| Stream | Assumed volume | Channel |
|--------|----------------|---------|
| Recurring memberships | 70% of card volume | Card-on-file |
| Drop-in / packages / events | 15% | Online + desk |
| Kitchen / merch | 15% | Desk terminal |

**TEC components to calculate with live quotes before go-live:**

`TEC = interchange + processor markup + per-txn fees + monthly fees + PCI fees + terminal rent/purchase amortized + chargeback fees + failed-payment ops cost + engineering hours for adapter`

Directional expectation for a gym under ~$150K/mo processing: **Helcim TEC usually lower** because $0 monthly + no terminal lease; Moneris can win only if negotiated markup + Interac mix + existing bank relationship beat Helcim all-in **and** engineering cost of Adapter #1 is accepted.

**Decision:** implement **Helcim adapter first**; keep schema/API processor-agnostic so Moneris can replace without touching membership UI, XP, kitchen, or reports.

---

## 4. Payment Data Model

Extend Prisma; **do not drop** existing membership tables. Prefer additive columns + new tables.

### New / evolved entities (logical)

```
PaymentCustomer          # Sully user ↔ provider customer id (per provider)
PaymentMethod            # token refs only (brand, last4, exp, providerMethodId)
Payment                  # one charge attempt / capture (amount, currency, status, purpose)
PaymentAllocation        # links Payment → Membership | KitchenOrder | Event | Package | etc.
Subscription             # Sully subscription schedule; providerSubscriptionId optional
SubscriptionItem         # product/price lines
PaymentEventNormalized   # evolve PaymentEvent → typed enum + idempotencyKey
WebhookDelivery          # raw inbound webhook audit
DunningPolicy            # admin-configurable failure ladder
CreditLedger             # account credits / comps
Refund                   # full/partial against Payment
ReconciliationRun / Diff # Sully vs processor settlement compare
```

### Membership field migration

| Today | Target |
|-------|--------|
| `stripeCustomerId` | Keep temporarily; mirror into `PaymentCustomer(provider=stripe\|helcim)` |
| `stripeSubscriptionId` | Mirror into `Subscription.providerSubscriptionId` |
| `stripeCheckoutId` | Generic `checkoutSessionId` on Payment or CheckoutSession table |
| `PaymentEvent.provider` | `mock \| stripe \| helcim \| moneris` |

### Normalized event types (Sully enum)

`PAYMENT_CREATED` · `PAYMENT_AUTHORIZED` · `PAYMENT_SUCCEEDED` · `PAYMENT_FAILED` · `PAYMENT_REFUNDED` · `PAYMENT_PARTIALLY_REFUNDED` · `SUBSCRIPTION_CREATED` · `SUBSCRIPTION_UPDATED` · `SUBSCRIPTION_CANCELLED` · `PAYMENT_METHOD_UPDATED` · `CHARGEBACK_CREATED`

Map each processor webhook → these enums inside the adapter (`handleWebhook`).

### Membership status sync (Sully-owned)

`ACTIVE` · `PAST_DUE` · `PAYMENT_FAILED` · `GRACE_PERIOD` · `CANCELLED` · `EXPIRED` · `PAUSED`

Map from payments + `DunningPolicy`; never hardcode “cancel on first decline.”

### Card data rule

Store only: `provider`, `providerCustomerId`, `providerPaymentMethodId`, `brand`, `last4`, `expMonth`, `expYear`, `fingerprint` (if provided). **Never** PAN/CVV/track data. `raw` webhook payloads redacted before persistence.

---

## 5. API Architecture

### `PaymentProvider` interface (Nest injectable)

```ts
interface PaymentProvider {
  readonly id: "helcim" | "moneris" | "stripe" | "mock";
  createCustomer(input): Promise<ProviderCustomer>;
  createPaymentMethod(input): Promise<ProviderPaymentMethod>;
  createPayment(input): Promise<ProviderPayment>;
  createSubscription(input): Promise<ProviderSubscription>;
  updateSubscription(input): Promise<ProviderSubscription>;
  cancelSubscription(input): Promise<ProviderSubscription>;
  refundPayment(input): Promise<ProviderRefund>;
  getPayment(id): Promise<ProviderPayment>;
  getCustomer(id): Promise<ProviderCustomer>;
  getSubscription(id): Promise<ProviderSubscription>;
  handleWebhook(req): Promise<NormalizedPaymentEvent[]>;
}
```

### App services (processor-agnostic)

| Service | Responsibility |
|---------|----------------|
| `BillingService` | Orchestrates membership checkout using Sully products |
| `SubscriptionService` | Create/update/cancel; writes Sully `Subscription` first |
| `PaymentService` | One-off charges (drop-in, kitchen, events) |
| `DunningService` | Applies configurable rules on `PAYMENT_FAILED` |
| `ReconciliationService` | Pull processor settlements vs Sully `Payment` |
| `PaymentEventService` | Idempotent event append + side-effect dispatch |

### HTTP surface (evolve `/api/v1`)

- Keep `/membership/checkout`, `/billing/*` as façades; internals call `BillingService`
- Add `/webhooks/payments/:provider` (Helcim, Moneris, Stripe)
- Member: billing history, update payment method (hosted fields / redirect), invoices/receipts
- Staff: desk charge, refund (RBAC), lookup
- Admin: revenue dashboard aggregates from Sully `Payment` (not processor UI scrape)

### Frontend

- Member app: native Sully billing screens; processor iframes/JS only for card capture
- Staff desk: member lookup → charge → receipt
- Kitchen POS later: same `PaymentService` with `purpose=kitchen`

---

## 6. Webhook Architecture

```
Processor → POST /api/v1/webhooks/payments/:provider
  → verify signature (provider-specific)
  → persist WebhookDelivery (raw hash + headers + receivedAt)
  → idempotency: providerEventId UNIQUE
  → adapter.handleWebhook → NormalizedPaymentEvent[]
  → PaymentEventService.apply (transactional)
      - insert event if new
      - update Payment / Subscription
      - enqueue side effects (membership sync, notify, XP) with outbox
  → 200 OK quickly; heavy work via outbox/worker if needed
```

### Guarantees

- Duplicate delivery → `duplicate: true`, no second membership activation, no second XP, no second invoice
- Signature failure → 400, log, no side effects
- Unknown event types → store + ignore safely
- Failure recovery → replay from `WebhookDelivery` / admin “reprocess”
- Audit trail → who/what/when for admin refunds and manual status overrides

---

## 7. Security Architecture

- Secrets in Railway/Vercel env / secret manager — never in repo or client bundles
- Role checks: member (own billing), front_desk (charge/refund limited), admin/owner (policies, reconcile)
- Audit log for admin payment actions
- PCI: SAQ A / A-EP via hosted fields / terminal — no card data through Sully servers
- Redact logs: no full PANs, no CVV, no raw auth cookies
- Encrypt sensitive tokens at rest if required by policy (provider IDs are not secrets but treat API keys as secrets)
- Webhook endpoints: signature + optional IP allowlists where processors publish them

---

## 8. Migration Plan

1. **Additive schema** — new payment tables + provider-agnostic columns; keep Stripe columns.
2. **Introduce `PaymentProvider` + mock adapter** — route existing mock through interface (behavior unchanged).
3. **Stripe adapter wrap** — move current Stripe calls behind interface (no UX change).
4. **Helcim adapter + sandbox** — dual-write `PaymentCustomer` for new checkouts.
5. **Cutover new memberships to Helcim** — feature flag `PAYMENT_PROVIDER=helcim`.
6. **Backfill** — existing active Stripe subs: either remain on Stripe adapter until renewal, or guided card re-token into Helcim (ops playbook).
7. **Deprecate Stripe columns** only after zero active Stripe subscriptions (read-only archive OK).
8. **Moneris adapter** when commercially required — no UI rewrite.

Kitchen/merch attach in a later phase once membership recurring is stable.

---

## 9. Testing Plan

### Sandbox matrix

| Scenario | Expect |
|----------|--------|
| Successful payment | Payment SUCCEEDED; membership ACTIVE; one XP grant |
| Failed / declined | PAYMENT_FAILED; dunning step 1; no XP |
| Expired payment method | Method flagged; member notified; grace per policy |
| Refund / partial refund | Refund rows; revenue reports adjust; membership rules per product |
| Duplicate webhook | Second delivery no-ops |
| Delayed webhook | Confirm-checkout + webhook both idempotent |
| Subscription cancel | Sully sub cancelled; access until period end per policy |
| Payment retry | Succeeds → ACTIVE; clears PAST_DUE/GRACE |

### Automation

- Contract tests per adapter with recorded fixtures
- Idempotency tests on event apply
- RBAC tests for refunds
- Load/latency smoke on webhook endpoint

---

## 10. Implementation Plan (phased)

### Phase 0 — Accept this architecture (now)

- Stakeholder sign-off on Helcim-first + abstraction
- Open Helcim sandbox + collect TEC quote with real mix

### Phase 1 — Foundation (engineering)

- Prisma additive models
- `PaymentProvider` + mock + Stripe wrap
- Normalized events + webhook router
- DunningPolicy defaults (notify → retry → grace → staff alert → configurable action)
- Member billing UI remains Sully-native

### Phase 2 — Helcim membership billing

- Helcim adapter: customer, payment method, pay, subscribe, refund, webhooks
- Checkout + portal-equivalent flows
- Admin: daily/monthly/recurring revenue, failed/successful, refunds

### Phase 3 — Desk + reporting

- Terminal / tap path
- Filters (date, member, product, coach, program, method, status, location)
- Reconciliation tool v1

### Phase 4 — Commerce expansion

- Drop-in, packages, PT, camps, events on same `Payment` model
- Kitchen + merch POS
- Credits / partial refunds polish

### Phase 5 — Moneris readiness

- Moneris adapter behind same interface
- Switch drill in staging (membership UI unchanged)

---

## Observability

Track: processor API errors, webhook failures, payment failures, sync failures, p95 latency, provider health. Surface on owner/admin ops page.

---

## Acceptance criteria for “native” feel

- Members never see “powered by random bolted UI” as the system of record
- Staff refunds and desk charges feel like Sully desk tools
- Reports read from Sully ledgers
- Swapping Helcim → Moneris changes adapters + secrets, not Boxing Card / XP / membership screens
