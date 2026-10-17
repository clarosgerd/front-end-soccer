import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTournaments } from '@/hooks/useTournaments'
import { useSyncStatus } from '@/hooks/useSync'
import { useAuthStore } from '@/store/authStore'
import { useCurrentSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Tournament } from '@/api/types'

const GRADIENTS = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
]

function getGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length]
}

function timeAgo(dateString: string | null): string {
  if (!dateString) return 'Nunca'
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Hace un momento'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Hace ${days} d`
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const isActive = Number(tournament.actived) === 1
  const isPromo = Number(tournament.is_promotional) === 1
  const initial = tournament.name.charAt(0).toUpperCase()

  return (
    <Link
      to="/login"
      className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="relative h-36 overflow-hidden">
        {tournament.logo_url ? (
          <img
            src={tournament.logo_url}
            alt={tournament.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getGradient(tournament.tournament_id)}`}
          >
            <span className="text-4xl font-bold text-white/20">{initial}</span>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent" />

        {tournament.flag_url && (
          <img
            src={tournament.flag_url}
            alt={tournament.country}
            className="absolute right-3 top-3 h-6 w-8 rounded border border-white/30 object-cover shadow-sm"
          />
        )}

        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {isPromo && (
            <span className="rounded bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              Promocional
            </span>
          )}
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${
              isActive
                ? 'bg-emerald-500/90 text-white'
                : 'bg-slate-500/80 text-white'
            }`}
          >
            {isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-1 text-sm font-bold text-slate-900 group-hover:text-slate-700">
          {tournament.name}
        </h3>
        <p className="mb-3 text-xs text-slate-500">
          {tournament.season} · {tournament.country}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {new Date(tournament.start_date).toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })}
            {' – '}
            {new Date(tournament.end_date).toLocaleDateString('es-AR', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="font-medium text-slate-500 group-hover:text-slate-700">Ver →</span>
        </div>
      </div>
    </Link>
  )
}

export function LandingPage() {
  const { data, isLoading, isError } = useTournaments()
  const { data: syncStatus } = useSyncStatus()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data: subscription } = useCurrentSubscription()
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState('')

  const hasPaidPlan = subscription && subscription.plan !== 'free'
  const tournaments = data?.data ?? []

  const freeTournaments = tournaments.filter((t) => Number(t.is_promotional) === 0)
  const promoTournaments = tournaments.filter((t) => Number(t.is_promotional) === 1)
  const activeTournaments = tournaments.filter((t) => Number(t.actived) === 1)

  const visibleTournaments = isAuthenticated && hasPaidPlan
    ? tournaments
    : freeTournaments

  const query = search.trim().toLowerCase()

  const filteredTournaments = query
    ? visibleTournaments.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.country.toLowerCase().includes(query) ||
          t.season.includes(query),
      )
    : visibleTournaments

  const filteredLeagues = query
    ? (syncStatus?.leagues ?? []).filter(
        (l) =>
          l.name.toLowerCase().includes(query) ||
          l.country.toLowerCase().includes(query),
      )
    : syncStatus?.leagues ?? []

  const displayedTournaments = showAll
    ? filteredTournaments
    : filteredTournaments.slice(0, 6)

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative mx-auto max-w-5xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {activeTournaments.length} torneos activos · {(syncStatus?.leagues ?? []).length} ligas en vivo
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Predicciones de fútbol
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-base text-slate-400">
            Creá grupos, hacé predicciones y competí con tus amigos en los mejores torneos del mundo.
          </p>
          <div className="flex items-center justify-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="bg-white text-slate-900 hover:bg-slate-100">Ir al dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button className="bg-white text-slate-900 hover:bg-slate-100">Crear cuenta gratis</Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" className="border-white/20 text-white hover:bg-white/10">
                    Iniciar sesión
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-5xl px-4 -mt-5">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setShowAll(false)
            }}
            placeholder="Buscar torneo, liga o país..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <svg
            className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </section>

      {/* Live leagues section */}
      {filteredLeagues.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-xl font-bold text-slate-900">Ligas en vivo</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Datos actuales de las principales ligas del mundo.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {filteredLeagues.map((league) => (
              <Card key={league.tournament_id} className="p-3 text-center">
                {league.logo_url ? (
                  <img src={league.logo_url} alt="" className="mx-auto mb-2 h-10 w-10 rounded" />
                ) : (
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-lg font-bold text-slate-400">
                    {league.name.charAt(0)}
                  </div>
                )}
                <p className="truncate text-xs font-semibold text-slate-900">{league.name}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {league.teams} equipos · {league.matches} partidos
                </p>
                {league.last_synced_at && (
                  <p className="mt-1 text-[9px] text-slate-300">
                    Actualizado: {timeAgo(league.last_synced_at)}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Torneos disponibles</h2>
            <p className="mt-1 text-sm text-slate-500">
              {isAuthenticated && hasPaidPlan
                ? 'Todos los torneos disponibles para tu plan.'
                : 'Torneos gratuitos. Registrate para acceder a más.'}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white">
                <div className="h-36 bg-slate-100" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-medium text-red-700">No se pudieron cargar los torneos.</p>
          </div>
        )}

        {!isLoading && !isError && filteredTournaments.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
              ⚽
            </div>
            <p className="text-sm font-medium text-slate-700">
              {query ? 'No se encontraron torneos' : 'No hay torneos disponibles'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {query ? 'Probá con otro término de búsqueda.' : 'Volvé a revisar pronto.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && filteredTournaments.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {displayedTournaments.map((t) => (
                <TournamentCard key={t.tournament_id} tournament={t} />
              ))}
            </div>

            {filteredTournaments.length > 6 && !showAll && (
              <div className="mt-8 text-center">
                <Button variant="secondary" onClick={() => setShowAll(true)}>
                  Ver todos ({filteredTournaments.length})
                </Button>
              </div>
            )}
          </>
        )}

        {!isAuthenticated && promoTournaments.length > 0 && (
          <div className="mt-10 overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl">
                🏆
              </div>
              <div className="flex-1">
                <p className="mb-1 text-sm font-bold text-amber-900">
                  {promoTournaments.length} torneo{promoTournaments.length > 1 ? 's' : ''} promocional{promoTournaments.length > 1 ? 'es' : ''}
                </p>
                <p className="text-xs text-amber-700">
                  Registrate gratis para acceder a torneos promocionales con beneficios especiales y sin límites.
                </p>
              </div>
              <Link to="/register" className="flex-shrink-0">
                <Button>Crear cuenta gratis</Button>
              </Link>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="mb-1 text-sm font-semibold text-slate-900">¿Tenés un plan premium?</p>
            <p className="mb-4 text-xs text-slate-500">
              Iniciá sesión para ver todos los torneos disponibles según tu suscripción.
            </p>
            <Link to="/login">
              <Button variant="secondary">Iniciar sesión</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
