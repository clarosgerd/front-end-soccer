import { useState } from 'react'
import { useAdminSubscriptions, useConfirmAdminSubscription } from '@/hooks/useAdmin'
import { useToastStore } from '@/store/toastStore'
import { confirmAction } from '@/lib/confirmAction'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { AdminSubscription } from '@/api/endpoints/admin'

const STATUSES = [
  { value: '', label: 'Todos' },
  { value: 'pending_payment', label: 'Pago pendiente (SIP)' },
  { value: 'active', label: 'Activas' },
  { value: 'cancelled', label: 'Canceladas' },
  { value: 'past_due', label: 'Vencidas' },
] as const

export function Subscriptions() {
  const [status, setStatus] = useState('pending_payment')
  const { data, isLoading } = useAdminSubscriptions({ status: status || undefined })
  const confirmSubscription = useConfirmAdminSubscription()
  const push = useToastStore((s) => s.push)

  async function handleConfirm(subscription: AdminSubscription) {
    if (
      !(await confirmAction(
        `¿Confirmar manualmente el pago de ${subscription.user.email} (${subscription.plan})?`,
        { danger: false },
      ))
    ) {
      return
    }

    try {
      await confirmSubscription.mutateAsync(subscription.subscription_id)
      push('Suscripción activada.', 'success')
    } catch {
      push('No se pudo confirmar — revisá el estado de la suscripción.', 'error')
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Suscripciones</h1>
      <p className="mb-4 text-sm text-slate-500">
        Soporte de pagos SIP: confirmá manualmente un pago que el usuario ya hizo pero cuyo callback
        nunca llegó.
      </p>

      <div className="mb-4 flex gap-1 rounded-md border border-slate-200 p-1 text-sm">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatus(s.value)}
            className={`rounded px-3 py-1 ${status === s.value ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando…</p>}

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Plan</th>
              <th className="px-4 py-2">Monto</th>
              <th className="px-4 py-2">Referencia SIP</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data?.data.map((subscription) => (
              <tr key={subscription.subscription_id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2">{subscription.user.email}</td>
                <td className="px-4 py-2 capitalize">{subscription.plan}</td>
                <td className="px-4 py-2">
                  Bs {subscription.is_annual ? subscription.annual_price : subscription.monthly_price}
                </td>
                <td className="px-4 py-2 font-mono text-xs">{subscription.sip_referencia ?? '—'}</td>
                <td className="px-4 py-2">{subscription.status}</td>
                <td className="px-4 py-2">
                  {subscription.status === 'pending_payment' && (
                    <Button
                      className="text-xs"
                      isLoading={confirmSubscription.isPending}
                      onClick={() => handleConfirm(subscription)}
                    >
                      Confirmar manualmente
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {data?.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                  No hay suscripciones con ese estado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
