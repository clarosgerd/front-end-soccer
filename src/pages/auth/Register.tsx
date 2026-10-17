import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useRegister } from '@/hooks/useAuth'
import { normalizeApiError } from '@/lib/errorHandler'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'

export function Register() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const register = useRegister()
  const normalized = register.error ? normalizeApiError(register.error) : null

  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    register.mutate(form)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Crear cuenta</h1>
        <p className="mb-6 text-sm text-slate-500">Armá tu grupo de predicciones</p>

        {normalized && !normalized.isValidationError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {normalized.message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Nombre"
            name="first_name"
            value={form.first_name}
            onChange={handleChange('first_name')}
            error={normalized?.fieldErrors.first_name}
            required
          />
          <TextField
            label="Apellido"
            name="last_name"
            value={form.last_name}
            onChange={handleChange('last_name')}
            error={normalized?.fieldErrors.last_name}
            required
          />
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange('email')}
            error={normalized?.fieldErrors.email}
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange('password')}
            error={normalized?.fieldErrors.password}
            required
          />
          <TextField
            label="Confirmar contraseña"
            type="password"
            name="password_confirmation"
            autoComplete="new-password"
            value={form.password_confirmation}
            onChange={handleChange('password_confirmation')}
            required
          />
          <Button type="submit" isLoading={register.isPending} className="mt-2">
            Crear cuenta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-slate-900 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
