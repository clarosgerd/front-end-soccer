import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMatches, usePredictionsByGroup } from '@/hooks/usePredictions'
import { MatchPredictionCard } from '@/components/domain/MatchPredictionCard'
import { ClosedMatchCard } from '@/components/domain/ClosedMatchCard'
import type { Match } from '@/api/types'

const WINDOW_MS = 30 * 60 * 1000
const INITIAL_OPEN = 3
const LOAD_MORE = 5

function isOpen(match: Match): boolean {
  if (match.status !== 'scheduled') return false
  const matchTime = new Date(match.match_date).getTime()
  return matchTime - Date.now() > WINDOW_MS
}

export function MyPredictions() {
  const [searchParams] = useSearchParams()
  const groupId = Number(searchParams.get('groupId'))
  const tournamentId = Number(searchParams.get('tournamentId'))
  const [tab, setTab] = useState<'open' | 'closed'>('open')
  const [visibleOpen, setVisibleOpen] = useState(INITIAL_OPEN)
  const [visibleClosed, setVisibleClosed] = useState(INITIAL_OPEN)

  const matchFilters: Record<string, string> = {
    'status[eq]': 'scheduled',
    includeHome: '1',
    includeAway: '1',
  }

  if (Number.isFinite(tournamentId) && tournamentId > 0) {
    matchFilters['tournament_id[eq]'] = String(tournamentId)
  }

  const { data, isLoading, isError } = useMatches(matchFilters)

  const { data: predictionsData } = usePredictionsByGroup(groupId)

  const predictionsMap = useMemo(() => {
    const map = new Map<number, (typeof predictionsData extends { data: infer T } ? T : never)[number]>()
    for (const p of predictionsData?.data ?? []) {
      map.set(p.match_id, p)
    }
    return map
  }, [predictionsData])

  const matches = useMemo(() => data?.data ?? [], [data])

  const openMatches = useMemo(
    () => matches.filter(isOpen).sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()),
    [matches],
  )

  const closedMatches = useMemo(
    () => matches.filter((m) => !isOpen(m)).sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()),
    [matches],
  )

  const visibleOpenMatches = openMatches.slice(0, visibleOpen)
  const visibleClosedMatches = closedMatches.slice(0, visibleClosed)

  if (!Number.isFinite(groupId) || !searchParams.get('groupId')) {
    return (
      <p className="text-sm text-slate-500">
        Entrá desde el detalle de un grupo para hacer tus predicciones.
      </p>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">Predicciones</h1>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setTab('open')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'open'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Abiertas
          {openMatches.length > 0 && (
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              tab === 'open' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {openMatches.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('closed')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            tab === 'closed'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Cerradas
          {closedMatches.length > 0 && (
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              tab === 'closed' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {closedMatches.length}
            </span>
          )}
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100" />
                <div className="h-4 flex-1 rounded bg-slate-100" />
                <div className="h-8 w-20 rounded bg-slate-100" />
                <div className="h-4 flex-1 rounded bg-slate-100" />
                <div className="h-8 w-8 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-medium text-red-700">No se pudieron cargar los partidos.</p>
        </div>
      )}

      {!isLoading && !isError && tab === 'open' && openMatches.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 py-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
            ⏰
          </div>
          <p className="text-sm font-medium text-slate-700">No hay partidos abiertos</p>
          <p className="mt-1 text-xs text-slate-400">
            Todos los partidos cercanos ya cerraron su ventana de predicción.
          </p>
        </div>
      )}

      {!isLoading && !isError && tab === 'closed' && closedMatches.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 py-12 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
            🏟️
          </div>
          <p className="text-sm font-medium text-slate-700">No hay partidos cerrados</p>
          <p className="mt-1 text-xs text-slate-400">
            Los partidos aparecerán aquí una vez que cierre la ventana de predicción.
          </p>
        </div>
      )}

      {/* Open matches */}
      {!isLoading && !isError && tab === 'open' && openMatches.length > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {visibleOpenMatches.map((match) => (
              <MatchPredictionCard key={match.match_id} match={match} groupId={groupId} />
            ))}
          </div>
          {visibleOpen < openMatches.length && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setVisibleOpen((v) => v + LOAD_MORE)}
                className="rounded-md border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Ver más ({Math.min(LOAD_MORE, openMatches.length - visibleOpen)} de {openMatches.length - visibleOpen})
              </button>
            </div>
          )}
        </>
      )}

      {/* Closed matches */}
      {!isLoading && !isError && tab === 'closed' && closedMatches.length > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {visibleClosedMatches.map((match) => (
              <ClosedMatchCard
                key={match.match_id}
                match={match}
                prediction={predictionsMap.get(match.match_id) ?? null}
              />
            ))}
          </div>
          {visibleClosed < closedMatches.length && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setVisibleClosed((v) => v + LOAD_MORE)}
                className="rounded-md border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Ver más ({Math.min(LOAD_MORE, closedMatches.length - visibleClosed)} de {closedMatches.length - visibleClosed})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
