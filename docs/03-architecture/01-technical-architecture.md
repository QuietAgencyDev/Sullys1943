# Technical Architecture & Recommended Stack

## Architecture Style

**Modular monolith first** (single deployable API) with **clear domain bounded contexts**, extracting services only when scaling or team boundaries demand it (Kitchen KDS WebSockets, AI workers, notification dispatcher).

**Multi-tenant:** shared database, strict `organization_id` (+ `location_id`) isolation with Postgres Row Level Security.

**Clients:** Mobile-first Progressive Web App for members; responsive web for parents; desktop-optimized staff/owner consoles; **Gym TV kiosk app**; **Command Center** desk display mode; optional native shells later (Capacitor/React Native).

**Product modules:** Core · Training · Nutrition · Family · Community · Business · Future — see [Modular Product Architecture](../02-domain/18-modular-architecture.md). Runtime stays a modular monolith with a shared realtime plane for app, KDS, TV, and Command Center.

---

## Recommended Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend (Web)** | Next.js 15 (App Router) + TypeScript + React | SSR/marketing + app; excellent DX; edge-friendly |
| **UI** | Tailwind CSS + Radix primitives + custom design tokens | Premium control without heavy UI kit lock-in |
| **Motion** | Motion (Framer Motion) | Animation guide compliant |
| **Mobile** | PWA first → Capacitor or RN later | Speed to value; one codebase |
| **Backend API** | NestJS (Node) + TypeScript **or** Next.js Route Handlers + separate Nest worker | Nest preferred for domain modules, queues, guards |
| **Alternative Backend** | Rails/Laravel also viable — team skill decides; **TS full-stack recommended** for shared types |
| **Database** | PostgreSQL 16 | RLS, JSONB for flexible policies, maturity |
| **ORM** | Prisma or Drizzle | Drizzle if RLS-heavy raw SQL preferred; Prisma for speed |
| **Cache / Queues** | Redis + BullMQ | Jobs: PDF, email, XP, dunning |
| **Auth** | Auth.js / Clerk / Supabase Auth / Auth0 | **Recommendation: Clerk or Auth0 for MFA/staff**; or Supabase Auth if choosing Supabase host — see Auth doc |
| **Payments** | Stripe Billing + Checkout + Customer Portal | Subscriptions, invoices, Terminal later |
| **Storage** | Cloudflare R2 or AWS S3 | Waiver PDFs, media |
| **CDN** | Cloudflare | Assets + WAF |
| **Images** | Cloudflare Images or imgix / Next Image | Optimization |
| **Email** | Resend or Postmark | Transactional |
| **SMS** | Twilio or MessageBird | Reminders; compliance |
| **Push** | Web Push + FCM/APNs when native | |
| **Analytics** | PostHog (product) + Stripe + warehouse | See Analytics Strategy |
| **Warehouse** | Tinybird or BigQuery/Snowflake later | Owner heavy analytics |
| **Hosting** | Fly.io / Render / AWS ECS / GCP Cloud Run | **Recommendation: AWS or GCP** for franchise path; Vercel for Next frontend |
| **CI/CD** | GitHub Actions | Lint, test, migrate, deploy |
| **Testing** | Vitest + Playwright + k6 | Unit/integ/E2E/load |
| **Monitoring** | Sentry + OpenTelemetry + Grafana/Datadog | Errors, traces, metrics |
| **Logging** | Structured JSON → Axiom/Datadog/Loki | |
| **Feature Flags** | GrowthBook or Unleash or LaunchDarkly | Or in-house table early |
| **Docs / PDF** | Playwright/Puppeteer or React-PDF | Waivers |
| **AI** | OpenAI / Azure OpenAI + tool calling | Phase 9 |

### Stack Decision Record (Summary)

**Choose TypeScript end-to-end** for shared contracts between mobile web and API.  
**Choose Postgres** for compliance-friendly relational integrity.  
**Choose Stripe** — do not build payments.  
**Choose modular monolith** until Kitchen/AI workers prove need for split.

---

## High-Level Context Diagram

```
[Member PWA] [Parent Web] [Staff/Command] [KDS] [Gym TV]
       \          |              |          |      /
        \         |              |          |     /
         v        v              v          v    v
              [API Gateway / NestJS + WebSocket]
                      |
        +-------------+--------------+
        |             |              |
   [Postgres]      [Redis]     [Object Storage]
        |             |
   [Stripe]      [Workers: PDF, Email, SMS, XP, Calendar project, AI]
        |
   [PostHog / Sentry / OTel]
```

---

## Bounded Contexts (Modules)

**Core:** Identity · Tenancy · Members/Card · Documents · Membership · Billing · Calendar Hub · Scheduling/Booking · Attendance/Check-In · Messaging/Announcements/Push  

**Training:** Coaching/Workouts · Boxing Progression · Performance (PBs/milestones)  

**Nutrition:** Meal Planning · Recipes · Grocery · Kitchen Orders  

**Family:** Parent Portal · Kids · Camps · Youth Progress  

**Community:** Feed · Events · Leaderboards  

**Business:** POS adapter · Inventory · Analytics · Marketing · Gym TV · Command Center  

**Future:** AI · Wearables · Smart Equipment · Franchise  

Each module: domain logic, repository, API controllers, events published to bus (in-process initially). Calendar and Displays are **read-model / projection** consumers of many contexts.

---

## Event-Driven Hooks (In-Process → Queue)

Examples: `membership.activated`, `attendance.checked_in`, `waiver.signed`, `payment.failed`, `class.cancelled`, `kitchen.order.ready`, `announcement.posted`, `leaderboard.updated`, `emergency.raised`  

Consumers: XP, notifications, analytics, kitchen promos, **calendar projection**, **TV/Command Center fan-out**.

---

## Environment Strategy

| Env | Purpose |
|-----|---------|
| local | Docker compose: api, db, redis, mailhog |
| staging | Prod-like; Stripe test; seed data |
| production | Multi-AZ DB; restricted secrets |

---

## Scalability Path to Hundreds of Locations

1. Shared DB + RLS + careful indexes  
2. Read replicas for reporting  
3. Shard by org only if needed (late)  
4. CDN for media  
5. Per-location Redis not required initially  
6. Background jobs horizontal workers  
7. Avoid noisy-neighbor: rate limits per org  

---

## Rejected / Deferred Options

| Option | Why not now |
|--------|-------------|
| Microservices day one | Team overhead |
| MongoDB primary | Weak relational fit for billing/attendance |
| Firebase-only | Harder complex entitlements/RLS |
| Custom payment vault | PCI nightmare |
| GraphQL everywhere | Start REST + tRPC/OpenAPI; GraphQL optional later |
