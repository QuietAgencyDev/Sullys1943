# Sully’s — QuickBooks Integration

**Ops PDF:** [Sullys-QuickBooks-Integration.pdf](./Sullys-QuickBooks-Integration.pdf) · HTML: [08-quickbooks-integration.html](./08-quickbooks-integration.html)

Companion: [Banking & Payment Setup](./07-banking-payment-setup.md) · Architecture: [../03-architecture/08-proprietary-payment-platform.md](../03-architecture/08-proprietary-payment-platform.md)

## Principle

Sully’s remains source of truth for members, memberships, and desk tenders. QuickBooks receives **settled CAD totals** only — never card data, waivers, or access status.

## Order

1. Helcim / banking live (or sandbox validated)
2. Owner desk revenue by tender trusted for 1–2 weeks
3. Phase A: CSV export → accountant import
4. Phase B: QuickBooks Online OAuth + nightly idempotent sync
5. Avoid double-posting if Helcim’s own QBO sync is also enabled

## Status

Owner desk shows QuickBooks as **planned / not connected**. OAuth env vars and sync ship in a later engineering pass; this PDF is the owner + build guide.
