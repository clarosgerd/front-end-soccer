import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTournamentGroups, useCreateGroup } from '@/hooks/useGroups'
import { useJoinGroup, useMyMemberships } from '@/hooks/useGroupMembers'
import { useTournament } from '@/hooks/useTournaments'
import { toast } from '@/lib/toast'
import { normalizeApiError } from '@/lib/errorHandler'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { DEFAULT_GROUP_VALUES } from '@/api/endpoints/groups'

function QuickCreateGroup({
  tournamentId,
  onSuccess,
}: {
  tournamentId: number
  onSuccess: () => void
}) {
  const createGroup = useCreateGroup()
  const [name, setName] = useState('Mi grupo')
  const [isPublic, setIsPublic] = useState(true)

  const error = createGroup.error ? normalizeApiError(createGroup.error) : null

  const handleSubmit = () => {
    createGroup.mutate(
      {
        tournament_id: tournamentId,
        name,
        description: 'Grupo privado del torneo',
        ...DEFAULT_GROUP_VALUES,
        is_public: isPublic ? '1' : '0',
      },
      {
        onSuccess: () => {
          toast.success('Grupo creado')
          onSuccess()
        },
      },
    )
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Crear grupo rápido</h3>
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error.message}
        </div>
      )}
      <div className="space-y-3">
        <TextField label="Nombre del grupo" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-slate-300"
          />
          Público (cualquiera puede unirse)
        </label>
        <Button
          onClick={handleSubmit}
          disabled={createGroup.isPending || !name.trim()}
          className="w-full"
        >
          {createGroup.isPending ? 'Creando...' : 'Crear grupo'}
        </Button>
      </div>
    </Card>
  )
}

export function JoinTournamentFlow({ tournamentId }: { tournamentId: number }) {
  const { data: tournament } = useTournament(tournamentId)
  const { data: groupsData, isLoading } = useTournamentGroups(tournamentId)
  const { data: memberships } = useMyMemberships(tournamentId)
  const joinGroup = useJoinGroup()
  const [showCreate, setShowCreate] = useState(false)

  const groups = groupsData?.data ?? []
  const membershipMap = new Map(
    (memberships ?? []).map((m) => [m.group_id, m]),
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
            <div className="h-4 w-3/4 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tournament && (
        <div className="flex items-center gap-3">
          {tournament.logo_url ? (
            <img src={tournament.logo_url} alt="" className="h-10 w-10 rounded-lg border border-slate-200 object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-400">
              {tournament.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-sm font-bold text-slate-900">{tournament.name}</h2>
            <p className="text-xs text-slate-500">{tournament.season} · {tournament.country}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">
          Grupos disponibles ({groups.length})
        </h3>
        <Button variant="secondary" onClick={() => setShowCreate((s) => !s)} className="text-xs">
          {showCreate ? 'Cancelar' : '+ Crear grupo'}
        </Button>
      </div>

      {showCreate && (
        <QuickCreateGroup
          tournamentId={tournamentId}
          onSuccess={() => {
            setShowCreate(false)
          }}
        />
      )}

      {groups.length === 0 && !showCreate && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">No hay grupos en este torneo</p>
          <p className="mt-1 text-xs text-slate-400">Creá uno para comenzar.</p>
        </div>
      )}

      {groups.map((g) => {
        const membership = membershipMap.get(g.group_id)
        const isMember = !!membership

        return (
          <Card key={g.group_id} className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-slate-900 truncate">{g.name}</h4>
                <span className="flex-shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  {g.is_public ? 'Público' : 'Privado'}
                </span>
                {isMember && (
                  <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    membership.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {membership.status === 'accepted' ? 'Miembro' : 'Pendiente'}
                  </span>
                )}
              </div>
              {g.description && (
                <p className="mt-0.5 text-xs text-slate-400 truncate">{g.description}</p>
              )}
              <p className="mt-1 text-[11px] text-slate-400">
                Máx. {g.max_members} miembros
              </p>
            </div>
            {isMember ? (
              <Link
                to={`/groups/${g.group_id}`}
                className="ml-3 flex-shrink-0 rounded border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Ver grupo
              </Link>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  joinGroup.mutate(g.group_id, {
                    onSuccess: () => toast.success('Solicitud enviada'),
                    onError: (err) => toast.error(normalizeApiError(err).message),
                  })
                }}
                disabled={joinGroup.isPending}
                className="ml-3 flex-shrink-0 text-xs"
              >
                {joinGroup.isPending ? 'Uniendo...' : 'Unirse'}
              </Button>
            )}
          </Card>
        )
      })}
    </div>
  )
}
