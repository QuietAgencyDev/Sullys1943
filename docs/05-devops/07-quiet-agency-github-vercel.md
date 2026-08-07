# Quiet Agency GitHub + Vercel (separate ownership)

Goal: **all Sully’s product code and hosting live under Quiet Agency**, not a personal GitHub/Vercel. Then connect Cursor to that repo and keep building there.

This local folder (`SULLYS`) currently has **no git commits and no remote** — ideal for a clean first push into the new org.

---

## A) Create Quiet Agency GitHub (15 min)

1. Sign into GitHub with a **Quiet Agency** email (or create that account first).
2. Create an **Organization** (recommended name: `Quiet-Agency` or `quietagency`).
   - Plan: Free is fine for private demo repos.
3. Create a new repo under the org:
   - **Name:** `SULLYS` (or `sullys-platform`)
   - **Visibility:** Private (until you choose to open the marketing site)
   - **Do not** add README / .gitignore / license (this folder already has them)
4. Invite yourself (and any QA teammates) as Owner/Admin on the org.

You should end with a URL like:

`https://github.com/Quiet-Agency/SULLYS.git`

---

## B) Create Quiet Agency Vercel (10 min)

1. Sign up / log in at [vercel.com](https://vercel.com) with the **same Quiet Agency** identity (or a Quiet Agency Google Workspace).
2. Create a **Team** named Quiet Agency (Hobby is fine for demo).
3. **Do not** import a project yet — wait until the GitHub repo has the first push.
4. Later: Team Settings → Git → connect the Quiet Agency GitHub org (GitHub App).

---

## C) First push from this machine (with Cursor)

When the empty org repo exists, tell Cursor:

> “Commit everything and push to `https://github.com/ORG/SULLYS.git`”

Or run locally (PowerShell):

```powershell
cd C:\Users\user\.cursor\SULLYS
git checkout -b main
git add .
git status   # confirm no .env / secrets
git commit -m "Initial commit: Sully's Digital Performance Platform (AAA pack)"
git remote add origin https://github.com/ORG/SULLYS.git
git push -u origin main
```

**Never commit:** `apps/api/.env`, `apps/web/.env.local`, `apps/staff/.env.local`, `*.db`, Stripe keys.

---

## D) Connect Cursor to the new GitHub

1. Cursor → **Settings → Account / GitHub** → sign in / authorize the **Quiet Agency** GitHub user or org.
2. Prefer working in a clone of the org repo (not a personal fork):
   - File → Open Folder → clone `Quiet-Agency/SULLYS`, **or**
   - Keep this folder and just set `origin` to the org remote (step C).
3. In chat, confirm with: “Remote is Quiet Agency — continue building on `main`.”

Optional: enable GitHub in Cursor so PRs / Cloud Agents use the org repo.

---

## E) Wire Vercel to the org repo

1. Vercel (Quiet Agency team) → **Add New Project** → Import `ORG/SULLYS`.
2. **Root Directory:** `apps/web`
3. Env vars from `apps/web/.env.production.example` (API URL after Railway exists).
4. Deploy. Custom domain comes after Cloudflare (see [06-next-steps-go-live.md](./06-next-steps-go-live.md)).

Railway API and Neon stay separate Quiet Agency projects; same pattern: create under QA accounts, not personal.

---

## Suggested account map

| Service | Owner | Notes |
|---------|--------|--------|
| GitHub org + `SULLYS` repo | Quiet Agency | Source of truth |
| Vercel team + web project | Quiet Agency | `apps/web` |
| Railway + API | Quiet Agency | `apps/api` |
| Neon Postgres | Quiet Agency | Production DB |
| Cloudflare domain/DNS | Quiet Agency | ~CAD $20 |

---

## Reply checklist (paste back into Cursor)

When ready:

```
Quiet Agency GitHub org: ________
Repo URL: https://github.com/________/SULLYS.git
Vercel team: ________ (created / connected to GitHub)
Please: make initial commit + push to origin main
```

Then we continue the build **only** on that remote.
