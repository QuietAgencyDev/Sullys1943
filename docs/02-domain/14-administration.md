# Administration

## Purpose

Enable non-engineers to configure the gym: access, brand, communications, and runtime flags — with full auditability.

---

## Capability Map

| Area | Features |
|------|----------|
| Feature Flags | Per org/location/user % rollout |
| Settings | Location hours, policies, timezone, tax |
| Role Permissions | Map roles → permissions; custom roles |
| Audit Logs | Searchable, exportable, immutable |
| Notifications | Channels, preferences defaults |
| Email Templates | Rich templates + variables + locales |
| SMS Templates | Short forms + compliance footer |
| Push Notifications | Copy + deep links |
| Theme Management | Tokens, dark default, logo |
| Brand Settings | Name, colors, social links, app icons |
| Document Templates | Waivers hub |
| Membership Products | Catalog admin |
| Programs & Rooms | Scheduling admin |
| Integrations | Stripe, SMS provider, email, storage |
| Data Tools | Export, DSAR helpers |

---

## Feature Flag Taxonomy

- `module.nutrition.enabled`
- `module.kitchen.enabled`
- `module.community.ugc`
- `checkin.wallet`
- `ai.coach`

Flags evaluated server-side; client may gate UI but never authority.

---

## Audit Log Events (Examples)

- Role changed
- Refund issued
- Waiver template published
- Manual XP grant
- Membership comped
- Document viewed (sensitive)
- Feature flag flipped

Retain per policy (e.g., 2–7 years).

---

## Notification Admin

- Trigger catalog (waiver expiring, class canceled, etc.)
- Enable/disable per location
- Quiet hours
- Youth → parent routing rules

---

## Theme / Brand

- CSS variable export from tokens
- Prevent low-contrast combinations (lint)
- Franchise: brand kit locked vs local accent unlock

---

## Developer Admin Overlap

- Impersonation: **break-glass only**, MFA + reason + time-boxed + audited
- Job replay / dead letter queues visibility
- System health status page internal
