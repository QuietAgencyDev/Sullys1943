# Railway API setup — sullys1943.com

**Repo:** `QuietAgencyDev/Sullys1943`  
**Service root:** `apps/api`  
**Public URL goal:** `https://api.sullys1943.com`

## After GitHub login on Railway

1. **New project** → **GitHub Repository** → select **`Sullys1943`**  
   - If missing: Configure GitHub App → grant access to **QuietAgencyDev** org + `Sullys1943`.

2. **Root Directory** (critical for monorepo):  
   Settings → **Root Directory** = **empty / repo root** (do **not** set `apps/api`).  
   Build uses root `railway.toml` → `apps/api/prisma/schema.prisma`.

3. **Variables** → add:

```
DATABASE_URL=<same Neon URL you used for seed>
JWT_SECRET=<long random string, not the local dev secret>
PORT=4000
NODE_ENV=production
WEB_ORIGIN=https://www.sullys1943.com
STAFF_ORIGIN=https://staff.sullys1943.com
CORS_ORIGINS=https://www.sullys1943.com,https://sullys1943.com,https://staff.sullys1943.com
```

4. Deploy uses `apps/api/railway.toml`:
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `node dist/main.js`
   - Health: `/api/v1/health`

5. **Networking** → Generate domain (temporary `*.up.railway.app`) → then **Custom domain** `api.sullys1943.com`.

6. Cloudflare DNS → CNAME `api` → Railway target (**DNS only / grey cloud**).

7. Smoke: `https://api.sullys1943.com/api/v1/health`

## Note on monorepo install

If build fails on workspace hoisting, set Railway root to repo root and override:

```
Build: npm install && npm exec -w @sullys/api -- prisma generate && npm run build -w @sullys/api
Start: node apps/api/dist/main.js
```

Prefer root `apps/api` first; only switch if deploy logs show missing workspace packages.
