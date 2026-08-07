# Database options (Docker optional)

## If Docker Desktop says it can’t run on your PC

That’s common when:

- **WSL 2** is not installed / not enabled  
- **Virtualization** is off in BIOS (Intel VT-x / AMD-V)  
- The PC is older, low-RAM, or a managed/locked image  

**You do not need Docker to keep building Sully’s.** Local **SQLite** is the supported default and already runs the full demo.

```bash
npm run db:sqlite
npm run db:seed
npm run dev:api
```

## Option A — Stay on SQLite (recommended for now)

Best for: marketing site, member portal, desk scanner dry-run, staff admin, mock billing.

Production can still be Postgres later; Prisma schema toggles with:

```bash
npm run db:sqlite     # local default
npm run db:postgres   # only after Postgres is actually reachable
```

## Option B — Native Postgres (no Docker)

1. Install [PostgreSQL 16 for Windows](https://www.postgresql.org/download/windows/) (or `winget install PostgreSQL.PostgreSQL.16` when winget works).  
2. Create a DB/user, e.g. user/password/db `sullys`.  
3. Point API env:

```env
DATABASE_URL="postgresql://sullys:sullys@localhost:5432/sullys"
```

4. Switch Prisma + push + seed:

```bash
node scripts/use-db.mjs postgres
npm run db:push
npm run db:seed
```

## Option C — Free cloud Postgres

Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) free tier → paste the connection string into `apps/api/.env` as `DATABASE_URL` → `node scripts/use-db.mjs postgres` → `npm run db:push && npm run db:seed`.

## Option D — Fix Docker later (optional)

Only if you want containers:

1. Install **WSL 2**: `wsl --install` in an admin PowerShell, reboot.  
2. Enable virtualization in BIOS if the installer asks.  
3. Retry Docker Desktop, then `npm run db:postgres`.

Compose file remains at `infrastructure/docker/docker-compose.yml` for when a machine supports it.
