# Sully’s — Banking & Payment Setup (Helcim)

**Separate ops PDF:** [Sullys-Banking-Payment-Setup.pdf](./Sullys-Banking-Payment-Setup.pdf) · HTML: [07-banking-payment-setup.html](./07-banking-payment-setup.html)

Architecture detail: [../03-architecture/08-proprietary-payment-platform.md](../03-architecture/08-proprietary-payment-platform.md)

## Principle

Helcim is a **service**. Sully’s owns memberships, waivers, XP, cash ledger, and owner analytics. Never store card PANs in the app.

## Owner steps (short)

1. Open a Canadian Helcim merchant account and complete KYC + bank deposit setup.
2. Enable online pay, recurring, terminal, and webhooks.
3. Create sandbox + production API tokens.
4. Send Quiet Agency (Railway/Vercel secrets only):
   - `PAYMENT_PROVIDER=helcim`
   - `HELCIM_API_TOKEN`
   - `HELCIM_ACCOUNT_ID`
   - `HELCIM_WEBHOOK_SECRET`
   - optional `HELCIM_TERMINAL_ID`
5. Pair front-desk terminal; train staff: **CASH** = Staff ledger, **CARD** = Helcim terminal.
6. QuickBooks comes **after** Helcim is stable (export settled totals only).

## What works before Helcim keys

- Desk **CASH** / **CARD** tender labels on drop-in
- Owner desk: kids/youth vs adult memberships, revenue by tender, waivers, walk-ins, demographics, group messages
- Online checkout remains mock until `PAYMENT_PROVIDER=helcim` is wired and flagged
