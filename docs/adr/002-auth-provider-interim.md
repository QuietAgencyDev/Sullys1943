# ADR-002: Auth provider (interim)

- Status: Proposed
- Date: 2026-08-07

## Context

Need MFA for staff, magic link/OTP for members, parent–child linking in our DB.

## Decision (interim for Phase 1)

Ship **email/password + session cookies** in-app for local development, with a clean `AuthProvider` interface so we can swap to **Clerk or Auth0** before production Phase 2 billing go-live.

Authorization (RBAC, entitlements, RLS) always lives in our API.

## Consequences

- Faster local DX now
- Must not bake vendor-specific claims into domain logic
- Production auth vendor chosen before accepting real payments
