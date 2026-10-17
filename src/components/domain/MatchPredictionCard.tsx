import { useState } from 'react'
import type { Match, PredictedResult } from '@/api/types'
import { usePredictionWindow } from '@/hooks/usePredictionWindow'
import { useCreatePrediction } from '@/hooks/usePredictions'
import { useAiPrediction } from '@/hooks/useAiPrediction'
import { useAiCompetitorPrediction, useAiCompetitorStatus } from '@/hooks/useAiCompetitor'
import { normalizeApiError } from '@/lib/errorHandler'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { AiPredictionBadge } from './AiPredictionBadge'

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
        className="h-8 w-8 rounded-full border border-slate-200 object-cover"
      />
    )
  }

  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${color} text-xs font-bold text-white`}
    >
      {initial}
    </div>
  )
}

function inferResult(home: number, away: number): PredictedResult {
  if (home > away) return 'home_win'
  if (home < away) return 'away_win'
  return 'draw'
}

export function MatchPredictionCard({ match, groupId }: { match: Match; groupId: number }) {
  const window = usePredictionWindow(match.match_date)
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const createPrediction = useCreatePrediction(groupId)
  const normalized = createPrediction.error ? normalizeApiError(createPrediction.error) : null
  const { data: aiPrediction } = useAiPrediction(match.match_id)
  const { data: aiCompetitorData } = useAiCompetitorStatus(groupId)
  const { data: aiCompetitorPrediction } = useAiCompetitorPrediction(
    aiCompetitorData?.ai_competitor_enabled ? groupId : undefined,
    match.match_id,
  )

  const homeName = match.home?.name ?? `Eq. ${match.home_team_id}`
  const awayName = match.away?.name ?? `Eq. ${match.away_team_id}`

  function handleSubmit() {
    const home = Number(homeScore)
    const away = Number(awayScore)
    if (Number.isNaN(home) || Number.isNaN(away)) return

    createPrediction.mutate({
      match_id: match.match_id,
      group_id: groupId,
      predicted_home_score: home,
      predicted_away_score: away,
      predicted_result: inferResult(home, away),
      bet_type: 'exact_score',
      confidence: 5,
    })
  }

  return (
    <Card>
      <div className="flex items-center gap-3">
        {/* Home team */}
        <div className="flex flex-1 items-center gap-2.5">
          <TeamBadge name={homeName} logoUrl={match.home?.logo_url} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{homeName}</p>
          </div>
        </div>

        {/* Score inputs + countdown */}
        <div className="flex flex-col items-center gap-1">
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-medium ${
              window.isOpen ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {window.isOpen ? window.label : 'Cerrado'}
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              disabled={!window.isOpen}
              className="w-12 rounded border border-slate-300 px-1.5 py-1 text-center text-sm disabled:bg-slate-50"
              placeholder="0"
            />
            <span className="text-xs font-medium text-slate-400">–</span>
            <input
              type="number"
              min="0"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              disabled={!window.isOpen}
              className="w-12 rounded border border-slate-300 px-1.5 py-1 text-center text-sm disabled:bg-slate-50"
              placeholder="0"
            />
          </div>
        </div>

        {/* Away team */}
        <div className="flex flex-1 items-center justify-end gap-2.5">
          <div className="min-w-0 flex-1 text-right">
            <p className="truncate text-sm font-semibold text-slate-900">{awayName}</p>
          </div>
          <TeamBadge name={awayName} logoUrl={match.away?.logo_url} />
        </div>
      </div>

      <div className="mt-2 space-y-1">
        {aiPrediction && <AiPredictionBadge prediction={aiPrediction} />}

        {match.status === 'finished' && aiCompetitorPrediction && (
          <div className="flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-1.5">
            <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
              <svg className="size-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
              </svg>
              Franco (Chelo)
            </span>
            <span className="text-sm font-semibold text-indigo-800">
              {aiCompetitorPrediction.predicted_home_score} – {aiCompetitorPrediction.predicted_away_score}
            </span>
            <span className="text-[10px] text-indigo-500">IA</span>
          </div>
        )}
      </div>

      {normalized && (
        <div className="mt-2">
          <ErrorBanner error={normalized} />
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        {!window.isOpen && (
          <p className="text-[11px] text-slate-400">
            Cierra 30 min antes del partido.
          </p>
        )}
        {window.isOpen && <span />}
        {createPrediction.isSuccess ? (
          <p className="text-xs font-medium text-emerald-600">Guardada ✓</p>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!window.isOpen || homeScore === '' || awayScore === ''}
            isLoading={createPrediction.isPending}
            className="text-xs"
          >
            Predecir
          </Button>
        )}
      </div>
    </Card>
  )
}
