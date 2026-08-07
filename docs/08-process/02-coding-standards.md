# Coding Standards

## Language

- **TypeScript strict** everywhere  
- `noImplicitAny`, `strictNullChecks`  
- Prefer `unknown` over `any`; narrow explicitly  

---

## Style

- ESLint + Prettier enforced in CI  
- Named exports preferred for components/utils  
- Files: `kebab-case` for routes; `PascalCase` for React components  

---

## React / Next.js

- Server Components default; Client only when needed  
- Follow team React Compiler guidance — don't sprinkle `useMemo`/`useCallback` without cause  
- Prefer `useEffectEvent` where appropriate for event handlers in effects  
- Accessible components from `packages/ui` — don't fork one-off buttons  

---

## API / Nest

- Thin controllers; business logic in application services  
- Domain validation separate from HTTP  
- DTOs via Zod or class-validator — single schema shared to `packages/types` when possible  
- Never trust client `organizationId` — take from auth context  

---

## Database

- Migrations reviewed  
- Indexes for foreign keys used in filters  
- No unbounded lists — pagination required  
- Explicit transactions for booking/check-in/points spend  

---

## Security Coding Rules

- Authorize every endpoint with permission decorator  
- Encrypt/minimize medical fields  
- Log redaction middleware  
- HTML sanitize any CMS content  

---

## Testing Standards

- Policy functions: pure unit tests  
- External I/O: mocked at boundary  
- Flaky E2E: quarantine with ticket within 48h  

---

## Git Commit Messages

Imperative, scoped when helpful:

```
feat(check-in): add late arrival flag
fix(billing): handle invoice.paid idempotently
```

---

## Performance Budgets (Draft)

- Member LCP < 2.5s on 4G  
- Check-in API p95 < 200ms  
- Staff tables virtualize > 100 rows  
