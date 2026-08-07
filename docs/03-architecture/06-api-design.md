# API Design

## Style

- **REST** JSON over HTTPS as primary public API  
- Version prefix `/api/v1`  
- OpenAPI 3.1 source of truth  
- Optional **tRPC** internal for Next.js BFF — still publish REST for mobile/native later  
- Idempotency keys on payments, check-in, redemptions  

---

## Conventions

| Topic | Rule |
|-------|------|
| IDs | UUID |
| Time | ISO-8601 UTC |
| Errors | `{ code, message, details?, requestId }` |
| Pagination | Cursor `?cursor=&limit=` |
| Auth | `Authorization: Bearer` or session cookie |
| Tenant | From session claims; optional `X-Location-Id` |
| Idempotency | Header `Idempotency-Key` |

---

## Endpoint Catalog (Planned)

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/magic-link` / OTP request & verify
- `POST /auth/mfa/enable`
- `POST /auth/password/forgot`
- `GET /auth/me`
- `POST /auth/context` — switch org/location

### Users & Guardianship
- `GET/PATCH /users/me`
- `POST /users/me/children`
- `GET /users/me/children`
- `POST /guardianships/invites`
- `POST /guardianships/accept`

### Documents / Waivers
- `GET /documents/requirements`
- `GET /documents/templates/{id}/active`
- `POST /documents/packets`
- `POST /documents/packets/{id}/sign`
- `GET /documents/signed/{id}`
- `GET /documents/signed/{id}/pdf`

### Memberships
- `GET /membership/products`
- `POST /membership/checkout`
- `GET /memberships/me`
- `POST /memberships/{id}/pause`
- `POST /memberships/{id}/cancel`
- `POST /memberships/{id}/members` (family)
- `GET /credits/me`

### Billing
- `GET /billing/invoices`
- `POST /billing/portal-session`
- `POST /webhooks/stripe` (raw body)

### Classes & Booking
- `GET /programs`
- `GET /sessions`
- `GET /sessions/{id}`
- `POST /sessions/{id}/bookings`
- `DELETE /bookings/{id}`
- `POST /sessions/{id}/waitlist`
- `POST /waitlist/{id}/accept`

### Check-In / Attendance
- `GET /check-in/token` — rotating QR payload
- `GET /membership-card` — digital card DTO (status, photo, QR, waiver chip)
- `POST /check-in`
- `GET /attendance/me`
- `GET /sessions/{id}/roster`
- `POST /sessions/{id}/attendance/finalize`
- `POST /attendance/{id}/void`
- `GET /presence/location` — members currently in gym (staff)
- `POST /presence/checkout`

### Calendar Hub
- `GET /calendar?role=member|coach|owner&from=&to=&kinds=`
- `GET /calendar/today`
- `POST /calendar/preferences`
- `GET /calendar/ics`
- `POST /resources/{id}/bookings` — equipment
- `POST /staff/time-off`
- `GET/PATCH /staff/certifications`

### Coach / Workouts
- `GET/POST /workouts`
- `POST /sessions/{id}/workout`
- `GET/POST /athletes/{id}/notes`
- `GET /athletes/{id}/progress`
- `GET /coaches` / `GET /coaches/{id}` — public coach profiles

### Boxing Progression / Gamification
- `GET /gamification/me`
- `GET /progression/ranks`
- `GET /progression/skill-trees`
- `POST /progression/personal-bests`
- `GET /gamification/leaderboards`
- `GET /quests`
- `POST /quests/{id}/claim`
- `GET /rewards/catalog`
- `POST /rewards/redeem`

### Nutrition
- `GET /nutrition/profile`
- `PATCH /nutrition/profile`
- `GET /nutrition/plans/me`
- `POST /nutrition/plans/assign`
- `GET /recipes`
- `GET /nutrition/shopping-list`
- `POST /nutrition/habits/log`
- `POST /nutrition/hydration/log`
- `GET /nutrition/courses`

### Kitchen
- `GET /kitchen/menu`
- `POST /kitchen/orders`
- `GET /kitchen/orders/{id}`
- `GET /kitchen/kds/feed` (WS)
- `PATCH /kitchen/orders/{id}/status`
- `POST /kitchen/menu-items/{id}/eighty-six`
- `GET/POST /kitchen/inventory`

### Community
- `GET /feed`
- `POST /posts`
- `POST /posts/{id}/reactions`
- `POST /posts/{id}/comments`
- `POST /moderation/reports`
- `GET /announcements`
- `POST /announcements` (staff)

### Events
- `GET /events`
- `POST /events` (staff)
- `POST /events/{id}/tickets/checkout`
- `POST /events/{id}/check-in`

### Messaging
- `GET /messages/threads`
- `POST /messages/threads`
- `POST /messages/threads/{id}/messages`

### Store
- `GET /store/products`
- `POST /store/checkout`

### Displays — Gym TV & Command Center
- `GET /displays/{profile}/playlist` — lobby | training_floor | kids_area | kitchen_window
- `WS /displays/{locationId}/{profile}`
- `GET /command-center/snapshot`
- `WS /command-center/{locationId}`
- `POST /command-center/alerts` — staff emergency
- `POST /command-center/alerts/{id}/ack`

### Owner Analytics
- `GET /analytics/overview`
- `GET /analytics/mrr`
- `GET /analytics/retention`
- `GET /analytics/attendance`
- `GET /analytics/kitchen`
- `GET /analytics/at-risk-members`
- `GET /analytics/revenue/today`

### Admin
- `GET/PATCH /admin/settings`
- `GET/POST /admin/roles`
- `GET /admin/audit-logs`
- `GET/PATCH /admin/feature-flags`
- `CRUD /admin/notification-templates`
- `CRUD /admin/themes`
- `CRUD /admin/display-devices`

### AI (Future)
- `POST /ai/coach/suggest`
- `POST /ai/nutrition/draft-plan`
- `GET /ai/retention/scores`
- `POST /ai/support/chat`

---

## Webhooks Inbound

| Source | Endpoint |
|--------|----------|
| Stripe | `/webhooks/stripe` |
| Twilio | `/webhooks/twilio` |
| Email provider | `/webhooks/email` |

---

## Error Codes (Sample)

- `AUTH_UNAUTHORIZED`
- `AUTH_FORBIDDEN`
- `WAIVER_REQUIRED`
- `MEMBERSHIP_INACTIVE`
- `CAPACITY_FULL`
- `PAYMENT_REQUIRED`
- `AGE_INELIGIBLE`
- `IDEMPOTENCY_CONFLICT`
- `RATE_LIMITED`
- `VALIDATION_FAILED`

---

## Rate Limits (Draft)

| Actor | Limit |
|-------|-------|
| Check-in | 30/min/device |
| Auth login | 10/min/IP |
| Public browse | 120/min/IP |
| Member API | 600/min/user |

---

## OpenAPI Governance

- PR must update OpenAPI when endpoints change  
- Contract tests in CI  
- Breaking changes require `/v2` or negotiated deprecation window  
