import { useAiCompetitorStatus, useToggleAiCompetitor, useRegenerateAiCompetitor } from '@/hooks/useAiCompetitor'
import { Button } from '@/components/ui/Button'

interface Props {
  groupId: number
  showLabel?: boolean
}

export function AiCompetitorToggle({ groupId, showLabel = true }: Props) {
  const { data: status, isLoading, refetch } = useAiCompetitorStatus(groupId)
  const toggle = useToggleAiCompetitor(groupId)
  const regenerate = useRegenerateAiCompetitor(groupId)

  const isEnabled = status?.ai_competitor_enabled ?? false

  if (isLoading) return null

  return (
    <div className="rounded-md border border-slate-200 p-3">
      <label className="mb-1 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={() => toggle.mutate()}
        />
        Franco (Chelo) IA — competidor automático
      </label>

      {isEnabled && (
        <div className="ml-6 mt-2 space-y-1">
          <p className="text-[11px] text-slate-500">
            {status?.predictions_count ?? 0} predicciones generadas
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              isLoading={regenerate.isPending}
              onClick={() => regenerate.mutate()}
            >
              Regenerar predicciones
            </Button>
          </div>
        </div>
      )}

      {!isEnabled && showLabel && (
        <p className="ml-6 text-[11px] text-slate-400">
          Al activar, Franco (Chelo) se une al grupo y genera predicciones para todos los partidos
          del torneo. Los miembros compiten contra la IA.
        </p>
      )}
    </div>
  )
}
