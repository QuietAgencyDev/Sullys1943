# Modular Product Architecture

**Status:** Blueprint v1.2  
**Runtime:** Modular monolith (see Technical Architecture) until scale forces extraction.  
**Product framing:** [Digital Performance Platform](./00-digital-performance-platform.md)

---

## Sully's Gym Platform

```
Sully's Digital Performance Platform

Public
├── Marketing Website          ← sullysboxinggym.com redesign
├── Live Schedule / Events widgets
├── Online Join Funnel
└── Legacy Wall (public)

Core
├── Authentication
├── Members
├── Calendar                   ← training hub (member / coach / owner)
├── Booking
├── Billing
├── Check-In
├── Digital Waivers
├── Digital Membership Card
├── Announcements
└── Push / Messaging

Training
├── Workouts
├── Boxing Progression         ← XP, ranks, skill trees, PBs, milestones
├── Boxing Passport
├── Coach Portal
└── Performance Tracking

Nutrition
├── Meal Planning
├── Kitchen Orders
├── Recipes
└── Grocery Lists

Family
├── Parent Portal
├── Kids Program
├── Camps
└── Youth Progress

Community
├── Feed
├── Events
├── Messaging
├── Leaderboards
├── Legacy Wall / Trophy Room / Hall of Fame

Business
├── POS
├── Inventory
├── Analytics / BI
├── Reports
├── Marketing
├── Gym TV Network (Reception, Floor, Kitchen, Kids, Owner)
├── Digital Signage Engine
└── Gym Command Center

Future
├── Sully AI
├── Wearables
├── Smart Equipment
└── Franchise Management (multi-location rollup)
```

---

## Module Independence Rules

1. **Core** has no dependency on Community UGC, Legacy CMS depth, or AI.  
2. **Public website** may read Core + Events + Legacy public content only.  
3. Cross-module integration via **domain events** + Calendar + Display projections.  
4. Feature flags gate every non-Core module.  
5. Franchise locations share modules; data scoped by `location_id` with HQ rollup.

---

## Mapping to Monorepo

| Product module | API / app | Surfaces |
|----------------|-----------|----------|
| Public website | `apps/web` marketing | Browser |
| Core.* | identity, membership, calendar, attendance… | App, desk |
| Legacy | `legacy` module | Web, app, TV “on this day” |
| Displays | `displays` | `apps/tv`, Command Center |
| Sully AI | `ai` | App, desk, owner |
| Franchise | tenancy + analytics rollup | HQ console |

---

## Beyond Glofox (Doesn't Exist There)

| Pillar | Capabilities |
|--------|----------------|
| 🏛 Legacy | Interactive history, HoF, championship archive, coach bios, alumni, Boxing Passport |
| 🎮 Gamification | XP, seasonal rankings, prestige levels, daily challenges, rare achievements, digital trophies |
| 🍽 Nutrition | Kitchen, ordering, subscriptions, cooking classes, nutrition coaching on calendar |
| 👨‍👩‍👧 Family | Parent portal, report cards, camps, family memberships |
| 📺 Smart Gym | TV network, signage, live announcements, check-in + kitchen displays, Command Center |
| 📊 BI | Heat maps, AI retention, forecasting, coach performance, inventory analytics |
| 🤖 Sully AI | Conversational book / nutrition / rank / order / owner queries |

---

## Change Log

- **2026-08-07 (v1.2):** Public/Legacy/TV network/Sully AI/Passport added to module map.
