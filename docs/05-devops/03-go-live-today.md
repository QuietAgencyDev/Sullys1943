# Go-live today (1–3): public link + second screen

You will end with:

- `https://www.YOURDOMAIN.com` — marketing + portal  
- `https://api.YOURDOMAIN.com/api/v1/health` — API  
- `https://www.YOURDOMAIN.com/tv/floor` — second-screen demo  

Detailed stack notes: [02-demo-deploy…](./02-demo-deploy-cloudflare-vercel-railway-neon.md)

---

## A) Buy domain (Cloudflare) — ~10 min

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Domain Registration** → buy (e.g. `sullys.app` / `.ca`).  
2. Keep DNS on Cloudflare.  
3. Leave records empty for now (Vercel/Railway will give targets).

---

## B) Neon Postgres — ~10 min

1. [neon.tech](https://neon.tech) → New project (region close to you).  
2. Copy the **connection string** (`sslmode=require`).  
3. From this repo (any machine with Node):

```bash
node scripts/use-db.mjs postgres
# Edit apps/api/.env → DATABASE_URL=<neon string>
cd apps/api
npx prisma db push
npx tsx prisma/seed.ts
```

---

## C) Railway API — ~15 min

1. [railway.app](https://railway.app) → New Project → **GitHub repo** (or empty + CLI).  
2. Set root / service to **`apps/api`**.  
3. Use build/start from `apps/api/railway.toml` (or paste):

```
Build: npm install && npx prisma generate && npm run build
Start: node dist/main.js
```

4. Variables — copy from `apps/api/.env.production.example` (fill Neon URL + JWT + WEB_ORIGIN).  
5. Settings → Networking → generate domain → add custom **`api.YOURDOMAIN.com`**.  
6. Cloudflare DNS: `CNAME api` → Railway hostname.  
7. Test: `https://api.YOURDOMAIN.com/api/v1/health` and `/api/v1/tv/board?profile=floor`.

---

## D) Vercel Web — ~15 min

1. [vercel.com](https://vercel.com) → Import Git repo.  
2. **Root Directory:** `apps/web`  
3. Env — copy from `apps/web/.env.production.example`:

```
NEXT_PUBLIC_API_URL=https://api.YOURDOMAIN.com
NEXT_PUBLIC_QUIET_AGENCY_URL=https://quietagency.co
```

4. Deploy → Domains → add `www.YOURDOMAIN.com` (+ apex).  
5. Cloudflare: `CNAME www` → Vercel DNS target.  
6. Smoke:

- `/` (logo + gym photos)  
- `/coaches`  
- `/tv/demo`  
- `/tv/floor` (press **F**; round timer)  
- `/join`  
- `/app` after `member@sullys.local` / `password123`  
- `/app/book` (week strip + waitlist when full)  
- See also [05-aaa-pack-ready.md](./05-aaa-pack-ready.md)

---

## E) Second-screen demo kit — 2 min

1. Open `https://www.YOURDOMAIN.com/tv/demo` on your laptop.  
2. On the spare monitor / Fire TV / Chromecast, open **Floor TV**.  
3. Press **F**. Walk the room with marketing + join on the laptop.

Local preview (before DNS): http://localhost:3000/tv/demo

---

## Blockers only you can click

| Need | Who |
|------|-----|
| Pay for domain | You (Cloudflare) |
| Create Neon / Railway / Vercel accounts | You (free tiers OK) |
| Connect GitHub to Vercel/Railway | You |
| Paste production secrets | You |

Once those accounts exist, paste the three URLs (web / api / domain) back here and we can harden cookies, CORS, and Stripe next.
