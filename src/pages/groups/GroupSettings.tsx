import { useNavigate, useParams } from 'react-router-dom'
import { useGroup, useUpdateGroup } from '@/hooks/useGroups'
import { useGroupMembers } from '@/hooks/useGroupMembers'
import { normalizeApiError } from '@/lib/errorHandler'
import { GroupSettingsForm } from '@/components/domain/GroupSettingsForm'
import { toast } from '@/lib/toast'
import { Card } from '@/components/ui/Card'

export function GroupSettings() {
  const { groupId } = useParams()
  const id = Number(groupId)
  const navigate = useNavigate()

  const { data: group, isLoading } = useGroup(id)
  const { data: membersData } = useGroupMembers(id)
  const updateGroup = useUpdateGroup(id)
  const error = updateGroup.error ? normalizeApiError(updateGroup.error) : null

  const acceptedCount = membersData?.data?.filter((m) => m.status === 'accepted').length ?? 0
  const rulesFrozen = acceptedCount > 1

  if (isLoading) return <p className="text-sm text-slate-500">Cargando grupo…</p>
  if (!group) return <p className="text-sm text-red-600">Grupo no encontrado.</p>

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">Configurar {group.name}</h1>
      <Card>
        <GroupSettingsForm
          groupId={id}
          initialValues={{
            name: group.name,
            description: group.description,
            is_public: group.is_public ? '1' : '0',
            max_members: String(group.max_members),
            bet_amount: String(group.bet_amount),
            prize_1st_pct: String(group.prize_1st_pct),
            prize_2nd_pct: String(group.prize_2nd_pct),
            prize_3rd_pct: String(group.prize_3rd_pct),
            pool_active: group.pool_active ? '1' : '0',
            exact_score_points: String(group.exact_score_points),
            match_result_points: String(group.match_result_points),
            correct_goal_points: String(group.correct_goal_points),
            unique_exact_points: String(group.unique_exact_points),
            multiplier_dieciseisavos: String(group.multiplier_dieciseisavos),
            multiplier_octavos: String(group.multiplier_octavos),
            multiplier_cuartos: String(group.multiplier_cuartos),
            multiplier_semifinal: String(group.multiplier_semifinal),
            multiplier_final: String(group.multiplier_final),
          }}
          onSubmit={(payload) =>
            updateGroup.mutate(payload, {
              onSuccess: () => {
                toast.success('Configuración guardada')
                navigate(`/groups/${id}`)
              },
            })
          }
          isSubmitting={updateGroup.isPending}
          error={error}
          rulesFrozen={rulesFrozen}
        />
      </Card>
    </div>
  )
}
