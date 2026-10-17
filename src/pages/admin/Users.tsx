import { useState } from 'react'
import { useAdminUsers, useResetUserPassword, useToggleUserSuspended, useUpdateAdminUser } from '@/hooks/useAdmin'
import { useToastStore } from '@/store/toastStore'
import { confirmAction } from '@/lib/confirmAction'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { AdminUser } from '@/api/endpoints/admin'

const TIERS = ['free', 'predictor', 'pro', 'premium'] as const

export function Users() {
  const [email, setEmail] = useState('')
  const { data, isLoading } = useAdminUsers({ email: email || undefined })
  const updateUser = useUpdateAdminUser()
  const resetPassword = useResetUserPassword()
  const toggleSuspended = useToggleUserSuspended()
  const push = useToastStore((s) => s.push)
  const [revealedPassword, setRevealedPassword] = useState<{ userId: number; password: string } | null>(null)

  async function handleResetPassword(user: AdminUser) {
    if (!(await confirmAction(`¿Resetear la contraseña de ${user.email}?`))) return

    const result = await resetPassword.mutateAsync(user.user_id)
    setRevealedPassword({ userId: user.user_id, password: result.temporary_password })
  }

  async function handleToggleSuspended(user: AdminUser) {
    const willSuspend = !user.suspended_at
    const label = willSuspend ? 'suspender' : 'reactivar'
    if (!(await confirmAction(`¿${label.charAt(0).toUpperCase() + label.slice(1)} a ${user.email}?`))) return

    await toggleSuspended.mutateAsync(user.user_id)
    push(`Usuario ${willSuspend ? 'suspendido' : 'reactivado'}.`, 'success')
  }

  function handleTierChange(user: AdminUser, tier: string) {
    updateUser.mutate(
      { userId: user.user_id, payload: { subscription_tier: tier } },
      { onSuccess: () => push('Plan actualizado.', 'success') },
    )
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Usuarios</h1>
      <p className="mb-4 text-sm text-slate-500">Soporte: cambiar plan, resetear contraseña, suspender cuentas.</p>

      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Buscar por email…"
        className="mb-4 w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      {isLoading && <p className="text-sm text-slate-500">Cargando…</p>}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Plan</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((user) => (
              <tr key={user.user_id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2">
                  <p className="font-medium text-slate-900">{user.first_name} {user.last_name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </td>
                <td className="px-4 py-2">
                  <select
                    value={user.subscription_tier}
                    onChange={(e) => handleTierChange(user, e.target.value)}
                    className="rounded border border-slate-200 px-2 py-1 text-xs"
                  >
                    {TIERS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  {user.suspended_at ? (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Suspendido
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Activo
                    </span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" className="text-xs" onClick={() => handleResetPassword(user)}>
                      Resetear contraseña
                    </Button>
                    <Button
                      variant={user.suspended_at ? 'secondary' : 'danger'}
                      className="text-xs"
                      onClick={() => handleToggleSuspended(user)}
                    >
                      {user.suspended_at ? 'Reactivar' : 'Suspender'}
                    </Button>
                  </div>
                  {revealedPassword?.userId === user.user_id && (
                    <p className="mt-1 text-xs text-slate-600">
                      Nueva contraseña: <code className="font-mono">{revealedPassword.password}</code>
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
