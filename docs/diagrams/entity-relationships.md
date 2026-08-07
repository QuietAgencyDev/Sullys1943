# Entity Relationship Overview

## Core Tenancy & People

```mermaid
erDiagram
  ORGANIZATIONS ||--o{ LOCATIONS : has
  ORGANIZATIONS ||--o{ USERS : hosts
  USERS ||--o{ STAFF_ASSIGNMENTS : holds
  LOCATIONS ||--o{ STAFF_ASSIGNMENTS : scopes
  ROLES ||--o{ STAFF_ASSIGNMENTS : role
  USERS ||--o{ GUARDIANSHIPS : guardian
  USERS ||--o{ GUARDIANSHIPS : child
```

## Membership & Compliance

```mermaid
erDiagram
  MEMBERSHIP_PRODUCTS ||--o{ MEMBERSHIP_PLAN_VERSIONS : versions
  MEMBERSHIP_PLAN_VERSIONS ||--o{ ENTITLEMENT_POLICIES : defines
  MEMBERSHIP_PLAN_VERSIONS ||--o{ MEMBERSHIPS : sold_as
  USERS ||--o{ MEMBERSHIPS : pays
  MEMBERSHIPS ||--o{ MEMBERSHIP_MEMBERS : covers
  USERS ||--o{ MEMBERSHIP_MEMBERS : member
  DOCUMENT_TEMPLATES ||--o{ DOCUMENT_TEMPLATE_VERSIONS : versions
  DOCUMENT_TEMPLATE_VERSIONS ||--o{ SIGNATURE_PACKETS : signed
  USERS ||--o{ SIGNATURE_PACKETS : subject
  SIGNATURE_PACKETS ||--o{ SIGNATURES : has
  SIGNATURE_PACKETS ||--|| SIGNED_DOCUMENTS : produces
```

## Scheduling & Attendance

```mermaid
erDiagram
  PROGRAMS ||--o{ CLASS_TEMPLATES : defines
  LOCATIONS ||--o{ ROOMS : has
  CLASS_TEMPLATES ||--o{ SESSIONS : materializes
  SESSIONS ||--o{ BOOKINGS : has
  USERS ||--o{ BOOKINGS : books
  SESSIONS ||--o{ WAITLIST_ENTRIES : queues
  SESSIONS ||--o{ ATTENDANCE_EVENTS : records
  USERS ||--o{ ATTENDANCE_EVENTS : attends
  USERS ||--o{ PRESENCE_SESSIONS : present
  SESSIONS ||--o{ CALENDAR_ITEMS : projects
  EVENTS ||--o{ CALENDAR_ITEMS : projects
```

## Calendar & Displays

```mermaid
erDiagram
  USERS ||--o{ CALENDAR_PREFERENCES : configures
  LOCATIONS ||--o{ CALENDAR_ITEMS : hosts
  LOCATIONS ||--o{ DISPLAY_DEVICES : mounts
  DISPLAY_DEVICES ||--o{ DISPLAY_PLAYLISTS : plays
  LOCATIONS ||--o{ COMMAND_CENTER_ALERTS : raises
  RESOURCES ||--o{ RESOURCE_BOOKINGS : booked
```

## Gamification Ledgers

```mermaid
erDiagram
  USERS ||--o{ XP_LEDGER : earns
  USERS ||--|| POINTS_ACCOUNTS : wallet
  POINTS_ACCOUNTS ||--o{ POINTS_LEDGER : entries
  REWARD_SKUS ||--o{ REDEMPTIONS : redeemed
  USERS ||--o{ REDEMPTIONS : redeems
  USERS ||--o{ USER_BADGES : collects
  BADGES ||--o{ USER_BADGES : awarded
  USERS ||--o{ PERSONAL_BESTS : logs
  SKILL_TREES ||--o{ USER_SKILL_STAMPS : stamped
```

## Kitchen

```mermaid
erDiagram
  MENU_ITEMS ||--o{ KITCHEN_ORDER_ITEMS : ordered
  USERS ||--o{ KITCHEN_ORDERS : places
  KITCHEN_ORDERS ||--o{ KITCHEN_ORDER_ITEMS : contains
  MENU_ITEMS ||--o{ MENU_ALLERGENS : declares
  INVENTORY_ITEMS ||--o{ INVENTORY_TRANSACTIONS : moves
```

## Notes

- Full physical schemas evolve in migrations; this is the conceptual map.  
- JSONB policy documents attach to plan versions and XP rules for extensibility.  
- All tenant tables include `organization_id` (omitted in diagrams for clarity).  
- Calendar items may be materialized or a secured view — either way, one hub API.