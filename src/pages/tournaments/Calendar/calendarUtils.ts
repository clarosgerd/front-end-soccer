import type { Match, MatchStatus } from '@/api/types'

export type ViewMode = 'day' | 'week' | 'month'

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAY_NAMES_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function getDayName(date: Date, short = true): string {
  return short ? DAY_NAMES[date.getDay()] : DAY_NAMES_FULL[date.getDay()]
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function getWeekRange(date: Date): Date[] {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const result = new Date(monday)
    result.setDate(monday.getDate() + i)
    return result
  })
}

export function getMonthGrid(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1)
  const startDay = firstDay.getDay()
  const offset = startDay === 0 ? -6 : 1 - startDay

  const gridStart = new Date(year, month, 1 + offset)
  gridStart.setHours(0, 0, 0, 0)

  const weeks: Date[][] = []
  const current = new Date(gridStart)

  for (let w = 0; w < 6; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
    if (current.getMonth() !== month && w >= 3) break
  }

  return weeks
}

export function navigateDate(date: Date, view: ViewMode, direction: -1 | 1): Date {
  const d = new Date(date)
  switch (view) {
    case 'day':
      d.setDate(d.getDate() + direction)
      break
    case 'week':
      d.setDate(d.getDate() + direction * 7)
      break
    case 'month':
      d.setMonth(d.getMonth() + direction)
      break
  }
  return d
}

export function groupMatchesByDate(matches: Match[]): Map<string, Match[]> {
  const map = new Map<string, Match[]>()
  for (const m of matches) {
    const key = formatDateKey(new Date(m.match_date))
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(m)
  }
  return map
}

export function getMatchesForDate(matches: Match[], date: Date): Match[] {
  const key = formatDateKey(date)
  return matches.filter((m) => formatDateKey(new Date(m.match_date)) === key)
}

export function getHourFromTime(iso: string): number {
  return new Date(iso).getHours()
}

export function getMinuteFromTime(iso: string): number {
  return new Date(iso).getMinutes()
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })
}

export function formatWeekRange(week: Date[]): string {
  const start = week[0]
  const end = week[6]
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} - ${end.getDate()} ${formatMonthYear(start)}`
  }
  return `${start.getDate()} ${formatDateLabel(start)} - ${end.getDate()} ${formatDateLabel(end)}`
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const TIMELINE_HOURS = Array.from({ length: 18 }, (_, i) => i + 6)
export const HOUR_HEIGHT = 60

export function getStatusColor(status: MatchStatus): string {
  switch (status) {
    case 'live':
      return 'bg-red-500'
    case 'finished':
      return 'bg-emerald-500'
    default:
      return 'bg-slate-400'
  }
}

export function getStatusBorder(status: MatchStatus): string {
  switch (status) {
    case 'live':
      return 'border-red-200 bg-red-50'
    case 'finished':
      return 'border-emerald-200 bg-emerald-50'
    default:
      return 'border-slate-200 bg-white'
  }
}
