# Competitive Fighter Verification (BoxRec / Boxing Ontario)

Isolated member Profile kit. Do **not** merge into auth or a general user-update route.

| Layer | Path |
|-------|------|
| Prisma columns | `apps/api/prisma/schema.prisma` |
| SQL | `apps/api/prisma/migrations/20260811_fighter_verification/migration.sql` |
| API | `apps/api/src/fighter-verification.controller.ts` (registered in `app.module.ts`) |
| UI | this folder — mounted on `/app/profile` |

Endpoints: `GET /api/v1/fighter-verification/me`, `PATCH /api/v1/fighter-verification`.
