# Check-In System

## Purpose

Make presence the **system of record** for attendance, capacity, XP, parent peace of mind, and analytics.

---

## Digital Membership Card

Primary check-in surface (day one):

- Member name + photo  
- Plan + status chips  
- Live rotating QR  
- Waiver validity  
- Family switcher when applicable  

See [Day-One Member Experience](./15-day-one-member-experience.md) and [Calendar Hub](./16-calendar-hub.md).

---

## Channels (Roadmap)

| Channel | Phase | Notes |
|---------|-------|-------|
| QR Code (dynamic rotating token) | 3 | Primary |
| Staff search / manual | 3 | Fallback |
| Membership photo card + barcode | 3–4 | Optional print |
| Apple Wallet / Google Wallet | Future | PassKit / Google Pay passes |
| NFC tap | Future | Desk reader |
| Bluetooth proximity | Future | Experimental; privacy review |

---

## QR Credential Design

- **Member presents:** app screen or printed card with QR encoding `checkin_token`
- **Token properties:** opaque, user-bound, location-scoped optional, short TTL rotating (e.g., 60s) to prevent screenshot sharing
- **Static fallback token:** longer-lived for printed cards; rate-limited + photo verify at desk if flagged
- **Scanner apps:** Front Desk tablet, Coach phone, optional door iPad kiosk (check-in only role)

### Validation Pipeline

1. Authenticate scanner staff/device
2. Resolve token → member
3. Verify membership active + waiver valid
4. Resolve context: open gym vs specific class session (geo/time heuristics + member selection)
5. Enforce capacity
6. Write `attendance_event`
7. Emit XP / streak / parent notify
8. Return success UI (< 300ms perceived)

---

## Attendance Event Model

```
attendance_events:
  id, org_id, location_id
  user_id, session_id nullable
  method: qr | manual | wallet | nfc | kiosk
  status: checked_in | late | voided | duplicate_ignored
  checked_in_at, recorded_by
  device_id, ip_hash
  late_by_seconds
  metadata jsonb
```

**Idempotency:** same user + session within N minutes → ignore duplicate (still show success).

---

## Late Arrival

- Session has `start_at` + `late_after_minutes` (default 10)
- Flag `late` on event; coach roster shows amber
- Optional XP penalty (config; default none for youth)

---

## Capacity Limits

- `session.capacity` hard cap for checked-in + reserved
- Policy modes: `strict` (block) vs `soft` (warn + owner override)
- Walk-ins consume capacity; waitlist promotion reserved until TTL

---

## Open Gym vs Class Check-In

- **Class:** member books → check-in attaches to booking
- **Open gym:** check-in creates attendance without session or attaches to open-gym session template
- **Kids:** parent/staff may check in on behalf (`proxy_check_in` audited)

---

## Automatic XP

On successful check-in (configurable ruleset):
- Base XP
- First check-in of day bonus
- Streak maintain
- Class completion XP may fire at session end (coach finalize) to reduce early-leave abuse

Anti-abuse: max XP/day; velocity limits; impossible travel; staff void.

---

## Offline / Degraded Mode

- Ideal: online-only
- Degraded: desk queues check-ins locally and syncs (Should Have)
- Never silently grant access without later reconciliation flag

---

## Staff UX

- Big name + photo + status chips (Active / Past Due / Waiver Expired)
- One-tap fix: send waiver link / take payment / check-in anyway (permissioned)

---

## Metrics

- Median check-in time
- Method mix
- Duplicate rate
- Override rate
- Capacity denials

---

## Privacy

- Tokens are secrets; don't log raw QR payloads
- Parent notifications: minimal data ("Alex checked in at 4:02 PM")
