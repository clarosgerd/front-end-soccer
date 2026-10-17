import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTournament, usePublishTournament, useGoLiveTournament, useCloseTournament, useTournamentManagers, useAssignManager, useRemoveManager } from '@/hooks/useTournaments'
import { usePendingResults, useUpdateMatchResult } from '@/hooks/useManualMatches'
import { useBracket } from '@/hooks/useBracket'
import { ExcelImport } from './ExcelImport'
import { useAuthStore } from '@/store/authStore'
import { confirmAction } from '@/lib/confirmAction'
import { toast } from '@/lib/toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useTournamentRole } from '@/hooks/useTournamentRole'
import { RoleBadge } from '@/components/domain/RoleBadge'
import { UserMinus, UserPlus } from 'lucide-react'
import type { TournamentStatus, Match } from '@/api/types'

const STATUS_CONFIG: Record<TournamentStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Borrador', color: 'text-amber-700', bg: 'bg-amber-100' },
  published: { label: 'Publicado', color: 'text-blue-700', bg: 'bg-blue-100' },
  live: { label: 'En vivo', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  closed: { label: 'Cerrado', color: 'text-slate-500', bg: 'bg-slate-100' },
}

function TeamBadge({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="flex items-center gap-2 min-w-0">
      {logoUrl ? (
        <img src={logoUrl} alt="" className="h-6 w-6 rounded-full border border-slate-200 object-cover flex-shrink-0" />
      ) : (
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400">
          {initial}
        </div>
      )}
      <span className="text-sm font-medium text-slate-800 truncate">{name}</span>
    </div>
  )
}

function ScoreInput({
  match,
  onSubmit,
  isPending,
}: {
  match: Match & { home?: { name: string; logo_url?: string | null }; away?: { name: string; logo_url?: string | null }; stage?: { name: string } }
  onSubmit: (matchId: number, home: number, away: number) => void
  isPending: boolean
}) {
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)

  const handleSubmit = async () => {
    const ok = await confirmAction('¿Registrar este resultado?', {
      description: `${match.home?.name ?? 'Local'} ${homeScore} - ${awayScore} ${match.away?.name ?? 'Visitante'}`,
      confirmLabel: 'Registrar',
    })
    if (ok) {
      onSubmit(match.match_id, homeScore, awayScore)
    }
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2">
      <div className="flex-1 min-w-0">
        <TeamBadge name={match.home?.name ?? 'Local'} logoUrl={match.home?.logo_url} />
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <input
          type="number"
          min={0}
          value={homeScore}
          onChange={(e) => setHomeScore(Number(e.target.value))}
          className="h-9 w-12 rounded border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-900 focus:border-blue-400 focus:outline-none"
        />
        <span className="text-xs text-slate-400">-</span>
        <input
          type="number"
          min={0}
          value={awayScore}
          onChange={(e) => setAwayScore(Number(e.target.value))}
          className="h-9 w-12 rounded border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-900 focus:border-blue-400 focus:outline-none"
        />
      </div>

      <div className="flex-1 min-w-0 flex justify-end">
        <TeamBadge name={match.away?.name ?? 'Visitante'} logoUrl={match.away?.logo_url} />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="ml-2 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        {isPending ? '...' : '✓'}
      </button>
    </div>
  )
}

export function TournamentManager() {
  const { tournamentId } = useParams<{ tournamentId: string }>()
  const id = Number(tournamentId)
  const user = useAuthStore((s) => s.user)
  const { data: tournament, isLoading } = useTournament(id)
  const { data: pendingData, isLoading: loadingPending } = usePendingResults(id)
  const { data: bracket } = useBracket(id)

  const publishMutation = usePublishTournament(id)
  const goLiveMutation = useGoLiveTournament(id)
  const closeMutation = useCloseTournament(id)
  const updateResult = useUpdateMatchResult(id)

  const isAdmin = user?.role === 'admin'
  const { data: managers } = useTournamentManagers(id)
  const assignManager = useAssignManager(id)
  const removeManager = useRemoveManager(id)
  const [managerUserId, setManagerUserId] = useState('')
  const { role } = useTournamentRole(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-medium text-red-700">Torneo no encontrado.</p>
      </div>
    )
  }

  const isOwner = tournament.created_by === user?.user_id
  const canManage = isAdmin || isOwner

  if (!canManage) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-medium text-red-700">No tenés permisos para administrar este torneo.</p>
      </div>
    )
  }
  const status = tournament.status || 'draft'
  const config = STATUS_CONFIG[status]
  const stages = bracket?.bracket ?? []
  const groupStages = stages.filter((s) => !s.is_knockout)
  const knockoutStages = stages.filter((s) => s.is_knockout)
  const pending = pendingData?.summary
  const pendingMatches = pendingData?.matches ?? []

  const groupedByStage = pendingMatches.reduce<Record<string, typeof pendingMatches>>((acc, m) => {
    const stageName = m.stage?.name ?? 'Sin fase'
    if (!acc[stageName]) acc[stageName] = []
    acc[stageName].push(m)
    return acc
  }, {})

  const handlePublish = async () => {
    const ok = await confirmAction('¿Publicar este torneo?', {
      description: 'El torneo será visible para otros usuarios. No podrás eliminarlo después.',
      confirmLabel: 'Publicar',
    })
    if (ok) {
      publishMutation.mutate(undefined, {
        onSuccess: () => toast.success('Torneo publicado'),
        onError: (e: { response?: { data?: { message?: string } } }) =>
          toast.error(e?.response?.data?.message ?? 'Error al publicar'),
      })
    }
  }

  const handleGoLive = async () => {
    const ok = await confirmAction('¿Activar este torneo?', {
      description: 'Los usuarios podrán hacer predicciones y podrás ingresar resultados.',
      confirmLabel: 'Activar',
    })
    if (ok) {
      goLiveMutation.mutate(undefined, {
        onSuccess: () => toast.success('Torneo activado'),
        onError: (e: { response?: { data?: { message?: string } } }) =>
          toast.error(e?.response?.data?.message ?? 'Error al activar'),
      })
    }
  }

  const handleClose = async () => {
    const ok = await confirmAction('¿Cerrar este torneo?', {
      description: 'El torneo se marcará como finalizado.',
      confirmLabel: 'Cerrar',
    })
    if (ok) {
      closeMutation.mutate(undefined, {
        onSuccess: () => toast.success('Torneo cerrado'),
        onError: (e: { response?: { data?: { message?: string } } }) =>
          toast.error(e?.response?.data?.message ?? 'Error al cerrar'),
      })
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-xs text-slate-400">
        <Link to="/tournaments" className="hover:text-slate-600">Torneos</Link>
        <span>/</span>
        <span className="text-slate-600">{tournament.name}</span>
        <span>/</span>
        <span className="text-slate-600">Administrar</span>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{tournament.name}</h1>
            <p className="text-xs text-slate-500">{tournament.season} · {tournament.country}</p>
          </div>
          <RoleBadge role={role} />
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.color}`}>
          {config.label}
        </span>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {status === 'draft' && isOwner && (
          <Button onClick={handlePublish} disabled={publishMutation.isPending}>
            {publishMutation.isPending ? 'Publicando...' : 'Publicar torneo'}
          </Button>
        )}
        {status === 'published' && isOwner && (
          <Button onClick={handleGoLive} disabled={goLiveMutation.isPending}>
            {goLiveMutation.isPending ? 'Activando...' : 'Activar torneo'}
          </Button>
        )}
        {status === 'live' && isOwner && (
          <>
            <Link
              to={`/tournaments/${id}/bracket`}
              className="rounded border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Ver bracket
            </Link>
            <Button variant="danger" onClick={handleClose} disabled={closeMutation.isPending}>
              {closeMutation.isPending ? 'Cerrando...' : 'Cerrar torneo'}
            </Button>
          </>
        )}
        {status === 'closed' && (
          <Link
            to={`/tournaments/${id}/bracket`}
            className="rounded border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Ver bracket final
          </Link>
        )}
      </div>

      <Card className="mb-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Configuración</h2>
        <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
          <div>
            <span className="text-slate-400">Fases</span>
            <p className="font-medium text-slate-700">
              {groupStages.length} grupos · {knockoutStages.length} eliminatoria{knockoutStages.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Partidos</span>
            <p className="font-medium text-slate-700">
              {pending ? `${pending.finished}/${pending.total}` : '...'}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Inicio</span>
            <p className="font-medium text-slate-700">
              {new Date(tournament.start_date).toLocaleDateString('es-AR')}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Fin</span>
            <p className="font-medium text-slate-700">
              {new Date(tournament.end_date).toLocaleDateString('es-AR')}
            </p>
          </div>
        </div>
      </Card>

      {isAdmin && (
        <Card className="mb-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Gestionar acceso (Managers)</h2>
          <p className="mb-3 text-xs text-slate-500">
            Asigná un usuario como manager del torneo. Podrá actualizar resultados y gestionar el grupo de predicciones.
          </p>

          <div className="mb-4 flex items-end gap-2">
            <TextField
              label="User ID"
              name="manager_user_id"
              type="number"
              value={managerUserId}
              onChange={(e) => setManagerUserId(e.target.value)}
              placeholder="ID del usuario"
              className="w-40"
            />
            <Button
              onClick={() => {
                const uid = Number(managerUserId)
                if (!uid) return
                assignManager.mutate(uid, {
                  onSuccess: () => {
                    setManagerUserId('')
                    toast.success('Manager asignado')
                  },
                  onError: () => toast.error('Error al asignar manager'),
                })
              }}
              isLoading={assignManager.isPending}
              disabled={!managerUserId}
            >
              <UserPlus size={16} className="mr-1 inline" />
              Asignar
            </Button>
          </div>

          {managers && managers.length > 0 && (
            <div className="space-y-2">
              {managers.map((m) => (
                <div key={m.member_id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.email} · ID: {m.user_id}</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await confirmAction(`¿Remover a ${m.name} como manager?`, { danger: true })
                      if (ok) {
                        removeManager.mutate(m.user_id, {
                          onSuccess: () => toast.success('Manager removido'),
                          onError: () => toast.error('Error al remover manager'),
                        })
                      }
                    }}
                    disabled={removeManager.isPending}
                    className="rounded p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
                  >
                    <UserMinus size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {managers && managers.length === 0 && (
            <p className="text-xs text-slate-400">No hay managers asignados.</p>
          )}
        </Card>
      )}

      {(status === 'live' || status === 'published') && (
        <>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              {status === 'live' ? 'Ingresar resultados' : 'Partidos programados'}
            </h2>
            {pending && (
              <span className="text-xs text-slate-400">
                {pending.finished}/{pending.total} completados
              </span>
            )}
          </div>

          {loadingPending && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          )}

          {!loadingPending && pending && pending.total === 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">No hay partidos creados</p>
              <p className="mt-1 text-xs text-slate-400">
                Creá fases y partidos antes de publicar el torneo.
              </p>
              <Link
                to={`/tournaments/${id}/stages`}
                className="mt-3 inline-block rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
              >
                Crear fases
              </Link>
            </div>
          )}

          {!loadingPending && Object.keys(groupedByStage).length > 0 && (
            <div className="space-y-4">
              {Object.entries(groupedByStage).map(([stageName, matches]) => (
                <div key={stageName}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {stageName}
                  </h3>
                  <div className="space-y-1.5">
                    {matches.map((m) => (
                      <ScoreInput
                        key={m.match_id}
                        match={m as Match & { home?: { name: string; logo_url?: string | null }; away?: { name: string; logo_url?: string | null }; stage?: { name: string } }}
                        onSubmit={(matchId, home, away) =>
                          updateResult.mutate(
                            { matchId, homeScore: home, awayScore: away },
                            {
                              onSuccess: () => toast.success('Resultado registrado'),
                              onError: () => toast.error('Error al registrar resultado'),
                            },
                          )
                        }
                        isPending={updateResult.isPending}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {status === 'draft' && (
        <>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="mb-2 text-sm font-semibold text-amber-800">Torneo en borrador</h2>
            <p className="mb-4 text-xs text-amber-700">
              Configurá las fases, equipos y partidos. Cuando esté listo, publicalo para que otros usuarios puedan verlo.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/tournaments/${id}/stages`}
                className="rounded border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
              >
                Fases
              </Link>
              <Link
                to={`/tournaments/${id}/groups-admin`}
                className="rounded border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
              >
                Grupos
              </Link>
              <Link
                to={`/tournaments/${id}/matches`}
                className="rounded border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-100"
              >
                Partidos
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Importar desde Excel</h3>
            <ExcelImport />
          </div>
        </>
      )}
    </div>
  )
}