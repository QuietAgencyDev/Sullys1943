# UI Design System

## Design North Star

**Heritage performance** — Sully's Boxing Gym EST 1943 badge energy × modern athletic product clarity. Dark-first for floor usability; cream + classic red + chocolate brown from the official logo. Glassmorphism used **sparingly** — never at the cost of readability under gym lighting.

Official mark: [Brand Guidelines](./03-brand-guidelines.md) · [`assets/sullys-logo-primary.png`](./assets/sullys-logo-primary.png)

---

## Themes

- **Default:** Dark charcoal (member + staff + Command Center) with **heritage accents**  
- **Marketing / light:** Cream field inspired by logo interior  
- **Optional light app theme:** accessibility / outdoor glare  
- Tokens drive all themes; no one-off hex in components.

---

## Color Palette (Logo-Locked Tokens)

Extracted from the official Sully's badge — refine when master vector lands.

| Token | Role | Value |
|-------|------|-------|
| `--brand-cream` | Logo field / light canvas / highlight text | `#F3E6C8` |
| `--brand-red` | Script / stars / primary CTA accent | `#C82026` |
| `--brand-brown` | Borders / caps labels / strong text on cream | `#3A2418` |
| `--brand-glove` | Illustration warm secondary (sparingly) | `#C4A06A` |
| `--bg-canvas` | App background (dark theme) | `#140F0C` |
| `--bg-elevated` | Surfaces | `#1C1612` |
| `--bg-cream` | Marketing / light panels | `#F3E6C8` |
| `--bg-glass` | Overlay | `rgba(28,22,18,0.78)` |
| `--text-primary` | Primary text on dark | `#F3E6C8` |
| `--text-muted` | Secondary on dark | `#B8A990` |
| `--text-on-cream` | Text on cream | `#3A2418` |
| `--accent` | CTA / energy | `var(--brand-red)` |
| `--accent-contrast` | Text on accent | `#F3E6C8` |
| `--danger` | Errors / allergens | `#E23B3B` (aligned to brand red family) |
| `--warning` | Late / past due | `#D4A017` |
| `--success` | Checked in / paid | `#2F9E6B` |
| `--border` | Hairline on dark | `rgba(243,230,200,0.12)` |
| `--focus` | Focus ring | brand red @ 0.85 |

**Do not** introduce purple, electric lime, or unrelated “startup” accents.  
**Allergen / safety:** never rely on color alone — icon + text.

---

## Typography

Avoid Inter/Roboto/Arial as brand voice.

| Role | Suggestion | Notes |
|------|------------|-------|
| Brand script | Licensed match to **Sully's** wordmark | Marketing heroes, rare celebrations only |
| Display athletic | Condensed sans | Ranks, TV scores |
| Headline | Satoshi / General Sans / similar grotesque | Section titles |
| Body | Same grotesque | Forms, data |
| Heritage caps | Bold classic caps (echo “BOXING GYM”) | EST chips, program labels |
| Mono | JetBrains Mono | Codes, IDs staff |

**Scale:** `12 / 14 / 16 / 18 / 24 / 32 / 40 / 56` with modular rhythm.  
**Line height:** body 1.5; display tighter.  
Script must never be used for dense tables, forms, or legal copy.

---

## Spacing & Grid

- Base unit **4px**; preferred spacing `4,8,12,16,24,32,48,64`  
- Mobile content width fluid with `16–20px` gutters  
- Desktop staff: 12-column; max content 1440  
- Member home / calendar hub: single-column composition, not dashboard soup  
- Marketing first viewport: **badge or Sully's script as hero-level brand signal**

---

## Corner Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 4px | Inputs; slightly sharper = heritage plaque feel |
| `--radius-md` | 10px | Buttons, sheets |
| `--radius-lg` | 16px | Feature panels |
| `--radius-full` | 9999 | Avatars only sparingly |

Avoid pill overload. Optional: shield-inspired frames for Command Center KPI tiles (subtle, not literal logo clones everywhere).

---

## Shadows & Elevation

Dark UI: prefer **border + warm ambient**, not heavy Material shadows.

- `elev-1`: `0 1px 0 rgba(243,230,200,0.06)`  
- `elev-2`: soft ambient `0 8px 24px rgba(0,0,0,0.5)`  
- Accent glow on primary CTA: subtle red, never neon bloom  

---

## Components

### Buttons
- **Primary:** brand red fill, cream label, min height 44px  
- **Secondary:** cream/brown border ghost on dark  
- **Destructive:** deeper red outline/fill  
- **States:** hover, active, disabled, loading (spinner left)  

### Cards
Default **no cards** on marketing hero (badge + photography). In-app: elevated surfaces for **interactive groupings**. Shield silhouette optional as watermark on TV/Command Center — low opacity.

### Inputs
High contrast fields; visible labels; error text below.

### Charts (Owner / Command Center)
- Cream gridlines on dark  
- Brand red for primary series  
- Glove tan for secondary comparison  
- Empty state with badge or gloves mark + CTA  

### Icons
- Lucide or custom dual-tone; warm cream on dark  
- Optional custom glove glyph for check-in success  

### Navigation
- Member: bottom tabs (**Calendar/Home**, Scan/Card, Nutrition, Community, Profile)  
- Staff: left rail; Command Center as desk home option  
- Calendar is the primary member surface — not a buried submenu  
- Nav logo: full badge on marketing; compact gloves or horizontal lockup in app header  

---

## States

| State | Pattern |
|-------|---------|
| Loading | Skeleton matching layout; avoid full-page spinners except first load |
| Empty | Illustration + one sentence + one CTA (heritage-friendly, not clipart) |
| Error | Plain language + retry + support link |
| Success | Toast + optional celebration for achievements (red/cream, not rainbow confetti spam) |
| Offline | Banner; desk mode instructions |

---

## Accessibility

- WCAG 2.2 AA target  
- Focus visible  
- Reduced motion support  
- Tap targets ≥ 44px  
- Screen reader labels on QR scanner controls  
- Don't lock zoom  

---

## Responsive Breakpoints

`sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1536`  

Mobile-first member flows; staff tables enhance on lg+.

---

## Content Tone in UI

Short, confident, respectful.  
"You're checked in." not "Yay!!!"  
Youth UI: warmer, simpler words; still not childish chaos.

---

## Change Log

- **2026-08-07:** Palette and type locked to official Sully's badge (cream / classic red / chocolate brown); removed draft lime accent.
