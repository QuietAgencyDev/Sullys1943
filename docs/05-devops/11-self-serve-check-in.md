# Self-serve walk-in QR check-in

Two unattended paths share the same attendance pipeline (`performCheckIn` + session attach).

## Session attach (auto)

When `sessionId` is omitted on scan or self check-in:

1. Member booking (confirmed / checked_in / waitlisted) for a class that is live or starts within ±30 minutes  
2. Else nearest class currently live  
3. Else open gym (`sessionId` null)

## Path A — Door kiosk (scanner reads phone QR)

1. Keep a tablet signed in as `desk@sullys.local` (or a dedicated desk user).  
2. Open **Door kiosk mode**: staff hub → `/desk/kiosk` (fullscreen).  
3. Plug a USB 2D scanner in **keyboard wedge** mode; leave the scan field focused.  
4. Member opens **Digital Card** (`/app/card`) and holds the rotating QR to the scanner.  
5. Kiosk calls `POST /api/v1/check-in/scan` with token only (no manual session pick).  
6. Hidden **Exit kiosk** returns to `/desk` (PIN gate later).

## Path B — Wall QR (phone scans wall)

Printable URL (prod):

`https://www.sullys1943.com/app/check-in/arrive`

Local:

`http://localhost:3000/app/check-in/arrive`

Behavior:

- Logged in → page immediately `POST /api/v1/check-in` (no button).  
- Logged out → `/app/login?next=/app/check-in/arrive`, then auto check-in after login.  
- States: Checking in… / You’re in (+XP) / Already checked in / Waiver or membership blocked / See desk.

## Smoke checklist

| Case | Expect |
|------|--------|
| Kiosk scan happy path | Green flash with name + XP; attendance row created |
| Wall arrive (logged in) | Auto success without tapping Self check-in |
| Wall arrive cold login | Login → return to arrive → auto check-in |
| Duplicate within 5 min | “Already checked in” (no second XP) |
| Waiver / membership block | Clear block message; desk override only on full desk UI |

## Related

- Scanner rehearsal: [`docs/08-process/09-scanner-dry-run.md`](../08-process/09-scanner-dry-run.md)  
- Digital Card QR remains the primary credential for Path A; in-app **Or check in here** is fallback only.
