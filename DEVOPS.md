# Friend Soccer — Documento DEVOPS

## Resumen del Sistema

Friend Soccer es una plataforma de predicciones de fútbol con:

- **Frontend:** React 19 + Vite + TypeScript (SPA)
- **Backend:** Laravel 12 + Sanctum (REST API)
- **Base de datos:** MySQL
- **APIs externas:** ESPN (gratis, sin key), football-data.org (gratis, 10 req/min), API-Football (free: solo 2022-2024)

---

## Arquitectura de Sincronización de Datos

```
┌──────────────────────────────────────────────────┐
│  Frontend (React)                                │
│  - Landing: ligas en vivo + torneos              │
│  - Admin: sync manual por liga                   │
└──────────────────┬───────────────────────────────┘
                   │ GET /api/v1/sync/status (público)
                   │ POST /api/v1/sync (auth requerido)
┌──────────────────▼───────────────────────────────┐
│  Laravel Backend                                 │
│                                                  │
│  EspnService ────────► ESPN API (gratis, sin key)│
│  FootballDataService ─► football-data.org (10/min)│
│                                                  │
│  Artisan Commands:                               │
│    espn:sync    — sync por liga desde ESPN       │
│    sync:live    — wrapper para scheduler         │
│    worldcup:sync — sync Mundial (API-Football)   │
│    league:sync  — sync ligas (API-Football)      │
│                                                  │
│  Laravel Scheduler: cron cada 6 horas            │
│    └─ sync:live                                  │
└──────────────────────────────────────────────────┘
```

---

## APIs Externales

### ESPN (Principal — datos actuales)

| Dato | Endpoint | Costo |
|------|----------|-------|
| Equipos | `GET /sports/soccer/{liga}/teams` | Gratis |
| Jugadores (roster) | `GET /sports/soccer/{liga}/teams/{id}/roster` | Gratis |
| Fixture del día | `GET /sports/soccer/{liga}/scoreboard` | Gratis |
| Calendario | `GET /sports/soccer/{liga}/scoreboard?dates=YYYYMMDD` | Gratis |
| Detalle partido | `GET /sports/soccer/{liga}/summary?event={id}` | Gratis |
| **Standings** | **No disponible** | — |

- **URL base:** `https://site.api.espn.com/apis/site/v2/sports/soccer`
- **API key:** No requerida
- **Rate limit:** No documentado (uso responsable)
- **IDs de liga:** `eng.1`, `esp.1`, `ger.1`, `ita.1`, `fra.1`, `mex.1`, `usa.1`, `bra.1`, `arg.1`, `ned.1`

### football-data.org (Standings)

| Dato | Endpoint | Costo |
|------|----------|-------|
| Standings | `GET /v4/competitions/{id}/standings` | Gratis (10 req/min) |
| Equipos | `GET /v4/competitions/{id}/teams` | Gratis |
| Partidos | `GET /v4/competitions/{id}/matches` | Gratis |

- **URL base:** `https://api.football-data.org/v4`
- **API key:** Requerida (header `X-Auth-Token`)
- **Rate limit:** 10 requests/minuto (plan free)
- **IDs de competición:** 2021 (PL), 2014 (La Liga), 2002 (Bundesliga), 2019 (Serie A), 2015 (Ligue 1), 2003 (Eredivisie)

### API-Football (Histórica — solo 2022-2024 en free)

| Dato | Endpoint | Costo |
|------|----------|-------|
| Jugadores detallados | `GET /players?league=X&season=2022` | Free (solo 2022-2024) |
| Standings | `GET /standings?league=X&season=2022` | Free (solo 2022-2024) |

- **URL base:** `https://v3.football.api-sports.io`
- **API key:** Requerida (header `x-apisports-key`)
- **Rate limit:** 100 requests/día (plan free)
- **Limitación importante:** Standings y players solo funcionan con temporadas 2022-2024 en el plan free

---

## Variables de Entorno (.env)

```env
# APIs de datos
API_FOOTBALL_KEY=tu_api_key_aqui
FOOTBALL_DATA_API_TOKEN=tu_token_aqui
THESPORTSDB_API_KEY=tu_api_key_aqui

# App
APP_KEY=base64:...
DB_DATABASE=soccerapi
DB_USERNAME=root
DB_PASSWORD=

# Stripe
STRIPE_KEY=pk_...
STRIPE_SECRET=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Comandos Artisan Disponibles

### Sincronización

```bash
# Sync completo ESPN (todas las ligas): equipos + fixtures + players + standings
php artisan espn:sync

# Sync de una sola liga
php artisan espn:sync --league=eng.1
php artisan espn:sync --league=esp.1 --type=teams

# Tipos de sync: all, teams, fixtures, players, standings
php artisan espn:sync --type=players --league=ita.1

# Sync combinado (para scheduler)
php artisan sync:live

# Sync Mundial (API-Football, requiere key)
php artisan worldcup:sync --season=2022 --type=all

# Sync ligas individuales (API-Football)
php artisan league:sync --league-id=39 --season=2024

# Sync CONMEBOL (API-Football)
php artisan conmebol:sync --competition=libertadores --season=2024

# Sync football-data.org (standings/equipos)
php artisan football:sync --type=competitions
php artisan football:sync --type=teams --competition=2021
php artisan football:sync --type=matches --competition=2021
```

### Scoring y Predicciones

```bash
php artisan predictions:score              # Scorear predicciones de partidos finalizados
php artisan predictions:score-unscored     # Buscar partidos sin scorear
php artisan predictions:remind --hours=24  # Enviar recordatorios
```

### Pool y Distribución

```bash
php artisan pool:contribute --group_id=1 --user_id=1
php artisan pool:distribute --group_id=1
```

### Suscripciones

```bash
php artisan subscription:check-expired
php artisan subscription:remind-expiring
```

### Otros

```bash
php artisan promotions:expire
php artisan tournament:summary {tournament_id}
```

### Demo Tournaments

```bash
# Seed torneo demo completo (Liga Amistosa + Cuadrangular)
php artisan tournament:seed-demo

# Seed torneo simple (solo Cuadrangular)
php artisan tournament:seed-simple

# Ver resumen de un torneo específico
php artisan tournament:summary 25
php artisan tournament:summary 26
```

**Torneos demo creados:**
- **Tournament #25 (Liga Amistosa)**: 12 equipos, 2 grupos (Serie A + Serie B), 15 partidos por grupo
- **Tournament #26 (Cuadrangular)**: 4 equipos, 1 grupo, 6 partidos

**Usuarios predictor demo:**
- `predictor1@demo.com` a `predictor6@demo.com`
- Password: `password`

---

## Endpoints HTTP de Sync

| Método | URL | Auth | Descripción |
|--------|-----|------|-------------|
| `GET` | `/api/v1/sync/status` | No | Status general + ligas syncronizadas |
| `POST` | `/api/v1/sync` | Sí (Sanctum) | Trigger sync manual |

### POST /api/v1/sync — Body

```json
{
  "type": "all",
  "league": "eng.1",
  "season": 2026,
  "source": "espn"
}
```

**Parámetros:**
- `type`: `all`, `teams`, `fixtures`, `players`, `standings` (requerido)
- `league`: `eng.1`, `esp.1`, `ger.1`, `ita.1`, `fra.1`, `mex.1`, `usa.1`, `bra.1`, `arg.1`, `ned.1` (opcional — si se omite, sync todas)
- `season`: año (opcional — default: año actual)
- `source`: `espn` o `worldcup` (opcional — default: `espn`)

---

## Base de Datos — Tablas Principales

### `teams`
| Columna | Tipo | Notas |
|---------|------|-------|
| `team_id` | PK auto | Custom PK |
| `external_id` | int, unique | ID del proveedor (ESPN/API-Football) |
| `name` | string | Nombre del equipo |
| `country` | string | País |
| `league` | string | Nombre de la liga |
| `logo_url` | string, nullable | URL del escudo |
| `flag_url` | string, nullable | URL de la bandera |

### `tournaments`
| Columna | Tipo | Notas |
|---------|------|-------|
| `tournament_id` | PK auto | Custom PK |
| `external_id` | int, unique | ID del proveedor |
| `name` | string | Ej: "Premier League" |
| `season` | string | Ej: "2026" |
| `country` | string | País |
| `is_promotional` | bool | Torneos promocionales |

### `matches`
| Columna | Tipo | Notas |
|---------|------|-------|
| `match_id` | PK auto | Custom PK |
| `external_id` | int, unique | ID del partido en ESPN |
| `home_team_id` | FK → teams | |
| `away_team_id` | FK → teams | |
| `tournament_id` | FK → tournaments | |
| `stage_id` | FK → tournamentstage | |
| `match_date` | datetime | |
| `status` | enum | `scheduled`, `live`, `finished`, `canceled` |
| `home_score` / `away_score` | int | |

### `players`
| Columna | Tipo | Notas |
|---------|------|-------|
| `player_id` | PK auto | Custom PK |
| `external_id` | int, unique | ID de ESPN |
| `team_id` | FK → teams, nullable | |
| `name` | string | Nombre completo |
| `position` | string | Ej: "Forward" |
| `nationality` | string | Nacionalidad |

**IMPORTANTE:** `timestamps = false` en TODAS las tablas de datos de fútbol.

---

## Sistema de Torneos

### Torneos Privados vs Públicos

| Tipo | Creador | Status Workflow | Gestión |
|------|---------|-----------------|---------|
| **Público** | Admin | Activo/Inactivo | Admin controla |
| **Privado** | Usuario | draft → published → live → closed | Owner gestiona |

### Status Workflow (Torneos Privados)

```
draft → published → live → closed
```

- **draft**: Estado inicial, owner puede editar
- **published**: Visible a usuarios, pueden unirse
- **live**: Partidos en progreso, owner puede ingresar resultados
- **closed**: Torneo finalizado, resultados definitivos

### Campos de Torneos

| Columna | Tipo | Notas |
|---------|------|-------|
| `status` | enum | `draft`, `published`, `live`, `closed` |
| `created_by` | FK → users | ID del creador (para torneos privados) |

### Manual Match Entry

El owner de un torneo privado puede ingresar resultados manualmente:

- **Endpoint**: `POST /api/v1/manual-match`
- **Controller**: `ManualMatchController`
- **Requisitos**: 
  - Usuario autenticado
  - Usuario es owner del torneo
  - Torneo en status `live`
- **Efecto**: Actualiza scores, dispatcha `ScoreMatchPredictions` job
- **Auto-check**: Verifica si el stage está completo y aprueba grupos automáticamente

### Membership System

Los grupos pueden estar vinculados a torneos via `tournament_id` nullable:

**Endpoints de membership:**

| Método | URL | Auth | Descripción |
|--------|-----|------|-------------|
| `GET` | `/api/v1/tournament/{id}/my-memberships` | Sí | Grupos donde el usuario es miembro para este torneo |
| `GET` | `/api/v1/my-tournament-memberships` | Sí | Todos los tournament_ids donde el usuario tiene membership |

**Flujo de unión:**
1. Usuario solicita unirse a un grupo
2. Admin del grupo aprueba la solicitud
3. Usuario se convierte en miembro

**UI behavior:**
- Muestra badges "Miembro"/"Pendiente" cuando ya está unido
- Muestra link "Ver grupo" para navegar al grupo
- Lista de torneos muestra badge "Ya unido" deshabilitado

### Toggle-Active Endpoints

Endpoints para activar/desactivar recursos (requieren autenticación):

| Método | URL | Descripción |
|--------|-----|-------------|
| `PATCH` | `/api/v1/tournament/{id}/toggle-active` | Toggle `active` field |
| `PATCH` | `/api/v1/team/{id}/toggle-active` | Toggle `actived` field |
| `PATCH` | `/api/v1/group/{id}/toggle-active` | Toggle `actived` field |

**Nota**: Los torneos usan `active` (sin 'd'), mientras que teams y groups usan `actived`.

---

## API Naming Convention

**IMPORTANTE**: Todos los resources del backend retornan IDs con underscore:

```json
{
  "tournament_id": 25,
  "stage_id": 123,
  "group_id": 45
}
```

**NUNCA** usar `tournamentid` o `stageid` (sin underscore). El frontend espera `tournament_id` y `stage_id` para coincidir con los tipos TypeScript y las columnas de la base de datos.

**Endpoints que aceptan filtros:**

```bash
# Correcto
GET /api/v1/stage?tournament_id[eq]=25

# Incorrecto (no funciona)
GET /api/v1/stage?tournamentid[eq]=25
```

---

## Scheduler (Cron Job)

### Configuración

El scheduler está configurado en `routes/console.php`:

```php
Schedule::command('sync:live')->cron('0 */6 * * *');
```

**Ejecuta `sync:live` cada 6 horas** (00:00, 06:00, 12:00, 18:00).

### Activación

**Linux:**
```bash
# Agregar al crontab del servidor
* * * * * cd /path/to/laravel-crud-api && php artisan schedule:run >> /dev/null 2>&1
```

**Windows (Task Scheduler):**
```
Programa: php.exe
Argumentos: artisan schedule:run
Working directory: C:\xampp\htdocs\laravel-crud-api
Trigger: Cada 6 horas
```

### Verificar que funciona

```bash
php artisan schedule:list          # Ver tareas programadas
php artisan schedule:run          # Ejecutar manualmente
php artisan sync:live             # Ejecutar sync directamente
```

---

## Fixtures Importantes Implementados

### Guzzle base_uri

**Problema conocido:** Guzzle resuelve URIs relativas reemplazando el path completo del `base_uri`, no concatenándolo.

```php
// MAL — resuelve a https://api.ejemplo.com/endpoint (pierde /v4)
$client = new Client(['base_uri' => 'https://api.ejemplo.com/v4']);
$client->request('GET', '/endpoint');

// BIEN — usar URL completa
$client->request('GET', 'https://api.ejemplo.com/v4/endpoint');
// O bien, sin slash inicial (URIs relativas):
$client->request('GET', 'endpoint');
```

Ambos servicios (`EspnService` y `FootballDataService`) usan URL completa en el método `request()`.

### ESPN Liga IDs

| Liga | ESPN ID | football-data ID | País |
|------|---------|-----------------|------|
| Premier League | `eng.1` | 2021 | 🏴󠁧󠁢󠁥󠁮󠁧󠁿 |
| La Liga | `esp.1` | 2014 | 🇪🇸 |
| Bundesliga | `ger.1` | 2002 | 🇩🇪 |
| Serie A | `ita.1` | 2019 | 🇮🇹 |
| Ligue 1 | `fra.1` | 2015 | 🇫🇷 |
| Liga MX | `mex.1` | — | 🇲🇽 |
| MLS | `usa.1` | — | 🇺🇸 |
| Brasileirão | `bra.1` | — | 🇧🇷 |
| Liga Argentina | `arg.1` | — | 🇦🇷 |
| Eredivisie | `ned.1` | — | 🇳🇱 |

### Mapeo de Status ESPN → Interno

```
STATUS_FINAL, STATUS_FULL_TIME     → finished
STATUS_SCHEDULED, STATUS_NOT_STARTED → scheduled
STATUS_HALFTIME, STATUS_SECOND_HALF,
STATUS_FIRST_HALF, STATUS_IN_PROGRESS → live
STATUS_CANCELED, STATUS_POSTPONED  → canceled
```

### IDs Externos para Torneos ESPN

Los torneos syncronizados desde ESPN usan IDs en el rango `10001-10010` (definidos en `SyncEspnCommand::getLeagueExternalId`).

---

## Estructura de Archivos Nuevos

```
laravel-crud-api/
├── app/
│   ├── Console/Commands/
│   │   ├── SyncEspnCommand.php        ← espn:sync
│   │   ├── SyncLiveCommand.php         ← sync:live
│   │   ├── SyncWorldCupCommand.php     ← worldcup:sync (existente)
│   │   ├── SyncLeagueCommand.php       ← league:sync (existente)
│   │   ├── SeedDemoTournament.php      ← tournament:seed-demo
│   │   └── SeedSimpleTournament.php    ← tournament:seed-simple
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── SyncController.php          ← GET /sync/status + POST /sync
│   │   │   ├── ManualMatchController.php   ← POST /manual-match
│   │   │   └── GroupsController.php        ← myMemberships, myTournamentMemberships
│   │   ├── Middleware/
│   │   │   └── RequireAdmin.php            ← Admin-only routes
│   │   └── Resources/
│   │       ├── TournamentResource.php      ← Returns tournament_id (underscore)
│   │       └── TournamentStageResource.php ← Returns stage_id, tournament_id
│   └── Services/
│       ├── EspnService.php             ← Cliente ESPN API
│       ├── ApiFootballService.php      ← Cliente API-Football (existente)
│       └── FootballDataService.php     ← Cliente football-data.org (existente)

soccerapi/
├── src/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── sync.ts           ← Tipos + ESPN_LEAGUES
│   │   │   ├── stages.ts         ← StagePayload uses tournament_id
│   │   │   └── groupMembers.ts   ← myMemberships, myTournamentMemberships
│   │   └── types.ts              ← Tournament (with status, created_by)
│   ├── hooks/
│   │   ├── useSync.ts                ← useSyncStatus + useSync
│   │   └── useGroupMembers.ts        ← useMyMemberships, useMyTournamentMemberships
│   ├── pages/
│   │   ├── admin/
│   │   │   └── SyncAdmin.tsx       ← UI admin de sync
│   │   └── tournaments/
│   │       ├── Bracket/
│   │       │   └── BracketView.tsx ← Formatted match cards with logos
│   │       ├── TournamentList.tsx  ← Shows "Ya unido" badge
│   │       ├── JoinTournamentPage.tsx
│   │       ├── Stages.tsx          ← Sends tournament_id in payload
│   │       └── ExcelImport.tsx     ← Excel import for stages/teams/matches
│   ├── components/domain/
│   │   └── JoinTournamentFlow.tsx  ← Membership badges + "Ver grupo" link
│   └── pages/LandingPage.tsx       ← Sección "Ligas en vivo"
```

---

## Troubleshooting

### "No teams found" en espn:sync

El endpoint de ESPN retorna datos pero el service devuelve `[]`. Verificar que el `EspnService::request()` usa URL completa (no relativa con base_uri).

### football-data.org retorna 404

Mismo problema de Guzzle. Verificar que `FootballDataService` usa `$this->baseUrl . $uri` en el método `request()`.

### "Route [login] not defined" (500)

Significa que una ruta pública está duplicada dentro del middleware `auth:sanctum`. Verificar que `GET /sync/status` esté SOLO en la sección pública de `routes/api.php`, no dentro del grupo protegido.

### Rate limit de football-data.org (429)

El servicio duerme 60 segundos y reintenta una vez. Si falla, el sync de standings se omite para esa liga. Las demás fuentes (ESPN) no tienen rate limit documentado.

### Players no aparecen en landing

La landing solo muestra datos de `GET /sync/status` (conteo de equipos/partidos). Los jugadores se muestran en la página de detalle de equipos/partidos.

### Tournament links no funcionan (404 o datos vacíos)

**Síntoma**: Al hacer click en un torneo, no carga o muestra datos vacíos.

**Causa**: El backend retornaba `tournamentid` (sin underscore) pero el frontend esperaba `tournament_id`.

**Solución**: Verificar que `TournamentResource` y `TournamentStageResource` retornen `tournament_id` y `stage_id` (con underscore).

```php
// Correcto
return ['tournament_id' => $this->tournament_id, ...]

// Incorrecto
return ['tournamentid' => $this->tournament_id, ...]
```

### Membership endpoints retornan vacío

Verificar que:
1. El usuario esté autenticado (Bearer token en header)
2. El `tournament_id` exista y tenga grupos asociados
3. Las rutas estén registradas en `routes/api.php` dentro del grupo `auth:sanctum`

### Bracket muestra grupos vacíos

El bracket requiere que los grupos tengan:
1. `tournament_groups` creados y vinculados al torneo
2. `tournament_group_teams` con equipos asignados
3. Standings calculados (se generan automáticamente al crear matches)

Para torneos demo, ejecutar:
```bash
php artisan tournament:seed-demo
```

### "Cannot add foreign key constraint" en migraciones

**Problema**: `created_by` en `tournaments` usa `unsignedBigInteger` pero `users.user_id` es `INT UNSIGNED`.

**Solución**: Usar `unsignedInteger()` en lugar de `unsignedBigInteger()`:

```php
// Correcto
$table->unsignedInteger('created_by')->nullable();

// Incorrecto
$table->unsignedBigInteger('created_by')->nullable();
```

---

## Comandos Rápidos de Referencia

```bash
# Ver datos actuales en la BD
php artisan tinker --execute="echo \App\Models\Team::count() . ' teams';"
php artisan tinker --execute="echo \App\Models\Matches::count() . ' matches';"
php artisan tinker --execute="echo \App\Models\Player::count() . ' players';"

# Resync completo (10 ligas, ~5 min)
php artisan espn:sync --type=all

# Resync rápido (solo fixtures, ~30 seg)
php artisan espn:sync --type=fixtures

# Verificar API endpoint
curl http://127.0.0.1:8000/api/v1/sync/status | python -m json.tool

# Ver rutas de sync
php artisan route:list --path=sync
```
