# AI Features — Sully AI

## Purpose

**Sully AI** is a conversational assistant layered on the Gym OS — members, parents, and owners ask in natural language instead of hunting menus. It amplifies coaches and operators; it never replaces duty of care, medical judgment, or human coaching.

---

## Conversational Experiences

### Members ask
- “Book boxing tomorrow.”  
- “Show my nutrition.”  
- “How close am I to Champion?”  
- “Order my protein shake.”  
- “What's on my calendar today?”  
- “Show my Boxing Passport.”  

### Parents ask
- “When is Emma's next class?”  
- “Did Emma check in?”  
- “Any unpaid fees?”  
- “Show Emma's skill progress.”  

### Owners / staff ask
- “Show memberships expiring this week.”  
- “What's today's kitchen revenue?”  
- “Who is in the gym right now?”  
- “Class utilization this week.”  

Every action that mutates state (book, order, message) requires confirmation + permission checks; AI proposes, platform executes.

---

## Systems Roadmap (Phase 9+)

| System | User | Function | Guardrail |
|--------|------|----------|-----------|
| Sully AI Concierge | All | NL intents → tools | Confirm mutations; audit |
| AI Coach | Member | Next-session suggestions | Not injury diagnosis |
| AI Nutrition Assistant | Member/Coach | Plan Q&A + drafts | Allergen-safe; coach approve publishes |
| AI Meal Planner | Nutrition Coach | Draft plans | Human approve |
| AI Business Analytics | Owner | Narrative KPI insights | Show underlying metrics |
| AI Member Retention | Staff/Owner | Churn risk + playbooks | Avoid discriminatory features |
| AI Workout Generator | Coach | Draft sessions | Coach edit required |
| AI Injury Prevention Suggestions | Coach/Member | Load hints | Explicit non-medical disclaimer |
| AI Customer Support | All | FAQ + ticket draft | Human handoff; no legal advice |

---

## Architecture Pattern

```
Chat UI / Voice (future) → Orchestrator → Tools (calendar, booking, kitchen, analytics, passport)
                              ↓
                       Prompt + policy layer
                              ↓
                       Validator + AuthZ
                              ↓
                       Audit log (redacted)
```

**RAG** over gym policies, class descriptions, nutrition education, **Legacy Wall public facts** — never over other members' private medical notes.

---

## Data Prerequisites

- Clean attendance ≥ 95%  
- Membership status accuracy  
- Opt-in for personal metrics in AI  
- Minors: default **off**; parent-mediated queries only  

---

## Model Hosting

- Reputable API providers with DPA (prefer Azure OpenAI for residency options)  
- PII minimization in prompts  
- Spend caps per org  
- Cache common FAQs / legacy facts  

---

## Evaluation

- Intent gold sets (book, nutrition, rank progress, parent schedule, owner expiry)  
- Coach/owner override rate  
- Red-team medical/legal overreach  
- Never auto-send parent messages without policy  

---

## Non-Goals

- Autonomous medical diets  
- Fight outcome gambling predictions  
- Emotion recognition on cameras  
- Always-on form analysis without consent program  

---

## Phase Mapping

| Piece | Priority | Phase |
|-------|----------|-------|
| FAQ bot (read-only) | Could | 8 soft |
| Full Sully AI tools (book/order/query) | Future | 9 |
| Retention + analytics narratives | Future | 9 |
| Voice on floor kiosks | Future | 10+ |

---

## Change Log

- **2026-08-07:** Reframed as Sully AI conversational concierge with member/parent/owner example intents.
