import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'
import { normalizeApiError } from '@/lib/errorHandler'
import { TextField } from '@/components/ui/TextField'
import { Button } from '@/components/ui/Button'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  const normalized = login.error ? normalizeApiError(login.error) : null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Iniciar sesión</h1>
        <p className="mb-6 text-sm text-slate-500">Accedé a tus torneos y grupos</p>

        {normalized && !normalized.isValidationError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {normalized.message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={normalized?.fieldErrors.email}
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={normalized?.fieldErrors.password}
            required
          />
          <Button type="submit" isLoading={login.isPending} className="mt-2">
            Iniciar sesión
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          ¿No tenés cuenta?{' '}
          <Link to="/register" className="font-medium text-slate-900 hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  )
}
