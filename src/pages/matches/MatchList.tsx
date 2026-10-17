import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTournament } from '@/hooks/useTournaments'
import { useAuthStore } from '@/store/authStore'
import { useStages } from '@/hooks/useStages'
import { useTeams } from '@/hooks/useTeams'
import { useMatches } from '@/hooks/usePredictions'
import { useCreateMatch, useCreateMatchesBulk, useDeleteMatch, useUpdateMatch } from '@/hooks/useMatchesAdmin'
import type { MatchPayload } from '@/api/endpoints/matches'
import type { Match, MatchStatus } from '@/api/types'
import { normalizeApiError } from '@/lib/errorHandler'
import { confirmAction } from '@/lib/confirmAction'
import { toast } from '@/lib/toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'

const STATUS_LABEL: Record<MatchStatus, string> = {
  scheduled: 'Programado',
  live: 'En vivo',
  finished: 'Finalizado',
}

function TeamSelect({
  value,
  onChange,
  teams,
}: {
  value: number
  onChange: (id: number) => void
  teams: { team_id: number; name: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
    >
      <option value={0}>Elegir equipo…</option>
      {teams.map((t) => (
        <option key={t.team_id} value={t.team_id}>
          {t.name}
        </option>
      ))}
    </select>
  )
}

export function MatchList() {
  const { tournamentId } = useParams()
  const id = Number(tournamentId)

  const { data: tournament } = useTournament(id)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const { data: stages } = useStages(id)
  const { data: teamsData } = useTeams()
  const teams = teamsData?.data ?? []

  const { data: matchesData, isLoading, isError } = useMatches({
    'tournament_id[eq]': String(id),
  } as Record<string, string>)

  const createMatch = useCreateMatch()
  const createBulk = useCreateMatchesBulk()
  const createError = createMatch.error ? normalizeApiError(createMatch.error) : null
  const bulkError = createBulk.error ? normalizeApiError(createBulk.error) : null

  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [showForm, setShowForm] = useState(false)

  const [draft, setDraft] = useState<Partial<MatchPayload>>({ status: 'scheduled' })
  const [bulkDrafts, setBulkDrafts] = useState<Partial<MatchPayload>[]>([
    { status: 'scheduled' },
  ])

  const canManage = user?.role === 'admin' || tournament?.created_by === user?.user_id
  if (tournament && !canManage) {
    navigate(`/tournaments/${id}/bracket`, { replace: true })
    return null
  }

  function handleCreate() {
    if (!draft.home_team_id || !draft.away_team_id || !draft.stage_id || !draft.match_date) return
    createMatch.mutate(
      {
        home_team_id: draft.home_team_id,
        away_team_id: draft.away_team_id,
        tournament_id: id,
        stage_id: draft.stage_id,
        match_date: draft.match_date,
        status: draft.status ?? 'scheduled',
      },
      { onSuccess: () => { setDraft({ status: 'scheduled' }); setShowForm(false); toast.success('Partido creado') } }
    )
  }

  function handleBulkCreate() {
    const valid = bulkDrafts.filter(
      (d) => d.home_team_id && d.away_team_id && d.stage_id && d.match_date
    )
    if (valid.length === 0) return
    const payload: MatchPayload[] = valid.map((d) => ({
      home_team_id: d.home_team_id!,
      away_team_id: d.away_team_id!,
      tournament_id: id,
      stage_id: d.stage_id!,
      match_date: d.match_date!,
      status: d.status ?? 'scheduled',
    }))
    createBulk.mutate(payload, {
      onSuccess: () => {
        setBulkDrafts([{ status: 'scheduled' }])
        setShowForm(false)
        toast.success(`${payload.length} partidos creados`)
      },
    })
  }

  function addBulkRow() {
    setBulkDrafts((prev) => [...prev, { status: 'scheduled' }])
  }

  function removeBulkRow(index: number) {
    setBulkDrafts((prev) => prev.filter((_, i) => i !== index))
  }

  function updateBulkRow(index: number, patch: Partial<MatchPayload>) {
    setBulkDrafts((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          Partidos · {tournament?.name}
        </h1>
        <div className="flex gap-2">
          <div className="flex gap-1 rounded-md border border-slate-200 p-1 text-xs">
            <button
              onClick={() => setMode('single')}
              className={`rounded px-2 py-1 ${mode === 'single' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
            >
              Individual
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`rounded px-2 py-1 ${mode === 'bulk' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
            >
              Bulk
            </button>
          </div>
          <Button variant="secondary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancelar' : 'Crear partido'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          {mode === 'single' ? (
            <>
              <ErrorBanner error={createError} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <TeamSelect
                  value={draft.home_team_id ?? 0}
                  onChange={(v) => setDraft((d) => ({ ...d, home_team_id: v }))}
                  teams={teams}
                />
                <TeamSelect
                  value={draft.away_team_id ?? 0}
                  onChange={(v) => setDraft((d) => ({ ...d, away_team_id: v }))}
                  teams={teams}
                />
                <select
                  value={draft.stage_id ?? 0}
                  onChange={(e) => setDraft((d) => ({ ...d, stage_id: Number(e.target.value) }))}
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                >
                  <option value={0}>Fase…</option>
                  {stages?.data.map((s) => (
                    <option key={s.stage_id} value={s.stage_id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  value={draft.match_date ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, match_date: e.target.value }))}
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                />
                <Button onClick={handleCreate} isLoading={createMatch.isPending}>
                  Crear
                </Button>
              </div>
            </>
          ) : (
            <>
              <ErrorBanner error={bulkError} />
              <p className="mb-3 text-sm text-slate-500">
                Agregá los partidos y crealos todos de una.
              </p>
              <div className="flex flex-col gap-2">
                {bulkDrafts.map((row, i) => (
                  <div key={i} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-5">
                    <TeamSelect
                      value={row.home_team_id ?? 0}
                      onChange={(v) => updateBulkRow(i, { home_team_id: v })}
                      teams={teams}
                    />
                    <TeamSelect
                      value={row.away_team_id ?? 0}
                      onChange={(v) => updateBulkRow(i, { away_team_id: v })}
                      teams={teams}
                    />
                    <select
                      value={row.stage_id ?? 0}
                      onChange={(e) => updateBulkRow(i, { stage_id: Number(e.target.value) })}
                      className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    >
                      <option value={0}>Fase…</option>
                      {stages?.data.map((s) => (
                        <option key={s.stage_id} value={s.stage_id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="datetime-local"
                      value={row.match_date ?? ''}
                      onChange={(e) => updateBulkRow(i, { match_date: e.target.value })}
                      className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeBulkRow(i)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" onClick={addBulkRow}>
                  + Agregar partido
                </Button>
                <Button onClick={handleBulkCreate} isLoading={createBulk.isPending}>
                  Crear {bulkDrafts.length} partidos
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {isLoading && <p className="text-sm text-slate-500">Cargando partidos…</p>}
      {isError && <p className="text-sm text-red-600">No se pudieron cargar los partidos.</p>}

      <ul className="flex flex-col gap-2">
        {matchesData?.data.map((match) => (
          <MatchRow key={match.match_id} match={match} teams={teams} tournamentId={id} />
        ))}
      </ul>
    </div>
  )
}

function MatchRow({
  match,
  teams,
  tournamentId,
}: {
  match: Match
  teams: { team_id: number; name: string }[]
  tournamentId: number
}) {
  const [editingStatus, setEditingStatus] = useState(false)
  const updateMatch = useUpdateMatch(match.match_id, tournamentId)
  const deleteMatch = useDeleteMatch(tournamentId)
  const error = updateMatch.error ? normalizeApiError(updateMatch.error) : null

  const homeName = teams.find((t) => t.team_id === match.home_team_id)?.name ?? match.home_team_id
  const awayName = teams.find((t) => t.team_id === match.away_team_id)?.name ?? match.away_team_id

  function changeStatus(status: MatchStatus) {
    updateMatch.mutate(
      {
        home_team_id: match.home_team_id,
        away_team_id: match.away_team_id,
        tournament_id: match.tournament_id,
        stage_id: match.stage_id,
        match_date: match.match_date,
        status,
      },
      { onSuccess: () => { setEditingStatus(false); toast.success('Estado actualizado') } }
    )
  }

  return (
    <li className="rounded-md border border-slate-200 bg-white px-4 py-3 text-sm">
      <ErrorBanner error={error} />
      <div className="flex items-center justify-between">
        <span>
          {homeName} vs {awayName}
        </span>
        <span className="text-xs text-slate-400">
          {new Date(match.match_date).toLocaleString()}
        </span>
        <div className="flex items-center gap-2">
          {editingStatus ? (
            <select
              defaultValue={match.status}
              onChange={(e) => changeStatus(e.target.value as MatchStatus)}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
              {(Object.keys(STATUS_LABEL) as MatchStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setEditingStatus(true)}
              className={`rounded px-2 py-0.5 text-xs ${
                match.status === 'finished'
                  ? 'bg-slate-100 text-slate-600'
                  : match.status === 'live'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {STATUS_LABEL[match.status]}
            </button>
          )}
          <Button
            variant="danger"
            onClick={async () => {
              const ok = await confirmAction('¿Eliminar este partido?', {
                description: 'Se perderán también las predicciones asociadas.',
                confirmLabel: 'Eliminar',
              })
              if (ok) {
                deleteMatch.mutate(match.match_id, {
                  onSuccess: () => toast.success('Partido eliminado'),
                  onError: () => toast.error('No se pudo eliminar el partido'),
                })
              }
            }}
            isLoading={deleteMatch.isPending}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </li>
  )
}
