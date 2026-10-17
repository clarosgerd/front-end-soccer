import { useState, useMemo } from 'react'
import type { Match } from '@/api/types'
import {
  getMonthGrid,
  isToday,
  isSameDay,
  formatDateKey,
  groupMatchesByDate,
  getStatusColor,
  formatTime,
  getStatusBorder,
} from './calendarUtils'

function TeamBadge({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      {logoUrl ? (
        <img src={logoUrl} alt="" className="h-5 w-5 rounded-full border border-slate-200 object-cover flex-shrink-0" />
      ) : (
        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-400">
          {initial}
        </div>
      )}
      <span className="text-xs font-medium text-slate-900 truncate">{name}</span>
    </div>
  )
}

interface MonthViewProps {
  date: Date
  matches: Match[]
}

export function MonthView({ date, matches }: MonthViewProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const year = date.getFullYear()
  const month = date.getMonth()
  const weeks = useMemo(() => getMonthGrid(year, month), [year, month])
  const matchesByDate = useMemo(() => groupMatchesByDate(matches), [matches])

  const selectedMatches = useMemo(() => {
    if (!selectedDay) return []
    return matchesByDate.get(formatDateKey(selectedDay)) ?? []
  }, [selectedDay, matchesByDate])

  return (
    <div>
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
            <div key={d} className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {d}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-slate-100 last:border-b-0">
            {week.map((day) => {
              const key = formatDateKey(day)
              const dayMatches = matchesByDate.get(key) ?? []
              const isCurrentMonth = day.getMonth() === month
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
              const today = isToday(day)

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`relative min-h-[80px] border-r border-slate-100 last:border-r-0 p-1.5 text-left transition-colors ${
                    !isCurrentMonth ? 'bg-slate-50/50' : 'bg-white'
                  } ${isSelected ? 'ring-2 ring-inset ring-blue-500 bg-blue-50/30' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                        today
                          ? 'bg-blue-600 text-white'
                          : isCurrentMonth
                            ? 'text-slate-900'
                            : 'text-slate-300'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {dayMatches.length > 0 && (
                      <span className="text-[9px] font-medium text-slate-400">
                        {dayMatches.length}
                      </span>
                    )}
                  </div>

                  {dayMatches.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayMatches.slice(0, 3).map((m) => (
                        <div key={m.match_id} className="flex items-center gap-1">
                          <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${getStatusColor(m.status)}`} />
                          <span className="text-[9px] text-slate-600 truncate">
                            {m.home?.name?.slice(0, 8) ?? '?'} vs {m.away?.name?.slice(0, 8) ?? '?'}
                          </span>
                        </div>
                      ))}
                      {dayMatches.length > 3 && (
                        <span className="text-[9px] font-medium text-slate-400">
                          +{dayMatches.length - 3} más
                        </span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {selectedDay && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 capitalize">
              {selectedDay.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cerrar
            </button>
          </div>

          {selectedMatches.length === 0 ? (
            <p className="text-sm text-slate-500">No hay partidos este día</p>
          ) : (
            <div className="space-y-2">
              {selectedMatches.map((match) => {
                const homeName = match.home?.name ?? 'Por definir'
                const awayName = match.away?.name ?? 'Por definir'
                const hasScores = match.home_score != null && match.away_score != null
                const isLive = match.status === 'live'
                const isFinished = match.status === 'finished'

                return (
                  <div key={match.match_id} className={`rounded-md border px-3 py-2 ${getStatusBorder(match.status)}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <TeamBadge name={homeName} logoUrl={match.home?.logo_url} />
                      </div>
                      <div className="flex-shrink-0 text-center">
                        {hasScores && (isFinished || isLive) ? (
                          <span className="text-sm font-bold text-slate-900 tabular-nums">
                            {match.home_score} - {match.away_score}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">vs</span>
                        )}
                        <div className="text-[10px] text-slate-500">{formatTime(match.match_date)}</div>
                      </div>
                      <div className="flex-1 min-w-0 flex justify-end">
                        <TeamBadge name={awayName} logoUrl={match.away?.logo_url} />
                      </div>
                    </div>
                    {match.stage && (
                      <p className="mt-1 text-[10px] text-slate-400">{match.stage.name}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
