import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTournament } from '@/hooks/useTournaments'
import { useCreateStagesBulk, useDeleteStage, useStages } from '@/hooks/useStages'
import { useAuthStore } from '@/store/authStore'
import type { StagePayload } from '@/api/endpoints/stages'
import { normalizeApiError } from '@/lib/errorHandler'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { confirmAction } from '@/lib/confirmAction'
import { toast } from '@/lib/toast'

type DraftStage = { name: string; is_knockout: boolean }

const PRESETS: Record<string, DraftStage[]> = {
  'Mundial (grupos + eliminación)': [
    { name: 'Fase de Grupos', is_knockout: false },
    { name: 'Dieciseisavos', is_knockout: true },
    { name: 'Octavos', is_knockout: true },
    { name: 'Cuartos', is_knockout: true },
    { name: 'Semifinal', is_knockout: true },
    { name: 'Final', is_knockout: true },
  ],
  'Liguilla (todos contra todos)': [{ name: 'Liguilla', is_knockout: false }],
  'Eliminación directa': [
    { name: 'Octavos', is_knockout: true },
    { name: 'Cuartos', is_knockout: true },
    { name: 'Semifinal', is_knockout: true },
    { name: 'Final', is_knockout: true },
  ],
}

export function Stages() {
  const { tournamentId } = useParams()
  const id = Number(tournamentId)

  const { data: tournament } = useTournament(id)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const canManage = user?.role === 'admin' || tournament?.created_by === user?.user_id

  const { data: existingStages, isLoading, isError } = useStages(id)
  const createBulk = useCreateStagesBulk(id)
  const deleteStage = useDeleteStage(id)

  const [draft, setDraft] = useState<DraftStage[]>([{ name: '', is_knockout: false }])
  const error = createBulk.error ? normalizeApiError(createBulk.error) : null

  function applyPreset(name: string) {
    setDraft(PRESETS[name].map((s) => ({ ...s })))
  }

  function updateRow(index: number, patch: Partial<DraftStage>) {
    setDraft((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setDraft((rows) => [...rows, { name: '', is_knockout: false }])
  }

  function removeRow(index: number) {
    setDraft((rows) => rows.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    const payload: StagePayload[] = draft
      .filter((r) => r.name.trim() !== '')
      .map((r, i) => ({
        tournament_id: id,
        name: r.name,
        stage_order: String(i + 1),
        is_knockout: r.is_knockout ? '1' : '0',
      }))
    if (payload.length === 0) return
    createBulk.mutate(payload, {
      onSuccess: () => {
        setDraft([{ name: '', is_knockout: false }])
        toast.success('Fases guardadas')
      },
    })
  }

  if (tournament && !canManage) {
    navigate(`/tournaments/${id}/bracket`, { replace: true })
    return null
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">
        Fases · {tournament?.name}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Definí las fases del torneo antes de crear grupos o partidos.
      </p>

      <Card className="mb-6">
        <h2 className="mb-2 text-sm font-medium text-slate-700">Fases existentes</h2>
        {isLoading && <p className="text-sm text-slate-500">Cargando…</p>}
        {isError && <p className="text-sm text-red-600">No se pudieron cargar las fases.</p>}
        {existingStages && existingStages.data.length === 0 && (
          <p className="text-sm text-slate-400">Todavía no hay fases creadas.</p>
        )}
        <ul className="flex flex-col divide-y divide-slate-100">
          {existingStages?.data
            .sort((a, b) => a.stage_order - b.stage_order)
            .map((stage) => (
              <li key={stage.stage_id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {stage.stage_order}. {stage.name}{' '}
                  {stage.is_knockout && (
                    <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                      knockout
                    </span>
                  )}
                </span>
                <Button
                  variant="danger"
                  onClick={async () => {
                    const ok = await confirmAction(`¿Eliminar la fase "${stage.name}"?`, {
                      confirmLabel: 'Eliminar',
                    })
                    if (ok) {
                      deleteStage.mutate(stage.stage_id, {
                        onSuccess: () => toast.success('Fase eliminada'),
                        onError: () => toast.error('No se pudo eliminar la fase'),
                      })
                    }
                  }}
                  isLoading={deleteStage.isPending}
                >
                  Eliminar
                </Button>
              </li>
            ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-slate-700">Crear fases (bulk)</h2>

        <div className="mb-4 flex flex-wrap gap-2">
          {Object.keys(PRESETS).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => applyPreset(name)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              {name}
            </button>
          ))}
        </div>

        {error && !error.isValidationError && (
          <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error.message}
          </p>
        )}

        <div className="flex flex-col gap-2">
          {draft.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 text-xs text-slate-400">{i + 1}.</span>
              <TextField
                label=""
                name={`stage-${i}`}
                value={row.name}
                onChange={(e) => updateRow(i, { name: e.target.value })}
                placeholder="Nombre de la fase"
                className="flex-1"
              />
              <label className="flex items-center gap-1 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={row.is_knockout}
                  onChange={(e) => updateRow(i, { is_knockout: e.target.checked })}
                />
                knockout
              </label>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-xs text-red-600 hover:underline"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <Button variant="secondary" type="button" onClick={addRow}>
            + Agregar fase
          </Button>
          <Button onClick={handleSubmit} isLoading={createBulk.isPending}>
            Guardar fases
          </Button>
        </div>
      </Card>
    </div>
  )
}
