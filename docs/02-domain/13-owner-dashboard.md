# Owner Dashboard

## Purpose

Executive-level visibility for running a profitable, high-retention boxing gym — **actionable**, not vanity charts.

---

## KPI Groups

### Revenue
- Gross revenue (membership, kitchen, store, events, PT)
- **MRR / ARR**
- New / expansion / reactivation / churned MRR
- Average Revenue Per Member (ARPM)
- Kitchen & store revenue
- Forecast (Could)

### Membership Health
- Active members
- Trials → paid conversion
- **Retention** curves (30/90/180)
- **Churn** rate & reasons
- **LTV** estimates
- At-risk list (rules, later AI)

### Attendance & Delivery
- Check-ins / day
- WATM (North Star)
- Class **utilization**
- No-show rate
- Capacity denials

### People
- Coach performance: hours, utilization, attendance quality, member NPS tags
- Staff overrides & comps

### Growth
- Referrals
- Marketing campaign attribution (when available)
- Corporate leads

### Costs (Phase incremental)
- Expense imports / manual categories
- Approximate contribution margin
- Payroll export integration (not full payroll engine)

---

## Morning Brief (Default Home)

1. Yesterday vs WTD revenue  
2. Failed payments needing action  
3. Waiver compliance exceptions  
4. Today's fill rates / staffing  
5. At-risk members (top 10)  
6. Kitchen 86 / low stock  
7. **Owner calendar** reminders (payroll, maintenance, renewals, campaigns)  
8. Deep link to **Gym Command Center** for live floor state  

The Owner Dashboard is the analytical brain; the [Gym Command Center](./17-gym-tv-command-center.md) is the live facility view. They share metrics definitions and realtime events — they are not duplicate products.

---

## Drill-Down Principles

- Every tile clickable to row-level (members, invoices, sessions)
- Export CSV for accountants
- Location switcher ready for multi-site
- Timezone-aware

---

## Permissions

- Owner: full
- Admin: configurable
- Franchise manager: aggregated + per-location (Phase 10)
- Coaches: **not** full financials by default

---

## Technical Notes

- Materialized daily rollups for speed
- Real-time for attendance/payments via events
- Define metric dictionary in Analytics Strategy to avoid chart arguments
