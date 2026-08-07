# Day-One Member Experience (Glofox Parity +)

**Status:** Added to blueprint v1.1  
**Intent:** Features that must exist for members from first public launch — the operational baseline before "beyond Glofox" differentiators dominate the roadmap.

This list is the **Member Experience contract**. Related systems (coach/owner calendars, Gym TV, Command Center) are specified in sibling docs.

---

## Day-One Feature Checklist

| Feature | Phase | Notes |
|---------|-------|-------|
| Login and authentication | 1 | Email/OTP; staff MFA |
| Profile management | 1 | Photo, contacts, preferences |
| Digital waivers | 1–2 | Gate on activation & check-in |
| Membership management | 2 | Status, plan, pause/cancel entry points |
| Membership renewals | 2 | Auto-renew + reminder flows |
| Payment history | 2 | Invoices, receipts, failed payments |
| Family accounts | 2 | Guardianship + combined billing |
| Class calendar | 3 | See [Unified Calendar Hub](./15-calendar-hub.md) |
| Class booking and waitlists | 3 | Capacity, policies, auto-promote |
| QR code check-in | 3 | Rotating token + desk fallback |
| Digital membership card | 3 | In-app card with QR + status chips |
| Attendance history | 3 | Member + parent views |
| Coach profiles | 3 | Bio, specialties, classes taught |
| Push notifications | 3 | Bookings, cancels, check-in (youth), renewals |
| Announcements | 3 | Staff/coach broadcast (pre-full community) |
| In-app messaging | 3–4 | Member↔coach / parent↔coach (audited) |

---

## Digital Membership Card (Day One Spec)

Surface in app (and printable fallback):

- Member name + photo  
- Plan name + status (`Active` / `Past Due` / `Paused`)  
- Home location  
- **Live QR** for check-in  
- Waiver valid / expired chip  
- Family switcher (if parent)  

Future: Apple/Google Wallet pass (not day one).

---

## Announcements vs Community Feed

| Day one | Later |
|---------|-------|
| Staff/coach **Announcements** (read + push) | Full **Community Feed** with UGC |

Announcements are Must Have; open posting waits for moderation (see Community + MoSCoW).

---

## Messaging Guardrails (Day One)

- Threads only with staff/coaches (no member↔member DMs at launch)  
- Parent CC / routing for youth  
- Templates for common topics  
- Full audit log  

---

## Acceptance Criteria (Member Day-One Slice)

A new adult member can, without staff paper:

1. Register and log in  
2. Sign waiver  
3. Purchase / activate membership  
4. View calendar and book a class (or waitlist)  
5. Present digital card / QR and check in  
6. See attendance + payment history  
7. Receive push/email for cancel and renewal  
8. Message their coach  
9. Read gym announcements  

A parent can additionally manage linked children through the same checklist where age rules apply.

---

## Change Log

- **2026-08-07:** Initial day-one member experience contract added from product planning workshop.
