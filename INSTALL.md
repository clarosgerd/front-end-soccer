# Friend Soccer — Guía de Instalación (DEVOPS)

> Plataforma de predicciones de fútbol con torneos privados, scoring en vivo y pool de premios.

---

## Resumen del Sistema

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | React + TypeScript + Vite + Tailwind | 19 / ~6.0 / 8.1 / v4 |
| Estado | Zustand + TanStack React Query | 5 / 5 |
| Backend | Laravel + Sanctum + MySQL | 12 / 4 / 8+ |
| Pagos | Stripe | — |
| APIs externas | ESPN, football-data.org, API-Football | — |

---

## Requisitos Previos

| Software | Versión mínima | Verificar |
|----------|----------------|-----------|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| PHP | 8.2+ | `php -v` |
| Composer | 2+ | `composer -V` |
| MySQL | 8+ | `mysql --version` |
| XAMPP | cualquier versión | Apache + MySQL activos |

---

## 1. Backend (Laravel)

### 1.1 Instalación

```bash
cd C:\xampp\htdocs\laravel-crud-api

# Instalar dependencias PHP
composer install

# Generar clave de aplicación
cp .env.example .env
php artisan key:generate
```

### 1.2 Base de datos

```bash
# Crear base de datos (desde MySQL CLI o phpMyAdmin)
mysql -u root -e "CREATE DATABASE soccerapi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Editar `.env` con tus credenciales:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=soccerapi
DB_USERNAME=root
DB_PASSWORD=
```

### 1.3 Migraciones y seeds

```bash
# Ejecutar migraciones
php artisan migrate

# Datos demo (opcional pero recomendado)
php artisan tournament:seed-demo
```

### 1.4 Variables de entorno del Backend

```env
# === APIs externas ===
API_FOOTBALL_KEY=tu_api_key_aqui
FOOTBALL_DATA_API_TOKEN=tu_token_aqui

# === Stripe ===
STRIPE_KEY=pk_...
STRIPE_SECRET=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# === App ===
APP_KEY=base64:...
APP_URL=http://127.0.0.1:8000
```

### 1.5 Arrancar backend

```bash
php artisan serve
# → http://127.0.0.1:8000
```

---

## 2. Frontend (React + Vite + TypeScript)

### 2.1 Instalación

```bash
cd C:\xampp\htdocs\soccerapi

# Instalar dependencias Node
npm install

# Configurar entorno
cp .env.example .env
```

Editar `.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

### 2.2 Arrancar frontend

```bash
npm run dev
# → http://localhost:5173
```

---

## 3. Stack Frontend — Explicación Detallada

### 3.1 React 19

Framework de UI declarativo. Componentes funcionales con hooks.

**Qué aporta en este proyecto:**
- Componentes reutilizables (`Button`, `Card`, `TextField`, `ErrorBanner`)
- Hooks personalizados para cada dominio (`useTournaments`, `useTeams`, `useMatches`)
- Server Components no se usan (SPA pura)

**Estructura de componentes:**

```
src/components/
├── ui/                    # Genéricos (reutilizables en cualquier proyecto)
│   ├── Button.tsx         # variants: primary, secondary, danger
│   ├── Card.tsx           # contenedor con borde
│   ├── TextField.tsx      # input con label + error
│   ├── ErrorBanner.tsx    # maneja 422, 403, errores genéricos
│   ├── ToastContainer.tsx # stack de notificaciones
│   └── ConfirmDialog.tsx  # modal async de confirmación
└── domain/                # Específicos de Friend Soccer
    ├── AppLayout.tsx      # shell autenticado (sidebar + nav)
    ├── TournamentForm.tsx # formulario de torneos
    ├── MatchPredictionCard.tsx  # tarjeta de predicción con countdown
    └── ...
```

### 3.2 TypeScript

Tipado estático para toda la aplicación. Cada entidad de la API tiene su tipo.

**Configuración clave** (`tsconfig.app.json`):

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Tipos de entidades** (`src/api/types.ts`):

```typescript
export interface Tournament {
  tournament_id: number;
  name: string;
  season: string;
  country: string;
  status: 'draft' | 'published' | 'live' | 'closed';
  is_promotional: boolean | number;
  created_by: number | null;
  actived: number | boolean;
}

export interface Team {
  team_id: number;
  name: string;
  country: string;
  league: string;
  logo_url: string | null;
  actived: number | boolean;
}

export interface Match {
  match_id: number;
  home_team_id: number;
  away_team_id: number;
  tournament_id: number;
  stage_id: number | null;
  match_date: string;
  status: 'scheduled' | 'live' | 'finished' | 'canceled';
  home_score: number | null;
  away_score: number | null;
}
```

**Tipos de respuesta API:**

```typescript
export interface ApiListResponse<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface ApiItemResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  message: string;
  errors: Record<string, string[]>;
}
```

### 3.3 Vite 8

Bundler y dev server. HMR (Hot Module Replacement) instantáneo.

**Configuración** (`vite.config.ts`):

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Alias `@`**: Permite imports limpios:

```typescript
// Sin alias (feo)
import { Button } from '../../../components/ui/Button'

// Con alias (limpio)
import { Button } from '@/components/ui/Button'
```

**Comandos de Vite:**

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Dev server en `:5173` con HMR |
| `npm run build` | Build producción: `tsc && vite build` |
| `npm run preview` | Preview del build de producción |

**Build de producción** genera `dist/` con archivos minificados y optimizados.

### 3.4 Tailwind CSS v4

Framework CSS utility-first. No escribe CSS custom, usa clases atómicas.

**Configuración** (`src/index.css`):

```css
@import "tailwindcss";
```

**Ejemplos en componentes:**

```tsx
// Button.tsx
<button className="px-4 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">

// Card.tsx
<div className="border border-gray-200 rounded-lg p-4">

// TextField.tsx
<input className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
```

**Ventajas en este proyecto:**
- Sin organizar CSS ni preocuparse por specificity
- Responsive fácil: `md:flex`, `lg:grid-cols-3`
- Dark mode listo si se necesita
- Bundle CSS mínimo (solo clases usadas)

### 3.5 Zustand (Estado del Cliente)

Estado global ligero. 3 stores para auth, toasts y confirmaciones.

**Por qué Zustand y no Redux:**
- Sin boilerplate (no actions, reducers, dispatch)
- Un archivo por store (~30 líneas)
- Persistencia con `persist` middleware (localStorage)
- Selectores granulares (evita re-renders innecesarios)

**Store de autenticación** (`src/store/authStore.ts`):

```typescript
interface AuthState {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' }  // localStorage key
  )
)
```

**Store de toasts** (`src/store/toastStore.ts`):

```typescript
// Uso desde cualquier componente:
import { toast } from '@/lib/toast'

toast.success('Partido creado exitosamente')
toast.error('Error al eliminar el equipo')
```

**Store de confirmación** (`src/store/confirmStore.ts`):

```typescript
// Uso async/await:
import { confirmAction } from '@/lib/confirmAction'

const confirmed = await confirmAction('¿Eliminar este torneo?')
if (confirmed) {
  await deleteTournament(id)
}
```

**Regla:** Ningún `window.confirm()` ni `alert()` nativo en toda la app.

### 3.6 TanStack React Query v5

Estado del servidor: cache, refetch, invalidación, polling, optimistic updates.

**Por qué React Query y no useState + useEffect:**
- Cache automático (no fetch duplicado)
- Invalidación inteligente tras mutaciones
- Polling integrado (bracket, scoring: 30s)
- Loading/error states automáticos
- Retry con backoff

**Configuración** (`src/App.tsx`):

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,      // 30s antes de considerar stale
      retry: 1,                // 1 reintento en error
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer />
      <ConfirmDialog />
    </QueryClientProvider>
  )
}
```

**Patrón de hooks** — Un archivo por dominio:

```typescript
// src/hooks/useTournaments.ts

// List query
export function useTournaments(params?: TournamentFilters) {
  return useQuery({
    queryKey: ['tournaments', params],
    queryFn: () => tournamentsApi.list(params),
  })
}

// Detail query
export function useTournament(id: number) {
  return useQuery({
    queryKey: ['tournaments', id],
    queryFn: () => tournamentsApi.getById(id),
    enabled: !!id,
  })
}

// Create mutation (invalida list)
export function useCreateTournament() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TournamentPayload) => tournamentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      toast.success('Torneo creado')
    },
  })
}

// Update mutation (invalida list + detail)
export function useUpdateTournament(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TournamentPayload) => tournamentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      queryClient.invalidateQueries({ queryKey: ['tournaments', id] })
      toast.success('Torneo actualizado')
    },
  })
}
```

**Polling para datos en vivo:**

```typescript
// Bracket view — refetch cada 30 segundos
const { data: bracket } = useBracket(tournamentId, {
  refetchInterval: 30_000,
})

// Scoring dashboard — refetch cada 30 segundos
const { data: scoring } = useScoring(groupId, {
  refetchInterval: 30_000,
})
```

**Patrón de invalidación:**

```
Crear equipo    → invalidate ['teams']
Actualizar equipo → invalidate ['teams'] + ['teams', id]
Eliminar equipo  → invalidate ['teams']
Crear partido   → invalidate ['matches', tournamentId]
Scorear partido → invalidate ['matches', tournamentId] + ['predictions'] + ['scoring']
```

---

## 4. Comandos de Desarrollo

### Frontend

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server con HMR (puerto 5173) |
| `npm run build` | Lint + TypeScript check + Vite build |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Lint con oxlint (plugins: react, ts, vitest) |
| `npm test` | Tests single run |
| `npm run test:watch` | Tests watch mode |

### Backend

| Comando | Descripción |
|---------|-------------|
| `php artisan serve` | Servidor de desarrollo (puerto 8000) |
| `php artisan migrate` | Ejecutar migraciones |
| `php artisan migrate:fresh --seed` | Recrear BD con seeds |
| `php artisan tournament:seed-demo` | Torneos demo completos |
| `php artisan espn:sync` | Sync completa ESPN (10 ligas, ~5 min) |
| `php artisan sync:live` | Sync combinado (para scheduler) |
| `php artisan predictions:score` | Scorear predicciones |
| `php artisan schedule:list` | Ver tareas programadas |

---

## 5. Testing

### Stack de testing

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| Vitest | 4 | Test runner (reemplaza Jest) |
| React Testing Library | 16 | Tests de componentes |
| jsdom | — | DOM virtual en Node |
| jest-dom | — | Matchers: `toBeInTheDocument`, `toHaveClass`, etc. |

### Configuración

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,           // describe/it/expect/vi sin import
    setupFiles: ['./src/test-setup.ts'],
    css: false,              // no procesar CSS en tests
  },
})
```

### Ejecutar tests

```bash
npm test             # Single run
npm run test:watch   # Watch mode
```

### Cobertura actual

**46 tests en 8 archivos:**

| Archivo | Tipo | Tests |
|---------|------|-------|
| `src/lib/errorHandler.test.ts` | Unit | 7 |
| `src/lib/toast.test.ts` | Unit | 4 |
| `src/lib/confirmAction.test.ts` | Unit | 6 |
| `src/hooks/usePredictionWindow.test.ts` | Hook | 7 |
| `src/components/ui/Button.test.tsx` | Component | 8 |
| `src/components/ui/Card.test.tsx` | Component | 4 |
| `src/components/ui/TextField.test.tsx` | Component | 8 |
| `src/router/ProtectedRoute.test.tsx` | Component | 2 |

### Ejemplo de test

```typescript
// src/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('is disabled when isLoading', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

---

## 6. Variables de Entorno

### Frontend (.env)

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

**Nota:** Las variables de Vite deben empezar con `VITE_` para estar expuestas al cliente.

### Backend (.env)

```env
# App
APP_KEY=base64:...
APP_URL=http://127.0.0.1:8000

# Base de datos
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=soccerapi
DB_USERNAME=root
DB_PASSWORD=

# APIs externas
API_FOOTBALL_KEY=tu_api_key
FOOTBALL_DATA_API_TOKEN=tu_token

# Stripe
STRIPE_KEY=pk_...
STRIPE_SECRET=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 7. Scheduler (Cron Jobs)

El scheduler ejecuta `sync:live` cada 6 horas automáticamente.

### Activar en Linux

```bash
# Editar crontab
crontab -e

# Agregar esta línea
* * * * * cd /path/to/laravel-crud-api && php artisan schedule:run >> /dev/null 2>&1
```

### Activar en Windows (Task Scheduler)

```
Programa: C:\xampp\php\php.exe
Argumentos: artisan schedule:run
Working directory: C:\xampp\htdocs\laravel-crud-api
Trigger: Cada 6 horas
```

### Verificar

```bash
php artisan schedule:list      # Ver tareas programadas
php artisan schedule:run      # Ejecutar manualmente
```

---

## 8. Troubleshooting

### Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `Failed to fetch` | Backend apagado o CORS | Verificar `php artisan serve` y configuración CORS en Laravel |
| `401 Unauthorized` | Token expirado | El frontend hace logout automático, volver a login |
| `403 Forbidden` | Límite de plan | Mostrado como CTA a `/subscription`, no es error |
| `422 Validation Error` | Campos faltantes | PUT requiere TODOS los campos (no PATCH) |
| `No teams found` en sync | Guzzle URI relativa | Verificar que services usen URL completa |
| `actived` = 0/1 | No es boolean | Usar `number | boolean` en tipos TypeScript |
| Build falla | Errores TypeScript | Ejecutar `npx tsc --noEmit` para ver errores |

### Puertos por defecto

| Servicio | Puerto |
|----------|--------|
| Frontend (Vite) | 5173 |
| Backend (Laravel) | 8000 |
| MySQL (XAMPP) | 3306 |
| Apache (XAMPP) | 80 |

### Reset completo

```bash
# Frontend
rm -rf node_modules
npm install

# Backend
cd ../laravel-crud-api
composer install
php artisan migrate:fresh --seed

# Reiniciar ambos
php artisan serve          # Terminal 1
npm run dev                # Terminal 2
```

---

## 9. Arquitectura de Directorios

```
soccerapi/                    # Frontend (este repo)
├── src/
│   ├── api/                  # Capa de API
│   │   ├── client.ts         # Axios + interceptors
│   │   ├── types.ts          # Tipos TypeScript
│   │   └── endpoints/        # 17 archivos, uno por dominio
│   ├── hooks/                # 21 hooks React Query
│   ├── store/                # 3 Zustand stores
│   ├── lib/                  # Utilidades (errorHandler, toast, confirm)
│   ├── components/
│   │   ├── ui/               # 6 componentes genéricos
│   │   └── domain/           # 11 componentes de negocio
│   ├── pages/                # 25+ páginas
│   └── router/               # Rutas + guards
├── public/                   # Assets estáticos
├── dist/                     # Build de producción
├── .env                      # Variables de entorno
├── vite.config.ts            # Configuración Vite
├── vitest.config.ts          # Configuración de tests
├── tsconfig.json             # Configuración TypeScript
└── package.json              # Dependencias NPM

laravel-crud-api/             # Backend (repo separado)
├── app/
│   ├── Console/Commands/     # Comandos Artisan
│   ├── Http/Controllers/     # Controllers REST
│   ├── Models/               # Modelos Eloquent
│   └── Services/             # Servicios externos (ESPN, football-data)
├── database/migrations/      # Migraciones MySQL
├── routes/api.php            # Rutas de la API
└── .env                      # Variables de entorno
```

---

*Última actualización: Agosto 2026*
