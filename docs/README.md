# Sully's Gym Performance Platform — Blueprint Index

**Status:** Pre-implementation specification  
**Version:** 1.2.0  
**Last Updated:** 2026-08-07  
**Audience:** Engineering, Product, Design, Operations, Legal, Franchise Leadership

This folder is the **single source of truth** for architecture, product scope, and delivery sequencing. No application code should be written until Phase 0 exit criteria in [Implementation Sequence](./08-process/05-implementation-sequence.md) are met.

**v1.2 adds:** Digital Performance Platform framing (website → portal → gym OS), [sullysboxinggym.com](https://www.sullysboxinggym.com) redesign spec, Boxing Passport / Legacy Wall / Trophy Room, five-screen TV network + signage, Sully AI intents, franchise location tree.  
**v1.1:** Day-one Glofox parity+, Calendar Hub, Command Center, modular map, official logo brand lock.

---

## How to Use This Blueprint

| Role | Start Here | Then Read |
|------|------------|-----------|
| Product / BA | [Vision](./00-executive/01-project-vision.md) | Personas → Journeys → Backlog → MoSCoW |
| Engineering Lead | [Technical Architecture](./03-architecture/01-technical-architecture.md) | System Design → Database → API → Folder Structure |
| Frontend / Mobile | [UI Design System](./06-design/01-ui-design-system.md) | Brand → Animation → User Journeys |
| Backend / Data | [Database Design](./03-architecture/03-database-design.md) | Auth → Permissions → API |
| Security / Compliance | [Security Plan](./04-security/01-security-plan.md) | Auth → Permissions → Waivers |
| DevOps | [Deployment Plan](./05-devops/01-deployment-plan.md) | Security → Testing → Monitoring |
| Domain SMEs | Domain modules in `02-domain/` | Assumptions & Risks |

---

## Document Map

### 00 — Executive
1. [Project Vision](./00-executive/01-project-vision.md)
2. [Mission](./00-executive/02-mission.md)
3. [Business Goals](./00-executive/03-business-goals.md)

### 01 — Product
1. [User Personas](./01-product/01-user-personas.md)
2. [User Journeys & Workflows](./01-product/02-user-journeys.md)
3. [User Stories](./01-product/03-user-stories.md)
4. [Feature Roadmap](./01-product/04-feature-roadmap.md)
5. [Product Backlog (Epics)](./01-product/05-backlog.md)
6. [MoSCoW Prioritization](./01-product/06-prioritization-moscow.md)

### 02 — Domain Modules
0. [Digital Performance Platform Vision](./02-domain/00-digital-performance-platform.md)
1. [Membership System](./02-domain/01-membership-system.md)
2. [Check-In System](./02-domain/02-check-in-system.md)
3. [Class Management](./02-domain/03-class-management.md)
4. [Digital Waiver System](./02-domain/04-digital-waiver-system.md)
5. [Nutrition Center](./02-domain/05-nutrition-center.md)
6. [Sully's Kitchen](./02-domain/06-sullys-kitchen.md)
7. [Kids / Youth Program](./02-domain/07-kids-program.md)
8. [Gamification / Boxing Progression](./02-domain/08-gamification.md)
9. [Rewards Store](./02-domain/09-rewards-store.md)
10. [Community](./02-domain/10-community.md)
11. [Events](./02-domain/11-events.md)
12. [Sully AI](./02-domain/12-ai-features.md)
13. [Owner Dashboard](./02-domain/13-owner-dashboard.md)
14. [Administration](./02-domain/14-administration.md)
15. [Day-One Member Experience](./02-domain/15-day-one-member-experience.md)
16. [Unified Calendar Hub](./02-domain/16-calendar-hub.md)
17. [Gym TV Network & Command Center](./02-domain/17-gym-tv-command-center.md)
18. [Modular Product Architecture](./02-domain/18-modular-architecture.md)
19. [Website & Public Platform](./02-domain/19-website-public-platform.md)
20. [Legacy Experience](./02-domain/20-legacy-experience.md)
21. [Legacy Board Research](./02-domain/21-legacy-board-research.md) — sourced visits + Boxing Canada dates

### 03 — Architecture
1. [Technical Architecture & Stack](./03-architecture/01-technical-architecture.md)
2. [System Design](./03-architecture/02-system-design.md)
3. [Database Design](./03-architecture/03-database-design.md)
4. [Authentication Design](./03-architecture/04-authentication-design.md)
5. [Permissions Matrix](./03-architecture/05-permissions-matrix.md)
6. [API Design](./03-architecture/06-api-design.md)
7. [Monorepo Folder Structure](./03-architecture/07-folder-structure.md)
8. [Proprietary Payment Platform](./03-architecture/08-proprietary-payment-platform.md) — Helcim-first abstraction; audit + implementation plan

### 04 — Security
1. [Security & Compliance Plan](./04-security/01-security-plan.md)

### 05 — DevOps
1. [Deployment & Operations Plan](./05-devops/01-deployment-plan.md)

### 06 — Design
1. [UI Design System](./06-design/01-ui-design-system.md)
2. [Animation Guide](./06-design/02-animation-guide.md)
3. [Brand Guidelines](./06-design/03-brand-guidelines.md)
4. [Vision & Aesthetic](./06-design/04-vision-aesthetic.md)

### 07 — Quality
1. [Testing Strategy](./07-quality/01-testing-strategy.md)
2. [Analytics Strategy](./07-quality/02-analytics-strategy.md)

### 08 — Process
1. [Developer Guidelines](./08-process/01-developer-guidelines.md)
2. [Coding Standards](./08-process/02-coding-standards.md)
3. [Future Expansion Plan](./08-process/03-future-expansion.md)
4. [Assumptions, Risks & Improvements](./08-process/04-assumptions-risks.md)
5. [Implementation Sequence](./08-process/05-implementation-sequence.md)
6. [Client Demo Test Guide](./08-process/06-client-demo-test-guide.md) — full Member / Coach / Staff / TV walkthrough ([PDF](./08-process/Sullys-Client-Demo-Test-Guide.pdf))

### Diagrams
- [Architecture Diagrams (Mermaid)](./diagrams/architecture.md)
- [Entity Relationship Overview](./diagrams/entity-relationships.md)
- [Core Workflows](./diagrams/workflows.md)

---

## Guiding Principles

1. **Multi-tenant from day one** — every record is scoped by `organization_id` / `location_id`.
2. **Configuration over hardcoding** — membership types, waiver templates, programs, and roles are data-driven.
3. **Mobile-first member experience; desktop-first staff/owner tooling.**
4. **Privacy by design** — minors, medical data, and waivers are first-class sensitive domains.
5. **Phased value** — Phase 1–3 match Glofox core; then legacy, smart gym, AI, franchise.
6. **No paper** — digital documents replace physical forms with auditability.
7. **Reward the habit** — attendance and consistency drive boxing progression, not vanity metrics alone.
8. **Calendar is the hub** — training, nutrition, challenges, events, and ops share one calendar system.
9. **One live facility** — website, member app, staff tools, Gym TV network, and Command Center share realtime data.
10. **Legacy is a product** — EST 1943 story ships as Passport, Legacy Wall, and Trophy Room — not only copy.

---

## Change Control

Blueprint changes require:
1. Update to the relevant doc(s)
2. Version bump in this README
3. Note in the affected module's "Change Log" section
4. Product + Architecture sign-off for Must Have scope changes

**Document owners:** Product (scope), Architecture (tech), Design (UI/brand), Security (compliance).
