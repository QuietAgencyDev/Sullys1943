# Core Workflows

## Member Calendar Hub Day

```mermaid
flowchart TD
  A[Open Calendar Hub] --> B[Today Schedule]
  A --> C[Nutrition layer]
  A --> D[Challenges / Achievements]
  A --> E[Gym Events / Closures]
  B --> F[Book / Waitlist / Check-in card]
  C --> G[Meal prep / Smoothie / Class]
  D --> H[Heavy Bag Challenge / Streak]
  E --> I[Fight Night / Kids Camp]
```

## Guest → Member

```mermaid
flowchart TD
  A[Browse classes/coaches] --> B[Book trial]
  B --> C[Register]
  C --> D[Sign waiver]
  D --> E[Pay trial]
  E --> F[Attend + digital card check-in]
  F --> G[Convert to membership]
  G --> H[Sign membership docs]
  H --> I[Active member on Calendar Hub]
```

## Class Day — Member

```mermaid
flowchart LR
  A[Open Calendar Hub] --> B[View next class]
  B --> C[Arrive]
  C --> D[Digital card QR check-in]
  D --> E{Valid membership + waiver?}
  E -->|No| F[Desk resolve]
  E -->|Yes| G[Attendance + XP + Presence]
  G --> H[Train]
  H --> I[Optional kitchen pickup on calendar]
  G --> J[TV / Command Center update]
```

## Parent Youth Loop

```mermaid
flowchart TD
  A[Parent hub] --> B[Bookings + calendar]
  A --> C[Attendance alerts]
  A --> D[Coach feedback / skills]
  A --> E[Waiver status]
  A --> F[Nutrition lessons]
  A --> G[Camps + events]
  A --> H[Pay + messages]
```

## Coach Run Class

```mermaid
flowchart TD
  A[Coach calendar] --> B[Open session]
  B --> C[Live roster]
  C --> D[Confirm attendance]
  D --> E[Stamp skills / notes]
  E --> F[Finalize class]
  F --> G[XP + parent notify]
```

## Kitchen Pre-Order

```mermaid
flowchart LR
  A[Member orders] --> B[Pay/points]
  B --> C[KDS ticket]
  C --> D[Preparing]
  D --> E[Ready push + calendar]
  E --> F[Pickup]
  F --> G[Inventory deplete]
```

## Payment Failure Recovery

```mermaid
flowchart TD
  A[Stripe invoice.payment_failed] --> B[Membership past_due]
  B --> C[Notify member]
  C --> D[Grace policy]
  D --> E{Updated card?}
  E -->|Yes| F[Active restored]
  E -->|No after N days| G[Access restricted / cancel policy]
```

## Command Center Morning

```mermaid
flowchart TD
  A[Desk opens Command Center] --> B[Presence + active classes]
  A --> C[Check-in ticker]
  A --> D[Revenue today]
  A --> E[Kitchen queue]
  A --> F[Leaderboard / birthdays / streaks]
  A --> G[Upcoming bookings]
  A --> H[Equipment + announcements]
  H --> I{Emergency?}
  I -->|Yes| J[Staff-only alert — not public TV]
```
