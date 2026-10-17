import { useState, type FormEvent } from 'react'
import type { CreateTournamentPayload } from '@/api/endpoints/tournaments'
import type { NormalizedError } from '@/lib/errorHandler'
import { useCountries } from '@/hooks/useCountries'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'

interface TournamentFormProps {
  initialValues?: Partial<CreateTournamentPayload>
  onSubmit: (payload: CreateTournamentPayload) => void
  isSubmitting: boolean
  error: NormalizedError | null
  submitLabel: string
}

const EMPTY: CreateTournamentPayload = {
  name: '',
  season: '',
  country: '',
  country_code: '',
  start_date: '',
  end_date: '',
  actived: '1',
  is_promotional: '0',
  promotional_tier_required: null,
  promotional_ends_at: null,
}

export function TournamentForm({
  initialValues,
  onSubmit,
  isSubmitting,
  error,
  submitLabel,
}: TournamentFormProps) {
  const [form, setForm] = useState<CreateTournamentPayload>({ ...EMPTY, ...initialValues })
  const { data: countries } = useCountries()

  function field(key: keyof CreateTournamentPayload) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function handleCountryChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selected = countries?.find((c) => c.code === e.target.value)
    if (selected) {
      setForm((f) => ({ ...f, country: selected.name, country_code: selected.code }))
    }
  }

  const selectedCountryCode = form.country_code || ''

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <ErrorBanner error={error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Nombre"
          name="name"
          value={form.name}
          onChange={field('name')}
          error={error?.fieldErrors.name}
          required
        />
        <TextField
          label="Temporada"
          name="season"
          value={form.season}
          onChange={field('season')}
          error={error?.fieldErrors.season}
          placeholder="2026"
          required
        />
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">País</label>
          <select
            name="country"
            value={selectedCountryCode}
            onChange={handleCountryChange}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Seleccionar país...</option>
            {countries?.map((c) => (
              <option key={c.country_id} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          {error?.fieldErrors.country && (
            <p className="mt-1 text-sm text-red-600">{error.fieldErrors.country}</p>
          )}
        </div>
        <TextField
          label="Fecha de inicio"
          name="start_date"
          type="date"
          value={form.start_date}
          onChange={field('start_date')}
          error={error?.fieldErrors.start_date}
          required
        />
        <TextField
          label="Fecha de fin"
          name="end_date"
          type="date"
          value={form.end_date}
          onChange={field('end_date')}
          error={error?.fieldErrors.end_date}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={form.actived === '1'}
          onChange={(e) => setForm((f) => ({ ...f, actived: e.target.checked ? '1' : '0' }))}
        />
        Torneo activo
      </label>

      <div className="rounded-md border border-slate-200 p-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.is_promotional === '1'}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_promotional: e.target.checked ? '1' : '0' }))
            }
          />
          Torneo promocional (acceso gratis temporal para usuarios free)
        </label>
        {form.is_promotional === '1' && (
          <div className="mt-3">
            <TextField
              label="La promo termina el"
              name="promotional_ends_at"
              type="date"
              value={form.promotional_ends_at ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, promotional_ends_at: e.target.value }))
              }
            />
          </div>
        )}
      </div>

      <Button type="submit" isLoading={isSubmitting} className="self-start">
        {submitLabel}
      </Button>
    </form>
  )
}
