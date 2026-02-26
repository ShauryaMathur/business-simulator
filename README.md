# Business Simulator (Full-Stack Engineer Take-Home)

Single-player, turn-based startup simulation built with Next.js + Supabase for the Convergent Full-Stack Engineer take-home assignment.

The app is a vertical slice of the game loop: quarterly decisions -> server-side simulation via Supabase RPC -> persisted state -> dashboard/office visualization/history updates.

## Tech Stack

- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS, Recharts
- Backend / DB: Supabase (Postgres, Auth, RPC functions)

## What Was Built

- Email/password authentication (Supabase Auth)
- Session persistence across reloads
- Route protection + redirects (`/dashboard` protected; `/login` + `/signup` redirect when authenticated)
- New user bootstrap (trigger inserts initial game row)
- Quarterly decision panel:
  - Unit price
  - New engineers
  - New sales staff
  - Salary % of industry average
- Server-authoritative turn advancement via `advance_turn` RPC
- Dashboard with:
  - Current quarter
  - Financial history table (last 4 quarters)
  - Charts (cash + net income + headcount ratio)
  - Office visualization (desks, role split, empty capacity)
- Win / lose modal overlay
- Restart simulation via `reset_game` RPC
- Global auth context + toast notifications

## Repository Layout

- `frontend/` Next.js application
- `supabase/migrations/schema.sql` table schema
- `supabase/migrations/rls_policies.sql` RLS + policies
- `supabase/functions/functions.sql` RPCs (`advance_turn`, `reset_game`)
- `supabase/functions/handle_new_user.sql` auth signup trigger

## Setup

1. `cd frontend`
2. `npm install`
3. Create `frontend/.env.local` with:
   - `NEXT_PUBLIC_SUPABASE_URL=...`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...`
4. `npm run dev`

Then open `http://localhost:3000`.

## Supabase Setup (SQL)

Run these SQL files in Supabase SQL Editor (or via your migration workflow) in this order:

1. `supabase/migrations/schema.sql`
2. `supabase/functions/handle_new_user.sql`
3. `supabase/functions/functions.sql`
4. `supabase/migrations/rls_policies.sql`

Notes:
- The order matters: `handle_new_user.sql` inserts into `public.games`, so the `games` table must already exist.
- `handle_new_user.sql` creates a game row automatically for each new auth user.
- `advance_turn` and `reset_game` are implemented as `SECURITY DEFINER` RPCs.

## Simulation Model Notes

The simulation runs server-side in `advance_turn` and persists results to `games` and `game_history`.

Financial Integrity:
- History snapshots reflect Closing Balances. Cash shown for Quarter `N` includes the revenue and expenses incurred during that quarter, ensuring the "Financial History" table reconciles with the current "Cash at Hand".

## Architecture & Technical Decisions

### 1. Server-Authoritative Logic & Security

Simulation Engine (RPC): All business logic for the startup simulation is encapsulated within PostgreSQL RPC functions (`advance_turn`, `reset_game`). This ensures the client cannot manipulate outcomes (e.g., granting extra cash) and keeps the simulation model protected on the server.

Zero-Trust Security (RLS): Implemented Row Level Security (RLS) on `public.games` and `public.game_history`, scoped to `auth.uid()`. This ensures that even with the public API key, users are restricted to their own data and helps mitigate IDOR-style access risks.

Edge-Level Route Protection: Utilized Next.js `proxy.ts` route interception to guard `/dashboard` and redirect authenticated users away from `/login` and `/signup`. This prevents unauthorized dashboard access before render and avoids auth-related layout flash.

### 2. Data Integrity & Observability

Audit-Ready History (Soft Delete): Rather than destructive `DELETE` operations on reset, I implemented a soft delete strategy using `game_history.is_deleted`. This preserves prior game attempts for auditability/debugging and future analytics while keeping the active UI session clean.

Atomic State Transitions: Turn advancement is implemented as a single RPC that performs simulation math, history logging, and game state updates together. This leverages database transaction semantics so failures roll back the entire operation and prevent a partially advanced/corrupted game state.

### 3. Frontend Architecture

Pragmatic State Management: Used React Context (`AuthProvider`) over Redux. The global state surface is intentionally small (auth/session only), so Context is a lower-overhead solution that remains easy to reason about without Redux boilerplate. Redux would be overkill for this scope.

Decoupled Data Fetching: Encapsulated dashboard orchestration in a custom `useDashboardData` hook. This separates the data-access layer (Supabase queries/RPC orchestration) from presentation components, improving maintainability and making future testing/refactoring easier.

## Tradeoffs & Pragmatic Decisions

### 1. Tooling & Velocity

Manual Type Definitions: I opted for manual TypeScript interfaces (`Game`, `GameHistory`) instead of generated Supabase types to maintain high velocity for this vertical slice. In production, I would integrate Supabase CLI type generation into the migration workflow/CI so frontend types remain synchronized with schema changes.

Client-Side Hydration: Chose a combination of Next.js `proxy.ts` route protection and client-side auth context rather than a full SSR auth bootstrap. SSR session hydration could further optimize initial paint, but the current approach reduced complexity while still enforcing route security and maintaining a clean auth UX.

### 2. Known Constraints

Testing Coverage: Automated tests (unit/integration/e2e) were deferred in favor of delivering a complete end-to-end vertical slice (Auth -> DB -> Simulation Logic -> UI).

Win-State Persistence: `cumulative_profit` in the victory modal is derived from the `advance_turn` turn-result payload. If the page is reloaded on the win state, that derived metric is not currently re-calculated from history and rehydrated into the modal.

Fixed Office Capacity (UI Simplicity): To constrain UI overflow/layout complexity and keep the office visualization predictable for this vertical slice, the maximum office capacity is intentionally fixed and centralized in `frontend/config/game.ts` (`OFFICE_MAX_CAPACITY`). The same value is passed into the `advance_turn` RPC to keep frontend and backend validation aligned.

Operational Migrations: Supabase schema changes in SQL files do not retroactively update an already-created database; schema changes (e.g., column type updates) must be applied through migrations/SQL execution in the target environment.

## Assignment Context

This project is an implementation of **Option A (Simulation Spec)** from the take-home assignment.
