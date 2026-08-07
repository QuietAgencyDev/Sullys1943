# Website & Public Platform

**Status:** Blueprint v1.2  
**Current site:** [https://www.sullysboxinggym.com](https://www.sullysboxinggym.com) — preserve essentials (about, classes, history, contact); rebuild as the **public face** of the Digital Performance Platform.  
**Stack:** Same Next.js monorepo `apps/web` marketing routes; live widgets call public/read APIs from the Gym OS.

---

## Role of the Website

| Today (typical) | Target |
|-----------------|--------|
| Static info brochure | Premium sports-org digital front door |
| Phone to join | Full online join → waiver → pay → book → QR card |
| Separate from ops | Same DB as app, desk, TVs |

The website **recruits and tells the legacy story**. The app **powers the inside**. Both are one product.

---

## Homepage Redesign

### Hero (first viewport — brand first)
- Full-bleed **video background** (edge-to-edge): heavy bags, slow-motion sparring, kids training, fight team, kitchen, community  
- Hero-level **Sully's badge / wordmark** (not nav-only)  
- One headline + one supporting line + CTA group  

Suggested copy direction:

> **Canada's Oldest Boxing Gym**  
> Established 1943 · Building Champions For Over 80 Years  

CTAs: **Join Now** · **Book a Trial** · **Explore the Legacy**

Avoid first-viewport clutter (no stats strips competing with brand — counters come in the next section).

### Proof section — animated counters
| Stat | Label (editable CMS) |
|------|----------------------|
| 80+ | Years |
| 20,000+ | Members Trained |
| 100+ | Championships |
| Thousands | Lives Changed |

Numbers are CMS-configurable; animate once on scroll (respect reduced motion).

### Live website features (not static pages only)

#### Current Classes (live)
```
12:00 PM  Beginner Boxing     8 Spots Left
6:00 PM   Competitive Team    Full
7:00 PM   Women's Boxing      5 Spots Left
```
- Pulls from same `sessions` API as the app  
- Spot counts update on booking/check-in  
- Deep link → login/register → book  

#### Live Events
- Fight Night, Cooking Class, Nutrition Seminar, Kids Camp, Guest Coach  
- Registration closes automatically per event rules  
- Same Events module as in-app  

### Legacy teaser
- Strip into [Legacy Wall](./20-legacy-experience.md) / Hall of Fame  
- Famous alumni (Ali, Lewis, Chuvalo, Gray, Bull, Ruddock, …) with consent/rights review  

### Kitchen / Community / Kids teaser blocks
- One job per section; photography from real gym  

---

## Online Join Flow (Website → Platform)

```
New visitor
  → Choose Membership (or Trial)
  → Digital Waiver
  → Payment (Stripe)
  → App download / PWA prompt
  → First Class Booking
  → QR Membership Card created
  → Welcome Email + Push
  → Welcome XP (when Progression live)
```

Must meet [Day-One Member Experience](./15-day-one-member-experience.md) acceptance criteria.  
Staff desk can complete the same flow for walk-ins on tablet.

---

## Information Architecture (Public)

| Route | Purpose |
|-------|---------|
| `/` | Hero video, counters, live classes/events, CTAs |
| `/legacy` | Legacy Wall timeline |
| `/trophy-room` or `/hall-of-fame` | Digital Trophy Room |
| `/coaches` | Coach profiles (synced with app) |
| `/classes` | Programs + live schedule embed |
| `/events` | Upcoming ticketed/special |
| `/kids` | Youth programs + parent CTA |
| `/nutrition` / `/kitchen` | Public menu highlights (optional) |
| `/memberships` | Plans + join |
| `/contact` | Location, hours, map |
| `/join` | Funnel entry |

Authenticated routes under `/app` or `app.` subdomain for member portal.

---

## Website ↔ Ecosystem Sync

```
Website ⇄ App ⇄ Front Desk ⇄ TVs ⇄ Kitchen ⇄ Coach Tablets ⇄ Owner Dashboard
                         one database / one realtime bus
```

Public endpoints are **read-optimized** and rate-limited; never expose PII on public live widgets.

---

## SEO / Content / Rights

- Preserve strong history/contact SEO equity where possible during redesign  
- Alumni names/photos: legal/media rights review  
- Bilingual readiness (EN/FR) for Canadian audience  

---

## Phase Mapping

| Capability | Priority | Phase |
|------------|----------|-------|
| Marketing redesign shell + brand hero | Must | 1–2 |
| Join / trial / waiver / pay on web | Must | 2 |
| Live class spots + events | Must | 3 |
| Counters + video hero | Should | 1–2 |
| Legacy Wall / Trophy Room public | Should/Could | 4–8 |
| Deep live kitchen public menu | Could | 6 |

---

## Change Log

- **2026-08-07:** Website specified as public face of Digital Performance Platform; live widgets + join funnel.
