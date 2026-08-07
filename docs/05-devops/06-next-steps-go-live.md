# Next steps — Quiet Agency public go-live

**Domain bought:** `sullys1943.com` (Quiet Agency Cloudflare)  
**DNS UI:** https://dash.cloudflare.com/3c6e70786012f0eaa348023e095546e8/sullys1943.com/dns/records  
**GitHub:** https://github.com/QuietAgencyDev/Sullys1943  

Full domain worksheet: [08-sullys1943-domain.md](./08-sullys1943-domain.md)

## Done

- [x] AAA pack (local)
- [x] GitHub push → QuietAgencyDev/Sullys1943
- [x] Cloudflare account + domain `sullys1943.com`

## Do next (in order)

### 1) Neon Postgres
https://neon.tech → New project → copy connection string (`sslmode=require`)

### 2) Railway API
https://railway.app → New project from `QuietAgencyDev/Sullys1943` → root **`apps/api`**  
Env from `apps/api/.env.production.example` (already filled for sullys1943.com)  
Custom domain: **`api.sullys1943.com`**

### 3) Vercel Web
https://vercel.com → Import `QuietAgencyDev/Sullys1943` → root **`apps/web`**  
Env from `apps/web/.env.production.example`  
Domains: **`www.sullys1943.com`** + **`sullys1943.com`**

### 4) Cloudflare DNS
Add CNAMEs using the **exact** targets Vercel/Railway show — see [08-sullys1943-domain.md](./08-sullys1943-domain.md).

### 5) Seed Neon + smoke
`prisma db push` + `seed` against Neon, then hit:
- https://www.sullys1943.com  
- https://api.sullys1943.com/api/v1/health  

## Unblock Cursor

Reply with:

```
Neon DATABASE_URL=...
Railway ready: yes
Vercel ready: yes
```

Or: **Install CLIs and I’ll log in**
