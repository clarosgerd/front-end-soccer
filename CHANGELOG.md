# Changelog — SoccerApi Frontend

## 2026-07-25

### Escenario 2: Unirse a torneo — Grupos vinculados + flujo solicitud/aprobación

**Backend (`laravel-crud-api`):**
- **Migraciones:**
  - `2026_07_25_110000` — FK `tournament_id` nullable en tabla `groups` (nullOnDelete)
  - `2026_07_25_110001` — Columna `status` (default `accepted`) en tabla `groupmembers`
- `app/Models/Groups.php` — `tournament_id` en fillable, relación `tournament()`, `pendingMembers()`
- `app/Models/GroupMembers.php` — `status` en fillable
- `app/Http/Resources/GroupsResource.php` — Incluye `tournament_id`
- `app/Http/Resources/GroupMembersResource.php` — Incluye `status` + `user` (whenLoaded)
- `app/Filters/GroupsFilter.php` — Soporte `tournament_id[eq]`
- `app/Http/Controllers/GroupsController.php` — `insertFirt()` acepta `tournament_id`
- `app/Http/Controllers/GroupMembersController.php` — 4 nuevos endpoints:
  - `joinRequest()` — Crea miembro pendiente, valida duplicados y max_members
  - `approve()` — Admin del grupo aprueba solicitud (solo group admin)
  - `reject()` — Admin rechaza solicitud (borra registro)
  - `pending()` — Lista solicitudes pendientes del grupo
- `routes/api.php` — 4 nuevas rutas: `POST /group/{group}/join`, `POST /member/{member}/approve`, `POST /member/{member}/reject`, `GET /group/{group}/pending-members`

**Frontend:**
- `src/api/types.ts` — `Group` agrega `tournament_id`, `creator_id`, `invitation_code`; nuevos tipos `GroupMember`, `GroupMemberStatus`
- `src/api/endpoints/groups.ts` — `tournament_id` en `CreateGroupPayload`, nuevo `listByTournament()`
- **Nuevo** `src/api/endpoints/groupMembers.ts` — `joinRequest()`, `approve()`, `reject()`, `pending()`
- `src/hooks/useGroups.ts` — Nuevo `useTournamentGroups(tournamentId)`
- **Nuevo** `src/hooks/useGroupMembers.ts` — `useJoinGroup()`, `useApproveMember()`, `useRejectMember()`, `usePendingMembers()`
- **Nuevo** `src/components/domain/JoinTournamentFlow.tsx` — Lista grupos del torneo, botón "Unirse" por grupo, creación rápida de grupo con defaults
- **Nuevo** `src/pages/tournaments/JoinTournamentPage.tsx` — Wrapper de JoinTournamentFlow
- `src/router/index.tsx` — Ruta `/tournaments/:tournamentId/join`
- `src/pages/tournaments/TournamentList.tsx` — Nuevo botón "Unirse" en cada tarjeta
- `src/pages/groups/GroupDetail.tsx` — Sección "Solicitudes pendientes" con aprobar/rechazar (solo admin del grupo)
- `src/pages/predictions/MyPredictions.tsx` — Filtrado por `tournamentId` cuando se navega desde un grupo con torneo

> **Ejecutar** `php artisan migrate` para las nuevas migraciones.

---

### Torneos privados + Importación Excel

**Escenario 1: Torneo Privado** — Un usuario con rol `user` puede crear torneos privados, configurarlos, publicarlos e ingresar resultados manualmente.

**Backend (`laravel-crud-api`):**
- **Migración** `2026_07_25_100000` — Agrega `status` (draft/published/live/closed) y `created_by` (FK users) a `tournaments`
- `app/Models/Tournament.php` — Nuevos campos `status`, `created_by`, relación `creator()`, scopes `draft()`, `published()`, `live()`, métodos `isOwner()`, `isDraft()`, etc.
- `app/Http/Controllers/TournamentController.php`:
  - `store()` — Guarda `created_by = auth()->id()` automáticamente
  - `update()` — Owner-only en draft, solo permite start_date/end_date una vez publicado
  - `destroy()` — Owner-only, solo draft
  - `publish()` — draft → published (owner/admin)
  - `goLive()` — published → live (owner/admin)
  - `close()` — live → closed (owner/admin)
- **Nuevo** `app/Http/Controllers/ManualMatchController.php`:
  - `updateResult()` — Owner ingresa goles de un partido, dispatch `ScoreMatchPredictions` job
  - `updateStatus()` — Owner cambia estado de un partido
  - `pendingResults()` — Lista partidos pendientes + resumen (total/finished/pending)
  - Auto-check: cuando todos los partides de una fase terminan, aprueba los grupos automáticamente
- `app/Http/Resources/TournamentResource.php` — Agrega `status` y `created_by`
- `app/Http/Requests/StoreTournamentRequest.php` — `logo_url`/`flag_url` ahora nullable, `status` opcional
- `routes/api.php` — 6 nuevas rutas: publish, go-live, close, updateResult, updateStatus, pendingResults

**Frontend:**
- `src/api/types.ts` — `TournamentStatus` type, `status` y `created_by` en `Tournament`
- `src/api/endpoints/tournaments.ts` — `publish()`, `goLive()`, `close()`
- **Nuevo** `src/api/endpoints/manualMatches.ts` — `pendingResults()`, `updateResult()`, `updateStatus()`
- `src/hooks/useTournaments.ts` — `usePublishTournament()`, `useGoLiveTournament()`, `useCloseTournament()`
- **Nuevo** `src/hooks/useManualMatches.ts` — `usePendingResults()`, `useUpdateMatchResult()`, `useUpdateMatchStatus()`
- **Nuevo** `src/pages/tournaments/TournamentManager.tsx`:
  - Panel del owner con badge de status (draft/published/live/closed)
  - Acciones: Publicar, Activar, Cerrar
  - Vista de partidos pendientes agrupados por fase
  - Form de ingreso de resultado por partido (goles + confirmación)
  - Vista draft con links a Fases/Grupos/Partidos
- **Nuevo** `src/pages/tournaments/ExcelImport.tsx`:
  - Drag & drop de archivos .xlsx/.xls/.csv
  - Parseo con SheetJS en el navegador
  - Vista previa de fases, equipos, partidos detectados
  - Importación secuencial: fases → equipos → partidos vía bulk endpoints
  - Template de formato: hojas "Fases", "Equipos", "Partidos"
- `src/pages/tournaments/TournamentList.tsx` — Badge de status, botón "Administrar" para owner
- `src/router/index.tsx` — Ruta `/tournaments/:tournamentId/manage`
- `xlsx` (SheetJS) instalado como dependencia

---

### Calendario de partidos por liga

**Backend (`laravel-crud-api`):**
- `app/Filters/MatchesFilter.php` — `match_date` ahora soporta `gt`, `lt`, `gte`, `lte` además de `eq`
- `app/Http/Resources/MatchesResource.php` — Campo `stage` descomentado y funcional (usa `TournamentStageResource`)
- `app/Http\Controllers/MatchesController.php` — Soporte para `?includeStage=1` en `index()` y `show()`, eager loading optimizado

**Frontend:**
- `src/api/types.ts` — `Match` interface ahora incluye campo `stage?: Stage`
- `src/hooks/useCalendarMatches.ts` — **Nuevo**: Hook que trae todos los partidos de un torneo con teams + stage
- `src/pages/tournaments/CalendarPage.tsx` — **Nuevo**: Vista de timeline por jornada
  - Partidos agrupados por fecha, ordenados cronológicamente
  - Filtro por fase/etapa del torneo (pills navegables)
  - TeamBadge con escudo o initial para home/away
  - Score (si finished/live) o "vs" (si scheduled)
  - Badge de estado (Programado / En vivo / Finalizado)
  - Fecha y hora formateada en locale `es-AR`
  - Breadcrumbs: Torneos > Torneo > Calendario
  - Skeleton loading + empty state
- `src/router/index.tsx` — Ruta `/tournaments/:tournamentId/calendar`
- `src/pages/tournaments/TournamentList.tsx` — Nuevo botón "Calendario" en cada tarjeta de torneo

---

### Fix: Registro — campo password_confirmation faltante

**Problema:** El formulario de registro no incluía `password_confirmation`, que Laravel requiere. El error mostrado era "The password field confirmation does not match".

**Archivo:** `src/pages/auth/Register.tsx` — Agregado campo `password_confirmation` al state y al form.

---

### Torneos: Cards + paginación + activar/desactivar

**Backend (`laravel-crud-api`):**
- `app/Http/Controllers/TournamentController.php` — Nuevo método `toggleActive()` que invierte `actived` (0↔1)
- `routes/api.php` — `PATCH /v1/tournament/{tournament}/toggle-active` (auth required)

**Frontend:**
- `src/api/endpoints/tournaments.ts` — Método `toggleActive(id)`, `list()` acepta `page` y `perPage`
- `src/hooks/useTournaments.ts` — `useTournaments(page, perPage)` con defaults, nuevo hook `useToggleTournamentActive()`
- `src/pages/tournaments/TournamentList.tsx` — Reescrito:
  - Grid de tarjetas con gradiente/logo por torneo, badges Activo/Inactivo y Promocional
  - Toggle activar/desactivar con confirmación modal (sin eliminar)
  - Paginación profesional (12 por página) con ellipsis y anterior/siguiente
  - Skeleton loading de 6 tarjetas, empty states

---

### Equipos: Cards + buscador + paginación + activar/desactivar

**Backend (`laravel-crud-api`):**
- `app/Http/Controllers/TeamController.php` — Nuevo método `toggleActive()` que invierte `active` (0↔1)
- `routes/api.php` — `PATCH /v1/team/{team}/toggle-active` (auth required)

**Frontend:**
- `src/api/types.ts` — `Team` ahora incluye `active?: number | boolean`
- `src/api/endpoints/teams.ts` — Método `toggleActive(id)`, `list()` acepta `page` y `perPage`
- `src/hooks/useTeams.ts` — `useTeams(params, page, perPage)` con defaults, nuevo hook `useToggleTeamActive()`
- `src/pages/teams/TeamList.tsx` — Reescrito:
  - Grid de tarjetas 4 columnas con gradiente colorido por equipo
  - Buscador por nombre con botón ✕ para limpiar
  - Badges Activo/Inactivo con toggle vía confirmación
  - Edición inline en card azul
  - Paginación profesional (24 por página)
  - Formulario crear Individual + Bulk conservados

---

### Grupos: Cards + buscador + paginación + activar/desactivar

**Backend (`laravel-crud-api`):**
- `database/migrations/2026_07_25_000001_add_active_to_groups_table.php` — Nueva migración: columna `active` en tabla `groups`
- `app/Models/Groups.php` — `active` agregado a `$fillable`
- `app/Http/Controllers/GroupsController.php` — Nuevo método `toggleActive()`
- `routes/api.php` — `PATCH /v1/group/{group}/toggle-active` (auth required)

**Frontend:**
- `src/api/types.ts` — `Group` ahora incluye `active?: number | boolean`
- `src/api/endpoints/groups.ts` — Método `toggleActive(id)`, `list()` acepta `page` y `perPage`
- `src/hooks/useGroups.ts` — `useGroups(page, perPage)` con defaults, nuevo hook `useToggleGroupActive()`
- `src/pages/groups/GroupList.tsx` — Reescrito:
  - Grid de tarjetas con gradiente e initial
  - Buscador por nombre/descripción
  - Badges Activo/Inactivo con toggle
  - Paginación profesional (12 por página)
  - Texto "Sin apuestas" en vez de "Sin pool"
- `src/pages/groups/GroupDetail.tsx` — Reescrito:
  - Botón "Eliminar" → reemplazado por toggle Activo/Inactivo
  - Leaderboard ordenable: click en columnas Puntos/Aciertos/Exactos para ordenar asc/desc
  - Default: mayor puntaje primero

> **Ejecutar** `php artisan migrate` para agregar la columna `active` a la tabla `groups`.

---

### Landing: Buscador

**Archivo:** `src/pages/LandingPage.tsx` — Agregado buscador que filtra en tiempo real ligas en vivo (nombre/país) y torneos (nombre/país/temporada), con botón ✕ para limpiar y empty state contextual.

---

### Sync: Restringido a admin

**Backend (`laravel-crud-api`):**
- `app/Http/Middleware/RequireAdmin.php` — Nuevo middleware: verifica `$user->role === 'admin'`, retorna 403 si no
- `bootstrap/app.php` — Alias registrado `'admin' => RequireAdmin::class`
- `routes/api.php` — `POST /v1/sync` ahora tiene `->middleware('admin')`

**Frontend:**
- `src/api/types.ts` — `User` ahora incluye `role?: string`
- `src/router/AdminRoute.tsx` — Nuevo componente: redirige a `/dashboard` si el user no es admin
- `src/router/index.tsx` — `/admin/sync` envuelto en `<AdminRoute>`
- `src/components/domain/AppLayout.tsx` — Link "Sync" solo visible si `user?.role === 'admin'`

---

### Fix: MatchesResource — team relation error

**Problema:** `TeamResource::collection()` se usaba con `whenLoaded()` que devuelve un solo modelo, causando `Call to undefined method App\Models\Team::mapInto()`.

**Archivo:** `app/Http/Resources/MatchesResource.php` — Cambiado a `new TeamResource()` directo para relaciones `belongsTo` (`home`, `away`).

---

### Bracket: Tabla de posiciones completa con escudos

**Backend (`laravel-crud-api`):**
- `app/Services/AdvancementService.php` — `calculateGroupStandings()` ahora incluye `logo_url` del equipo en la respuesta

**Frontend:**
- `src/api/types.ts` — `TournamentGroupStanding` ahora incluye `matches_played`, `wins`, `draws`, `losses`, `logo_url`
- `src/pages/tournaments/Bracket/BracketView.tsx` — Tabla expandida de 3 → 10 columnas:
  - Badge circular con escudo (`logo_url`) o initial en gradiente
  - Columnas: #, Equipo, PJ, PG, PE, PP, GF, GC, DG, Pts
  - Top 2 filas resaltadas (clasificados)
  - Responsive: PJ/PG/PE/PP ocultas en mobile, GF/GC ocultas en pantallas pequeñas

---

### Predicciones: Rediseño con tabs abiertas/cerradas

**Frontend:**
- `src/api/types.ts` — `Team` ahora incluye `logo_url` y `flag_url`
- `src/components/domain/MatchPredictionCard.tsx` — Reescrito:
  - Badge circular con escudo (logo_url) o initial en gradiente por equipo
  - Layout horizontal: Home team | inputs score | Away team
  - Countdown compacto, "Guardada ✓" al guardar
- `src/components/domain/ClosedMatchCard.tsx` — **Nuevo**:
  - Tarjeta de solo lectura para partidos cerrados
  - Escudos grandes de ambos equipos con logo_url o fallback
  - Resultado real en tipografía bold, badge de estado (Finalizado/En curso)
  - Tu predicción mostrada debajo (si la hiciste)
- `src/pages/predictions/MyPredictions.tsx` — Reescrito:
  - Dos tabs: "Abiertas" / "Cerradas" con conteo
  - Abiertas: ordenadas por fecha asc (más cercana primero), muestra 3, "Ver más (+5)"
  - Cerradas: ordenadas por fecha desc, muestra 3, "Ver más (+5)"
  - Fetch con `includeHome=1&includeAway=1` para traer escudos
  - Predicciones del grupo cruzadas para mostrar en cerradas

---

## 2026-07-22

### Fix: Auth token no se enviaba en requests

**Problema:** El tipo `LoginResponse` usaba `plainTextToken` pero la API Laravel devuelve `token`. Esto causaba que `data.plainTextToken` fuera `undefined`, el store guardara `null` como token, y ningún request enviara el header `Authorization: Bearer`.

**Archivos:**
- `src/api/types.ts` — `LoginResponse.plainTextToken` → `LoginResponse.token`
- `src/hooks/useAuth.ts` — `data.plainTextToken` → `data.token` (useLogin + useRegister)

---

### Bracket: Mockup compliance

**BracketView (`src/pages/tournaments/Bracket/BracketView.tsx`) — Reescrito:**
- Tabs horizontales (Fase de grupos / Eliminación directa) con active state
- Badge "Torneo promocional" amber con fecha de expiración
- Groups tab: standings con top 2 resaltados + lista de matches con scores o badge "En vivo"
- Knockout tab: layout horizontal tipo bracket (cada stage = columna), dashed borders para "Por definir", multiplicadores violetas

**AdminBracket (`src/pages/tournaments/admin/AdminBracket.tsx`) — Mejorado:**
- Position badges circulares (1° verde, 2° azul, resto gris)
- Destination label "Avances sugeridos → {next stage name}"
- RuleInfo: fetch de `bracketApi.listRules(stageId)` mostrando "Regla: top N. Los demás no avanzan."

**Hook nuevo (`src/hooks/useBracket.ts`):**
- `useAdvancementRules(stageId)` — fetch de reglas de avance por stage

---

### Landing page pública

**Archivos nuevos:**
- `src/components/domain/PublicLayout.tsx` — Header (logo + nav + login/register o Dashboard según auth) + footer con copyright y links
- `src/pages/LandingPage.tsx` — Hero con CTA, grid de torneos filtrado por plan, secciones de upsell para promocionales y login

**Archivos modificados:**
- `src/router/index.tsx` — `/` es público (PublicLayout + LandingPage), Dashboard movido a `/dashboard`
- `src/hooks/useAuth.ts` — Login y register redirigen a `/dashboard`
- `src/components/domain/AppLayout.tsx` — Logo link apunta a `/dashboard`

**Lógica de visibilidad de torneos:**
- No logueado / plan free → solo torneos gratuitos (`is_promotional === 0`)
- Plan paid (pro/premium) → todos los torneos
- Sección CTA para torneos promocionales si el usuario no está logueado

---

### Landing page: Rediseño estilizado con cards de imagen

**Tipos (`src/api/types.ts`):**
- Agregados `logo_url: string | null` y `flag_url: string | null` al tipo `Tournament`

**LandingPage (`src/pages/LandingPage.tsx`) — Rediseñado:**
- Hero oscuro (slate-900) con patrón de puntos decorativo, badge stats ("X torneos activos · Y países"), tipografía grande
- TournamentCard con: imagen `logo_url` como cover (fallback a gradiente colorido con inicial), bandera `flag_url` como badge, hover lift con shadow, badges sobre la imagen, fechas con formato compacto
- Skeleton loading state con animación pulse
- Empty state con icono ⚽
- Botón "Ver todos" cuando hay más de 6 torneos
- Sección CTA para promocionales con icono 🏆 y gradiente amber→orange
- Sección premium login con estilo consistente

**PublicLayout (`src/components/domain/PublicLayout.tsx`) — Mejorado:**
- Header sticky con `backdrop-blur-md`, logo con badge "SA"
- Footer organizado en columnas (marca, plataforma, legal), max-w-5xl, separador
