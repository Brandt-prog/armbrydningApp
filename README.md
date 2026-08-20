# Armbrydning 5000 — National Ranking App

A ranking system for arm wrestling, built as an Expo/React Native app with web support (PWA), a Supabase backend, and Glicko-2-based ratings.

**Live URL:** https://armbrydning5000-app.vercel.app

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Getting Started Locally](#getting-started-locally)
3. [Architecture](#architecture)
4. [Database](#database)
5. [Key Design Decisions](#key-design-decisions)
6. [Tests](#tests)
7. [Deployment](#deployment)
8. [Edge Functions](#edge-functions)
9. [Known Pitfalls and Solutions](#known-pitfalls-and-solutions)

---

## Tech Stack

- **Frontend:** Expo (React Native) SDK 54, Expo Router (file-based routing), TypeScript
- **Backend:** Supabase (Postgres + Auth + Realtime + Edge Functions), EU region (Frankfurt)
- **Web hosting:** Vercel
- **CI/CD:** GitHub Actions
- **Tests:** Jest (`jest-expo` preset)
- **State/data:** MVVM pattern — Repositories → Services → ViewModels (hooks) → Views

---

## Getting Started Locally

```bash
npm install
```

Create a `.env` file in the project root:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

**Native/Expo Go:**
```bash
npx expo start --clear
```

**Web (local):**
```bash
npx expo start --web
```

**Run tests:**
```bash
npm test
```

**Type-check:**
```bash
npx tsc --noEmit
```

---

## Architecture

The codebase follows MVVM, split into layers:

```
src/
  models/          → Plain TypeScript types (User, Match, Club, Arm, etc.)
  repositories/    → All direct Supabase communication (SELECT/INSERT/UPDATE/RPC)
  services/        → Business logic (Glicko-2, connectivity, match flow)
  viewmodels/      → React hooks that bind repositories/services to UI state
  views/           → React Native components (no direct database calls here)
  components/      → Reusable, "dumb" UI components
  theme/           → Colors, fonts, spacing

app/                    → Expo Router file-based routes (call views/ only)
supabase/functions/     → Edge Functions (Deno, run server-side)
```

**Rule:** Views never call repositories directly — only through viewmodels. This keeps database logic testable and separated from UI.

---

## Database

**Tables:** `clubs`, `users`, `matches`, `tournaments`, `tournament_matches`, `supermatches`, `supermatch_games`

**Key Postgres functions (`SECURITY DEFINER`):**

| Function | Purpose |
|---|---|
| `glicko2_update(...)` | Pure Glicko-2 math (Illinois algorithm) |
| `confirm_club_match(match_id)` | Confirms a club match, updates both players' ratings atomically with a `FOR UPDATE` lock |
| `void_club_match(match_id)` | Admin voids a confirmed match, rolling back the rating change |
| `get_my_profile()` | Fetches the caller's own full profile (including sensitive fields) |
| `get_member_profile_for_admin(user_id)` | Admin fetches another member's full profile |
| `get_classification(user_id)` / `get_classifications_bulk(ids)` | Derived age/weight class labels, without exposing raw birth date/weight |
| `is_admin_for_club(club_id)` | Helper used by RLS policies to avoid recursion |

**Sensitive columns** (`birth_date`, `weight`, `height` on `users`) have had their general `SELECT` privilege revoked (`REVOKE`) — they are only accessible through the controlled functions above, never via a plain `SELECT * FROM users`.

**RLS policies** are set up restrictively: members can only see their own sensitive fields, admins can see/edit within their own club, `super_admin` has full access.

---

## Key Design Decisions

- **Glicko-2 over simple ELO:** gives each member a rating **and** an uncertainty value (RD), which decreases over time.
- **Only gender is a hard split** in the rating calculation itself. Weight/age are used only for display/filtering.
- **Leaderboard thresholds:** a player only appears on the main leaderboard if (a) RD < 200, **and** (b) they have faced at least 4 distinct opponents **and** belong to a connected cluster of at least 5 players. Both conditions are required — RD alone can be "gamed" by only playing the same partner repeatedly.
- **Rating changes happen exclusively server-side** (in Postgres functions), never client-side — prevents manipulation and guarantees atomicity via row locking.

---

## Tests

`GlickoMath.ts` (the JS-side implementation, used for tournaments/supermatches) has unit tests in `GlickoMath.test.ts`, which verify mathematical properties (favors upsets, RD never drops below the floor, etc.) — not just that the code runs.

**Note:** the SQL version of Glicko-2 (`glicko2_update`) is a **separate** implementation (same math, ported to PL/pgSQL to run atomically with row locking). The two are not automatically kept in sync — if the algorithm changes, both must be updated.

---

## Deployment

CI/CD runs via `.github/workflows/deploy.yml`:

- **`test` job:** runs automatically on every push to `main` (type-check + Jest tests)
- **`deploy` job:** runs **only manually** (`workflow_dispatch`) — go to GitHub → Actions → "CI and Deploy" → "Run workflow"

The deploy job automatically runs:
```bash
npx expo export --platform web
node scripts/fix-web-export.js
vercel --cwd dist --prod
```

**Required GitHub Secrets:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

---

## Edge Functions

Two Deno-based Edge Functions handle security-critical admin actions that require the `service_role` key (never exposed to the client):

- `admin-reset-password` — resets a member's password
- `admin-reject-member` — rejects and deletes a pending membership application (both the `users` row and the Auth account)

Deploy with:
```bash
supabase functions deploy <name>
```

Both functions independently verify that the calling user is actually an admin (and, where relevant, belongs to the same club) before performing any action — they never trust the client.

---

## Known Pitfalls and Solutions

These took time to track down during development — documented here to save future debugging:

1. **Vercel ignores folders named `node_modules`** in uploads, even with an empty `.vercelignore`. Fix: `scripts/fix-web-export.js` renames the folder after every `expo export`, before deploying.

2. **PostgREST returns an object with `null` fields, not a true `null`**, when a function declared to `RETURNS <table>` finds no matching row. A simple `if (data)` check in JS is therefore insufficient — always check a specific field instead (e.g. `data.id`).

3. **`service_role` requires explicit `GRANT`** on columns/tables, even though it normally bypasses RLS — a `REVOKE ... FROM authenticated, anon` can unintentionally affect `service_role` too under certain configurations.

4. **SPA routing requires rewrites in `vercel.json`**, otherwise a manual page reload on any route other than `/` returns a 404.

5. **Variable names in PL/pgSQL can silently collide** — an earlier version of `glicko2_update` reused the same variable name for both a fixed constant and a moving bisection boundary in the Illinois algorithm, producing catastrophically wrong ratings in specific, rarer scenarios (large rating gap + upset result). Always use distinct variable names between "constant" and "loop state" in this kind of iterative, numerical code.

6. **Supabase Realtime channels must not reuse the same name** across re-renders (React Strict Mode/Fast Refresh can trigger a double-subscribe). Fix: append a random suffix to the channel name on every `useEffect` run.
