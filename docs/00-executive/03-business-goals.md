# Business Goals

## Primary Business Objectives

| ID | Goal | Target (Flagship, 12 months post Phase 3) | Measurement |
|----|------|---------------------------------------------|-------------|
| BG-1 | Digitize core operations | 100% digital waivers; 0 paper check-in | Waiver completion %, check-in method mix |
| BG-2 | Increase member retention | +8–12 pp improvement in 90-day retention | Cohort retention curves |
| BG-3 | Increase class utilization | Average utilization 70–85% peak classes | Booked / capacity |
| BG-4 | Grow ancillary revenue | Kitchen + store ≥ 15% of membership revenue | Revenue mix |
| BG-5 | Reduce front-desk load | −30% time on intake & attendance | Time-motion / ticket volume |
| BG-6 | Improve youth parent NPS | Parent NPS ≥ 50 | Survey |
| BG-7 | Create franchise-ready foundation | Multi-location data model live; 2nd location onboardable in < 2 weeks | Onboarding checklist |

---

## Revenue Levers the Platform Enables

1. **Membership conversion** — trials → paid with digital waiver + payment in one flow
2. **Retention** — streaks, coaching visibility, youth report cards reduce silent churn
3. **Upsell** — private lessons, events, VIP tiers, meal prep subscriptions
4. **Kitchen attach** — pre-order + pickup reduces waste, increases ticket size
5. **Store / rewards** — merchandise and lesson redemptions keep brand in daily life
6. **Corporate & parties** — packaged events and birthday bookings
7. **Future franchise SaaS** — platform itself becomes a product (Phase 10+)

---

## Cost / Efficiency Levers

| Area | Automation Opportunity |
|------|------------------------|
| Intake | Online registration, waiver, payment, emergency contacts |
| Attendance | QR / Wallet check-in; auto capacity enforcement |
| Billing | Stripe subscriptions, dunning, family invoices |
| Comms | Templated SMS/email/push for reminders & announcements |
| Reporting | Owner dashboard replaces spreadsheet exports |
| Compliance | Versioned waivers; audit logs; renewal nudges |

---

## KPI Framework

### Member Health
- Active members (rolling 30)
- WATM (North Star)
- Check-in frequency / member / week
- Booking no-show rate
- Streak distribution

### Revenue Health
- MRR / ARR
- New MRR, Expansion MRR, Churned MRR
- Average Revenue Per Member (ARPM)
- LTV / CAC (when marketing attribution exists)
- Kitchen AOV and attach rate
- Store conversion

### Operational Health
- Class fill rate
- Peak waitlist conversion
- Front desk check-in median time
- Waiver compliance rate (valid waiver on file)
- Payment failure recovery rate

### Youth Health
- Youth attendance consistency
- Parent message response SLA
- Report card delivery rate
- Youth → teen → adult conversion (longitudinal)

### Staff Health
- Coach class load
- Coach NPS / satisfaction (internal)
- Time-to-publish workout plans

---

## OKR Example — Launch Year (Phase 1–4)

**Objective:** Make Sully's the first fully digital boxing gym experience in our market.

| Key Result | Target |
|------------|--------|
| KR1 | 95% of new members complete digital waiver + payment online |
| KR2 | 75% of check-ins via QR within 60 days of Phase 3 launch |
| KR3 | Owner can view MRR, attendance, and churn live without spreadsheets |
| KR4 | Gamification live: ≥60% of active members earn XP weekly |
| KR5 | Zero P1 payment or PII security incidents |

---

## Pricing Model Considerations (Platform Internal)

For Sully's flagship: platform cost is internal OpEx.

For future franchise / multi-gym SaaS (Phase 10):
- Per-location monthly fee + optional transaction fees
- Modules: Core Ops, Nutrition, Kitchen, Community, AI Add-ons
- Data residency options for Canadian operators (PIPEDA)

*Do not hardcode pricing into application logic — use plan/entitlement tables.*

---

## Success Gates Before Expanding Scope

Do **not** start Phase 9 (AI) or Phase 10 (Franchise UI) until:
1. Check-in data quality ≥ 95% match to physical attendance samples
2. Billing reliability ≥ 99.5% successful renewals (excl. card declines handled by dunning)
3. Waiver audit sample passes legal review
4. Multi-location schema validated with at least staging second tenant
