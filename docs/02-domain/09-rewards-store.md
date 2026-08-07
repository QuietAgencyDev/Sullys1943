# Rewards Store

## Purpose

Let members redeem points (and optionally cash) for meaningful Sully's perks — reinforcing loyalty and moving inventory.

---

## Redeemable Catalog (Examples)

| Category | Items |
|----------|-------|
| Membership | % off next month, freeze token, guest pass |
| Gear | Gloves, wraps, hoodies, shirts |
| Training | Private lesson credit, exclusive class seat |
| Kitchen | Meals, smoothies, protein shakes |
| Events | Fight night tickets |
| Experiences | Mystery class with pro coach |

All items are `RewardSku` records — not hardcoded.

---

## Ledger

```
points_accounts: user_id, balance
points_ledger: id, user_id, delta, reason, ref_type, ref_id, created_at
redemptions: id, sku_id, points_spent, status, fulfillment
```

**Idempotent** spends; prevent double-redeem with row locks.

---

## Fulfillment States

`pending → approved → fulfilled | rejected | expired`

- Digital (discount): auto-issue coupon
- Physical: staff marks picked up
- Lesson: credit PT package
- Kitchen: create $0 order / voucher QR

---

## Inventory & Limits

- Stock counts for physical
- Per-user caps
- Membership-tier exclusives
- Seasonal catalog windows

---

## Fraud Controls

- Minimum account age / attendance for high-value items
- Velocity limits
- Staff audit on manual adjustments
- Clawback on voided attendance that granted XP (policy)

---

## Owner Controls

- Margin awareness (don't bankrupt kitchen via free shakes)
- Featured items
- Pause catalog
