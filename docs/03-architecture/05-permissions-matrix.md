# Permissions Matrix

## Permission Model

**RBAC** with fine-grained permissions; optional ABAC later for "own athletes only."

Format: `domain:action`  
Enforcement: API guards + RLS + UI hiding (UI never sole control).

---

## Core Roles

| Role | Description |
|------|-------------|
| `guest` | Unauthenticated / pre-member |
| `member` | Adult member |
| `parent` | Guardian (also may be member) |
| `child` | Minor subject (limited) |
| `teen` | Semi-autonomous minor |
| `coach` | Class coach |
| `nutrition_coach` | Nutrition |
| `kitchen_staff` | Kitchen |
| `front_desk` | Front desk |
| `personal_trainer` | PT |
| `owner` | Location owner |
| `admin` | Location/org admin |
| `developer` | Platform engineer |
| `franchise_manager` | Multi-location (Phase 10) |

Users can hold multiple roles (e.g., parent + member).

---

## Matrix Legend

- **F** Full  
- **R** Read  
- **W** Write/Create  
- **O** Own/scoped only  
- **—** None  
- **A** Approve / admin  

---

## High-Level Matrix

| Permission | Guest | Member | Parent | Teen | Coach | Nut | Kitchen | Desk | PT | Owner | Admin | Dev | Fran |
|------------|-------|--------|--------|------|-------|-----|---------|------|----|-------|-------|-----|------|
| `marketing:view` | F | F | F | F | F | F | F | F | F | F | F | F | F |
| `auth:register` | W | — | W | — | — | — | — | W | — | — | W | F | — |
| `profile:self` | — | F | F | O | F | F | F | F | F | F | F | F | F |
| `child:manage` | — | — | F | — | — | — | — | A | — | F | F | F | — |
| `waiver:sign:self` | W | W | W | W | — | — | — | — | — | — | — | — | — |
| `waiver:sign:child` | — | — | W | — | — | — | — | A | — | F | F | — | — |
| `waiver:view:sensitive` | — | O | O | — | R* | — | — | R | — | F | F | F | R |
| `membership:purchase` | W | W | W | — | — | — | — | W | — | F | F | — | — |
| `membership:comp` | — | — | — | — | — | — | — | — | — | F | A | — | — |
| `billing:refund` | — | — | — | — | — | — | — | A | — | F | A | — | — |
| `class:browse` | R | R | R | R | R | R | R | R | R | R | R | R | R |
| `class:book:self` | — | W | W† | W‡ | — | — | — | W | — | F | F | — | — |
| `schedule:manage` | — | — | — | — | W§ | — | — | — | — | F | F | — | — |
| `checkin:self` | — | W | W† | W | — | — | — | — | — | — | — | — | — |
| `checkin:proxy` | — | — | W | — | W | — | — | W | — | F | F | — | — |
| `checkin:scan` | — | — | — | — | W | — | — | W | — | F | F | F | — |
| `attendance:roster` | — | — | — | — | R | — | — | R | R | F | F | F | R |
| `notes:athlete` | — | — | — | — | W | W | — | — | W | R | R | — | — |
| `workout:build` | — | — | — | — | W | — | — | — | W | F | F | — | — |
| `nutrition:assign` | — | — | — | — | — | W | — | — | — | F | F | — | — |
| `nutrition:follow` | — | F | R | O | — | F | — | — | — | — | — | — | — |
| `kitchen:order` | — | W | W | W‡ | W | W | — | W | W | F | F | — | — |
| `kitchen:fulfill` | — | — | — | — | — | — | F | — | — | F | F | — | — |
| `inventory:manage` | — | — | — | — | — | — | W | — | — | F | F | — | — |
| `xp:manual_grant` | — | — | — | — | A | — | — | A | — | F | F | — | — |
| `rewards:redeem` | — | W | W | W‡ | — | — | — | W | — | F | F | — | — |
| `community:post` | — | ‡ | — | ‡ | W | W | — | W | W | F | F | — | — |
| `community:moderate` | — | — | — | — | A | — | — | A | — | F | F | — | — |
| `message:coach` | — | W | W | W | W | W | — | W | W | F | F | — | — |
| `events:manage` | — | — | — | — | A | — | — | W | — | F | F | — | — |
| `analytics:finance` | — | — | — | — | — | — | — | — | — | F | A | R | F |
| `analytics:ops` | — | — | — | — | R | R | R | R | R | F | F | F | F |
| `displays:tv` | — | — | — | — | — | — | — | A | — | F | F | F | A |
| `displays:command_center` | — | — | — | — | R* | — | R† | F | — | F | F | F | F |
| `displays:emergency_alert` | — | — | — | — | — | — | — | W | — | F | F | — | — |
| `admin:settings` | — | — | — | — | — | — | — | — | — | F | F | F | A |
| `admin:roles` | — | — | — | — | — | — | — | — | — | F | F | F | A |
| `flags:manage` | — | — | — | — | — | — | — | — | — | A | A | F | A |
| `audit:view` | — | — | — | — | — | — | — | — | — | F | F | F | F |
| `franchise:portfolio` | — | — | — | — | — | — | — | — | — | — | — | R | F |

\* Coach: limited medical **flags**, not full documents, unless policy grants. On Command Center, coach sees ops tiles without revenue by default.  
† Parent acts on behalf of child. Kitchen staff Command Center = kitchen queue tiles only.  
‡ Policy / approval gated.  
§ Coach requests; admin approves schedule publish depending on config.

---

## Entitlements vs Permissions

- **Permissions** = what role may do in software  
- **Entitlements** = what membership product allows (book Boxing Advanced, kitchen 10% off)  

Both must pass.

---

## Row-Level Examples

- Parent reads attendance `WHERE user_id IN children`  
- Coach reads notes for athletes in their programs  
- Kitchen staff sees orders for `location_id` only  
- Franchise manager reads rollups for `org_ids` in portfolio  

---

## Custom Roles

Admin may clone role and toggle permissions from catalog — never free-form string permissions in UI without registry.
