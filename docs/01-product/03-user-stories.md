# User Stories

Format: `As a [persona], I want [capability], so that [outcome].`  
Acceptance criteria are summarized; full Gherkin lives in the backlog tool during build.

IDs: `US-{DOMAIN}-{###}`  
Priority tags reference MoSCoW: **M**ust / **S**hould / **C**ould / **F**uture

---

## Authentication & Accounts

| ID | Story | P |
|----|-------|---|
| US-AUTH-001 | As a guest, I want to register with email or phone, so that I can book a trial. | M |
| US-AUTH-002 | As a member, I want passwordless magic link / OTP option, so that I can log in quickly at the gym. | S |
| US-AUTH-003 | As a parent, I want to link child accounts I legally guardian, so that I can manage their membership. | M |
| US-AUTH-004 | As staff, I want SSO-free but MFA-enforced staff login, so that desk accounts stay secure. | M |
| US-AUTH-005 | As a teen, I want my own login under parental supervision, so that I can check in independently. | M |
| US-AUTH-006 | As an admin, I want to force logout / disable accounts, so that I can respond to incidents. | M |

---

## Waivers & Documents

| ID | Story | P |
|----|-------|---|
| US-WAI-001 | As a guest, I want to sign a waiver digitally before my visit, so that I am ready to train. | M |
| US-WAI-002 | As a parent, I want to sign minor consent and medical disclosure, so that my child can participate. | M |
| US-WAI-003 | As front desk, I want to see waiver validity instantly, so that I never admit an unsigned athlete. | M |
| US-WAI-004 | As admin, I want versioned templates, so that legal updates supersede old forms. | M |
| US-WAI-005 | As a member, I want a PDF copy of signed documents, so that I have my own record. | S |
| US-WAI-006 | As owner, I want competition and photo consents as separate templates, so that risk is scoped. | M |
| US-WAI-007 | As staff, I want to acknowledge safety policies digitally, so that HR has proof. | S |

---

## Membership & Billing

| ID | Story | P |
|----|-------|---|
| US-MEM-001 | As a guest, I want to purchase a membership online, so that I can start without paperwork. | M |
| US-MEM-002 | As a member, I want monthly auto-renew with card on file, so that my access never lapses unexpectedly. | M |
| US-MEM-003 | As a parent, I want a family plan covering multiple children, so that billing is simple. | M |
| US-MEM-004 | As front desk, I want to sell punch cards and drop-ins, so that casual visitors can train. | M |
| US-MEM-005 | As owner, I want scholarship and VIP membership types, so that I can support special cases. | S |
| US-MEM-006 | As a member, I want to pause membership for travel/injury, so that I don't cancel permanently. | S |
| US-MEM-007 | As admin, I want configurable entitlements per plan, so that class access rules aren't hardcoded. | M |
| US-MEM-008 | As a member, I want failed payment recovery flows, so that I can update my card easily. | M |

---

## Check-In & Attendance

| ID | Story | P |
|----|-------|---|
| US-CHK-001 | As a member, I want to check in with a QR code on my digital membership card, so that entry is fast. | M |
| US-CHK-002 | As the system, I want to award XP on valid check-in, so that habits are reinforced. | M |
| US-CHK-003 | As front desk, I want late arrival flags, so that coaches know who missed warm-up. | S |
| US-CHK-004 | As coach, I want live attendance roster, so that I know who is on the floor. | M |
| US-CHK-005 | As owner, I want capacity enforcement, so that classes stay safe and premium. | M |
| US-CHK-006 | As a member, I want Apple/Google Wallet passes (future), so that I need no app open. | F |
| US-CHK-007 | As parent, I want push when my child checks in, so that I know they arrived safely. | S |
| US-CHK-008 | As front desk, I want Command Center presence of who is in the gym, so that the floor is visible at a glance. | C |

---

## Classes & Scheduling

| ID | Story | P |
|----|-------|---|
| US-CLS-001 | As a member, I want to browse and book classes from my calendar hub, so that I can plan my training week. | M |
| US-CLS-002 | As a member, I want waitlist auto-promotion, so that I can take canceled spots. | M |
| US-CLS-003 | As coach, I want to build workouts and attach them to classes, so that sessions are consistent. | S |
| US-CLS-004 | As admin, I want unlimited program types, so that camps, parties, and seniors fit the same system. | M |
| US-CLS-005 | As owner, I want utilization reports, so that I can adjust the timetable. | M |
| US-CLS-006 | As a member, I want cancellation policy enforcement, so that no-shows are fair. | S |
| US-CLS-007 | As a member, I want my calendar to show nutrition, challenges, achievements, and gym events—not only classes—so that one place runs my gym life. | M |
| US-CLS-008 | As a coach, I want an ops calendar for classes, private lessons, sparring, vacation, and certifications, so that my day is managed in one view. | S |
| US-CLS-009 | As an owner, I want an ops calendar for renewals, staff, payroll, maintenance, inventory, marketing, and events, so that I see the whole facility. | S |

---

## Displays (Gym TV & Command Center)

| ID | Story | P |
|----|-------|---|
| US-TV-001 | As a member on the floor, I want Gym TV to show live schedule and open spots, so that I know what is next without asking desk. | S |
| US-TV-002 | As an owner, I want a Command Center board with revenue, check-ins, kitchen queue, and alerts, so that the facility runs as one ecosystem. | C |
| US-TV-003 | As admin, I want TV privacy profiles (lobby/kids/floor), so that minors and PII stay protected. | M (before TV GA) |

---

## Kids / Youth

| ID | Story | P |
|----|-------|---|
| US-KID-001 | As a parent, I want to view my child's attendance history, so that I can track consistency. | M |
| US-KID-002 | As a parent, I want digital report cards and coach feedback, so that I see skill progression. | S |
| US-KID-003 | As a coach, I want to stamp skills/achievements for kids, so that progress is visible. | S |
| US-KID-004 | As a parent, I want announcements per youth program, so that I don't miss gear or schedule changes. | M |
| US-KID-005 | As admin, I want age-based class eligibility rules, so that kids land in the right session. | M |
| US-KID-006 | As a parent, I want waiver status, camp registrations, nutrition lessons, and upcoming events in one hub, so that I never call the desk for basics. | S |

---

## Nutrition

| ID | Story | P |
|----|-------|---|
| US-NUT-001 | As a member, I want an assigned meal plan, so that I know what to eat. | S |
| US-NUT-002 | As a member, I want recipes and shopping lists, so that prep is easy. | S |
| US-NUT-003 | As a member, I want hydration and habit tracking, so that I build healthy routines. | C |
| US-NUT-004 | As a nutrition coach, I want adherence visibility, so that I can coach effectively. | S |
| US-NUT-005 | As a member, I want educational courses, so that I learn why the plan works. | C |
| US-NUT-006 | As a member, I want meal prep pickups, smoothie orders, nutrition classes, and grocery reminders on my calendar, so that nutrition fits my training day. | S |

---

## Kitchen

| ID | Story | P |
|----|-------|---|
| US-KIT-001 | As a member, I want to pre-order meals/smoothies, so that pickup is ready after training. | S |
| US-KIT-002 | As kitchen staff, I want allergen-highlighted tickets, so that we never miss a risk. | M |
| US-KIT-003 | As kitchen staff, I want inventory and 86ing, so that we don't oversell. | S |
| US-KIT-004 | As a member, I want meal prep subscriptions, so that healthy food is automatic. | C |
| US-KIT-005 | As owner, I want kitchen revenue and margin reports, so that the café is accountable. | S |

---

## Gamification & Rewards

| ID | Story | P |
|----|-------|---|
| US-GAM-001 | As a member, I want XP and levels for real training actions, so that consistency feels rewarding. | M |
| US-GAM-002 | As a member, I want boxing ranks, skill trees, and milestones, so that my progression feels like boxing—not a generic fitness app. | S |
| US-GAM-003 | As a member, I want badges and challenges on my calendar, so that goals are visible in my training hub. | S |
| US-GAM-004 | As a member, I want to redeem points for gear and perks, so that loyalty pays off. | S |
| US-GAM-005 | As owner, I want anti-cheat rules on XP, so that gaming the system is hard. | M |
| US-GAM-006 | As a member, I want streaks, personal bests, and weekly quests, so that I have a reason to return. | S |

---

## Community & Events

| ID | Story | P |
|----|-------|---|
| US-COM-001 | As a member, I want a private gym feed with achievements, fight photos, tips, recipes, specials, challenges, and merch, so that I open the app even when I'm not training. | C |
| US-COM-002 | As coach/admin, I want to post announcements, so that everyone sees critical info. | M |
| US-COM-003 | As a member, I want to RSVP and pay for events, so that fight nights and seminars are seamless. | S |
| US-COM-004 | As admin, I want moderation tools, so that the community stays safe (esp. minors). | M (before open posting) |

---

## AI (Future-Facing Stories)

| ID | Story | P |
|----|-------|---|
| US-AI-001 | As a member, I want an AI coach suggestion based on my attendance, so that I know what to do next. | F |
| US-AI-002 | As a nutrition coach, I want AI draft meal plans I can edit, so that I save time. | F |
| US-AI-003 | As an owner, I want churn risk scores, so that staff can intervene early. | F |
| US-AI-004 | As support, I want AI-assisted FAQ answers with human handoff, so that desk load drops. | F |

---

## Owner & Admin

| ID | Story | P |
|----|-------|---|
| US-OWN-001 | As an owner, I want live MRR/ARR and churn, so that I can run the business. | M |
| US-OWN-002 | As an owner, I want at-risk member lists, so that retention outreach is targeted. | S |
| US-OWN-003 | As an admin, I want RBAC and audit logs, so that changes are accountable. | M |
| US-OWN-004 | As an admin, I want feature flags, so that we can roll out safely. | M |
| US-OWN-005 | As a franchise manager, I want cross-location KPIs, so that I can coach underperforming gyms. | F |

---

## Messaging

| ID | Story | P |
|----|-------|---|
| US-MSG-001 | As a coach, I want to message a member or parent about class, so that coordination is in-app. | S |
| US-MSG-002 | As a parent, I want notifications for cancellations, so that I don't drive unnecessarily. | M |
| US-MSG-003 | As admin, I want email/SMS/push templates, so that tone stays on-brand. | M |

---

## Store

| ID | Story | P |
|----|-------|---|
| US-STO-001 | As a member, I want to buy gear online/pickup, so that I get gloves and wraps easily. | C |
| US-STO-002 | As admin, I want inventory for retail SKUs, so that we don't oversell. | C |

---

## Acceptance Criteria Pattern (All Must Stories)

1. Multi-tenant isolation enforced (org/location)
2. Role permission checked server-side
3. Audit event written for sensitive actions
4. Mobile-usable for member-facing paths
5. Empty, loading, and error states defined
6. Analytics event emitted per analytics plan
7. Works offline-tolerant only where specified (check-in fallback is online-first with desk backup)
