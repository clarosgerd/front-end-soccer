import type { Match } from '@/api/types'
import {
  TIMELINE_HOURS,
  HOUR_HEIGHT,
  getWeekRange,
  getDayName,
  isToday,
  isSameDay,
  getMatchesForDate,
  getHourFromTime,
  getMinuteFromTime,
  formatTime,
  getStatusBorder,
} from './calendarUtils'

function TeamBadge({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="flex items-center gap-1 min-w-0">
      {logoUrl ? (
        <img src={logoUrl} alt="" className="h-4 w-4 rounded-full border border-slate-200 object-cover flex-shrink-0" />
      ) : (
        <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[8px] font-bold text-slate-400">
          {initial}
        </div>
      )}
      <span className="text-[10px] font-medium text-slate-900 truncate">{name}</span>
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
    <div className={`rounded border px-1.5 py-1 ${getStatusBorder(match.status)}`}>
      <div className="text-[9px] font-medium text-slate-500 mb-0.5">
        {formatTime(match.match_date)}
      </div>
      <div className="flex items-center justify-between gap-0.5">
        <TeamBadge name={homeName} logoUrl={match.home?.logo_url} />
        <div className="flex-shrink-0 text-center px-0.5">
          {hasScores && (isFinished || isLive) ? (
            <span className="text-[10px] font-bold text-slate-900 tabular-nums">
              {match.home_score}-{match.away_score}
            </span>
          ) : (
            <span className="text-[9px] text-slate-400">vs</span>
          )}
        </div>
        <TeamBadge name={awayName} logoUrl={match.away?.logo_url} />
      </div>
    </div>
  )
}

interface WeekViewProps {
  date: Date
  matches: Match[]
  selectedDate: Date
}

export function WeekView({ date, matches, selectedDate }: WeekViewProps) {
  const weekDays = getWeekRange(date)
  const totalHeight = TIMELINE_HOURS.length * HOUR_HEIGHT

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="grid grid-cols-8 border-b border-slate-200">
        <div className="border-r border-slate-200" />
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`border-r border-slate-200 last:border-r-0 px-2 py-2 text-center ${
              isSameDay(day, selectedDate) ? 'bg-blue-50' : ''
            }`}
          >
            <div className="text-[10px] font-medium text-slate-500">
              {getDayName(day)}
            </div>
            <div
              className={`text-sm font-semibold ${
                isToday(day)
                  ? 'flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white mx-auto'
                  : 'text-slate-900'
              }`}
            >
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      <div className="relative overflow-y-auto" style={{ maxHeight: 600 }}>
        <div className="grid grid-cols-8" style={{ height: totalHeight }}>
          <div className="relative border-r border-slate-200">
            {TIMELINE_HOURS.map((hour, i) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-slate-100"
                style={{ top: i * HOUR_HEIGHT }}
              >
                <span className="absolute -top-2 right-1 text-[9px] text-slate-400">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {weekDays.map((day) => {
            const dayMatches = getMatchesForDate(matches, day)
            return (
              <div
                key={day.toISOString()}
                className="relative border-r border-slate-200 last:border-r-0"
              >
                {TIMELINE_HOURS.map((hour, i) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-slate-50"
                    style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  />
                ))}
                <div className="absolute inset-0 px-0.5">
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
                        <MatchBlock match={match} />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
