import type { Match } from '@/api/types'
import {
  TIMELINE_HOURS,
  HOUR_HEIGHT,
  getHourFromTime,
  getMinuteFromTime,
  formatTime,
  formatDayLabel,
  getMatchesForDate,
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

function MatchBlock({ match }: { match: Match }) {
  const homeName = match.home?.name ?? 'Por definir'
  const awayName = match.away?.name ?? 'Por definir'
  const hasScores = match.home_score != null && match.away_score != null
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'

  return (
    <div className={`rounded-md border px-2 py-1.5 ${getStatusBorder(match.status)}`}>
      <div className="flex items-center justify-between gap-1">
        <TeamBadge name={homeName} logoUrl={match.home?.logo_url} />
        <div className="flex-shrink-0 text-center">
          {hasScores && (isFinished || isLive) ? (
            <span className="text-xs font-bold text-slate-900 tabular-nums">
              {match.home_score}-{match.away_score}
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">vs</span>
          )}
        </div>
        <TeamBadge name={awayName} logoUrl={match.away?.logo_url} />
      </div>
      {match.stage && (
        <p className="mt-0.5 text-[9px] text-slate-400 truncate">{match.stage.name}</p>
      )}
    </div>
  )
}

interface DayViewProps {
  date: Date
  matches: Match[]
}

export function DayView({ date, matches }: DayViewProps) {
  const dayMatches = getMatchesForDate(matches, date)
  const totalHeight = TIMELINE_HOURS.length * HOUR_HEIGHT

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-slate-900 capitalize">
        {formatDayLabel(date)}
      </h2>

      {dayMatches.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white py-12 text-center">
          <p className="text-sm text-slate-500">No hay partidos este día</p>
        </div>
      ) : (
        <div className="relative rounded-lg border border-slate-200 bg-white overflow-hidden">
          <div className="relative" style={{ height: totalHeight }}>
            {TIMELINE_HOURS.map((hour, i) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-slate-100"
                style={{ top: i * HOUR_HEIGHT }}
              >
                <span className="absolute -top-2.5 left-2 text-[10px] text-slate-400 bg-white px-1">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}

            <div className="absolute left-14 right-2 top-0 bottom-0">
              {dayMatches.map((match) => {
                const hour = getHourFromTime(match.match_date)
                const minute = getMinuteFromTime(match.match_date)
                const offsetHour = hour - TIMELINE_HOURS[0]
                if (offsetHour < 0) return null
                const top = offsetHour * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT
                return (
                  <div
                    key={match.match_id}
                    className="absolute left-0 right-0"
                    style={{ top }}
                  >
                    <div className="mb-0.5 flex items-center gap-1">
                      <span className="text-[10px] font-medium text-slate-500">
                        {formatTime(match.match_date)}
                      </span>
                    </div>
                    <MatchBlock match={match} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
