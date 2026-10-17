import { useState } from 'react'
import {
  useCreateTeam,
  useCreateTeamsBulk,
  useTeams,
  useToggleTeamActive,
  useUpdateTeam,
} from '@/hooks/useTeams'
import { useCountries } from '@/hooks/useCountries'
import { normalizeApiError } from '@/lib/errorHandler'
import { confirmAction } from '@/lib/confirmAction'
import { toast } from '@/lib/toast'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import type { Team } from '@/api/types'

const TEAM_COLORS = [
  'from-blue-500 to-blue-700',
  'from-emerald-500 to-emerald-700',
  'from-violet-500 to-violet-700',
  'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700',
  'from-cyan-500 to-cyan-700',
  'from-indigo-500 to-indigo-700',
  'from-pink-500 to-pink-700',
]

function TeamCard({
  team,
  onEdit,
}: {
  team: Team
  onEdit: (team: Team) => void
}) {
  const isActive = team.active === undefined ? true : Number(team.active) === 1
  const toggleActive = useToggleTeamActive()
  const initial = team.name.charAt(0).toUpperCase()
  const color = TEAM_COLORS[team.team_id % TEAM_COLORS.length]

  return (
    <Card className="overflow-hidden !p-0">
      <div className="relative flex h-20 items-center justify-center bg-gradient-to-br">
        <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
        <span className="relative text-3xl font-bold text-white/30">{initial}</span>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-bold text-slate-900">{team.name}</h3>
            <p className="text-xs text-slate-500">{team.country}</p>
          </div>
          <button
            type="button"
            disabled={toggleActive.isPending}
            onClick={async () => {
              const action = isActive ? 'desactivar' : 'activar'
              const ok = await confirmAction(
                `¿${action.charAt(0).toUpperCase() + action.slice(1)} el equipo "${team.name}"?`,
                {
                  description: isActive
                    ? 'El equipo no aparecerá en las listas de selección.'
                    : 'El volverá a estar disponible.',
                  confirmLabel: isActive ? 'Desactivar' : 'Activar',
                  danger: isActive,
                },
              )
              if (ok) {
                toggleActive.mutate(team.team_id, {
                  onSuccess: () => toast.success(`Equipo ${action}do`),
                  onError: () => toast.error(`No se pudo ${action} el equipo`),
                })
              }
            }}
            className={`flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors ${
              isActive
                ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                : 'bg-slate-400/80 text-white hover:bg-slate-500'
            }`}
          >
            {isActive ? 'Activo' : 'Inactivo'}
          </button>
        </div>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => onEdit(team)}
        >
          Editar
        </Button>
      </div>
    </Card>
  )
}

export function TeamList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const perPage = 24
  const params = search.trim() ? { 'name[eq]': search.trim() } : undefined
  const { data, isLoading, isError } = useTeams(params, page, perPage)
  const { data: countries } = useCountries()

  const [editing, setEditing] = useState<Team | null>(null)
  const [editName, setEditName] = useState('')
  const [editCountry, setEditCountry] = useState('')
  const updateTeam = useUpdateTeam(editing?.team_id ?? 0)
  const updateError = updateTeam.error ? normalizeApiError(updateTeam.error) : null

  const [showForm, setShowForm] = useState(false)
  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const createTeam = useCreateTeam()
  const createBulk = useCreateTeamsBulk()
  const createError = createTeam.error ? normalizeApiError(createTeam.error) : null
  const bulkError = createBulk.error ? normalizeApiError(createBulk.error) : null

  const [bulkDrafts, setBulkDrafts] = useState<{ name: string; country: string }[]>([
    { name: '', country: '' },
  ])

  const teams = data?.data ?? []
  const meta = data?.meta

  function startEdit(team: Team) {
    setEditing(team)
    setEditName(team.name)
    setEditCountry(team.country)
  }

  function handleSubmit() {
    if (!name || !country) return
    createTeam.mutate(
      { name, country },
      {
        onSuccess: () => {
          setName('')
          setCountry('')
          setShowForm(false)
          setPage(1)
          toast.success('Equipo creado')
        },
      },
    )
  }

  function handleBulkCreate() {
    const valid = bulkDrafts.filter((d) => d.name.trim() && d.country.trim())
    if (valid.length === 0) return
    createBulk.mutate(valid, {
      onSuccess: () => {
        setBulkDrafts([{ name: '', country: '' }])
        setShowForm(false)
        setPage(1)
        toast.success(`${valid.length} equipos creados`)
      },
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Equipos</h1>
          {meta && (
            <p className="text-xs text-slate-500">
              {meta.total} equipo{meta.total !== 1 ? 's' : ''} en total
            </p>
          )}
        </div>
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
            {showForm ? 'Cancelar' : 'Crear equipo'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          {mode === 'single' ? (
            <>
              <ErrorBanner error={createError} />
              <div className="flex items-end gap-2">
                <TextField
                  label="Nombre"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={createError?.fieldErrors.name}
                  className="flex-1"
                />
                <div className="w-48">
                  <label className="mb-1 block text-xs font-medium text-slate-600">País</label>
                  <select
                    value={countries?.find((c) => c.name === country)?.code ?? ''}
                    onChange={(e) => {
                      const selected = countries?.find((c) => c.code === e.target.value)
                      setCountry(selected?.name ?? '')
                    }}
                    className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">País...</option>
                    {countries?.map((c) => (
                      <option key={c.country_id} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleSubmit} isLoading={createTeam.isPending}>
                  Crear
                </Button>
              </div>
            </>
          ) : (
            <>
              <ErrorBanner error={bulkError} />
              <p className="mb-3 text-sm text-slate-500">
                Agregá los equipos y crealos todos de una.
              </p>
              <div className="flex flex-col gap-2">
                {bulkDrafts.map((row, i) => (
                  <div key={i} className="flex items-end gap-2">
                    <TextField
                      label=""
                      name={`bulk-name-${i}`}
                      value={row.name}
                      onChange={(e) =>
                        setBulkDrafts((prev) =>
                          prev.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)),
                        )
                      }
                      placeholder="Nombre"
                      className="flex-1"
                    />
                    <select
                      value={countries?.find((c) => c.name === row.country)?.code ?? ''}
                      onChange={(e) => {
                        const selected = countries?.find((c) => c.code === e.target.value)
                        setBulkDrafts((prev) =>
                          prev.map((r, j) =>
                            j === i ? { ...r, country: selected?.name ?? '' } : r,
                          ),
                        )
                      }}
                      className="w-48 rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">País...</option>
                      {countries?.map((c) => (
                        <option key={c.country_id} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setBulkDrafts((prev) => prev.filter((_, j) => j !== i))}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setBulkDrafts((prev) => [...prev, { name: '', country: '' }])}
                >
                  + Agregar equipo
                </Button>
                <Button onClick={handleBulkCreate} isLoading={createBulk.isPending}>
                  Crear {bulkDrafts.length} equipos
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Inline edit modal */}
      {editing && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <ErrorBanner error={updateError} />
          <div className="flex items-end gap-2">
            <TextField
              label="Nombre"
              name="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1"
            />
            <div className="w-48">
              <label className="mb-1 block text-xs font-medium text-slate-600">País</label>
              <select
                value={countries?.find((c) => c.name === editCountry)?.code ?? ''}
                onChange={(e) => {
                  const selected = countries?.find((c) => c.code === e.target.value)
                  setEditCountry(selected?.name ?? '')
                }}
                className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">País...</option>
                {countries?.map((c) => (
                  <option key={c.country_id} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
            <Button
              isLoading={updateTeam.isPending}
              onClick={() =>
                updateTeam.mutate(
                  { name: editName, country: editCountry },
                  {
                    onSuccess: () => {
                      setEditing(null)
                      toast.success('Equipo actualizado')
                    },
                    onError: () => toast.error('No se pudo actualizar el equipo'),
                  },
                )
              }
            >
              Guardar
            </Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Buscar equipo por nombre..."
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
            onClick={() => { setSearch(''); setPage(1) }}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-white">
              <div className="h-20 bg-slate-100 rounded-t-xl" />
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
          <p className="text-sm font-medium text-red-700">No se pudieron cargar los equipos.</p>
        </div>
      )}

      {!isLoading && !isError && teams.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 py-16 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
            ⚽
          </div>
          <p className="text-sm font-medium text-slate-700">
            {search ? 'No se encontraron equipos' : 'No hay equipos creados'}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {search ? 'Probá con otro término.' : 'Creá uno para comenzar.'}
          </p>
        </div>
      )}

      {!isLoading && !isError && teams.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {teams.map((team) => (
              <TeamCard key={team.team_id} team={team} onEdit={startEdit} />
            ))}
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
