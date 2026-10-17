import { Link, useParams } from 'react-router-dom'
import { useState, useMemo, type FormEvent } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useGroup, useLeaderboard, useToggleGroupActive } from '@/hooks/useGroups'
import { usePendingMembers, useApproveMember, useRejectMember } from '@/hooks/useGroupMembers'
import { useSendInvitation } from '@/hooks/useInvitations'
import { normalizeApiError } from '@/lib/errorHandler'
import { confirmAction } from '@/lib/confirmAction'
import { toast } from '@/lib/toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { useTournamentRole } from '@/hooks/useTournamentRole'
import { RoleBadge } from '@/components/domain/RoleBadge'
import { AiCompetitorToggle } from '@/components/domain/AiCompetitorToggle'
import type { LeaderboardEntry } from '@/api/types'

type SortKey = 'total_points' | 'correct_predictions' | 'exact_scores'

function SortIcon({ sortKey, sortDir, column }: { sortKey: SortKey; sortDir: 'asc' | 'desc'; column: SortKey }) {
  if (sortKey !== column) return <span className="ml-0.5 text-slate-300">⇅</span>
  return <span className="ml-0.5">{sortDir === 'desc' ? '↓' : '↑'}</span>
}

export function GroupDetail() {
  const { groupId } = useParams()
  const id = Number(groupId)
  const user = useAuthStore((s) => s.user)
  const { data: group } = useGroup(id)
  const { data: leaderboardData, isLoading, isError } = useLeaderboard(id)
  const toggleActive = useToggleGroupActive()
  const { data: pendingData } = usePendingMembers(id)
  const approveMember = useApproveMember()
  const rejectMember = useRejectMember()

  const tournamentId = group?.tournament_id ?? undefined
  const { role } = useTournamentRole(tournamentId!)

  const isGlobalAdmin = user?.role === 'admin'
  const isGroupCreator = group?.creator_id === user?.user_id
  const canManage = isGlobalAdmin || isGroupCreator

  const [inviteEmail, setInviteEmail] = useState('')
  const sendInvitation = useSendInvitation(id)
  const inviteError = sendInvitation.error ? normalizeApiError(sendInvitation.error) : null

  const [sortKey, setSortKey] = useState<SortKey>('total_points')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sortedLeaderboard = useMemo(() => {
    const list = leaderboardData?.leaderboard ?? []
    return [...list].sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
      const av = Number(a[sortKey])
      const bv = Number(b[sortKey])
      return sortDir === 'desc' ? bv - av : av - bv
    })
  }, [leaderboardData, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const isActive = group?.active === undefined ? true : Number(group.active) === 1

  function handleInvite(e: FormEvent) {
    e.preventDefault()
    sendInvitation.mutate(inviteEmail, {
      onSuccess: () => {
        setInviteEmail('')
        toast.success('Invitación enviada')
      },
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900">{group?.name ?? 'Grupo'}</h1>
            {tournamentId && <RoleBadge role={role} />}
          </div>
          <p className="text-sm text-slate-500">{group?.description}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            to={`/predictions?groupId=${id}${group?.tournament_id ? `&tournamentId=${group.tournament_id}` : ''}`}
            className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
          >
            Predicciones
          </Link>
          <Link
            to={`/groups/${id}/scoring`}
            className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
          >
            Scoring detallado
          </Link>
          {canManage && (
            <Link
              to={`/groups/${id}/settings`}
              className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
            >
              Configurar
            </Link>
          )}
          {group?.pool_active && (
            <Link
              to={`/groups/${id}/pool`}
              className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-50"
            >
              Pool
            </Link>
          )}
          {canManage && (
            <button
              type="button"
              disabled={toggleActive.isPending}
              onClick={async () => {
                const action = isActive ? 'desactivar' : 'activar'
                const ok = await confirmAction(
                  `¿${action.charAt(0).toUpperCase() + action.slice(1)} el grupo "${group?.name}"?`,
                  {
                    description: isActive
                      ? 'Los miembros no podrán hacer predicciones.'
                      : 'El grupo volverá a estar disponible.',
                    confirmLabel: isActive ? 'Desactivar' : 'Activar',
                    danger: isActive,
                  },
                )
                if (ok) {
                  toggleActive.mutate(id, {
                    onSuccess: () => toast.success(`Grupo ${action}do`),
                    onError: () => toast.error(`No se pudo ${action} el grupo`),
                  })
                }
              }}
              className={`rounded-md border px-3 py-1.5 font-medium transition-colors ${
                isActive
                  ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                  : 'border-slate-300 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {isActive ? 'Activo' : 'Inactivo'}
            </button>
          )}
        </div>
      </div>

      {canManage && (
        <Card className="mb-4">
          <h2 className="mb-2 text-sm font-medium text-slate-700">Invitar miembro</h2>
          <form onSubmit={handleInvite} className="flex items-end gap-2">
            <TextField
              label="Email"
              type="email"
              name="invite_email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              error={inviteError?.fieldErrors.email}
              placeholder="amigo@email.com"
              className="w-64"
            />
            <Button type="submit" isLoading={sendInvitation.isPending} disabled={!inviteEmail}>
              Invitar
            </Button>
          </form>
        </Card>
      )}

      {canManage && (
        <Card className="mb-4">
          <AiCompetitorToggle groupId={id} />
        </Card>
      )}

      {canManage && pendingData && pendingData.data.length > 0 && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <h2 className="mb-3 text-sm font-medium text-amber-800">
            Solicitudes pendientes ({pendingData.data.length})
          </h2>
          <div className="space-y-2">
            {pendingData.data.map((m) => (
              <div key={m.member_id} className="flex items-center justify-between rounded-lg border border-amber-100 bg-white px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {m.user?.first_name} {m.user?.last_name}
                  </p>
                  <p className="text-xs text-slate-400">{m.user?.email}</p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      approveMember.mutate(m.member_id, {
                        onSuccess: () => toast.success('Miembro aprobado'),
                      })
                    }}
                    disabled={approveMember.isPending}
                    className="text-xs"
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      const ok = await confirmAction('¿Rechazar solicitud?', { danger: true })
                      if (ok) {
                        rejectMember.mutate(m.member_id, {
                          onSuccess: () => toast.success('Solicitud rechazada'),
                        })
                      }
                    }}
                    disabled={rejectMember.isPending}
                    className="text-xs"
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="mb-3 text-sm font-medium text-slate-700">Leaderboard</h2>
        {isLoading && <p className="text-sm text-slate-500">Cargando ranking…</p>}
        {isError && <p className="text-sm text-red-600">No se pudo cargar el ranking.</p>}
        {leaderboardData && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="pb-2 font-normal">Usuario</th>
                <th
                  className="cursor-pointer select-none pb-2 text-right font-normal hover:text-slate-700"
                  onClick={() => handleSort('total_points')}
                >
                  Puntos <SortIcon sortKey={sortKey} sortDir={sortDir} column="total_points" />
                </th>
                <th
                  className="cursor-pointer select-none pb-2 text-right font-normal hover:text-slate-700"
                  onClick={() => handleSort('correct_predictions')}
                >
                  Aciertos <SortIcon sortKey={sortKey} sortDir={sortDir} column="correct_predictions" />
                </th>
                <th
                  className="cursor-pointer select-none pb-2 text-right font-normal hover:text-slate-700"
                  onClick={() => handleSort('exact_scores')}
                >
                  Exactos <SortIcon sortKey={sortKey} sortDir={sortDir} column="exact_scores" />
                </th>
                {group?.pool_active && (
                  <th className="pb-2 text-right font-normal">Premio</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedLeaderboard.map((entry, i) => {
                const isAiUser = entry.first_name === 'Franco' && entry.last_name === 'Marcelo (Chelo)';
                const rowClass = `border-t border-slate-100 ${isAiUser ? 'bg-indigo-50/50' : ''}`;
                return <tr key={entry.user_id} className={rowClass}>
                  <td className="py-2">
                    {i + 1}. {entry.first_name}
                    {isAiUser && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                        <svg className="size-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
                        </svg>
                        IA
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-right font-medium">{entry.total_points}</td>
                  <td className="py-2 text-right text-slate-500">
                    {entry.correct_predictions}
                  </td>
                  <td className="py-2 text-right text-slate-500">{entry.exact_scores}</td>
                  {group?.pool_active && (
                    <td className="py-2 text-right text-emerald-700">
                      ${entry.pool_winnings}
                    </td>
                  )}
                </tr>;
              })}
              {sortedLeaderboard.length === 0 && (
                <tr>
                  <td colSpan={group?.pool_active ? 5 : 4} className="py-8 text-center text-xs text-slate-400">
                    Aún no hay predicciones en este grupo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
