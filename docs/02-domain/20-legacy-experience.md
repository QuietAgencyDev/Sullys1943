# Legacy Experience — Passport, Legacy Wall & Trophy Room

**Status:** Blueprint v1.2  
**Why it matters:** Most gyms cannot buy an 80-year story. Sully's can — and the digital platform must make that legacy **experiential**, not a paragraph on an About page.

---

## 1. Boxing Passport (Every Member)

A digital passport — the member's living record at Sully's. Accessible from profile, calendar hub, and (opt-in slices) Gym TV.

### Shows
| Field | Notes |
|-------|-------|
| Years at Sully's | From first membership / first check-in |
| Primary coach | Assigned or most-trained-with |
| XP / Level / Boxing rank | From Boxing Progression |
| Attendance | Totals, streaks, heatmaps |
| Fight record | Amateur/pro bouts logged with consent |
| Achievements | Badges, milestones, rare trophies |
| Nutrition | Plan adherence summary / courses completed |
| Volunteer hours | Community / kids event support |
| Kitchen rewards | Redemptions / loyalty |
| Certificates | Camps, courses, coach-issued |

### UX
- Passport “cover” uses heritage badge motifs (cream/red/brown)  
- Share card (opt-in) for social / community feed  
- Youth passports: parent-controlled visibility  

### Phase
- **Thin passport** after Phase 3–4 (years, attendance, XP, achievements)  
- Fight record, volunteer, certificates as data exists  

---

## 2. Sully's Legacy Wall (Interactive Timeline)

Public + in-app interactive history museum.

```
1943 Founding
  ↓
George Chuvalo
  ↓
Muhammad Ali
  ↓
Lennox Lewis
  ↓
Clyde Gray · Fern Bull · Razor Ruddock · …
  ↓
Today — current fight team & youth champions
```

### Capabilities
- Scrubable timeline by decade  
- Entry types: era, person, event, championship, photo, video, article  
- CMS for staff/historians (versioned, rights flags)  
- Deep links from website homepage “Explore the Legacy”  

### Legal / editorial
- Alumni likeness and media require rights clearance  
- Distinguish “trained at / associated with” carefully and accurately  
- Prefer primary sources and gym archives  

---

## 3. Digital Trophy Room / Hall of Fame

Every championship, famous boxer, coach, and landmark event — browsable archive.

| Content | Media |
|---------|-------|
| Championships | Photos, belt stories |
| Famous alumni | Bios, highlight reels |
| Coaches | Biographies (sync with coach profiles) |
| Events | Fight nights, historical cards |
| Press | Articles, clippings |

### Features
- Filter: decade, weight class, youth vs elite, coach  
- Featured “this month in history” for TVs and homepage  
- Member contributions: submit memory → moderation queue  

---

## 4. Coach Biographies

Public coach pages richer than a headshot:

- Legacy connection (who they trained under / with)  
- Specialties, classes, certifications  
- Book trial with this coach CTA  

---

## Differentiation vs Glofox

| Glofox-class | Sully's |
|--------------|---------|
| No heritage product | Legacy Wall + Trophy Room + Passport |
| Generic member profile | Boxing Passport as prestige object |
| About page text | Interactive museum-grade storytelling |

---

## Data Model (Logical)

- `legacy_timeline_entries`  
- `hall_of_fame_entries`  
- `media_assets` + `rights_metadata`  
- `boxing_passports` (view/projection over member stats)  
- `fight_records`  
- `certificates`  

---

## Phase Mapping

| Piece | Priority | Phase |
|-------|----------|-------|
| Passport MVP (attendance, XP, years, badges) | Should | 4 |
| Coach bios upgrade | Should | 3 |
| Legacy Wall public MVP | Should | 4–5 |
| Trophy Room / HoF depth | Could | 7–8 |
| Member memory submissions | Could | 8 |

---

## Change Log

- **2026-08-07:** Legacy Experience module added (Passport, Wall, Trophy Room).
