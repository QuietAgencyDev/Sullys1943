# Cheap demo deploy — “here’s the link” (< ~$25/mo)

**Stack:** Cloudflare DNS → Vercel (`web` + optional `staff`) → Railway (Nest API) → Neon (Postgres free)

Goal today: a public URL you can send people, with Floor/Reception TV working on a second screen.

---

## 0) Accounts (free tiers)

1. [Cloudflare](https://dash.cloudflare.com) — domain DNS  
2. [Vercel](https://vercel.com) — Next.js  
3. [Railway](https://railway.app) — Nest API  
4. [Neon](https://neon.tech) — Postgres  

Buy domain on Cloudflare (~$10–15/yr for `.com` / `.ca`).

Suggested hostnames:

| Host | Points to |
|------|-----------|
| `www.yourdomain.com` | Vercel web |
| `api.yourdomain.com` | Railway API |
| `staff.yourdomain.com` | Vercel staff (optional later) |
| `tv.yourdomain.com` | Same Vercel project, path `/tv/floor` (or rewrite) |

---

## 1) Neon Postgres

1. Create project → copy connection string (`postgresql://…?sslmode=require`).  
2. Locally (or from any machine with the repo):

```bash
node scripts/use-db.mjs postgres
# set apps/api/.env DATABASE_URL to the Neon URL
cd apps/api && npx prisma db push && npx tsx prisma/seed.ts
```

---

## 2) Railway — API

1. New project → Deploy from GitHub (monorepo) **or** empty + local CLI.  
2. Root directory / watch path: `apps/api`  
3. Build command:

```bash
npm install && npx prisma generate && npm run build
```

4. Start command:

```bash
node dist/main.js
```

5. Env vars:

```env
DATABASE_URL=<neon url>
JWT_SECRET=<long random>
WEB_ORIGIN=https://www.yourdomain.com
STAFF_ORIGIN=https://staff.yourdomain.com
PORT=4000
# optional later
# STRIPE_SECRET_KEY=sk_test_...
```

6. Generate Railway domain, then attach custom `api.yourdomain.com` in Cloudflare (CNAME).

Health check: `https://api.yourdomain.com/api/v1/health`

---

## 3) Vercel — Web

1. Import monorepo → set **Root Directory** to `apps/web`  
2. Framework: Next.js  
3. Env:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_QUIET_AGENCY_URL=https://quietagency.co
```

4. Deploy → attach `www.yourdomain.com` (and apex via Cloudflare).

Smoke:

- `https://www.yourdomain.com`  
- `https://www.yourdomain.com/tv/floor` (second screen)  
- `https://www.yourdomain.com/tv/reception`  
- `https://www.yourdomain.com/join`

---

## 4) Cloudflare DNS (typical)

| Type | Name | Target |
|------|------|--------|
| CNAME | `www` | `cname.vercel-dns.com` |
| CNAME | `api` | `*.up.railway.app` (Railway gives exact host) |
| A/AAAA or CNAME | `@` | per Vercel apex docs |

Enable Cloudflare proxy (orange cloud) once SSL is happy.

---

## 5) Second screen at the gym / demo

1. Chrome / Fire TV / Chromecast / spare monitor  
2. Open `https://www.yourdomain.com/tv/floor`  
3. Press **F** for fullscreen  
4. Reception lobby: `/tv/reception`

No login required on TV boards (first names / initials only).

---

## 6) Quiet Agency credit

Footer links to Quiet Agency (`https://quietagency.co`) for web/system development credit.  
Override with `NEXT_PUBLIC_QUIET_AGENCY_URL` in Vercel if needed.

---

## Cost ballpark

| Service | Demo |
|---------|------|
| Domain | ~$1–2/mo amortized |
| Vercel Hobby | $0 |
| Railway trial/hobby | ~$0–5 |
| Neon free | $0 |
| **Total** | **usually under $25/mo** |

---

## End-of-day checklist

- [ ] Domain on Cloudflare  
- [ ] Neon DB pushed + seeded  
- [ ] Railway API health green  
- [ ] Vercel web live with `NEXT_PUBLIC_API_URL`  
- [ ] `/tv/floor` opens on a second screen  
- [ ] Quiet Agency link correct in footer  
