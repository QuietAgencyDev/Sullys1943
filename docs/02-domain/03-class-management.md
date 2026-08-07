# Class Management

## Purpose

Support **unlimited programs** on one scheduling substrate — boxing, kids, camps, parties, nutrition classes, corporate events — via configuration, not separate apps.

---

## Core Concepts

| Concept | Definition |
|---------|------------|
| **Program** | Category/product line (e.g., Kids Boxing, Competitive Team) |
| **ClassTemplate** | Recurring definition (Mon/Wed 5pm, coach, room, capacity) |
| **Session** | Concrete occurrence (date/time instance) |
| **Booking** | Member reservation for a session |
| **WaitlistEntry** | Ordered queue for full sessions |
| **WorkoutPlan** | Optional content attached to session/template |

---

## Example Programs (Seed, Not Hardcoded)

- Boxing (fundamentals / intermediate / advanced)
- Kids Boxing (age bands)
- Competitive Team
- Strength & Conditioning
- Open Gym
- Nutrition Education
- Cooking Classes (ties to Kitchen)
- Women's Boxing
- Senior Fitness
- Youth Camps / Summer Programs
- Birthday Parties
- Corporate Events / Team Builds
- Seminars (may also use Events module)

Use `program_kind` enum + tags for filtering: `youth`, `adult`, `competition`, `fee_extra`, `trial_eligible`.

---

## Scheduling Rules

- Timezone: per location
- Rooms: capacity may default session capacity
- Coach assignment: primary + assistants
- Conflicts: warn on double-booking coach/room (configurable hard block)
- Holidays: location calendar blackouts
- Substitutions: coach change notifies booked members

---

## Booking Policies (Configurable per Program)

- Booking window open/close (e.g., 7 days ahead, closes 1 hour before)
- Max bookings per day/week
- Cancel until X minutes before
- No-show penalties (strike system / XP / fee)
- Membership entitlement required
- Guest booking rules

---

## Waitlist

1. FIFO or priority (VIP Should Have)
2. Spot opens → offer with TTL (e.g., 15 min)
3. Accept → confirmed; expire → next
4. SMS/push critical for conversion

---

## Capacity & Safety

- Soft/hard caps
- Instructor ratio for kids (e.g., max kids per coach) as warning metric
- Fire occupancy: location-level live count (Future/Should)

---

## Coach Class Flow

See Coach journeys — finalize attendance triggers completion XP and parent summaries.

---

## Camps, Parties, Corporate

Model as programs with:
- Multi-day session groups (`session_series`)
- Add-on fees
- Dedicated waivers
- Roster imports
- Minimum enrollment to run

---

## Workout Builder (Coach)

- Blocks: rounds, rest, stations, media, notes
- Templates library (org shareable)
- Attach to session; members see "Today's Work" if entitled
- Export PDF for wall print (optional)

---

## Reporting

- Utilization = checked_in / capacity
- Popularity by program/time
- No-show rate
- Coach load hours

---

## Integrations

- Calendar Hub projection (member / coach / owner views) — see [Calendar Hub](./16-calendar-hub.md)
- Calendar feed (ICS) for members
- Google Calendar sync (Could)
- Events module for ticketed spectacles overlapping seminars
- Gym TV schedule blocks

---

## Change Log

- **2026-08-07:** Linked to Unified Calendar Hub; classes are one layer of the training hub, not the whole calendar.