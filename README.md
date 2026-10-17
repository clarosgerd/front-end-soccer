# SoccerApi — Frontend (Fase 1: Web)

> React + Vite + TypeScript + TanStack Query + Zustand + Tailwind v4
> Backend: Laravel 12 + Sanctum + MySQL | Fecha: Julio 2026

## Setup

```bash
npm install
cp .env.example .env   # y editá VITE_API_BASE_URL con la URL real de tu API Laravel
npm run dev
```

**Requisitos:** Node.js 18+

## Comandos

```bash
npm run dev          # Servidor de desarrollo (Vite HMR)
npm run build        # Build de producción (tsc + vite build)
npm run preview      # Preview del build de producción
npm run lint         # Linter (oxlint)
npm test             # Tests (single run)
npm run test:watch   # Tests (watch mode)
```

## Stack

| Capa | Elección | Por qué |
|------|----------|---------|
| Framework | React 19 + Vite 8 + TypeScript 6 | Sin SSR innecesario, TS tipa los contratos de la API |
| Estado de servidor | TanStack Query v5 | Cache, refetch, invalidación tras mutaciones, polling |
| Estado de auth/sesión | Zustand + persist (localStorage) | Simple, sin boilerplate |
| Auth | Bearer token (Sanctum) | Mismo mecanismo reusable en Flutter (Fase 2) |
| Estilos | Tailwind CSS v4 | Utility-first, sin CSS custom |
| HTTP Client | Axios | Interceptors para Bearer + manejo 422 |

## Arquitectura de carpetas

```
src/
├── api/
│   ├── client.ts              # Axios + interceptor Bearer + logout en 401
│   ├── endpoints/             # 11 archivos: un archivo por dominio de la API
│   │   ├── auth.ts
│   │   ├── bracket.ts
│   │   ├── groups.ts
│   │   ├── invitations.ts
│   │   ├── matches.ts
│   │   ├── pool.ts
│   │   ├── predictions.ts
│   │   ├── stages.ts
│   │   ├── subscriptions.ts
│   │   ├── teams.ts
│   │   └── tournaments.ts
│   └── types.ts               # Tipos de todas las entidades + respuestas API
├── hooks/                     # 12 hooks React Query por dominio
│   ├── useAuth.ts
│   ├── useBracket.ts
│   ├── useGroups.ts
│   ├── useInvitations.ts
│   ├── useMatchesAdmin.ts
│   ├── usePool.ts
│   ├── usePredictions.ts
│   ├── usePredictionWindow.ts
│   ├── useStages.ts
│   ├── useSubscription.ts
│   ├── useTeams.ts
│   └── useTournaments.ts
├── store/                     # Zustand stores
│   ├── authStore.ts           # Token + user + login/logout
│   ├── toastStore.ts          # Notificaciones flotantes
│   └── confirmStore.ts        # Modal de confirmación async
├── lib/
│   ├── errorHandler.ts        # Normaliza errores Laravel 422/401/403
│   ├── toast.ts               # toast.success() / toast.error()
│   └── confirmAction.ts       # Reemplazo async de window.confirm()
├── pages/                     # Una carpeta por sección
│   ├── auth/                  # Login, Register
│   ├── tournaments/           # TournamentList, TournamentEdit, Stages
│   │   ├── Bracket/           # BracketView (público)
│   │   └── admin/             # AdminBracket, ManageGroups
│   ├── teams/                 # TeamList (CRUD + bulk)
│   ├── matches/               # MatchList (CRUD + bulk por torneo)
│   ├── groups/                # GroupList, GroupDetail, GroupSettings, Invitations, ScoringDashboard
│   ├── predictions/           # MyPredictions
│   ├── pool/                  # PoolDetail
│   └── subscription/          # Plans, CheckoutRedirect
├── components/
│   ├── ui/                    # Genéricos: Button, Card, TextField, ErrorBanner, ToastContainer, ConfirmDialog
│   └── domain/                # Específicos: AppLayout, TournamentForm, GroupSettingsForm, MatchPredictionCard
├── router/
│   ├── index.tsx              # Todas las rutas configuradas
│   └── ProtectedRoute.tsx     # Guard de autenticación
├── App.tsx                    # QueryClientProvider + Router + Toast + ConfirmDialog
└── main.tsx                   # Entry point
```

## Módulos conectados a la API

| Módulo | Ruta | Funcionalidad |
|--------|------|---------------|
| **Auth** | `/login`, `/register` | Token persistido, errores 422 por campo |
| **Torneos** | `/tournaments` | CRUD completo, modo promocional |
| **Equipos** | `/teams` | CRUD con filtro por nombre, modo **bulk** |
| **Partidos** | `/tournaments/:id/matches` | CRUD por torneo, cambio de estado inline, modo **bulk** |
| **Fases** | `/tournaments/:id/stages` | Creación bulk con presets (Mundial, Liguilla, Eliminación) |
| **Grupos de torneo** | `/tournaments/:id/groups-admin` | Crear tournament-groups, asignar/quitar equipos |
| **Grupos de predicciones** | `/groups` | CRUD completo con scoring/pool configurables |
| **Bracket público** | `/tournaments/:id/bracket` | Polling 30s, borde punteado para matches por definir, multiplicador de fase |
| **Admin bracket** | `/tournaments/:id/admin` | Aprobar/rechazar grupos, sugerir y confirmar avances |
| **Invitaciones** | `/invitations` | Pendientes, aceptar/cancelar, unirse por código |
| **Predicciones** | `/predictions?groupId=X` | Countdown de 30 min real por partido |
| **Pool de premios** | `/groups/:id/pool` | Contribuir, distribuir 60/30/10 |
| **Scoring dashboard** | `/groups/:id/scoring` | Breakdown de puntos por usuario y por match |
| **Suscripciones** | `/subscription` | Planes Free/Pro/Premium, checkout Stripe por redirección |

## Testing

Stack: **Vitest 4** + **React Testing Library 16** + **jsdom** + **jest-dom**.

```bash
npm test             # Ejecutar todos los tests (single run)
npm run test:watch   # Ejecutar en watch mode
```

**46 tests** cubriendo:
- Unidad: `errorHandler`, `usePredictionWindow`, `toast`, `confirmAction`
- Componentes: `Button`, `Card`, `TextField`, `ProtectedRoute`

Test files colocados junto a los archivos que testean (`*.test.ts` / `*.test.tsx`).

## Manejo de errores

### Errores 422 (validación Laravel)

`src/lib/errorHandler.ts` normaliza el shape `{ message, errors: { campo: [...] } }` a `{ message, fieldErrors: { campo: "msg" } }`. Los formularios consumen `normalized.fieldErrors.email` directamente en cada `<TextField error={...} />`.

### Errores 403 (límites de plan)

`ErrorBanner.tsx` detecta 403 y muestra un CTA a `/subscription` en vez de un error genérico. Conectado en creación de torneo, grupo, predicción, equipo y partido.

### Errores 401 (sesión expirada)

El interceptor de响应 en `api/client.ts` hace logout automático y redirige a `/login`.

## Puntos clave de la API que moldean el frontend

1. **PUT requiere todos los campos** (no hay PATCH) → los formularios precargan el objeto completo
2. **Ventana de 30 min** antes del partido → `usePredictionWindow` cuenta regresiva, deshabilita el form
3. **Errores 422** → interceptor único que normaliza a mensajes por campo
4. **Scoring y bracket son asíncronos** → polling con `refetchInterval: 30_000` en leaderboard, scoring y bracket
5. **Checkout de Stripe es por redirección** → `window.location.href` a la URL que devuelve la API
6. **403 por límites de plan** → banner con CTA a upgrade, no error genérico
7. **Multiplicador de scoring depende del stage** → visible en bracket público

## Toasts y confirmación

Ningún `window.confirm` ni `alert` nativo en toda la app:

- **`toast.success(msg)`** / `toast.error(msg)` → notificación flotante, auto-descarta a 4s
- **`await confirmAction('¿Eliminar X?')`** → modal real con título, descripción y botón danger

Ambos usan Zustand y están montados una sola vez en `App.tsx`.

## Componentes UI reutilizables

| Componente | Descripción |
|------------|-------------|
| `Button` | Variants: primary, secondary, danger. Soporta `isLoading` |
| `Card` | Contenedor con borde y padding |
| `TextField` | Input con label y显示 de error |
| `ErrorBanner` | Maneja 422 (oculto, los campos lo muestran), 403 (CTA upgrade), y genéricos |
| `ToastContainer` | Stack de notificaciones flotantes |
| `ConfirmDialog` | Modal async de confirmación |

## Variables de entorno

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

## Fase 2 (próximo)

- [ ] Port a Flutter reusando la misma lógica de auth Bearer
- [ ] WebSockets para scoring/bracket en vivo (cuando el backend lo soporte)

---

*Documentación generada el 2026-07-22*
