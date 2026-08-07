# Unified Calendar Hub

**Status:** Blueprint v1.1  
**Principle:** The calendar is the member's **training hub**, the coach's **ops board**, and the owner's **facility timeline** — not merely a class booking grid.

All calendars share one **Calendar Event Bus**: sessions, bookings, nutrition pickups, challenges, achievements nudges, gym events, staff ops, and closures render as typed `calendar_items` with role-based filters.

---

## 1. Member Calendar — Training Hub

### What members see (layered, filterable)

#### Today's Schedule
- Boxing Fundamentals – 6:00 PM  
- Open Gym – 7:30 PM  
- Nutrition Workshop – 8:15 PM  
- Booked / waitlisted / available states  
- One-tap book, cancel, directions, coach link  

#### Nutrition
- Meal Prep Pickup – 5:30 PM  
- Cooking Class – Saturday  
- Smoothie / kitchen order ready windows  
- Grocery list reminders (optional toggle)  

#### Challenges
- Heavy Bag Challenge windows  
- Weekly Attendance Goal progress chip  
- Deep link to challenge detail  

#### Achievements
- Level-up progress toward next rank  
- Streak status  
- Upcoming redeemable rewards / quest deadlines  

#### Gym Events
- Fight Night  
- Guest Coaches  
- Community BBQ  
- Kids Camp  
- Holiday Closures  

### UX rules
- **Default view:** Day (mobile) / Week (desktop)  
- Agenda list is primary on mobile; grid secondary  
- Color by `calendar_item_kind` (schedule, nutrition, challenge, achievement, event, closure)  
- Toggles: Show nutrition / challenges / events (persisted preference)  
- Empty day: suggest next bookable class + active quest — never a blank void  

### Data model (logical)

```
calendar_items:
  id, org_id, location_id
  kind: class_session | open_gym | nutrition_pickup | nutrition_class
        | kitchen_order | challenge | quest_deadline | achievement_nudge
        | gym_event | closure | personal_reminder
  title, starts_at, ends_at
  ref_type, ref_id          -- polymorphic link
  visibility: member | staff | owner | public_tv
  audience_filters jsonb   -- program, age, membership, user_ids
```

Members only receive items they are entitled to see (own bookings, open events, assigned nutrition, opted-in challenges).

---

## 2. Coach Calendar — Operational

Coaches manage and view:

| Item | Notes |
|------|-------|
| Classes | Assigned sessions + substitutes |
| Private lessons | PT packages / 1:1 blocks |
| Sparring sessions | Team / invite-only |
| Nutrition consultations | If dual-role or booked against them |
| Kitchen workshops | Teaching assignments |
| Equipment bookings | Bags, rings, cages — resource calendar |
| Vacation requests | Submit → owner/admin approve |
| Certifications | Expiry reminders (first aid, coaching certs) |
| Team meetings | Staff-only events |

### Coach day view priorities
1. Next class roster + capacity  
2. Private lessons  
3. Pending vacation / cert alerts  
4. Messages requiring response  

Coaches **cannot** see owner financial deadlines or payroll by default.

---

## 3. Owner Calendar — Whole Operation

| Item | Purpose |
|------|---------|
| Membership renewals | Cohort of renewing members / failed renewals |
| Staff schedules | Who is on floor / desk / kitchen |
| Payroll reminders | Export / submit deadlines |
| Equipment maintenance | Bags, HVAC, ring, POS devices |
| Inventory deliveries | Kitchen + retail |
| Marketing campaigns | Launch dates, promo windows |
| Events | Fight nights, camps, parties |
| Financial reporting deadlines | Month-end close |
| Building maintenance | Vendors, inspections |

Owner calendar can overlay coach calendars and facility resources. Drill-through opens Command Center / analytics, not just a detail modal.

---

## 4. Shared Behaviors

- Timezone = location timezone  
- Holiday closures block booking + show on all role calendars + Gym TV  
- Conflict detection: coach double-book, room double-book, equipment double-book  
- External ICS feed (member: own items; coach: assigned; owner: ops — careful with PII)  
- Push reminders: configurable offsets (24h / 2h / 30m)  

---

## 5. Phase Mapping

| Capability | Priority | Phase |
|------------|----------|-------|
| Class schedule + booking on calendar | Must | 3 |
| Closures + gym events on calendar | Must | 3 |
| Digital card deep link from calendar | Must | 3 |
| Nutrition / kitchen items on calendar | Should | 5–6 |
| Challenges / achievements on calendar | Should | 4 |
| Coach ops calendar (lessons, vacation, certs) | Should | 3–4 |
| Equipment booking | Could | 4–5 |
| Owner ops calendar full | Should | 3–4 (thin) → deepen later |
| Unified filters + ICS | Should | 3+ |

---

## 6. API Sketch

- `GET /calendar?role=member|coach|owner&from=&to=&kinds=`  
- `GET /calendar/today`  
- `POST /calendar/preferences`  
- `POST /resources/{id}/bookings` (equipment)  
- `POST /staff/time-off`  
- `GET /calendar/ics` (tokenized)  

---

## 7. Differentiation vs Glofox-style Calendars

Traditional gym software = class grid.  
**Sully's calendar** = life-of-the-gym timeline: train, eat, compete, achieve, belong — one scroll.

---

## Change Log

- **2026-08-07:** Calendar elevated from booking tool to multi-role hub (member / coach / owner).
