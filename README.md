> ⚠️ **Not the live app.** This repo's BayRan build (below) was an
> independent rebuild done in a session that didn't know a more complete,
> already-deployed version already existed. **The real, in-use BayRan app
> lives in [`ayashdan/TrackFit`](https://github.com/ayashdan/TrackFit) on its
> `main` branch**, deployed at the Firebase project `trackfit-c2f76`. Nothing
> in this repo is connected to that deployment or its data. Treat this repo
> as inactive/historical unless you deliberately decide to revive it.
>
> Also note: this repo's **GitHub default branch is still
> `claude/ai-assistant-visually-impaired-ukk9t2`** (an old Phase-1 branch),
> not `main` — anyone opening this repo without explicitly switching to
> `main` will land on stale fitness-app content, not this file. Fix under
> **Settings → Branches → Default branch**.

# BayRan

Construction project management for companies running multiple customer jobs
at once. Track schedules, design selections, room measurements, materials,
subcontractors, customer payments, change orders, and a punch list — per
project — with a main dashboard that rolls everything up into overall status
and open action items.

**Stack:** Vite · React · React Router · Tailwind CSS · Firebase
(Authentication + Firestore + Hosting). No separate backend — the browser
talks to Firebase directly, and every push to `main` auto-deploys via GitHub
Actions.

---

## One-time setup (~15 min)

### 1. Create a Firebase project
[console.firebase.google.com](https://console.firebase.google.com) → **Add
project** → name it (e.g. `bayran`) → create it.

### 2. Register a web app
In the new project: **Project Settings → General → Your apps → Add app →
Web** (the `</>` icon). Name it anything. Firebase shows you a config
snippet with six values (`apiKey`, `authDomain`, `projectId`,
`storageBucket`, `messagingSenderId`, `appId`) — keep this tab open, you'll
need all six twice (local `.env` and GitHub secrets below).

### 3. Turn on Google sign-in
**Authentication → Sign-in method → Google → Enable.** That's it — Firebase
provisions the OAuth client for you, no separate Google Cloud Console setup
needed.

### 4. Turn on Firestore
**Firestore Database → Create database** → start in **production mode** →
pick a region.

### 5. Deploy the security rules
Firestore → **Rules** tab → paste in the contents of `firestore.rules` from
this repo → **Publish**. (There's no CI step for this — it's a one-time
manual paste, and again any time you change `firestore.rules`.)

### 6. Turn on Hosting
**Hosting → Get started** → you don't need to run any of the CLI commands it
shows you (GitHub Actions handles that) — just note the `your-project.web.app`
URL it gives you.

### 7. Create a service account for GitHub Actions
**Project Settings → Service accounts → Generate new private key.** This
downloads a JSON file — you'll paste its *entire contents* into a GitHub
secret next.

### 8. Add GitHub repo secrets
In this repo: **Settings → Secrets and variables → Actions → New repository
secret.** Add seven secrets:

| Secret name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | from step 2 |
| `VITE_FIREBASE_AUTH_DOMAIN` | from step 2 |
| `VITE_FIREBASE_PROJECT_ID` | from step 2 |
| `VITE_FIREBASE_STORAGE_BUCKET` | from step 2 |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from step 2 |
| `VITE_FIREBASE_APP_ID` | from step 2 |
| `FIREBASE_SERVICE_ACCOUNT` | the entire JSON file from step 7 |

### 9. Push to `main`
That's it from here on — `.github/workflows/deploy.yml` builds and deploys
to Firebase Hosting automatically on every push to `main`. Watch it run
under this repo's **Actions** tab. First deploy takes a couple of minutes;
after that, your app is live at `https://your-project.web.app`.

---

## Local development

```bash
cp .env.example .env   # fill in the same six Firebase values from step 2
npm install
npm run dev
```
Open **http://localhost:3000** (or whatever port Vite prints).

---

## What's built

- **Google sign-in** — no passwords. Every signed-in user gets a profile
  (`profiles/{uid}`) automatically and full access to every project; this is
  an internal company tool, not multi-tenant. The first person ever to sign
  in is marked `admin`, everyone after that `member` (informational only).
- **Main dashboard** — active project count, total contract value, balance
  due from clients, estimated total margin, and a prioritized list of open
  action items across every active project: overdue/upcoming tasks, pending
  change-order approvals, backordered materials, unmade design selections,
  and open punch list items.
- **Projects list** — filterable by status, with a progress/financial
  summary card per project.
- **Per-project workspace**, one tab per area of the job: Overview, Tasks,
  Design, Measurements, Materials, Subs, Payments, Change Orders, Trade
  Scope, and Punch List. All the "auto-calculated" numbers (totals,
  balances, profit, floor area) are computed in code at write time
  (`src/lib/data.js`), the same values every call site reads back — Firestore
  has no generated columns, so this stands in for what a SQL view used to do.

---

## Data model

Firestore, not a relational database — every project is one document in a
`projects` collection, and each tab's rows live in a subcollection under it:
`projects/{id}/tasks`, `.../design_selections`, `.../room_measurements`,
`.../materials`, `.../subcontractors`, `.../customer_payments`,
`.../change_orders`, `.../trade_scope`, `.../punch_list_items`. There's no
server-side aggregation (no SQL views/joins) — the dashboard and each
project's financial summary are computed client-side by reading a project's
subcollections and reducing them (see `src/lib/aggregate.js`).
