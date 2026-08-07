# Sully's Kitchen

## Purpose

Integrated healthy food operations: menu, ordering, fulfillment, inventory, allergens — attached to membership identity and nutrition plans. Future POS via adapter, not a full restaurant OS replacement on day one.

---

## Capabilities

| Area | Features |
|------|----------|
| Menu | Daily menu, weekly specials, categories (meals, smoothies, protein bar) |
| Ordering | Pre-order, pickup scheduling, member app + desk |
| Fulfillment | Kitchen Display System (KDS) statuses |
| Inventory | Ingredients, recipes → depletion, low-stock, 86 |
| Safety | Allergen tracking, nutrition facts |
| Commerce | Meal packages, meal prep subscription |
| Ops | Waste log, prep lists |
| Future | POS integration (Square/Toast/Clover adapter), hardware printers |

---

## Order Lifecycle

```
placed → accepted → preparing → ready → completed
                 ↘ cancelled / refunded
```

Notifications on `ready` and cancellations/86.

---

## Allergen System (Non-Negotiable)

- Canonical allergen taxonomy (gluten, dairy, nuts, shellfish, soy, egg, sesame, etc.)
- Item declares `contains` + `may_contain`
- Member profile allergens → **hard warning** at checkout; optional block
- KDS ticket prints allergens in high-contrast
- Staff acknowledgement on override

---

## Inventory

- Ingredient SKUs with units
- Recipe BOM (bill of materials) depletes on complete
- Par levels → alerts
- Receiving purchase orders (simple)
- Lot/expiry (Should) for food safety

---

## Meal Prep Subscription

- Weekly plan selection (e.g., 5 lunches)
- Delivery/pickup window
- Pause/skip weeks
- Ties to Nutrition Center preferences
- Stripe subscription item or separate product

---

## Nutrition Facts

- Per item macros + micros optional
- Sourced from recipe calculation or manual entry
- Display on app + print label (Could)

---

Owner KPIs

- Revenue, AOV, attach rate post-check-in
- COGS / margin estimates
- 86 frequency
- Peak pickup congestion
- Command Center kitchen queue summary
- Calendar pickup windows for members

---

## Integration Architecture

```
Member App → Order API → Kitchen Service → KDS WebSocket
                 ↓              ↓
            Payments      Calendar projection
                 ↓              ↓
         Inventory Service   Gym TV specials
                 ↓
     Nutrition tag matching
```

POS future: `PosAdapter` interface — map items/orders bidirectional.

Calendar: every pickup window and workshop projects to [Calendar Hub](./16-calendar-hub.md).  
Displays: kitchen specials + queue summaries feed [Gym TV / Command Center](./17-gym-tv-command-center.md).

---

## Ops Risks

- Food safety liability → train staff; don't overclaim allergen certainty
- Peak after class rush → time-slot capacity for pickups (shown on calendar)
- Waste → prep based on pre-orders first

---

## Change Log

- **2026-08-07:** Calendar + TV/Command Center integration called out.