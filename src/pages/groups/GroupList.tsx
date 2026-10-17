import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useCreateGroup, useGroups, useToggleGroupActive } from '@/hooks/useGroups'
import { DEFAULT_GROUP_VALUES } from '@/api/endpoints/groups'
import { normalizeApiError } from '@/lib/errorHandler'
import { confirmAction } from '@/lib/confirmAction'
import { toast } from '@/lib/toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { ErrorBanner } from '@/components/ui/ErrorBanner'

const GRADIENTS = [
  'from-teal-500 to-emerald-600',
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
]

function getGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length]
}

export function GroupList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const perPage = 12
  const { data, isLoading, isError } = useGroups(page, perPage)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [betAmount, setBetAmount] = useState('0')
  const [poolActive, setPoolActive] = useState(false)

  const createGroup = useCreateGroup()
  const toggleActive = useToggleGroupActive()
  const normalized = createGroup.error ? normalizeApiError(createGroup.error) : null

  const groups = data?.data ?? []
  const meta = data?.meta

  const query = search.trim().toLowerCase()
  const filteredGroups = query
    ? groups.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query),
      )
    : groups

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    createGroup.mutate(
      {
        ...DEFAULT_GROUP_VALUES,
        name,
        description,
        bet_amount: betAmount,
        pool_active: poolActive ? '1' : '0',
      },
      {
        onSuccess: () => {
          setShowForm(false)
          setName('')
          setDescription('')
          setBetAmount('0')
          setPoolActive(false)
          setPage(1)
          toast.success('Grupo creado')
        },
      },
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Grupos</h1>
          {meta && (
            <p className="text-xs text-slate-500">
              {meta.total} grupo{meta.total !== 1 ? 's' : ''} en total
            </p>
          )}
        </div>
        <Button variant="secondary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancelar' : 'Crear grupo'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <ErrorBanner error={normalized} />
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextField
              label="Nombre del grupo"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={normalized?.fieldErrors.name}
              required
            />
            <TextField
              label="Descripción"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={normalized?.fieldErrors.description}
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={poolActive}
                  onChange={(e) => setPoolActive(e.target.checked)}
                />
                Activar pool de premios
              </label>
              {poolActive && (
                <TextField
                  label="Monto de apuesta"
                  name="bet_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-32"
                />
              )}
            </div>
            <p className="text-xs text-slate-400">
              El scoring se crea con los valores default (10 / 5 / 3 / 15 puntos y
              multiplicadores 1.5x–10x). Se pueden ajustar después desde el detalle del grupo.
            </p>
            <Button type="submit" isLoading={createGroup.isPending} className="self-start">
              Crear grupo
            </Button>
          </form>
        </Card>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar grupo por nombre..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <svg
          className="absolute left-3 top-3 h-4 w-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white">
              <div className="h-24 rounded-t-xl bg-slate-100" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-sm font-medium text-red-700">No se pudieron cargar los grupos.</p>
        </div>
      )}

      {!isLoading && !isError && filteredGroups.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
            👥
          </div>
          <p className="text-sm font-medium text-slate-700">
            {query ? 'No se encontraron grupos' : 'No hay grupos creados'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {query ? 'Probá con otro término.' : 'Creá uno para comenzar.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredGroups.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map((group) => {
              const isActive = group.active === undefined ? true : Number(group.active) === 1
              const initial = group.name.charAt(0).toUpperCase()
              const color = GRADIENTS[group.group_id % GRADIENTS.length]

              return (
                <Card key={group.group_id} className="overflow-hidden !p-0">
                  <div className="relative flex h-24 items-center justify-center">
                    <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
                    <span className="relative text-3xl font-bold text-white/30">{initial}</span>
                    <button
                      type="button"
                      disabled={toggleActive.isPending}
                      onClick={async () => {
                        const action = isActive ? 'desactivar' : 'activar'
                        const ok = await confirmAction(
                          `¿${action.charAt(0).toUpperCase() + action.slice(1)} el grupo "${group.name}"?`,
                          {
                            description: isActive
                              ? 'Los miembros no podrán hacer predicciones.'
                              : 'El grupo volverá a estar disponible.',
                            confirmLabel: isActive ? 'Desactivar' : 'Activar',
                            danger: isActive,
                          },
                        )
                        if (ok) {
                          toggleActive.mutate(group.group_id, {
                            onSuccess: () => toast.success(`Grupo ${action}do`),
                            onError: () => toast.error(`No se pudo ${action} el grupo`),
                          })
                        }
                      }}
                      className={`absolute right-3 top-3 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                        isActive
                          ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                          : 'bg-slate-400/80 text-white hover:bg-slate-500'
                      }`}
                    >
                      {isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </div>

                  <div className="p-4">
                    <Link to={`/groups/${group.group_id}`} className="group mb-1 block">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                        {group.name}
                      </h3>
                    </Link>
                    {group.description && (
                      <p className="mb-2 line-clamp-2 text-xs text-slate-500">
                        {group.description}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      {group.pool_active
                        ? `Apuestas activas · $${group.bet_amount}`
                        : 'Sin apuestas'}
                    </p>
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
                    p === 1 || p === meta.last_page || Math.abs(p - page) <= 1,
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
