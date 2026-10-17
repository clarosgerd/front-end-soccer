import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useCreateTournament,
  useToggleTournamentActive,
  useTournaments,
} from '@/hooks/useTournaments'
import { useMyTournamentMemberships } from '@/hooks/useGroupMembers'
import { useAuthStore } from '@/store/authStore'
import { normalizeApiError } from '@/lib/errorHandler'
import { confirmAction } from '@/lib/confirmAction'
import { toast } from '@/lib/toast'
import { TournamentForm } from '@/components/domain/TournamentForm'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const GRADIENTS = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
]

function getGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length]
}

export function TournamentList() {
  const [page, setPage] = useState(1)
  const perPage = 12
  const { data, isLoading, isError } = useTournaments(page, perPage)
  const [showForm, setShowForm] = useState(false)
  const createTournament = useCreateTournament()
  const toggleActive = useToggleTournamentActive()
  const user = useAuthStore((s) => s.user)

  const createError = createTournament.error ? normalizeApiError(createTournament.error) : null
  const { data: joinedTournaments } = useMyTournamentMemberships()
  const joinedSet = new Set(joinedTournaments ?? [])

  const tournaments = data?.data ?? []
  const meta = data?.meta

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Torneos</h1>
          {meta && (
            <p className="text-xs text-slate-500">
              {meta.total} torneo{meta.total !== 1 ? 's' : ''} en total
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancelar' : 'Crear torneo'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <TournamentForm
            onSubmit={(payload) =>
              createTournament.mutate(payload, {
                onSuccess: () => {
                  setShowForm(false)
                  setPage(1)
                  toast.success('Torneo creado')
                },
              })
            }
            isSubmitting={createTournament.isPending}
            error={createError}
            submitLabel="Crear torneo"
          />
        </Card>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white">
              <div className="h-28 bg-slate-100 rounded-t-xl" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="h-8 w-full rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-medium text-red-700">No se pudieron cargar los torneos.</p>
        </div>
      )}

      {!isLoading && !isError && tournaments.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
            ⚽
          </div>
          <p className="text-sm font-medium text-slate-700">No hay torneos creados</p>
          <p className="mt-1 text-xs text-slate-400">Creá uno para comenzar.</p>
        </div>
      )}

      {!isLoading && !isError && tournaments.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => {
              const isActive = Number(t.actived) === 1
              const isPromo = Number(t.is_promotional) === 1
              const initial = t.name.charAt(0).toUpperCase()
              const isOwner = t.created_by === user?.user_id
              const canManage = user?.role === 'admin' || isOwner

              return (
                <Card key={t.tournament_id} className="overflow-hidden !p-0">
                  <div className="relative h-28 overflow-hidden">
                    {t.logo_url ? (
                      <img
                        src={t.logo_url}
                        alt={t.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${getGradient(t.tournament_id)}`}
                      >
                        <span className="text-4xl font-bold text-white/20">{initial}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {t.flag_url && (
                      <img
                        src={t.flag_url}
                        alt={t.country}
                        className="absolute right-3 top-3 h-5 w-7 rounded border border-white/30 object-cover shadow-sm"
                      />
                    )}
                    <div className="absolute bottom-2 left-3 flex gap-1.5">
                      {isPromo && (
                        <span className="rounded bg-amber-500/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Promo
                        </span>
                      )}
                      {'status' in t && t.status && t.status !== 'draft' && (
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          t.status === 'live' ? 'bg-emerald-500/90 text-white' :
                          t.status === 'published' ? 'bg-blue-500/90 text-white' :
                          'bg-slate-400/80 text-white'
                        }`}>
                          {t.status === 'live' ? 'En vivo' : t.status === 'published' ? 'Publicado' : 'Cerrado'}
                        </span>
                      )}
                      {canManage && (
                        <button
                          type="button"
                          disabled={toggleActive.isPending}
                          onClick={async () => {
                            const action = isActive ? 'desactivar' : 'activar'
                            const ok = await confirmAction(
                              `¿${action.charAt(0).toUpperCase() + action.slice(1)} el torneo "${t.name}"?`,
                              {
                                description: isActive
                                  ? 'Los usuarios no podrán hacer predicciones en este torneo.'
                                  : 'El torneo volverá a estar disponible para predicciones.',
                                confirmLabel: isActive ? 'Desactivar' : 'Activar',
                                danger: isActive,
                              },
                            )
                            if (ok) {
                              toggleActive.mutate(t.tournament_id, {
                                onSuccess: () =>
                                  toast.success(`Torneo ${action}do`),
                                onError: () =>
                                  toast.error(`No se pudo ${action} el torneo`),
                              })
                            }
                          }}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                            isActive
                              ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                              : 'bg-slate-400/80 text-white hover:bg-slate-500'
                          }`}
                        >
                          {isActive ? 'Activo' : 'Inactivo'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <Link
                      to={`/tournaments/${t.tournament_id}/bracket`}
                      className="group mb-1 block"
                    >
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                        {t.name}
                      </h3>
                    </Link>
                    <p className="mb-3 text-xs text-slate-500">
                      {t.season} · {t.country}
                    </p>
                    <p className="mb-3 text-[11px] text-slate-400">
                      {new Date(t.start_date).toLocaleDateString('es-AR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {' – '}
                      {new Date(t.end_date).toLocaleDateString('es-AR', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {canManage && (
                        <>
                          <Link
                            to={`/tournaments/${t.tournament_id}/stages`}
                            className="rounded border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Fases
                          </Link>
                          <Link
                            to={`/tournaments/${t.tournament_id}/groups-admin`}
                            className="rounded border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Grupos
                          </Link>
                          <Link
                            to={`/tournaments/${t.tournament_id}/matches`}
                            className="rounded border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                          >
                            Partidos
                          </Link>
                        </>
                      )}
                      <Link
                        to={`/tournaments/${t.tournament_id}/calendar`}
                        className="rounded border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Calendario
                      </Link>
                      {canManage && (
                        <Link
                          to={`/tournaments/${t.tournament_id}/manage`}
                          className="rounded bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-slate-800"
                        >
                          Administrar
                        </Link>
                      )}
                      {joinedSet.has(t.tournament_id) ? (
                        <span className="rounded bg-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500 cursor-not-allowed">
                          Ya unido
                        </span>
                      ) : (
                        <Link
                          to={`/tournaments/${t.tournament_id}/join`}
                          className="rounded bg-blue-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-blue-700"
                        >
                          Unirse
                        </Link>
                      )}
                      {canManage && (
                        <Link
                          to={`/tournaments/${t.tournament_id}/edit`}
                          className="rounded border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Editar
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Anterior
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === meta.last_page ||
                    Math.abs(p - page) <= 1,
                )
                .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('dots')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === 'dots' ? (
                    <span key={`dots-${idx}`} className="px-1 text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                        page === p
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                type="button"
                disabled={page === meta.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          )}

          {meta && meta.last_page > 1 && (
            <p className="mt-3 text-center text-[11px] text-slate-400">
              Página {meta.current_page} de {meta.last_page}
            </p>
          )}
        </>
      )}
    </div>
  )
}
