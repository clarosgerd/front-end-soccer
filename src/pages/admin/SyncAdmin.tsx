import { useState } from 'react'
import { useSync, useSyncStatus } from '@/hooks/useSync'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ESPN_LEAGUES, type EspnLeagueId } from '@/api/endpoints/sync'

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

const SYNC_TYPES = [
  { value: 'all', label: 'Todo', description: 'Equipos + partidos + jugadores + posiciones' },
  { value: 'teams', label: 'Equipos', description: 'Solo equipos con logos' },
  { value: 'fixtures', label: 'Partidos', description: 'Fixture y resultados' },
  { value: 'players', label: 'Jugadores', description: 'Plantel por equipo' },
  { value: 'standings', label: 'Posiciones', description: 'Tabla de posiciones (vía football-data.org)' },
] as const

const SYNC_SOURCES = [
  { value: 'all', label: 'Todas las fuentes', description: 'football-data.org (temporada actual) + ESPN (en vivo)' },
  { value: 'football', label: 'football-data.org', description: '13 competiciones con temporada actual (World Cup, Libertadores, ligas top)' },
  { value: 'espn', label: 'ESPN', description: 'Gratis e ilimitado. Ligas extra: Liga MX, MLS, Argentina' },
  { value: 'worldcup', label: 'World Cup (API-Football)', description: 'Solo temporadas 2022-2024 (plan free)' },
] as const

export function SyncAdmin() {
  const { data: status, isLoading: statusLoading } = useSyncStatus()
  const sync = useSync()
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedLeague, setSelectedLeague] = useState<EspnLeagueId | 'all'>('all')
  const [season, setSeason] = useState(new Date().getFullYear())
  const [force, setForce] = useState(false)

  const handleSync = () => {
    sync.mutate({
      type: selectedType,
      source: selectedSource,
      league: selectedSource === 'espn' && selectedLeague !== 'all' ? selectedLeague : undefined,
      season,
      force,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Sincronización de Ligas</h1>
        <p className="mt-1 text-sm text-slate-500">
          football-data.org (temporada actual) + ESPN (en vivo, ligas extra). Sync incremental: salta datos recientes salvo que fuerces.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Torneos</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {statusLoading ? '...' : status?.counts.tournaments ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Equipos</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {statusLoading ? '...' : status?.counts.teams ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Partidos</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {statusLoading ? '...' : status?.counts.matches ?? 0}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Jugadores</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {statusLoading ? '...' : status?.counts.players ?? 0}
          </p>
        </Card>
      </div>

      {/* Synced leagues */}
      {status?.leagues && status.leagues.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-medium text-slate-900">Ligas sincronizadas</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {status.leagues.map((league) => (
              <div
                key={league.tournament_id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
              >
                {league.logo_url ? (
                  <img src={league.logo_url} alt="" className="h-8 w-8 rounded" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-400">
                    {league.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{league.name}</p>
                  <p className="text-xs text-slate-500">
                    {league.teams} equipos · {league.matches} partidos · {league.players} jugadores
                  </p>
                  {league.last_synced_at && (
                    <p className="text-[10px] text-slate-400">
                      Actualizado: {timeAgo(league.last_synced_at)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CONMEBOL leagues */}
      {status?.conmebol && status.conmebol.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-medium text-slate-900">Copas CONMEBOL</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {status.conmebol.map((league) => (
              <div
                key={league.tournament_id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
              >
                {league.logo_url ? (
                  <img src={league.logo_url} alt="" className="h-8 w-8 rounded" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-400">
                    {league.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{league.name}</p>
                  <p className="text-xs text-slate-500">
                    {league.teams} equipos · {league.matches} partidos
                  </p>
                  {league.last_synced_at && (
                    <p className="text-[10px] text-slate-400">
                      Actualizado: {timeAgo(league.last_synced_at)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* football-data.org competitions */}
      {status?.football_data && status.football_data.length > 0 && (
        <Card>
          <h2 className="mb-3 text-sm font-medium text-slate-900">
            football-data.org — temporada actual
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {status.football_data.map((league) => (
              <div
                key={league.tournament_id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
              >
                {league.logo_url ? (
                  <img src={league.logo_url} alt="" className="h-8 w-8 rounded" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-400">
                    {league.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{league.name}</p>
                  <p className="text-xs text-slate-500">
                    {league.teams} equipos · {league.matches} partidos
                  </p>
                  {league.last_synced_at && (
                    <p className="text-[10px] text-slate-400">
                      Actualizado: {timeAgo(league.last_synced_at)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sync controls */}
      <Card>
        <h2 className="mb-3 text-sm font-medium text-slate-900">Sincronizar datos</h2>

        {/* Source selector */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-slate-700">Fuente</label>
          <div className="flex flex-wrap gap-2">
            {SYNC_SOURCES.map((s) => (
              <button
                key={s.value}
                onClick={() => setSelectedSource(s.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedSource === s.value
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {SYNC_SOURCES.find((s) => s.value === selectedSource)?.description}
          </p>
        </div>

        {/* League selector (ESPN only) */}
        {selectedSource === 'espn' && (
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-slate-700">Liga</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLeague('all')}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedLeague === 'all'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Todas
              </button>
              {ESPN_LEAGUES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLeague(l.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    selectedLeague === l.id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sync type */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-slate-700">Tipo de dato</label>
          <div className="flex flex-wrap gap-2">
            {SYNC_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setSelectedType(t.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selectedType === t.value
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {SYNC_TYPES.find((t) => t.value === selectedType)?.description}
          </p>
        </div>

        {/* Season + force + action */}
        <div className="flex items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Temporada</label>
            <select
              value={season}
              onChange={(e) => setSeason(Number(e.target.value))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((y) => (
                <option key={y} value={y}>{y}/{y + 1}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 pb-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300"
            />
            Forzar (ignorar sync reciente)
          </label>
          <Button onClick={handleSync} isLoading={sync.isPending}>
            Sincronizar
          </Button>
          {sync.isPending && (
            <p className="text-xs text-slate-400">Puede tardar unos segundos...</p>
          )}
        </div>
      </Card>

      {/* Result */}
      {sync.data && (
        <Card>
          <div className="mb-2 flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                sync.data.success ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <p className="text-sm font-medium text-slate-900">{sync.data.message}</p>
          </div>
          <pre className="max-h-64 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
            {sync.data.log}
          </pre>
        </Card>
      )}

      {sync.isError && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">Error al sincronizar. Verificá la consola del backend.</p>
        </Card>
      )}
    </div>
  )
}
