import { useParams } from 'react-router-dom'
import {
  useApproveGroup,
  useAdvancementRules,
  useBracket,
  useConfirmAdvancement,
  useConfirmAllAdvancements,
  useRejectGroup,
  useSuggestAdvancements,
} from '@/hooks/useBracket'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { normalizeApiError } from '@/lib/errorHandler'
import { toast } from '@/lib/toast'
import type { BracketStage } from '@/api/types'

function NextStageName({ stages, currentStage }: { stages: BracketStage[]; currentStage: BracketStage }) {
  const currentIdx = stages.findIndex((s) => s.stage_id === currentStage.stage_id)
  const next = stages[currentIdx + 1]
  return next?.name ?? 'Siguiente fase'
}

function RuleInfo({ stageId }: { stageId: number }) {
  const { data: rules } = useAdvancementRules(stageId)
  if (!rules || rules.length === 0) return null
  return (
    <p className="mt-2 text-xs text-slate-400">
      {rules.map((r) => {
        if (r.rule_type === 'top_n' && r.rule_value) {
          return `Regla: top ${r.rule_value}. Los demás no avanzan.`
        }
        return r.description ?? r.rule_type
      }).join(' · ')}
    </p>
  )
}

export function AdminBracket() {
  const { tournamentId } = useParams()
  const id = Number(tournamentId)

  const { data, isLoading, isError } = useBracket(id)
  const approveGroup = useApproveGroup(id)
  const rejectGroup = useRejectGroup(id)
  const suggestAdvancements = useSuggestAdvancements(id)
  const confirmAdvancement = useConfirmAdvancement(id)
  const confirmAll = useConfirmAllAdvancements(id)

  if (isLoading) return <p className="text-sm text-slate-500">Cargando…</p>
  if (isError) return <p className="text-sm text-red-600">No se pudo cargar el torneo.</p>

  const allStages = data?.bracket ?? []
  const pendingGroups =
    allStages.flatMap((stage) => stage.groups?.filter((g) => g.status === 'pending') ?? []) ?? []

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">
        Administrar {data?.tournament_name}
      </h1>
      <p className="mb-6 text-sm text-slate-500">Aprobación de grupos y avances entre fases</p>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-slate-700">
          Grupos pendientes de aprobación
        </h2>
        {pendingGroups.length === 0 && (
          <p className="text-sm text-slate-400">No hay grupos pendientes.</p>
        )}
        <div className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
          {pendingGroups.map((group) => (
            <div key={group.group_id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{group.name}</p>
                <p className="text-xs text-slate-500">
                  {group.teams.map((t) => t.team_name).join(', ')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    approveGroup.mutate(group.group_id, {
                      onSuccess: () => toast.success(`Grupo "${group.name}" aprobado`),
                      onError: () => toast.error('No se pudo aprobar el grupo'),
                    })
                  }
                  isLoading={approveGroup.isPending}
                >
                  Aprobar
                </Button>
                <Button
                  variant="danger"
                  onClick={() =>
                    rejectGroup.mutate(group.group_id, {
                      onSuccess: () => toast.success(`Grupo "${group.name}" rechazado`),
                      onError: () => toast.error('No se pudo rechazar el grupo'),
                    })
                  }
                  isLoading={rejectGroup.isPending}
                >
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-medium text-slate-700">Avances por fase</h2>
        <div className="flex flex-col gap-4">
          {allStages
            .filter((stage) => stage.is_knockout)
            .map((stage) => (
              <Card key={stage.stage_id}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">{stage.name}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        suggestAdvancements.mutate(stage.stage_id, {
                          onSuccess: () => toast.success('Avances sugeridos'),
                        })
                      }
                      isLoading={suggestAdvancements.isPending}
                    >
                      Sugerir avances
                    </Button>
                    <Button
                      onClick={() =>
                        confirmAll.mutate(stage.stage_id, {
                          onSuccess: () => toast.success('Avances confirmados'),
                        })
                      }
                      isLoading={confirmAll.isPending}
                      disabled={!stage.advancements || stage.advancements.length === 0}
                    >
                      Confirmar todos
                    </Button>
                  </div>
                </div>

                {suggestAdvancements.isError && (
                  <p className="mb-2 text-xs text-red-600">
                    {normalizeApiError(suggestAdvancements.error).message}
                  </p>
                )}

                {(!stage.advancements || stage.advancements.length === 0) && (
                  <p className="text-sm text-slate-400">
                    Sin avances sugeridos todavía para esta fase.
                  </p>
                )}

                {stage.advancements && stage.advancements.length > 0 && (
                  <p className="mb-2 text-xs text-slate-500">
                    Avances sugeridos → <NextStageName stages={allStages} currentStage={stage} />
                  </p>
                )}

                <ul className="flex flex-col divide-y divide-slate-100">
                  {stage.advancements?.map((adv, idx) => (
                    <li
                      key={adv.advancement_id}
                      className="flex items-center justify-between py-2 text-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                            idx === 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : idx === 1
                                ? 'bg-sky-100 text-sky-700'
                                : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {idx + 1}°
                        </span>
                        <span>{adv.team_name}</span>
                      </div>
                      {adv.confirmed ? (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                          Confirmado
                        </span>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            confirmAdvancement.mutate(adv.advancement_id, {
                              onSuccess: () => toast.success(`${adv.team_name} confirmado`),
                            })
                          }
                          isLoading={confirmAdvancement.isPending}
                        >
                          Confirmar
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>

                <RuleInfo stageId={stage.stage_id} />
              </Card>
            ))}
        </div>
      </section>
    </div>
  )
}
