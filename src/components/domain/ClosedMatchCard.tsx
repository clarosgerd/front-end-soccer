import type { Match, Prediction } from '@/api/types'
import { Card } from '@/components/ui/Card'

const TEAM_COLORS = [
  'from-blue-500 to-blue-700',
  'from-emerald-500 to-emerald-700',
  'from-violet-500 to-violet-700',
  'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700',
  'from-cyan-500 to-cyan-700',
]

function TeamBadge({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const initial = name.charAt(0).toUpperCase()
  const color = TEAM_COLORS[Math.abs(name.charCodeAt(0)) % TEAM_COLORS.length]

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className="h-10 w-10 rounded-full border border-slate-200 object-cover"
      />
    )
  }

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${color} text-sm font-bold text-white`}
    >
      {initial}
    </div>
  )
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Programado',
  live: 'En curso',
  finished: 'Finalizado',
  canceled: 'Cancelado',
}

const STATUS_CLASSES: Record<string, string> = {
  scheduled: 'bg-slate-100 text-slate-600',
  live: 'bg-red-50 text-red-600',
  finished: 'bg-emerald-50 text-emerald-700',
  canceled: 'bg-slate-100 text-slate-400',
}

interface ClosedMatchCardProps {
  match: Match
  prediction?: Prediction | null
}

export function ClosedMatchCard({ match, prediction }: ClosedMatchCardProps) {
  const homeName = match.home?.name ?? `Eq. ${match.home_team_id}`
  const awayName = match.away?.name ?? `Eq. ${match.away_team_id}`
  const hasResult = match.home_score != null && match.away_score != null
  const hasPrediction = prediction && prediction.predicted_home_score != null

  const matchDate = new Date(match.match_date)
  const dateStr = matchDate.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  })
  const timeStr = matchDate.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card>
      <div className="flex items-center gap-3">
        {/* Home team */}
        <div className="flex flex-1 items-center gap-2.5">
          <TeamBadge name={homeName} logoUrl={match.home?.logo_url} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{homeName}</p>
            <p className="text-[11px] text-slate-400">{dateStr} · {timeStr}</p>
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-1">
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-medium ${
              STATUS_CLASSES[match.status] ?? 'bg-slate-100 text-slate-500'
            }`}
          >
            {STATUS_LABEL[match.status] ?? match.status}
          </span>
          {hasResult ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">{match.home_score}</span>
              <span className="text-sm font-medium text-slate-400">–</span>
              <span className="text-lg font-bold text-slate-900">{match.away_score}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">vs</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-sm font-semibold text-slate-900">{awayName}</p>
            <p className="text-[11px] text-slate-400">
              {match.status === 'finished' ? 'Jugado' : ''}
            </p>
          </div>
          <TeamBadge name={awayName} logoUrl={match.away?.logo_url} />
        </div>
      </div>

      {/* User prediction */}
      {hasPrediction && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-md bg-slate-50 py-2">
          <span className="text-[11px] text-slate-500">Tu predicción:</span>
          <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
            {prediction.predicted_home_score} – {prediction.predicted_away_score}
          </span>
        </div>
      )}

      {!hasPrediction && match.status === 'finished' && (
        <div className="mt-3 text-center text-[11px] text-slate-400">
          No hiciste predicción para este partido.
        </div>
      )}
    </Card>
  )
}
