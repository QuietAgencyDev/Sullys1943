# Monorepo Folder Structure

Recommended **pnpm + Turborepo** monorepo.  
Product modules: see [Modular Product Architecture](../02-domain/18-modular-architecture.md).

```
sullys/
├── apps/
│   ├── web/                 # Next.js: marketing + member/parent app
│   ├── staff/               # Desk, coach, owner, admin, Command Center kiosk mode
│   ├── kds/                 # Kitchen display
│   ├── tv/                  # Gym TV fullscreen displays
│   ├── mobile/              # Future Capacitor/RN wrapper
│   └── api/                 # NestJS API (modular monolith)
├── packages/
│   ├── ui/                  # Design system components
│   ├── tokens/              # Color, type, space tokens
│   ├── config-eslint/
│   ├── config-ts/
│   ├── config-tailwind/
│   ├── types/               # Shared DTO/zod schemas
│   ├── api-client/          # Generated OpenAPI client
│   ├── domain-events/       # Event name constants
│   ├── calendar-kinds/      # Shared calendar item kind enums
│   └── utils/
├── services/                # Optional extracted workers later
│   ├── worker/              # BullMQ consumers
│   └── ai-orchestrator/
├── docs/                    # This blueprint
├── infrastructure/
│   ├── terraform/           # or sst/cdk
│   ├── docker/
│   └── github-actions/
├── scripts/
├── .github/workflows/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## API Internal Structure (`apps/api`)

Organized to mirror Core / Training / Nutrition / Family / Community / Business / Future:

```
apps/api/src/
├── main.ts
├── app.module.ts
├── config/
├── common/                  # guards, pipes, filters, logging
├── database/                # prisma/drizzle, rls middleware
├── modules/
│   ├── identity/            # Core — Authentication
│   ├── tenancy/
│   ├── members/             # Core — Members / profiles / digital card
│   ├── documents/           # Core — Digital Waivers
│   ├── membership/
│   ├── billing/             # Core — Billing
│   ├── calendar/            # Core — Unified Calendar Hub (projections)
│   ├── scheduling/          # Core — Booking substrate
│   ├── attendance/          # Core — Check-In
│   ├── messaging/           # Core — Messaging + announcements hooks
│   ├── coaching/            # Training — Coach Portal / workouts
│   ├── gamification/        # Training — Boxing Progression
│   ├── performance/         # Training — PBs / milestones
│   ├── nutrition/           # Nutrition
│   ├── kitchen/             # Nutrition — Kitchen Orders
│   ├── family/              # Family — Parent portal helpers
│   ├── community/           # Community — Feed
│   ├── events/              # Community — Events
│   ├── store/
│   ├── inventory/           # Business
│   ├── analytics/           # Business — Reports
│   ├── displays/            # Business — Gym TV + Command Center feeds
│   ├── admin/
│   ├── marketing/
│   └── ai/                  # Future
├── jobs/
└── integrations/            # stripe, twilio, storage, pos adapters
```

Each module:
```
module/
  *.module.ts
  api/           # controllers
  application/   # use cases
  domain/        # entities, policies
  infrastructure/# repos, external
```

---

## Web App Routes (Sketch)

```
apps/web/app/
  (marketing)/
  (auth)/
  (member)/
    home/
    calendar/            # Training hub (primary)
    card/                # Digital membership card + QR
    check-in/
    nutrition/
    kitchen/
    progression/         # Boxing ranks / skills
    rewards/
    community/
    events/
    messages/
    profile/
    payments/
  (parent)/
    children/
    calendar/
    attendance/
    progress/
    waivers/
    camps/
    messages/
```

```
apps/staff/app/
  desk/                  # Front desk + Command Center view
  coach/calendar/
  coach/roster/
  owner/calendar/
  owner/analytics/
  admin/
```

```
apps/tv/app/
  [profile]/              # lobby | training_floor | kids_area | kitchen_window
```

---

## Database Migrations

```
apps/api/prisma/migrations/
# or drizzle/
```

Never edit applied migrations.

---

## Documentation Coupling

Keep `/docs` updated when:
- New module added
- Permission added
- External integration added
- Phase exit criteria change
- Calendar item kinds added
