# Stripe test mode — local soft launch

## Enable Checkout + Customer Portal

1. Open [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/test/apikeys) (Test mode).
2. Copy the **Secret key** (`sk_test_...`) into `apps/api/.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
```

3. Restart the API. Startup log should show `Billing mode: stripe`.
4. Join flow at `/join` redirects to Stripe Checkout; return hits `/join/success` which calls `POST /api/v1/billing/confirm-checkout`.
5. `/app/billing` → **Stripe customer portal** works after at least one completed Checkout (customer id stored).

## Optional webhook (production-shaped)

```bash
stripe listen --forward-to localhost:4000/api/v1/webhooks/stripe
```

Paste the printed `whsec_...` as `STRIPE_WEBHOOK_SECRET` in `apps/api/.env` and restart.

## Cards

Use Stripe test cards (e.g. `4242 4242 4242 4242`, any future expiry, any CVC).

Leave `STRIPE_SECRET_KEY` unset to keep mock checkout at `/join/pay`.
