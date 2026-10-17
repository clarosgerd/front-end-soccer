# AGENTS.md — Friend Soccer Frontend

## Project Overview

React 19 + TypeScript frontend for **Friend Soccer** (badge "FS"), a soccer predictions platform. Consumes a Laravel 12 REST API (`/api/v1/`). All write operations require Sanctum Bearer token auth.

## Commands

```bash
# Dev server (Vite HMR)
npm run dev

# Production build (tsc + vite build)
npm run build

# Preview production build
npm run preview

# Lint (oxlint, zero-config)
npm run lint

# Type check (no emit)
npx tsc --noEmit

# Run tests (single run)
npm test

# Run tests (watch mode)
npm run test:watch
```

## Testing

Stack: **Vitest 4** + **React Testing Library 16** + **jsdom** + **jest-dom**.

- Config: `vitest.config.ts` (separate from `vite.config.ts`)
- Setup: `src/test-setup.ts` (imports jest-dom matchers)
- Test files: colocados junto a los archivos que testean (`*.test.ts` / `*.test.tsx`)
- Globals: `describe`, `it`, `expect`, `vi` disponibles sin imports (via `globals: true`)

### Archivos de test

| Archivo | Tipo | Tests |
|---------|------|-------|
| `src/lib/errorHandler.test.ts` | Unit | 7 — normalización de errores 422/401/403 |
| `src/hooks/usePredictionWindow.test.ts` | Unit (hook) | 7 — ventana de 30 min, labels, countdown |
| `src/components/ui/Button.test.tsx` | Component | 8 — variantes, disabled, onClick |
| `src/components/ui/Card.test.tsx` | Component | 4 — rendering, className |
| `src/components/ui/TextField.test.tsx` | Component | 8 — label, error, input props |
| `src/router/ProtectedRoute.test.tsx` | Component | 2 — auth guard |
| `src/lib/toast.test.ts` | Unit | 4 — store de toasts |
| `src/lib/confirmAction.test.ts` | Unit | 6 — store de confirmación |

**Total: 46 tests, 8 archivos**

## Architecture

### API Layer (`src/api/`)

- `client.ts` — Axios instance. Request interceptor adds Bearer token from Zustand store. Response interceptor: 401 → auto-logout.
- `types.ts` — All entity types + API response shapes (`ApiListResponse<T>`, `ApiItemResponse<T>`, `ApiErrorResponse`)
- `endpoints/` — 11 files, one per domain. Each exports an `xxxApi` object with methods that call `apiClient` and unwrap `.data`.

**Key pattern:** All endpoints use the same `apiClient` instance. Mutations invalidate React Query caches via `queryClient.invalidateQueries()`.

### Hooks (`src/hooks/`)

React Query hooks wrapping the API endpoints. One file per domain. Each exports:
- `useXxx()` — list query
- `useXxx(id)` — detail query
- `useCreateXxx()` — mutation that invalidates list
- `useUpdateXxx(id)` — mutation that invalidates list + detail
- `useDeleteXxx()` — mutation that invalidates list

### Stores (`src/store/`)

Zustand stores (NOT React Query):
- `authStore.ts` — `token`, `user`, `setSession()`, `logout()`. Persisted to localStorage.
- `toastStore.ts` — Toast queue with auto-dismiss (4s).
- `confirmStore.ts` — Async confirm dialog state.

### Error Handling (`src/lib/errorHandler.ts`)

Central error normalizer. Returns `NormalizedError` with:
- `message` — human-readable error
- `fieldErrors` — `{ fieldName: "first error message" }` (for 422)
- `isValidationError` — true on 422
- `isForbidden` — true on 403
- `isAuthError` — true on 401

Usage: `const normalized = mutation.error ? normalizeApiError(mutation.error) : null`

### Components

- `components/ui/` — Generic: `Button`, `Card`, `TextField`, `ErrorBanner`, `ToastContainer`, `ConfirmDialog`
- `components/domain/` — Business-specific: `AppLayout`, `TournamentForm`, `GroupSettingsForm`, `MatchPredictionCard`

### Router (`src/router/`)

`createBrowserRouter` with nested routes. All app routes are children of `ProtectedRoute > AppLayout`. Auth pages (`/login`, `/register`) are outside the layout.

## API Conventions (from backend)

1. **PUT requires ALL fields** — no PATCH. Forms preload the full object.
2. **422 shape:** `{ message: string, errors: { field: string[] } }`
3. **Filters:** `GET /api/v1/team?name[eq]=Barcelona&country[eq]=Spain` — operators: `eq`, `gt`, `lt`, `gte`, `lte`
4. **Custom PKs:** Each entity uses its own PK (`team_id`, `match_id`, etc.), never `id`
5. **Bulk endpoints:** `POST /team/bulk`, `POST /match/bulk`, `POST /stage/bulk`
6. **Prediction window:** 30 min before match start — backend rejects, frontend disables with countdown
7. **Scoring/bracket polling:** `refetchInterval: 30_000` on leaderboard, scoring, bracket
8. **Stripe checkout:** `POST /user/subscription/checkout` returns URL, frontend does `window.location.href`
9. **403 = plan limits** (`CheckGroupLimits`, `CheckSubscriptionTier`), not arbitrary permission
10. **API naming consistency:** All resources return `tournament_id`, `stage_id` (with underscore), matching frontend types and DB columns. Never `tournamentid` or `stageid`.
11. **Toggle-active endpoints:** `PATCH /tournament/{id}/toggle-active`, `PATCH /team/{id}/toggle-active`, `PATCH /group/{id}/toggle-active` (auth required)
12. **Membership checking:** `GET /tournament/{id}/my-memberships` and `GET /my-tournament-memberships` for checking user's group memberships

## Environment

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## Gotchas

- **`timestamps = false`** on all backend models except User
- **No `.pint.json`** in backend — uses all Laravel defaults
- **`actived` field** comes as `0 | 1` number from API, not boolean. Types use `number | boolean`.
- **Promotional tournaments** (`is_promotional`) bypass `CheckGroupLimits` and `CheckSubscriptionTier`
- **Score form in MatchPredictionCard** auto-infers `predicted_result` from home/away scores
- **Bulk UI** available in TeamList and MatchList via Individual/Bulk toggle
- **Bracket "por definir"** matches (null scores, scheduled status) render with dashed borders
- **API-Football free plan** only allows seasons 2022-2024 (no current season). Use football-data.org for current data.
- **football-data.org free tier**: 13 competitions with current seasons, 10 req/min limit. Sync commands throttle 7s between calls.
- **Incremental sync**: commands skip recently-synced data (teams 24h, matches 3h, standings 6h, ESPN fixtures 2h). Use `--force` to bypass.

## Tournament System

### Private vs Public Tournaments

- **Public tournaments**: Created by admins, open to all users
- **Private tournaments**: Created by users with status workflow (`draft` → `published` → `live` → `closed`)
- **Owner management**: Tournament creator can edit, activate, and manage their private tournaments
- **Manual result entry**: Owner can enter match results for live private tournaments via `ManualMatchController`

### Tournament Status Workflow

```
draft → published → live → closed
```

- `draft`: Initial state, owner can edit
- `published`: Visible to users, can be joined
- `live`: Matches in progress, owner can enter results
- `closed`: Tournament finished, results final

### Membership System

- Groups can be linked to tournaments via nullable `tournament_id`
- Join flow: User requests → Admin approves → User becomes member
- Quick-create group with defaults for new tournaments
- Existing groups without tournament stay untouched
- UI shows "Miembro"/"Pendiente" badges + "Ver grupo" link when already member
- Tournament list shows "Ya unido" disabled badge for joined tournaments

### Scoring Rules

- Tournament structure: Group stage + Semifinal + Final
- No multipliers for dieciseisavos/octavos (not used in current structure)
- `multiplier_dieciseisavos` and `multiplier_octavos` stay at 1x

## Demo Tournaments

Two demo tournaments seeded for testing:

- **Tournament #25 (Liga Amistosa)**: 12 teams, 2 groups (Serie A + Serie B), 15 matches per group
- **Tournament #26 (Cuadrangular)**: 4 teams, 1 group, 6 matches

### Predictor Users

6 demo predictor accounts for testing:
- `predictor1@demo.com` to `predictor6@demo.com`
- Password: `password`

### Artisan Commands

```bash
# Seed demo tournaments with full data
php artisan tournament:seed-demo
php artisan tournament:seed-simple

# Check tournament summary
php artisan tournament:summary {tournament_id}
```

## Excel Import

Browser-based Excel import using `xlsx` (SheetJS):

- Supports 3 sheets: **Fases** (stages), **Equipos** (teams), **Partidos** (matches)
- Parses Excel in browser, sends data to existing bulk endpoints
- Endpoints: `POST /stage/bulk`, `POST /team/bulk`, `POST /match/bulk`
- UI: `ExcelImport.tsx` component in tournament pages

## Admin Features

### Middleware

- `RequireAdmin` middleware at `app/Http/Middleware/RequireAdmin.php`
- Registered as `'admin'` alias in `bootstrap/app.php`
- Protects admin-only routes

### Toggle-Active Endpoints

All require authentication:

- `PATCH /tournament/{id}/toggle-active`
- `PATCH /team/{id}/toggle-active`
- `PATCH /group/{id}/toggle-active`

### Bracket View

- **Group stage**: Displays standings table with PJ/PG/PE/PP/GF/GC/DG/Pts
- **Knockout stages**: Grid layout with match cards
- **Match cards**: Show logos, scores, status badges (En vivo/Programado/Finalizado)
- **Polling**: Auto-refresh every 30 seconds during live matches

## Development Progress

All major features are implemented and connected to the real API:
- Auth (login/register/logout with Sanctum)
- CRUD for all entities (tournaments, teams, matches, stages, groups)
- Bracket view with polling and formatted match cards (logos, scores, status badges)
- Admin bracket (approve groups, suggest/confirm advancements)
- Predictions with 30-min window countdown
- Scoring dashboard with per-user breakdown
- Pool de premios (contribute + distribute)
- Subscription plans with Stripe checkout
- Invitations (send, accept by code, accept by ID, cancel)
- Bulk creation for teams, matches, and stages
- Error handling for 403 plan limits
- Toast notifications and confirm dialogs (no native alerts)
- Tournament sync from external APIs (ESPN, football-data.org, API-Football)
- **Sync tracking** with `last_synced_at` on tournaments/teams/matches
- **Master sync command** `sync:all` orchestrating all APIs
- **Exponential backoff** rate limiting on all API services
- Landing page with live leagues and sync status
- Match calendar with date filtering
- Private/public tournament system with status workflow
- Manual match result entry for tournament owners
- Excel import for stages, teams, and matches
- Membership system with join requests and admin approval
- Demo tournaments with full bracket data (standings + matches)
- Toggle-active endpoints for tournaments, teams, and groups
