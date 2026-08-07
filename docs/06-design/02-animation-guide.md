# Animation Guide

## Principles

1. **Presence over noise** — 2–3 intentional motions per key screen  
2. **Speed** — most transitions 150–250ms; celebrations ≤ 800ms  
3. **Meaning** — motion confirms action (check-in, level-up), doesn't decorate randomly  
4. **Respect** — `prefers-reduced-motion: reduce` → opacity crossfades only  
5. **Performance** — compositor-friendly (`transform`, `opacity`); avoid layout thrash on check-in  

---

## Motion Tokens

| Token | Duration | Easing |
|-------|----------|--------|
| `motion.fast` | 120ms | `ease-out` |
| `motion.base` | 200ms | cubic-bezier(0.2, 0.8, 0.2, 1) |
| `motion.slow` | 320ms | same |
| `motion.celebrate` | 600–800ms | spring (stiffness moderate) |

---

## Signature Motions (Ship These)

### 1. Check-In Success
- Soft scale pulse on checkmark  
- Haptic (native) / subtle flash border success  
- XP `+10` floats up and fades  

### 2. Home Streak / Progress
- Ring or bar animates to value on load once per session  
- Streak flame gently breathes (disabled if reduced motion)  

### 3. Level / Badge Unlock
- Modal with badge spin-in → settle  
- Confetti **optional** and rare (max particles low)  

### 4. Page Transitions (App)
- Shared element feel: content fade+slide 8px  
- Tabs: crossfade  

### 5. Kitchen KDS
- New order slides in from top  
- Ready status color wipe — functional, not playful  

---

## Interaction Microcopy Motions

- Button press: scale 0.98  
- List items: stagger ≤ 30ms (cap 5 items)  
- Toasts: slide from top  

---

## Forbidden

- Infinite bouncing CTAs  
- Parallax heavy on scroll for staff tools  
- Glass blur animations that tank low-end Androids  
- Blocking celebrations before check-in confirms  

---

## Implementation

- Motion library with variants in `packages/ui`  
- Central `useMotionConfig()` respects reduced motion  
- Lottie only for rare brand moments (preload carefully)  
