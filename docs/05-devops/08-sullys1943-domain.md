# Domain: sullys1943.com (Quiet Agency Cloudflare)

**Zone:** [Cloudflare DNS → sullys1943.com](https://dash.cloudflare.com/3c6e70786012f0eaa348023e095546e8/sullys1943.com/dns/records)  
**Repo:** https://github.com/QuietAgencyDev/Sullys1943  
**Owner:** Quiet Agency

Public URLs when live:

| Role | URL |
|------|-----|
| Marketing + member portal | https://www.sullys1943.com |
| Apex redirect (optional) | https://sullys1943.com → www |
| API | https://api.sullys1943.com |
| API (Railway public) | https://sullysapi-production.up.railway.app |
| API (Railway CNAME target) | `69a3ykoh.up.railway.app` → use for Cloudflare `api` |
| Floor TV | https://www.sullys1943.com/tv/floor |
| Staff (later) | https://staff.sullys1943.com |

---

## Order of operations

Do **not** invent CNAME targets yet — Vercel and Railway give you the exact hostnames.

1. **Neon** — create Postgres, copy connection string  
2. **Railway** — deploy `apps/api` from GitHub, set env, get Railway hostname, add custom domain `api.sullys1943.com`  
3. **Vercel** — import repo, root `apps/web`, set env, add domains `www.sullys1943.com` + `sullys1943.com`  
4. **Cloudflare DNS** — paste the records below using the targets Vercel/Railway show  
5. Smoke checklist in [05-aaa-pack-ready.md](./05-aaa-pack-ready.md)

---

## Cloudflare DNS records (fill targets after hosts exist)

In the DNS page you opened, add:

| Type | Name | Target (example — use exact value from host) | Proxy |
|------|------|-----------------------------------------------|-------|
| CNAME | `www` | `cname.vercel-dns.com` *(or the value Vercel shows)* | Proxied (orange) OK |
| CNAME | `@` | `cname.vercel-dns.com` *(Vercel apex instruction)* | Proxied OK, or follow Vercel A-record if they require it |
| CNAME | `api` | `<your-service>.up.railway.app` *(Railway custom domain target)* | **DNS only** (grey cloud) recommended for API |

Notes:

- Prefer **DNS only (grey)** for `api` to avoid Cloudflare proxy oddities with Railway TLS.  
- Vercel often wants a specific CNAME or A record for apex — copy whatever Vercel Domains UI prints; don’t guess.  
- Leave MX alone unless you add email later.

---

## Production env (copy-paste)

### Railway (`apps/api`)

```
DATABASE_URL=<neon-connection-string>?sslmode=require
JWT_SECRET=<long-random-string>
PORT=4000
NODE_ENV=production
WEB_ORIGIN=https://www.sullys1943.com
STAFF_ORIGIN=https://staff.sullys1943.com
CORS_ORIGINS=https://www.sullys1943.com,https://sullys1943.com,https://staff.sullys1943.com
```

Then on the Neon DB (from any machine with Node):

```bash
# point apps/api/.env DATABASE_URL at Neon temporarily
cd apps/api
npx prisma db push
npx tsx prisma/seed.ts
```

### Vercel (`apps/web`)

```
NEXT_PUBLIC_API_URL=https://api.sullys1943.com
NEXT_PUBLIC_QUIET_AGENCY_URL=https://quietagency.co
```

Root Directory: **`apps/web`**  
Git: **`QuietAgencyDev/Sullys1943`** · branch `main`

---

## Smoke after DNS is green

- https://www.sullys1943.com  
- https://api.sullys1943.com/api/v1/health  
- https://www.sullys1943.com/coaches  
- https://www.sullys1943.com/tv/floor  
- https://www.sullys1943.com/app — `member@sullys.local` / `password123`

---

## Reply to keep deploying from Cursor

Paste any of these when ready:

```
Neon DATABASE_URL=...
Railway API hostname=...
Vercel project created: yes/no
```

Or: **“Install CLIs and I’ll log in”** for `vercel` / `railway` on this machine.
