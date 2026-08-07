# Nutrition Center

## Purpose

A **guided nutrition platform** for boxers — meal plans, education, habits — integrated with coaches and Sully's Kitchen. Prefer adherence and simplicity over MyFitnessPal-style endless logging.

---

## Member Capabilities

| Feature | Description |
|---------|-------------|
| Meal Plans | Coach-assigned or self-selected templates |
| Recipe Library | Filter by allergen, macro band, prep time, equipment |
| Shopping Lists | Auto-aggregated from plan week |
| Healthy Habits | Configurable habit cards (sleep, veggies, no late sugar) |
| Hydration Tracking | Quick taps toward daily goal |
| Meal Prep Calendar | Weekly prep schedule |
| Nutrition Goals | Weight, performance, recomposition — member-defined |
| Coach Feedback | Threaded comments on check-ins |
| Educational Courses | Modules with quizzes (light LMS) |
| Progress Tracking | Adherence %, weight (optional), photos (private) |
| Kitchen Ordering | Deep link meals that match plan tags |
| Supplement Tracking | Log stack with reminders (not medical advice) |
| Cooking Videos | CMS media attached to recipes |

### Calendar integration (required for Phase 5+)

Nutrition is not a silo — items project onto the [Unified Calendar Hub](./16-calendar-hub.md):

| Example | Calendar kind |
|---------|---------------|
| Meal Prep Pickup – Mon 5:30 PM | `nutrition_pickup` |
| Smoothie Order ready window | `kitchen_order` |
| Nutrition Class | `nutrition_class` |
| Cooking Workshop – Saturday | `nutrition_class` |
| Grocery List Reminder | `personal_reminder` |

Member day example:

```
Monday
🥗 Meal Prep Pickup
🥤 Smoothie Order
🍎 Nutrition Class

Tuesday
🍳 Cooking Workshop
🥦 Grocery List Reminder
```

---

## Roles

- **Nutrition Coach:** assign plans, review adherence, publish content
- **Member / Teen:** follow plan; teen visibility shared with parent if enabled
- **Owner:** utilization of nutrition program as retention tool

---

## Domain Model

- `nutrition_profiles` (goals, allergens, preferences, exclusions)
- `meal_plans` / `meal_plan_days` / `meals`
- `recipes` / `ingredients` / `recipe_steps` / `media`
- `shopping_lists` / `shopping_list_items`
- `habit_definitions` / `habit_logs`
- `hydration_logs`
- `nutrition_courses` / `lessons` / `progress`
- `coach_feedback_threads`
- `supplement_items` / `supplement_logs`

---

## Adherence Model (Simple)

Member marks meal: `eaten | swapped | skipped`  
Adherence = eaten(+swapped_approved) / planned  

Coach dashboard: heatmaps, not surveillance theater.

---

## AI Hooks (Phase 9)

- Draft plan from profile → **human coach approve**
- Swap suggestions respecting allergens
- Never claim medical treatment

---

## Legal Disclaimers

- Not medical nutrition therapy unless licensed practitioner workflow added
- Allergen info best-effort; members verify
- Eating disorder sensitivity: avoid aggressive weight-nagging patterns; allow hide weight

---

## Phase Split

- **Should (Phase 5):** plans, recipes, shopping list, coach assign, basic habits
- **Could:** courses, videos, supplements, prep calendar
- **Kitchen sync:** Phase 6
