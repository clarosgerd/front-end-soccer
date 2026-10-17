import { useParams } from 'react-router-dom'
import { useGroup, useLeaderboard } from '@/hooks/useGroups'
import { useContributeToPool, useDistributePool, usePoolDetail } from '@/hooks/usePool'
import { normalizeApiError } from '@/lib/errorHandler'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'
import type { LeaderboardEntry, PoolDistributionEntry } from '@/api/types'

export function PoolDetail() {
  const { groupId } = useParams()
  const id = Number(groupId)

  const { data: group } = useGroup(id)
  const { data: pool, isLoading, isError } = usePoolDetail(id)
  const { data: leaderboardData } = useLeaderboard(id)

  const contribute = useContributeToPool(id)
  const distribute = useDistributePool(id)

  const contributeError = contribute.error ? normalizeApiError(contribute.error) : null
  const distributeError = distribute.error ? normalizeApiError(distribute.error) : null

  const ranking: LeaderboardEntry[] = leaderboardData?.leaderboard ?? []

  function buildDistribution(): PoolDistributionEntry[] {
    if (!group) return []
    const places: Array<{ place: PoolDistributionEntry['place']; pct: number }> = [
      { place: '1st', pct: group.prize_1st_pct },
      { place: '2nd', pct: group.prize_2nd_pct },
      { place: '3rd', pct: group.prize_3rd_pct },
    ]
    const poolTotal = (pool?.pool_total as number | undefined) ?? 0

    return places
      .map((p, i) => {
        const entry = ranking[i]
        if (!entry) return null
        return {
          place: p.place,
          user_id: entry.user_id,
          points: entry.total_points,
          percentage: p.pct,
          prize: Math.round(((poolTotal * p.pct) / 100) * 100) / 100,
        }
      })
      .filter((x): x is PoolDistributionEntry => x !== null)
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Pool de premios</h1>
      <p className="mb-4 text-sm text-slate-500">
        {group?.name} · Reparto {group?.prize_1st_pct}/{group?.prize_2nd_pct}/{group?.prize_3rd_pct}%
      </p>

      {isLoading && <p className="text-sm text-slate-500">Cargando pool…</p>}
      {isError && <p className="text-sm text-red-600">No se pudo cargar el pool.</p>}

      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Total acumulado</p>
            <p className="text-xl font-semibold text-slate-900">
              ${pool?.pool_total ?? 0}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button
              onClick={() =>
                contribute.mutate(undefined, {
                  onSuccess: () => toast.success('Contribución registrada'),
                })
              }
              isLoading={contribute.isPending}
            >
              Contribuir ${group?.bet_amount}
            </Button>
            {contributeError && (
              <p className="text-xs text-red-600">{contributeError.message}</p>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-700">Distribuir premios</h2>
          <Button
            variant="secondary"
            onClick={() =>
              distribute.mutate(buildDistribution(), {
                onSuccess: () => toast.success('Premios distribuidos'),
              })
            }
            isLoading={distribute.isPending}
            disabled={ranking.length === 0}
          >
            Distribuir según leaderboard
          </Button>
        </div>

        {distributeError && (
          <p className="mb-2 text-xs text-red-600">
            {distributeError.isForbidden
              ? 'Solo el creador del grupo puede distribuir el pool.'
              : distributeError.message}
          </p>
        )}

        <ul className="flex flex-col gap-1 text-sm">
          {buildDistribution().map((d) => {
            const entry = ranking.find((r) => r.user_id === d.user_id)
            return (
              <li key={d.place} className="flex justify-between border-t border-slate-100 py-1.5">
                <span>
                  {d.place === '1st' ? '🥇' : d.place === '2nd' ? '🥈' : '🥉'} {entry?.first_name}
                </span>
                <span className="text-slate-500">
                  {d.percentage}% · ${d.prize}
                </span>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
