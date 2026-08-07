# System Design

## Design Goals

1. Correctness for money, access, and minors  
2. Check-in latency under peak load  
3. Configurability without deploys  
4. Observability by default  
5. Graceful degradation (desk fallback)

---

## Key Use Case Designs

### 1. Trial → Member Conversion

```
Client → POST /auth/register
      → POST /waivers/sign
      → POST /memberships/checkout (Stripe Checkout Session)
Stripe webhook → billing.activate → entitlements.grant → notify.welcome
```

**Idempotency:** webhook event IDs stored; checkout sessions single-use.

### 2. QR Check-In Hot Path

```
Scanner → POST /check-in { token, sessionId? }
  1. AuthZ scanner
  2. Resolve rotating token (Redis)
  3. Load membership + waiver status (cached)
  4. Capacity check (transaction / advisory lock on session)
  5. Insert attendance_event
  6. Enqueue XP + parent notify
  7. Return DTO
```

**Perf:** denormalized `member_access_snapshot` cache; target p95 < 200ms server.

### 3. Booking + Waitlist

- Hold seat in transaction
- On cancel, promote waitlist asynchronously with offer TTL
- Race-safe with unique constraints `(session_id, user_id)`

### 4. Waiver PDF

- Sign completes DB state first  
- Async PDF generate → upload → update `pdf_ready`  
- Client polls or websocket  

### 5. Kitchen Order

- Pay (or points) → create order → push to KDS channel (WebSocket room `kitchen:{locationId}`)  
- Inventory reservation on accept  

---

## Consistency Model

| Domain | Model |
|--------|-------|
| Payments / entitlements | Strong (DB txn + Stripe source of truth reconciliation) |
| XP / streaks | Eventual via queue |
| Feed likes | Eventual OK |
| Check-in capacity | Strong |
| Analytics rollups | Eventual daily |

---

## Caching Strategy

- Redis: sessions, QR tokens, feature flags, hot schedules  
- CDN: public marketing, images  
- Avoid caching authorization decisions longer than seconds without invalidation  

---

## Realtime

- **WebSockets** (Socket.IO or native ws): KDS, live roster, notification badges, **Gym TV playlists**, **Command Center snapshot**, presence ticker  
- Auth via short-lived socket token (display devices use device credentials)  
- Rooms scoped by location + role / display profile  
- Calendar projection invalidation on domain events  

---

## Calendar Projection Service

- Consumes bookings, sessions, nutrition/kitchen orders, challenges, events, closures, staff ops  
- Emits role-filtered `calendar_items` for member / coach / owner  
- Single hub — modules never ship competing calendars  

See [Calendar Hub](../02-domain/16-calendar-hub.md) and [Gym TV & Command Center](../02-domain/17-gym-tv-command-center.md).
---

## File & Media Pipeline

1. Client requests signed upload URL  
2. Virus scan (ClamAV / cloud) for user media  
3. Transcode images; video async  
4. Store keys only in DB  

Waiver PDFs: server-only write.

---

## Job Types

| Job | Priority |
|-----|----------|
| Stripe webhook process | Critical |
| PDF generate | High |
| SMS/email | High |
| XP apply | Normal |
| Rollup analytics | Low |
| AI draft | Low |

Dead-letter queue + admin replay.

---

## Failure Modes

| Failure | Mitigation |
|---------|------------|
| Stripe outage | Queue webhooks; read-only entitlements; desk cash process offline log |
| Redis down | QR fallback to signed JWT validated by DB; degraded |
| Provider SMS down | Email fallback; in-app inbox |
| DB primary fail | Automatic failover; RPO/RTO per Deployment Plan |

---

## Multi-Location Tenancy Patterns

- Every table: `organization_id`  
- Most operational: `location_id`  
- Users may belong to multiple locations (passport Future) via membership rows  
- Staff assignments: `staff_location_roles`  

Cross-location queries only in Franchise Manager context with explicit permission.

---

## Integration Contracts

- Stripe webhooks signature verify  
- Twilio status callbacks  
- Future POS adapter interface  
- Calendar ICS generate  

---

## ADR Index (Create During Phase 0)

1. Modular monolith vs services  
2. Auth vendor  
3. RLS strategy  
4. PWA vs native  
5. PDF renderer  
6. Metric definitions ownership  
