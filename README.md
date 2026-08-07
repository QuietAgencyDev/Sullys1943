# Sully's Digital Performance Platform

Canada's oldest boxing gym (EST 1943) — **website → member portal → gym OS**.

Blueprint: [`/docs`](./docs/README.md)  
Current public site: [sullysboxinggym.com](https://www.sullysboxinggym.com)

## What's running now

| Surface | URL |
|---------|-----|
| Marketing site | http://localhost:3000 |
| Member portal | http://localhost:3000/app/login |
| Join / Visit | http://localhost:3000/join · `/contact` |
| API | http://localhost:4000/api/v1/health |
| Staff shell | http://localhost:3001 |

### Demo logins (password: `password123`)

- `member@sullys.local` — active membership + signed waiver  
- `parent@sullys.local` — linked to child Emma  
- `coach@sullys.local` · `desk@sullys.local`  
- `admin@sullys.local` · `owner@sullys.local` — staff user admin at `/admin/users`

### Working capabilities

Auth (cookie JWT) · memberships/checkout · digital card · QR check-in + XP · calendar · sessions + booking · attendance · waiver PDF · Legacy Wall + Passport · nutrition/kitchen KDS · family/youth · desk scanner · staff invite/disable · Stripe mock or test keys

### Later

Expo iOS/Android member app — see [`docs/08-process/07-mobile-app-path.md`](./docs/08-process/07-mobile-app-path.md)

## Quick start

```bash
npm install
npm run db:sqlite && npm run db:seed
npm run dev:api
npm run dev:web
npm run dev:staff
```

### Database

**SQLite is the default** — fine for demos. Docker Desktop is optional and often fails on PCs without WSL2.

```bash
npm run db:sqlite && npm run db:seed
```

Postgres later (native install or cloud URL): see [`docs/08-process/08-postgres-docker.md`](./docs/08-process/08-postgres-docker.md).

Scanner rehearsal: http://localhost:3001/desk/dry-run · [`docs/08-process/09-scanner-dry-run.md`](./docs/08-process/09-scanner-dry-run.md)

**Floor / Reception TV (2nd screen):** http://localhost:3000/tv/floor · `/tv/reception` (press **F** fullscreen)

**Go live today:** [`docs/05-devops/03-go-live-today.md`](./docs/05-devops/03-go-live-today.md) · TV kit: http://localhost:3000/tv/demo

Stripe key check: `npm run stripe:check`

Stripe test keys (optional): set `STRIPE_SECRET_KEY=sk_test_...` in `apps/api/.env` — see `docs/08-process/06-stripe-test-setup.md`.

## Monorepo

- `apps/web` — Next.js marketing + member portal  
- `apps/api` — NestJS + Prisma (**Postgres** via Docker)  
- `apps/staff` — desk / coach / kitchen / owner / admin  
- `packages/tokens` · `ui` · `types`  
- `docs/` — product/architecture blueprint  
- `infrastructure/docker` — Postgres 16 + Redis 7  
