# $20 CAD demo go-live — Quiet Agency owns the stack

**Budget:** ~CAD $20  
**Goal:** Public demo URL + domain, owned by **Quiet Agency** for Sully’s.  
**Hosting:** free tiers only (domain is the paid piece).

**Prerequisite:** AAA pack is code-complete — see [05-aaa-pack-ready.md](./05-aaa-pack-ready.md) before buying the domain.

---

## Money math (approx.)

| Item | Cost | Notes |
|------|------|--------|
| Domain `.com` on Cloudflare Registrar | **~USD $10–11** (~CAD $14–16) | At-cost; renews same ballpark next year |
| DNS / SSL / CDN | **$0** | Included with Cloudflare |
| Vercel (web) Hobby | **$0** | `apps/web` |
| Neon Postgres free | **$0** | Demo DB |
| Railway Hobby / trial | **$0** (watch usage) | `apps/api` — stay on free credits |
| **Total year 1** | **≈ CAD $15–20** | Fits a $20 CAD card |

**Do not buy:** paid Vercel Pro, paid Railway plan, or a premium domain (those blow the budget).

**Note:** Cloudflare Registrar bills in **USD**. A $20 CAD prepaid card usually covers one `.com` with a few dollars left. If checkout fails on FX, add ~$5 or use a card that can charge USD.

Cloudflare **does not register new `.ca`** domains — use `.com` / `.app` / `.dev` here, or buy `.ca` elsewhere later and point DNS at Cloudflare.

---

## Ownership (Quiet Agency holds the keys)

Create accounts with a **Quiet Agency** email (e.g. `ops@quietagency.co` or Google Workspace), not a personal Gmail you’ll lose.

| Account | Who owns | Purpose |
|---------|----------|---------|
| Cloudflare | Quiet Agency | Domain + DNS |
| GitHub org / repo access | Quiet Agency | Deploy source |
| Vercel team | Quiet Agency | Next.js site |
| Railway project | Quiet Agency | Nest API |
| Neon project | Quiet Agency | Postgres |

Registrant / WHOIS should show **Quiet Agency** (privacy redaction on). Document internally: “Held by Quiet Agency for Sully’s Boxing Gym demo.”

---

## Domain picks (cheap + on-brand)

Check availability in Cloudflare **Domain Registration** before paying. Prefer short:

1. `sullysboxing.com` (if free)  
2. `sullysgym.com`  
3. `trainsullys.com`  
4. `sullysdemo.com`  
5. `sullysapp.com`  

Avoid trademark fights with unrelated brands. If the perfect name is taken/expensive, take a clean `*demo.com` for the $20 launch and upgrade later.

---

## Exact click path (60–90 min)

### 1) Quiet Agency Cloudflare account
1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) with Quiet Agency email.  
2. Enable 2FA.  
3. Add a payment method that can settle **USD** (~CAD $20 budget).

### 2) Buy the domain (~CAD $15)
1. Cloudflare → **Domain Registration** → search → **Purchase**.  
2. Keep nameservers on Cloudflare (default).  
3. Turn on **WHOIS redaction** if offered.

### 3) Free backend (Neon + Railway)
1. Neon → new project → copy `DATABASE_URL`.  
2. From this repo: switch to Postgres, set Neon URL, `prisma db push`, seed.  
3. Railway → deploy `apps/api` with env from `apps/api/.env.production.example`.  
4. Custom domain later: `api.YOURDOMAIN.com`.

### 4) Free frontend (Vercel)
1. Vercel → import repo → root `apps/web`.  
2. Env:
   - `NEXT_PUBLIC_API_URL=https://api.YOURDOMAIN.com`
   - `NEXT_PUBLIC_QUIET_AGENCY_URL=https://quietagency.co`
3. Attach `www.YOURDOMAIN.com` (+ apex).  
4. Cloudflare DNS: CNAME `www` → Vercel target; CNAME `api` → Railway.

### 5) Show people
- Site: `https://www.YOURDOMAIN.com`  
- Floor TV: `https://www.YOURDOMAIN.com/tv/floor`  
- Manuals: `https://www.YOURDOMAIN.com/manuals`

Full checklist: [03-go-live-today.md](./03-go-live-today.md)

---

## If $20 is tight at checkout

1. Buy **only the domain** today on Cloudflare.  
2. Use free `*.vercel.app` + `*.up.railway.app` URLs for the demo **this week**.  
3. Point the custom domain at Vercel/Railway when you’re ready (DNS only — no extra fee).

---

## After you pay

Reply with:

1. The domain you bought  
2. Whether Neon / Railway / Vercel accounts are created under Quiet Agency  

Then we wire DNS + env to that exact hostname.
