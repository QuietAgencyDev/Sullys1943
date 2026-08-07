# Database Design

## Principles

1. **Everything multi-tenant** — `organization_id` on tenant data  
2. **No hardcoded enums for business products** — reference tables  
3. **Immutable versions** for prices, waivers, policies  
4. **Ledgers** for money, credits, points (append-only)  
5. **Soft delete** sparingly; prefer status + archive  
6. **JSONB** for extensible metadata with schema validation  
7. **RLS** policies in Postgres  

---

## Entity Relationship (Core)

See also [Entity Relationship Diagrams](../diagrams/entity-relationships.md).

### Tenancy & Identity
- `organizations` (id, name, slug, status, branding jsonb)
- `locations` (id, org_id, name, timezone, address, settings jsonb)
- `users` (id, email, phone, status, dob, persona flags)
- `user_profiles` (display, avatar, emergency contacts jsonb)
- `auth_identities` (provider keys)
- `roles`, `permissions`, `role_permissions`
- `staff_assignments` (user_id, location_id, role_id)
- `guardianships` (guardian_user_id, child_user_id, relationship, verified_at)

### Documents
- `document_templates`, `document_template_versions`
- `document_requirements` (scope: product/program/event)
- `signature_packets`, `signatures`, `signed_documents`

### Membership & Billing
- `membership_products`, `membership_plan_versions`, `entitlement_policies`
- `memberships`, `membership_members`, `membership_status_events`
- `credit_ledgers`, `credit_entries`
- `customers` (stripe_customer_id), `subscriptions`, `invoices`, `payment_events`
- `promo_codes`, `scholarship_grants`

### Scheduling
- `programs`, `rooms`, `class_templates`, `sessions`
- `bookings`, `waitlist_entries`
- `workout_plans`, `workout_blocks`

### Attendance
- `attendance_events`
- `checkin_credentials`
- `presence_sessions` — members currently in gym (for Command Center)

### Calendar
- `calendar_items` — projected/materialized hub items (or view over sources)
- `calendar_preferences`
- `resource_bookings` — equipment
- `staff_time_off`
- `staff_certifications`

### Gamification / Boxing Progression
- `xp_rules`, `xp_ledger`, `levels`, `boxing_ranks`, `user_ranks`
- `skill_trees`, `skill_nodes`, `user_skill_stamps`
- `personal_bests`, `milestones`, `user_milestones`
- `badges`, `user_badges`
- `streaks`, `quests`, `quest_progress`
- `points_accounts`, `points_ledger`
- `reward_skus`, `redemptions`
- `challenges`, `leaderboard_snapshots`

### Nutrition
- `nutrition_profiles`, `recipes`, `ingredients`, `meal_plans`, `meal_plan_assignments`
- `habit_logs`, `hydration_logs`, `courses`, `course_progress`

### Kitchen
- `menu_items`, `menu_allergens`, `menus`, `kitchen_orders`, `kitchen_order_items`
- `inventory_items`, `inventory_transactions`
- `meal_subscriptions`

### Community / Events / Store
- `posts`, `post_media`, `reactions`, `comments`, `moderation_actions`
- `announcements`
- `events`, `ticket_types`, `tickets`
- `retail_products`, `retail_variants`, `retail_orders`

### Displays
- `display_devices` — Gym TV / Command Center device credentials
- `display_playlists`
- `command_center_alerts`

### Admin / Platform
- `feature_flags`, `audit_logs`, `notification_templates`, `notification_deliveries`
- `message_threads`, `messages`
- `metric_daily_rollups`
- `coach_profiles`

---

## Example Table DDL Sketches

### organizations
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### memberships
```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  location_id UUID REFERENCES locations(id),
  plan_version_id UUID NOT NULL,
  payer_user_id UUID NOT NULL,
  status TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON memberships (organization_id, status);
CREATE INDEX ON memberships (payer_user_id);
```

### attendance_events
```sql
CREATE TABLE attendance_events (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  location_id UUID NOT NULL,
  user_id UUID NOT NULL,
  session_id UUID,
  method TEXT NOT NULL,
  status TEXT NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL,
  recorded_by UUID,
  late_by_seconds INT,
  metadata JSONB NOT NULL DEFAULT '{}',
  UNIQUE (session_id, user_id) -- where session_id is not null; use partial unique index
);
```

### xp_ledger (append-only)
```sql
CREATE TABLE xp_ledger (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  delta INT NOT NULL,
  reason TEXT NOT NULL,
  ref_type TEXT,
  ref_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## RLS Pattern

```sql
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY memberships_tenant ISOLATION ON memberships
  USING (organization_id = current_setting('app.organization_id')::uuid);
```

App sets `app.organization_id` and `app.user_id` per request after auth.

---

## Extensibility Patterns

| Need | Pattern |
|------|---------|
| New membership type | Row in `membership_products` + policy JSON |
| New waiver | Template + requirement row |
| New program | `programs` row |
| New XP event | `xp_rules` row |
| Custom fields | `metadata` JSONB + admin field registry (Future) |

---

## PII / Sensitive Columns

- DOB, phone, email, medical notes, signatures, documents  
- Consider `pgcrypto` column encryption for medical narrative  
- Separate `medical_profiles` table with tighter grants  

---

## Migration Strategy

- Expand/contract migrations  
- Never break rollback for one version  
- Seed reference data per env  

---

## Data Retention

| Data | Retention (draft — counsel confirm) |
|------|-------------------------------------|
| Waivers / liability | 7+ years after last activity |
| Attendance | 3–7 years |
| Messages | 2 years |
| Marketing analytics | Per policy |
| AI logs | 90 days redacted |

---

## Scalability Notes

- Partition `attendance_events` / `audit_logs` by month when large  
- Rollups for owner dashboard  
- Avoid unbounded `SELECT *` feed without keyset pagination  
