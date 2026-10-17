import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCalendarMatches } from '@/hooks/useCalendarMatches'
import { useTournament } from '@/hooks/useTournaments'
import type { Stage } from '@/api/types'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { DayView } from './DayView'
import { WeekView } from './WeekView'
import { MonthView } from './MonthView'
import {
  type ViewMode,
  navigateDate,
  formatMonthYear,
  formatWeekRange,
  formatDayLabel,
  getWeekRange,
} from './calendarUtils'

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: 'day', label: 'Día' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
]

export function CalendarPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>()
  const id = Number(tournamentId)
  const { data: tournament } = useTournament(id)
  const { data, isLoading, isError } = useCalendarMatches(id)

  const [view, setView] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [stageFilter, setStageFilter] = useState<number | null>(null)

  const matches = useMemo(() => data?.data ?? [], [data])

  const stages = useMemo(() => {
    const map = new Map<number, Stage>()
    for (const m of matches) {
      if (m.stage && !map.has(m.stage.stage_id)) {
        map.set(m.stage.stage_id, m.stage)
      }
    }
    return Array.from(map.values()).sort((a, b) => a.stage_order - b.stage_order)
  }, [matches])

  const filteredMatches = useMemo(() => {
    if (stageFilter === null) return matches
    return matches.filter((m) => m.stage_id === stageFilter)
  }, [matches, stageFilter])

  function handlePrev() {
    setCurrentDate((d) => navigateDate(d, view, -1))
  }

  function handleNext() {
    setCurrentDate((d) => navigateDate(d, view, 1))
  }

  function handleToday() {
    setCurrentDate(new Date())
  }

  function getTitle(): string {
    switch (view) {
      case 'day':
        return formatDayLabel(currentDate)
      case 'week':
        return formatWeekRange(getWeekRange(currentDate))
      case 'month':
        return formatMonthYear(currentDate)
    }
  }

  const totalMatches = filteredMatches.length

  return (
    <div>
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
          <Link to="/tournaments" className="hover:text-slate-600">Torneos</Link>
          <span>/</span>
          <Link to={`/tournaments/${id}/bracket`} className="hover:text-slate-600">
            {tournament?.name ?? '...'}
          </Link>
          <span>/</span>
          <span className="text-slate-600">Calendario</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={20} className="text-slate-400" />
          <h1 className="text-lg font-semibold text-slate-900">Calendario</h1>
        </div>
        {tournament && (
          <p className="text-xs text-slate-500">
            {tournament.name} · {tournament.season} · {tournament.country} · {totalMatches} partido{totalMatches !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {stages.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setStageFilter(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              stageFilter === null
                ? 'bg-slate-900 text-white'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todas las fases
          </button>
          {stages.map((s) => (
            <button
              key={s.stage_id}
              type="button"
              onClick={() => setStageFilter(s.stage_id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                stageFilter === s.stage_id
                  ? 'bg-slate-900 text-white'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Hoy
          </button>
          <h2 className="ml-2 text-sm font-semibold text-slate-900 capitalize">
            {getTitle()}
          </h2>
        </div>

        <div className="flex rounded-lg border border-slate-200 p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setView(v.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === v.key
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          <p className="mt-3 text-sm text-slate-500">Cargando partidos...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-medium text-red-700">No se pudieron cargar los partidos.</p>
        </div>
      )}

      {!isLoading && !isError && totalMatches === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <CalendarDays size={24} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">No hay partidos programados</p>
          <p className="mt-1 text-xs text-slate-400">
            Los partidos aparecerán cuando se creen en el torneo.
          </p>
        </div>
      )}

      {!isLoading && !isError && totalMatches > 0 && (
        <>
          {view === 'day' && <DayView date={currentDate} matches={filteredMatches} />}
          {view === 'week' && <WeekView date={currentDate} matches={filteredMatches} selectedDate={currentDate} />}
          {view === 'month' && <MonthView date={currentDate} matches={filteredMatches} />}
        </>
      )}
    </div>
  )
}
