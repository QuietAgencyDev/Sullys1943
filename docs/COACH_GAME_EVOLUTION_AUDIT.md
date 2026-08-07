# Sully's Gym — Coaching + Game Engine Evolution Audit

**Status:** Phase 1 implementation in progress (approved 2026-08-07)  
**Date:** 2026-08-07  
**Scope decisions locked:** Coach surfaces on **staff first + member `/app/coach` mirror** · Coach **controls the round timer** (Live Class Mode → floor TV)  
**Principle:** Preserve what works. Improve what exists. Extend — do not rebuild.

---

## 1. Executive verdict

The platform is a **working Gym OS** (membership, check-in, booking, desk, kitchen, TV boards, thin XP). It is **not yet** a Coach Command Center or Game Engine.

| Layer | Maturity |
|-------|----------|
| Member portal + digital card + booking | Strong MVP |
| Desk check-in + attendance + XP hook | Strong MVP |
| Public coaches directory + staff live roster | Thin |
| Coach Command Center / Live Class Mode | Missing |
| Workout / Game / Team / Skill engines | Docs only |
| Realtime bus (WS/SSE) | Missing (poll only) |
| TV coach-controlled second screen | Read-only boards |

**Do not rebuild:** auth cookie JWT, Prisma/Neon, check-in + `XpLedger`, Session/Booking/Attendance, TV floor board UI, `@sullys/tokens`, staff roster finalize/void.

---

## 2. Architecture map (what exists)

```
apps/web          Next.js — marketing, member /app/*, /tv/*
apps/staff        Next.js — desk, coach/roster, kitchen, owner, admin
apps/api          NestJS — api/v1/*, Prisma, cookie JWT sullys_token
packages/tokens   Design tokens (brand cream/red, fonts)
packages/ui       Button only (extend, don't fork)
```

**Auth:** `apps/api/src/auth/auth.guard.ts` — HS256 JWT in httpOnly cookie; roles as string on `User`.  
**Staff set:** `coach | front_desk | admin | owner` via ad-hoc `STAFF_ROLES` in `platform.controllers.ts`.  
**Realtime:** HTTP polling only (TV 15s, KDS 5s). No WebSocket/SSE.  
**Deployed:** www + api.sullys1943.com (Vercel + Railway + Neon).

---

## 3. Database — existing models (reuse)

~28 Prisma models. Coach/Game-relevant:

| Model | Reuse as |
|-------|----------|
| `User` (role, title, bio, photoUrl) | Coach identity + athlete |
| `Session` + `coachUserId` / `coachName` | Class instance (extend with live state) |
| `Booking` | Roster source |
| `AttendanceEvent` | Check-in / late / void |
| `CheckInCredential` | QR / future NFC events |
| `XpLedger` | Append-only XP (extend reasons + metadata) |
| `PointsAccount` | Wallet balance (keep; add ledger later if needed) |
| `Badge` / `UserBadge` | Achievements catalog |
| `Announcement` | Gym / TV messages |
| `MessageThread` / `Message` | Coach communication (extend, don't fork) |
| `Program` | Age/program restrictions for games |
| `Guardianship` | Kids / parent notifications |
| `DocumentTemplate*` | Waivers only — **not** workouts |

**No models today for:** WorkoutTemplate, Game, GameSession, Team, Challenge, Skill, CoachAssessment, Season, CoachAlert, TVDisplay control, PunchEvent, PerformanceEvent bus.

---

## 4. What already works (preserve)

### Member
- Login / register / reset · waiver · membership card QR · self check-in  
- Book + waitlist · calendar · family · billing (mock/Stripe path)  
- Passport (XP sum, hard-coded ranks, attendance snippet)  
- Home portal XP/level  

### Ops
- Desk scan + dry-run + drop-in  
- Coach live roster (finalize no-shows, void) — `apps/staff/src/app/coach/roster/page.tsx`  
- Kitchen KDS · owner morning brief (not coach)  
- Admin invite staff (`coach` role)  

### Public / TV
- `/coaches` directory via `GET /portal/coaches`  
- `/tv/floor` + `/tv/reception` — schedule, KPIs, XP leaderboard, ticker  
- Client round timer (wall-clock / class-start sync) — **no coach override**  

### XP (thin)
| Event | Amount | Dedup |
|-------|--------|-------|
| `attendance.checked_in` | +10 | 5-minute same session window |
| `welcome_join` | +50 | one-time findFirst |

Level = `floor(xp/100)+1`. Ranks hard-coded in controllers. Badges seeded, not event-driven.

---

## 5. Gaps vs vision (Coach + Game)

| Vision item | Status |
|-------------|--------|
| Coach Command Center home | Missing |
| Live Class Mode + control bar | Missing |
| Coach-owned session timer broadcast | Missing (client-only TV timer) |
| Workout / class builder + templates | Missing |
| Configurable Game Engine | Missing |
| Initial games (Bag Battle, etc.) | Missing (config later) |
| Skill tree + coach stamps | Missing |
| Coach assessments | Missing |
| Athlete / coach analytics | Missing beyond thin passport |
| Boxing Card as athletic passport | Partial (QR + plan; no skills/games) |
| Challenges / teams / seasons | Missing |
| Live leaderboards (multi-type) | Thin XP top-8 on TV |
| Coach-controlled TV / second screen | Missing (read-only) |
| Celebrations / announcements bus | Partial announcements |
| Punch tracking abstraction | Missing |
| Kids Quest mode + parent updates | Missing |
| AI coach assistant | Future |
| Realtime event bus | Missing |
| Offline class resilience | TV offline cache only |

---

## 6. Reuse map (do not duplicate)

| Need | Reuse | Extend |
|------|-------|--------|
| XP awards | `XpLedger` | Add `source`, `sessionId`, `metadata` JSON, unique constraints / idempotency keys |
| Points | `PointsAccount` | Optional `PointsLedger` later for rewards store |
| Badges | `Badge` / `UserBadge` | Event-driven grants from game/skill rules |
| Class | `Session` | Add live fields or sibling `LiveClassState` |
| Roster | bookings + attendance APIs | Scope to `coachUserId === me` |
| Messages | MessageThread/Message | Participants, coach compose, class broadcast |
| Announcements | Announcement | Coach → TV channel |
| TV UI | `tv-board.tsx` | Modes driven by LiveClass / DisplaySession |
| Check-in events | `AttendanceEvent` + QR | Feed game eligibility + XP rules |
| Design | `@sullys/tokens` + staff CSS modules | Tablet-first coach shell |
| Auth | JWT + roles | Coach-only route guards; location scope later |

---

## 7. Recommended new entities (only if needed)

Prefer **extending Session / XpLedger** before new tables. Proposed additions (Phase-gated):

| Entity | Phase | Purpose |
|--------|-------|---------|
| `LiveClassState` | 1 | running/paused, round, work/rest, startedBy, TV mode |
| `WorkoutTemplate` + `WorkoutBlock` | 1–2 | Warmup/rounds/stations/exercises |
| `XpRule` | 1–2 | Rules-as-data (per docs) |
| `CoachNote` / `CoachAssessment` | 1 | Athlete feedback + scores |
| `Skill` + `SkillProgress` | 2–6 | Tree + coach-stamped states |
| `GameDefinition` + `GameSession` + `GameScore` | 2 | Config-driven games |
| `Team` + `TeamMember` + `Season` | 2–7 | Team Sully's / seasons |
| `Challenge` + participation | 2 | Time-boxed goals |
| `PerformanceEvent` | 2 | Generic event bus row (audit + replay) |
| `DisplaySession` / TV playlist | 3 | Coach-controlled second screen |
| `PunchProvider` + `PunchEvent` | 5 | Hardware abstraction |
| `CoachAlert` | 4 | Attention system |

---

## 8. API shape (follow existing Nest style)

Prefix stays `api/v1`. Prefer controllers under existing modules; new domains:

```
GET|POST  /coach/home
GET       /coach/sessions/today
POST      /coach/sessions/:id/live/start|pause|next|finish
GET|PATCH /coach/sessions/:id/live
GET       /coach/sessions/:id/roster          (scoped)
POST      /coach/assessments
GET|POST  /coach/workouts/templates
GET|POST  /games /games/:id/sessions
POST      /games/sessions/:id/scores
GET       /leaderboards?scope=...
POST      /tv/display/control                 (staff)
GET       /tv/board                           (extend payload)
POST      /performance/events                 (internal + providers)
```

Keep `STAFF_ROLES` for ops; add **coach-scoped** queries (`coachUserId = sub`) so coaches don't see every class by default. Admin/owner retain full visibility.

---

## 9. UX surfaces (decision 1C)

| Surface | Role |
|---------|------|
| **Staff** `apps/staff` — primary Coach Command Center | Tablet-first: home, live class, roster, builder, TV control |
| **Web** `apps/web/app/coach/*` — phone coach mode | Mirror: start class, attendance, timer, award XP, end class |
| **TV** `apps/web/tv/*` | Second screen driven by LiveClassState |
| **Member** Boxing Card / passport | Consume XP, skills, game results (read) |

Staff today has **no AppShell** — Phase 1 must add coach shell + RBAC before new tools.

---

## 10. Security / safety / youth

- Coaches: own classes + assigned athletes; not owner financials.  
- Youth: separate Kids Quest scoring; no harsh adult leaderboards; parent-gated messaging via `Guardianship`.  
- XP: never for unsafe volume; coach awards audited on `XpLedger`.  
- Skill mastery: **coach stamp required** — never punch count alone.  
- Keep medical diagnosis out of AI scope (Phase 6+).  
- Audit admin/coach award actions (who granted XP/achievements).

---

## 11. Realtime & offline

| Today | Target |
|-------|--------|
| Poll TV 15s / KDS 5s | Event bus → WS channel `live:{sessionId}`, `tv:{locationId}` |
| Client-only round timer | Server `LiveClassState` + coach NEXT/PAUSE; TVs subscribe |
| TV localStorage cache | Keep for offline display; queue coach actions when tablet reconnects |

Phase 1 can ship with **short polling (2–3s)** on Live Class if WS is Phase 2–3, but design APIs as event-friendly from day one.

---

## 12. Technical debt / risks

| Risk | Mitigation |
|------|------------|
| Duplicate XP systems | Single `XpLedger` + `XpRule`; ban parallel counters |
| Hard-coded level/rank in 3 controllers | Extract `ProgressionService` |
| Coach sees all staff nav (desk/kitchen) | Role-aware staff shell |
| Hobby Vercel deploy flakiness | CLI/prebuilt path; don't block product on it |
| Scope explosion (full vision) | Strict phases; Phase 1 = coach can run a class |
| Messages unread/orphaned | Wire into coach + member shells before new chat product |
| No idempotency on XP | Add `idempotencyKey` unique on ledger |

**Breaking changes to avoid:** renaming `sullys_token`, changing check-in XP reason without migration, removing TV board query shape without versioning.

---

## 13. Phased roadmap (aligned to vision)

### Phase 1 — Coach Foundation (implement first after approval)

**Goal:** Coach walks in → sees today → starts class → roster → timer → finish → XP on complete.

1. Staff Coach shell (nav, auth gate, tablet layout)  
2. Coach Home dashboard (today/next/live, capacity, checked-in count)  
3. Scope sessions to assigned coach (+ admin override)  
4. Live Class Mode UI + control bar (START/PAUSE/NEXT/REST/FINISH)  
5. `LiveClassState` API + TV poll consumes it (coach-synced timer)  
6. Roster enhancements: one-tap mark present; attention chips (new / late / streak)  
7. Basic coach assessment + note on athlete  
8. Class-complete XP event (extend ledger; idempotent)  
9. Boxing Card / passport surface level + last class summary  
10. Thin `/app/coach` phone mirror (home + live controls)

**Success criteria (from prompt):** steps 1–5, 15–16 of the walk-in list.

### Phase 2 — Game Engine

- `GameDefinition` config (not hard-coded games)  
- Seed Bag Battle, Combo Rush, Team Sully's, Kids Quest (config JSON)  
- GameSession + scores + XP rules  
- Teams in-class  
- Multi leaderboard queries  
- Challenges (personal/class)

### Phase 3 — Second Screen

- Coach TV control API  
- Modes: timer, workout, teams, leaderboard, celebration, announcement  
- Celebration events (level-up, PB) with coach kill-switch  

### Phase 4 — Analytics

- Athlete trends · Coach ops analytics (no coach ranking) · Game engagement · Attention alerts  

### Phase 5 — Hardware

- Scan event taxonomy · NFC-ready · Punch provider interface + FightCamp/Hykso stubs  

### Phase 6 — Advanced

- Full skill tree UI · Video tagging (scaffold) · AI coach assistant (read-only insights)  

### Phase 7 — Ecosystem

- Seasons · cross-program competitions · multi-location · advanced rewards  

---

## 14. Prioritized backlog (Phase 1 tickets)

| ID | Item | Size | Depends |
|----|------|------|---------|
| CF-01 | Staff AppShell + coach RBAC nav | S | — |
| CF-02 | `GET /coach/home` + today sessions | S | CF-01 |
| CF-03 | Session scoping by `coachUserId` | S | — |
| CF-04 | `LiveClassState` schema + start/pause/next/finish | M | CF-03 |
| CF-05 | Live Class Mode UI (tablet) | M | CF-04 |
| CF-06 | TV board reads LiveClassState | S | CF-04 |
| CF-07 | Roster one-tap + attention | S | CF-03 |
| CF-08 | CoachNote + Assessment models/API/UI | M | CF-07 |
| CF-09 | `class.completed` XP + ProgressionService extract | M | CF-04 |
| CF-10 | Passport/Card show progression hooks | S | CF-09 |
| CF-11 | `/app/coach` phone mirror | M | CF-05 |
| CF-12 | Seed: assign Maria/Jamal sessions; demo live class | S | CF-03 |

---

## 15. Testing plan (Phase 1)

- Coach cannot access owner brief / admin users  
- Coach only lists own sessions (admin sees all)  
- Live start/pause/next idempotent; TV shows same round within poll window  
- Finalize attendance + class complete awards XP once (idempotency key)  
- Youth assessment visibility restricted to guardian + staff  
- Duplicate check-in still returns `xpAwarded: 0`  
- Regression: desk scan, member book, public `/coaches`, TV offline cache  

---

## 16. Forgotten / watch-outs

- **Substitution / vacation** — not in Phase 1; note for Phase 4  
- **Cert expiry** — coach profile field later  
- **Feature flags** — gate Live Class + Games per org  
- **Locale / timezone** — use `Location.timezone` for “today”  
- **Round Clock open-gym sync** — keep when no LiveClass; LiveClass overrides  
- **Trainer control of Round Clock** — delivered via Live Class Mode (answers prior product question)  
- **Vercel Hobby author/deploy quirks** — deploy staff/web via known-good path  
- **Do not gamify injury** — encode in GameDefinition.safetyRules + Kids Quest scoring  

---

## 17. Phase 1 shipped (local)

Approved and implemented:

| Surface | Path |
|---------|------|
| Coach home | Staff `/coach` · Web `/app/coach` |
| Live Class + **coach timer** | `/coach/live/[sessionId]` · `/app/coach/live/[sessionId]` |
| Timer API | `POST /api/v1/coach/sessions/:id/live/{start\|pause\|resume\|next\|back\|rest\|round\|finish}` |
| Floor TV | Reads `coachTimer` from `/api/v1/tv/board` — label **coach controlled** |
| Notes / assessments | `POST /api/v1/coach/notes` · `POST /api/v1/coach/assessments` |
| Class-complete XP | +25 idempotent on FINISH |

**Try locally:** sign in `coach@sullys.local` / `password123` on staff → **Coach Command Center** → **Open Live Class Mode** → START · open `/tv/floor` on second screen.
