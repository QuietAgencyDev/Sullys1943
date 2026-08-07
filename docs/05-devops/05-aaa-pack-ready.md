# AAA pack ready → Quiet Agency go-live

The **AAA polish pack** is implemented locally. Public deploy is the next human step under Quiet Agency ownership (~CAD $20 domain + free tiers).

## Pack complete (verify before DNS)

| Area | Check |
|------|--------|
| Member home | `/app` — next class, card, membership/waiver, Book CTA |
| Booking + waitlist | `/app/book` — week strip, waitlist when full, cancel promotes |
| Auth | `/app/login` sandbox hint; `/app/forgot-password` + `/app/reset-password` |
| Coaches | `/coaches` — seeded bios + gym photos |
| TV | `/tv/floor` — last-good `localStorage` + offline banner; round timer |
| Empties | Calendar / book / family / messages show honest errors + CTAs |
| PWA | `/manifest.webmanifest` + `/icons/icon-192.png` / `icon-512.png` |
| Visual | Logo + `/gym/*` photos load on home, TV, coaches |

Demo login: `member@sullys.local` / `password123`

## Deploy (Quiet Agency)

Follow in order:

1. **[06-next-steps-go-live.md](./06-next-steps-go-live.md)** — current checklist + what to send this agent  
2. [04-budget-20cad-quiet-agency.md](./04-budget-20cad-quiet-agency.md) — accounts + domain budget  
3. [03-go-live-today.md](./03-go-live-today.md) — Neon → Railway API → Vercel web → Cloudflare DNS  

Smoke after DNS (add to go-live list):

- `/` brand + gym photos  
- `/coaches`  
- `/app` (member home) after login  
- `/app/book` waitlist path  
- `/app/forgot-password` (non-prod shows reset link)  
- `/tv/floor` then kill API briefly → offline banner + cached board  

## Blocked until

Quiet Agency Cloudflare / Neon / Railway / Vercel credentials and a purchased domain. Code path is ready; no further feature work required for first public demo.
