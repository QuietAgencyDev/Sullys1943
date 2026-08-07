# Next steps — Quiet Agency public go-live

AAA pack is **verified locally**. Cloud CLIs (`vercel`, `railway`, `neonctl`, `gh`) are **not installed / not logged in** on this machine, so the remaining work is account + DNS ownership.

## Done (local)

- [x] Member home `/app`
- [x] Booking week strip + waitlist promote
- [x] Forgot / reset password
- [x] Public `/coaches`
- [x] TV last-good cache + offline banner
- [x] Branded empties / honest errors
- [x] PWA manifest + icons
- [x] Manuals regenerated (v1.1 AAA)
- [x] Smoke: health, portal home, coaches, sessions, forgot-password, gym photos, icons

## Your move (in order) — ~45–60 min

### 1) Quiet Agency accounts (once) — start here

Create with a Quiet Agency email (not a personal throwaway):

| # | Account | URL |
|---|---------|-----|
| 1 | **GitHub org + `SULLYS` repo** | see [07-quiet-agency-github-vercel.md](./07-quiet-agency-github-vercel.md) |
| 2 | **Vercel team** (Quiet Agency) | https://vercel.com |
| 3 | Cloudflare | https://dash.cloudflare.com |
| 4 | Neon | https://neon.tech |
| 5 | Railway | https://railway.app |

This workspace has **no commits/remote yet** — first push should go straight into the Quiet Agency org.

### 2) Buy domain (~CAD $15–20)

Cloudflare → Domain Registration → `.com` / `.app` / `.dev`  
Keep DNS on Cloudflare. See [04-budget-20cad-quiet-agency.md](./04-budget-20cad-quiet-agency.md).

### 3) Neon Postgres

1. New project → copy connection string (`sslmode=require`)
2. Locally (or CI machine):

```bash
node scripts/use-db.mjs postgres
# set apps/api/.env DATABASE_URL=<neon>
cd apps/api
npx prisma db push
npx tsx prisma/seed.ts
```

### 4) Railway API

1. New project from GitHub → root `apps/api`
2. Variables from `apps/api/.env.production.example` (Neon URL, JWT, WEB_ORIGIN)
3. Public domain → `api.YOURDOMAIN.com`
4. Cloudflare DNS: `CNAME api` → Railway host

### 5) Vercel Web

1. Import repo → root `apps/web`
2. Env from `apps/web/.env.production.example`
3. Domains: `www.YOURDOMAIN.com` (+ apex)
4. Cloudflare: `CNAME www` → Vercel

### 6) Smoke (public)

Use the checklist in [05-aaa-pack-ready.md](./05-aaa-pack-ready.md) + [03-go-live-today.md](./03-go-live-today.md).

## Optional after first URL is live

- Staff app on Vercel (`apps/staff`) → `staff.YOURDOMAIN.com`
- Stripe test keys on Railway
- Turn off non-prod reset-link display (already gated by `NODE_ENV=production`)
- Custom domain email later (not required for demo)

## Unblock this agent to deploy for you

Reply with any of:

1. **“Deploy with these creds”** — Neon connection string + confirm Railway/Vercel/Cloudflare logged in (or paste deploy tokens)
2. **“Install CLIs and I’ll log in”** — we install `vercel` / `railway` / wrap Neon, you complete browser auth
3. **Domain name chosen: `_____`** — we pre-fill DNS record templates for that name

Until then, keep demoing locally:

```bash
npm run dev:api
npm run dev:web
# member@sullys.local / password123
```
