import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBracket, useAssignTeamsToGroup, useCreateTournamentGroup, useRemoveTeamFromGroup } from '@/hooks/useBracket'
import { useStages } from '@/hooks/useStages'
import { useTournament } from '@/hooks/useTournaments'
import { useAuthStore } from '@/store/authStore'
import { useTeams } from '@/hooks/useTeams'
import { normalizeApiError } from '@/lib/errorHandler'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { toast } from '@/lib/toast'

export function ManageGroups() {
  const { tournamentId } = useParams()
  const id = Number(tournamentId)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { data: tournament } = useTournament(id)

  const { data: bracket, isLoading, isError } = useBracket(id)
  const { data: stages } = useStages(id)
  const { data: teamsData } = useTeams()
  const teams = teamsData?.data ?? []

  const createGroup = useCreateTournamentGroup(id)
  const assignTeams = useAssignTeamsToGroup(id)
  const removeTeam = useRemoveTeamFromGroup(id)

  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupStage, setNewGroupStage] = useState(0)
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [teamsToAssign, setTeamsToAssign] = useState<number[]>([])

  const createError = createGroup.error ? normalizeApiError(createGroup.error) : null
  const assignError = assignTeams.error ? normalizeApiError(assignTeams.error) : null

  const canManage = user?.role === 'admin' || tournament?.created_by === user?.user_id

  if (tournament && !canManage) {
    navigate(`/tournaments/${id}/bracket`, { replace: true })
    return null
  }

  const nonKnockoutStages = stages?.data.filter((s) => !s.is_knockout) ?? []
  const allGroups = bracket?.bracket.flatMap((stage) => stage.groups ?? []) ?? []

  function handleCreateGroup() {
    if (!newGroupName || !newGroupStage) return
    createGroup.mutate(
      { stage_id: newGroupStage, name: newGroupName, group_order: allGroups.length + 1 },
      { onSuccess: () => { setNewGroupName(''); toast.success('Grupo creado') } }
    )
  }

  function toggleTeam(teamId: number) {
    setTeamsToAssign((prev) =>
      prev.includes(teamId) ? prev.filter((t) => t !== teamId) : [...prev, teamId]
    )
  }

  function handleAssign() {
    if (!selectedGroupId || teamsToAssign.length === 0) return
    assignTeams.mutate(
      { groupId: selectedGroupId, teamIds: teamsToAssign },
      { onSuccess: () => { setTeamsToAssign([]); toast.success('Equipos asignados') } }
    )
  }

  if (isLoading) return <p className="text-sm text-slate-500">Cargando…</p>
  if (isError) return <p className="text-sm text-red-600">No se pudo cargar el torneo.</p>

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">
        Grupos de torneo · {bracket?.tournament_name}
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Creá los grupos de la fase de grupos y asignales sus equipos.
      </p>

      <Card className="mb-6">
        <h2 className="mb-3 text-sm font-medium text-slate-700">Crear grupo</h2>
        <ErrorBanner error={createError} />
        <div className="flex items-end gap-2">
          <TextField
            label="Nombre"
            name="group_name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Grupo A"
            className="flex-1"
          />
          <select
            value={newGroupStage}
            onChange={(e) => setNewGroupStage(Number(e.target.value))}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value={0}>Fase…</option>
            {nonKnockoutStages.map((s) => (
              <option key={s.stage_id} value={s.stage_id}>
                {s.name}
              </option>
            ))}
          </select>
          <Button onClick={handleCreateGroup} isLoading={createGroup.isPending}>
            Crear
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-medium text-slate-700">Asignar equipos a un grupo</h2>
        <ErrorBanner error={assignError} />

        <select
          value={selectedGroupId ?? 0}
          onChange={(e) => setSelectedGroupId(Number(e.target.value) || null)}
          className="mb-3 rounded-md border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value={0}>Elegir grupo…</option>
          {allGroups.map((g) => (
            <option key={g.group_id} value={g.group_id}>
              {g.name}
            </option>
          ))}
        </select>

        {selectedGroupId && (
          <>
            {(() => {
              const group = allGroups.find((g) => g.group_id === selectedGroupId)
              return (
                group && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs text-slate-500">Equipos ya asignados</p>
                    <div className="flex flex-wrap gap-2">
                      {group.teams.length === 0 && (
                        <span className="text-xs text-slate-400">Ninguno todavía</span>
                      )}
                      {group.teams.map((t) => (
                        <span
                          key={t.team_id}
                          className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs"
                        >
                          {t.team_name}
                          <button
                            onClick={() =>
                              removeTeam.mutate(
                                { groupId: selectedGroupId, teamId: t.team_id },
                                { onSuccess: () => toast.success(`${t.team_name} quitado del grupo`) }
                              )
                            }
                            className="text-slate-400 hover:text-red-600"
                            aria-label={`Quitar ${t.team_name}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )
              )
            })()}

            <p className="mb-1 text-xs text-slate-500">Elegir equipos para asignar</p>
            <div className="mb-3 grid grid-cols-2 gap-1 sm:grid-cols-4">
              {teams.map((t) => (
                <label key={t.team_id} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={teamsToAssign.includes(t.team_id)}
                    onChange={() => toggleTeam(t.team_id)}
                  />
                  {t.name}
                </label>
              ))}
            </div>

            <Button
              onClick={handleAssign}
              isLoading={assignTeams.isPending}
              disabled={teamsToAssign.length === 0}
            >
              Asignar {teamsToAssign.length > 0 ? `(${teamsToAssign.length})` : ''}
            </Button>
          </>
        )}
      </Card>
    </div>
  )
}
