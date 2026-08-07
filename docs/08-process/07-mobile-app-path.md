# Mobile app path (iOS + Android) — later

The member portal at `/app/*` is the product surface to wrap first. Recommended stack when you are ready to test on phones:

## Approach

1. **Expo (React Native)** in `apps/mobile` — one codebase for iOS + Android.
2. Reuse the Nest API (`/api/v1/*`) with cookie or Bearer JWT (API already accepts `Authorization: Bearer`).
3. Phase 1 screens: login, digital card + rotating QR, book class, waiver, family child QR, billing history.
4. Phase 2: push notifications for class reminders / kitchen order ready; deep links into Legacy / Passport.

## Why Expo first

- Ship TestFlight + Play Internal Testing without native rewrite.
- Share TypeScript types from `@sullys/types` and brand tokens where possible.
- Staff tools can stay web (`:3001`) on tablets; member app is the phone priority.

## Preconditions (now)

- Stable API on Postgres (this cut)
- Auth + QR + waiver gates working in web portal
- Stripe test checkout proven once

Do not start the mobile shell until those three are green in a demo dry-run.
