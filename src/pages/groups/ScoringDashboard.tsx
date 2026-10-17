import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { groupsApi } from '@/api/endpoints/groups'
import { useScoringDashboard } from '@/hooks/useGroups'
import { Card } from '@/components/ui/Card'

export function ScoringDashboard() {
  const { groupId } = useParams()
  const id = Number(groupId)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const { data: dashboard, isLoading, isError } = useScoringDashboard(id)

  const { data: userDetail } = useQuery({
    queryKey: ['groups', id, 'scoring', 'user', selectedUserId],
    queryFn: () => groupsApi.userScoring(id, selectedUserId as number),
    enabled: selectedUserId !== null,
  })

  if (isLoading) return <p className="text-sm text-slate-500">Cargando scoring…</p>
  if (isError) return <p className="text-sm text-red-600">No se pudo cargar el scoring.</p>

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">
        Scoring · {dashboard?.group.name}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        {dashboard?.summary.scored_predictions}/{dashboard?.summary.total_predictions} predicciones
        procesadas · {dashboard?.summary.members} miembros
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-sm font-medium text-slate-700">Reglas de scoring</h2>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-slate-500">Marcador exacto</dt>
            <dd className="text-right">{dashboard?.scoring_rules.exact_score_points} pts</dd>
            <dt className="text-slate-500">Ganador acertado</dt>
            <dd className="text-right">{dashboard?.scoring_rules.match_result_points} pts</dd>
            <dt className="text-slate-500">Gol acertado</dt>
            <dd className="text-right">{dashboard?.scoring_rules.correct_goal_points} pts</dd>
            <dt className="text-slate-500">Predicción única</dt>
            <dd className="text-right">{dashboard?.scoring_rules.unique_exact_points} pts</dd>
          </dl>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="mb-1 text-xs text-slate-500">Multiplicadores por fase</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {dashboard &&
                Object.entries(dashboard.scoring_rules.multipliers).map(([stage, mult]) => (
                  <span key={stage} className="rounded bg-slate-100 px-2 py-1">
                    {stage}: {mult as number}x
                  </span>
                ))}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-medium text-slate-700">Miembros</h2>
          <ul className="flex flex-col divide-y divide-slate-100">
            {dashboard?.members.map(
              (m: { user_id: number; first_name: string; total_points: number }) => (
                <li key={m.user_id}>
                  <button
                    onClick={() => setSelectedUserId(m.user_id)}
                    className={`flex w-full items-center justify-between py-2 text-left text-sm hover:text-slate-900 ${
                      selectedUserId === m.user_id ? 'font-medium text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    <span>{m.first_name}</span>
                    <span>{m.total_points} pts</span>
                  </button>
                </li>
              )
            )}
          </ul>
        </Card>
      </div>

      {userDetail && (
        <Card className="mt-6">
          <h2 className="mb-3 text-sm font-medium text-slate-700">
            Detalle de {dashboard?.members.find((m: { user_id: number }) => m.user_id === selectedUserId)?.first_name}
          </h2>
          <div className="flex flex-col gap-3">
            {userDetail.matches.map(
              (m: {
                match_id: number
                match: string
                predicted_home_score: number
                predicted_away_score: number
                home_score: number
                away_score: number
                stage: string
                points_earned: number
                breakdown: {
                  exact_score: number
                  match_result: number
                  correct_goal_home: number
                  correct_goal_away: number
                  unique_exact: number
                  stage_multiplier: number
                  subtotal: number
                  total: number
                }
              }) => (
                <div key={m.match_id} className="rounded-md border border-slate-100 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{m.match}</span>
                    <span className="text-slate-500">
                      {m.predicted_home_score}-{m.predicted_away_score} predicho ·{' '}
                      {m.home_score}-{m.away_score} real
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {m.stage} · subtotal {m.breakdown.subtotal} × {m.breakdown.stage_multiplier}
                    </span>
                    <span className="font-medium text-slate-900">{m.points_earned} pts</span>
                  </div>
                </div>
              )
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
