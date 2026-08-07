# Vercel web — www.sullys1943.com

**Account:** Quiet Agency Vercel  
**Repo:** `QuietAgencyDev/Sullys1943`  
**Root Directory:** `apps/web`  
**API:** `https://api.sullys1943.com`

## Import steps

1. Vercel → **Add New… → Project**
2. **Continue with GitHub** → authorize **QuietAgencyDev** org + `Sullys1943`
3. **Import** `Sullys1943`
4. Configure:
   - **Framework Preset:** Next.js (auto)
   - **Root Directory:** `apps/web` (Edit → select)
   - **Build Command:** default (`next build` via app package)
   - **Install Command:** leave default (workspace install from repo — if fail, set `cd ../.. && npm install`)
5. **Environment Variables** (Production + Preview):

```
NEXT_PUBLIC_API_URL=https://api.sullys1943.com
NEXT_PUBLIC_QUIET_AGENCY_URL=https://quietagency.co
```

6. **Deploy**

## Domains

1. Project → **Settings → Domains**
2. Add `www.sullys1943.com`
3. Add `sullys1943.com` (redirect to www if Vercel offers it)
4. Cloudflare DNS (use exact values Vercel shows), typically:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `www` | `cname.vercel-dns.com` | Proxied OK |
| A or CNAME | `@` | per Vercel UI | Proxied OK |

## Smoke

- https://www.sullys1943.com
- https://www.sullys1943.com/coaches
- https://www.sullys1943.com/tv/floor
- https://www.sullys1943.com/app/login → `member@sullys.local` / `password123`

## Note

Do **not** fix `@sullys/web` on Railway — Vercel owns the public site. Railway stays for API (+ optional staff).
