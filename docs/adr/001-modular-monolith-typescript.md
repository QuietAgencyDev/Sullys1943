# ADR-001: Modular monolith + TypeScript stack

- Status: Accepted
- Date: 2026-08-07

## Context

Sully's needs a franchise-ready platform spanning website, member portal, and gym OS. Team should move fast without premature microservice overhead.

## Decision

- **Modular monolith** API (NestJS) with clear domain modules
- **Next.js** for marketing + member/parent portal (`apps/web`)
- **PostgreSQL + Redis** via Docker locally
- **npm workspaces + Turborepo** (pnpm preferred later when install permissions allow)
- **Shared packages** for tokens, UI, and types

## Consequences

- Single deployable API initially; extract workers (PDF, notifications, AI) when needed
- Shared types reduce contract drift
- Must enforce `organization_id` / RLS from first schema
