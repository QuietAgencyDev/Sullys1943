# Authentication Design

## Goals

- Secure member and staff access  
- Parent–child linking without sharing passwords  
- MFA for privileged roles  
- Session hygiene for shared desk devices  
- Franchise-ready org context switching  

---

## Recommended Approach

**Managed auth provider** (Clerk, Auth0, or Supabase Auth) for:

- Email/password + social (optional Google/Apple)  
- Magic link / OTP  
- MFA (TOTP / SMS for staff)  
- Device session management  

**Application authorization** remains in our API (RBAC + entitlements + RLS). Auth provider = identity; our DB = permissions & profiles.

### Identity Linking

```
auth_user_id (provider) 1—1 users.id
users 1—N staff_assignments
users 1—N memberships (as payer or member)
users 1—N guardianships
```

---

## AuthN Flows

| Flow | Details |
|------|---------|
| Register | Email verify required before membership purchase (or soft verify with payment) |
| Login | Password or OTP |
| Staff login | MFA required if role ∈ {owner, admin, front_desk, developer} |
| Kiosk / scanner | Device-bound service user OR staff PIN + hardware lock |
| Impersonation | Break-glass; MFA; reason; 15-min TTL; audit |

---

## Tokens & Sessions

- **Member app:** short-lived access token + rotating refresh; secure cookies on web (`HttpOnly`, `Secure`, `SameSite=Lax/Strict`)  
- **Staff console:** shorter idle timeout (e.g., 30–60 min)  
- **Desk tablets:** supervised mode; auto-lock; no personal email lingering  
- **WebSocket:** exchange access token for socket ticket  

---

## Parent / Child / Teen

1. Parent verified account  
2. Creates child profile (no login) or teen invite  
3. `guardianships` row with permissions bitmask (pay, book, message, view medical)  
4. Teen accepts invite; parent retains override  
5. Age-up job: child → teen → adult transitions with consent prompts  

---

## Organization Context

JWT / session claims include:
- `userId`
- `orgId` (active)
- `locationId` (active)
- `roles[]` for active location  

Switching location re-issues session claims after AuthZ check.

---

## Password & Credential Policy

- Min length 12; breach list check (HaveIBeenPwned k-anonymity)  
- Staff: MFA  
- Recovery: email + SMS optional; support desk identity verify SOP  

---

## QR Check-In Auth

- Presenting QR is **not** full login  
- Rotating token minted for authenticated member session OR long-lived card token bound to user with rate limits  
- Scanner authenticates separately  

---

## API Key / Webhooks

- Stripe: signing secret  
- Internal workers: mTLS or signed queue tokens  
- Partner APIs (Future): scoped API keys per org  

---

## Account Lifecycle

- Deactivate / suspend  
- Anonymize on DSAR erase where legally allowed  
- Retain liability documents under legal hold  

---

## Threats & Mitigations

| Threat | Mitigation |
|--------|------------|
| Credential stuffing | Rate limit, CAPTCHA, MFA staff |
| Shared QR screenshots | Rotating tokens |
| Parent account takeover | MFA optional for parents; alerts on email change |
| Desk session leave-behind | Auto-lock, shared account discipline |
| Token theft | Short TTL, rotation, revoke all sessions |
