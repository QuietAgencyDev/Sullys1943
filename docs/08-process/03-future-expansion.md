# Future Expansion Plan

## Horizon Map

| Horizon | Expansion |
|---------|-----------|
| H1 | Wallet passes, NFC, offline desk mode |
| H2 | Native iOS/Android apps |
| H3 | Full community + creator tools for coaches |
| H4 | TV network + Command Center GA polish (five profiles + signage) |
| H5 | Sully AI suite GA |
| H6 | Franchise SaaS commercialization |
| H7 | Multi-country tax/payroll integrations |
| H8 | Wearables / heart-rate / punch overlays (consent) |
| H9 | Smart equipment + competition management suite |
| H10 | Marketplace / white-label for other combat gyms |

---

## Facility Ecosystem (Spec'd)

[Gym TV Network & Command Center](../02-domain/17-gym-tv-command-center.md)

Expansion work:
- Multi-display choreography (Reception / Floor / Kitchen / Kids / Owner)  
- Sponsor CMS + Legacy “on this day”  
- Emergency drill modes  
- Presence accuracy tuning  
- Hardware appliance packaging (TV + media player SKU)  

---

## Public + Legacy (Spec'd)

- [Website & Public Platform](../02-domain/19-website-public-platform.md) — [sullysboxinggym.com](https://www.sullysboxinggym.com)  
- [Legacy Experience](../02-domain/20-legacy-experience.md) — Passport, Wall, Trophy Room  
- [Sully AI](../02-domain/12-ai-features.md)  

---

## Franchise Platform (Phase 10 Detail)

- Org hierarchy: Brand → Franchisee → Locations  
- Template distribution: waivers, programs, XP rules, brand kits, legacy content packs  
- Override policy matrix  
- Portfolio analytics + benchmarking  
- Central billing for software fees  
- Staff onboarding academy  
- Compliance audits (waiver versions adopted?)  

### Illustrative Canadian expansion tree

```
Sully's HQ
├── Toronto West
├── Toronto East
├── Mississauga
├── Vaughan
├── Barrie
├── Hamilton
├── Ottawa
└── Future Locations
```

Each location: own calendar, staff, kitchen, inventory, leaderboards, members, events — corporate dashboard rollup.

---

## Platform Productization

When selling outside Sully's:
- Packaging: "Sully's OS" vs white-label  
- Tenant provisioning automation  
- SLA tiers  
- Data residency options (CA/US/EU)  

---

## Technical Evolution

- Extract Kitchen and Notification services when load justifies  
- Event bus (SNS/SQS or NATS) replacing in-process  
- Read replicas + warehouse for franchise BI  
- Edge check-in validation for global latency  

---

## Partnerships

- Equipment brands for rewards  
- Supplement partners (ethical disclosure)  
- Insurance partners for accident coverage upsell  
- Physiotherapy referral network (data-light)  
- Media/archive partners for Legacy Wall rights  

---

## Research Spikes (Timeboxed)

1. Apple Wallet pass personalization  
2. Square Terminal for kitchen POS  
3. FR localization pipeline  
4. On-device form analysis ethics/legal  
5. Hero video CDN + CMS workflow for website  
