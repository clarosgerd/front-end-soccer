import { useState, type FormEvent } from 'react'
import type { CreateGroupPayload } from '@/api/endpoints/groups'
import type { NormalizedError } from '@/lib/errorHandler'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { AiCompetitorToggle } from '@/components/domain/AiCompetitorToggle'

interface GroupSettingsFormProps {
  groupId?: number
  initialValues: CreateGroupPayload
  onSubmit: (payload: CreateGroupPayload) => void
  isSubmitting: boolean
  error: NormalizedError | null
  rulesFrozen?: boolean
}

export function GroupSettingsForm({
  groupId,
  initialValues,
  onSubmit,
  isSubmitting,
  error,
  rulesFrozen = false,
}: GroupSettingsFormProps) {
  const [form, setForm] = useState<CreateGroupPayload>(initialValues)

  function field(key: keyof CreateGroupPayload) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <ErrorBanner error={error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Nombre" name="name" value={form.name} onChange={field('name')} error={error?.fieldErrors.name} required />
        <TextField label="Descripción" name="description" value={form.description} onChange={field('description')} error={error?.fieldErrors.description} />
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <p className="text-sm font-medium text-slate-700">Puntos de scoring</p>
          {rulesFrozen && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Bloqueado
            </span>
          )}
        </div>
        {rulesFrozen && (
          <p className="mb-3 text-[11px] text-amber-600">
            Ya hay miembros activos en el grupo. Las reglas de puntuación no pueden modificarse
            una vez que otros predictores se han unido. Creá un grupo nuevo si necesitás otra
            configuración.
          </p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <TextField label="Marcador exacto" name="exact_score_points" type="number" value={form.exact_score_points} onChange={field('exact_score_points')} disabled={rulesFrozen} />
          <TextField label="Ganador acertado" name="match_result_points" type="number" value={form.match_result_points} onChange={field('match_result_points')} disabled={rulesFrozen} />
          <TextField label="Gol acertado" name="correct_goal_points" type="number" value={form.correct_goal_points} onChange={field('correct_goal_points')} disabled={rulesFrozen} />
          <TextField label="Predicción única" name="unique_exact_points" type="number" value={form.unique_exact_points} onChange={field('unique_exact_points')} disabled={rulesFrozen} />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <p className="text-sm font-medium text-slate-700">Multiplicadores por fase</p>
          {rulesFrozen && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              Bloqueado
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <TextField label="16avos" name="multiplier_dieciseisavos" type="number" step="0.1" value={form.multiplier_dieciseisavos} onChange={field('multiplier_dieciseisavos')} disabled={rulesFrozen} />
          <TextField label="Octavos" name="multiplier_octavos" type="number" step="0.1" value={form.multiplier_octavos} onChange={field('multiplier_octavos')} disabled={rulesFrozen} />
          <TextField label="Cuartos" name="multiplier_cuartos" type="number" step="0.1" value={form.multiplier_cuartos} onChange={field('multiplier_cuartos')} disabled={rulesFrozen} />
          <TextField label="Semifinal" name="multiplier_semifinal" type="number" step="0.1" value={form.multiplier_semifinal} onChange={field('multiplier_semifinal')} disabled={rulesFrozen} />
          <TextField label="Final" name="multiplier_final" type="number" step="0.1" value={form.multiplier_final} onChange={field('multiplier_final')} disabled={rulesFrozen} />
        </div>
      </div>

      <div className="rounded-md border border-slate-200 p-3">
        <label className="mb-3 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.pool_active === '1'}
            onChange={(e) => setForm((f) => ({ ...f, pool_active: e.target.checked ? '1' : '0' }))}
          />
          Pool de premios activo
        </label>
        {form.pool_active === '1' && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <TextField label="Monto de apuesta" name="bet_amount" type="number" step="0.01" value={form.bet_amount} onChange={field('bet_amount')} />
            <TextField label="% 1er lugar" name="prize_1st_pct" type="number" value={form.prize_1st_pct} onChange={field('prize_1st_pct')} />
            <TextField label="% 2do lugar" name="prize_2nd_pct" type="number" value={form.prize_2nd_pct} onChange={field('prize_2nd_pct')} />
            <TextField label="% 3er lugar" name="prize_3rd_pct" type="number" value={form.prize_3rd_pct} onChange={field('prize_3rd_pct')} />
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.is_public === '1'}
          onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked ? '1' : '0' }))}
        />
        Grupo público
      </label>

      {groupId && <AiCompetitorToggle groupId={groupId} />}

      <Button type="submit" isLoading={isSubmitting} className="self-start">
        Guardar cambios
      </Button>
    </form>
  )
}
