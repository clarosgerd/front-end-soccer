import { useState } from 'react'
import {
  useCurrentSubscription,
  usePlans,
  usePaymentStatus,
  useStartCheckout,
} from '@/hooks/useSubscription'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'
import { normalizeApiError } from '@/lib/errorHandler'
import type { SipCheckoutResponse } from '@/api/types'

function SipQrModal({ checkout, onClose }: { checkout: SipCheckoutResponse; onClose: () => void }) {
  const { data: status } = usePaymentStatus(checkout.referencia)
  const isPaid = status?.status === 'active'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      onClick={isPaid ? undefined : onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl"
      >
        {isPaid ? (
          <>
            <p className="text-lg font-semibold text-emerald-700">¡Pago confirmado! 🎉</p>
            <p className="mt-2 text-sm text-slate-600">Tu suscripción ya está activa.</p>
            <Button className="mt-4 w-full" onClick={onClose}>
              Listo
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-base font-semibold text-slate-900">Escaneá el QR para pagar</h2>
            <p className="mt-1 text-sm text-slate-500">
              Bs {checkout.monto.toFixed(2)} · {checkout.banco_destino ?? 'Pago QR'}
            </p>
            {checkout.qr_image_base64 && (
              <img
                src={`data:image/png;base64,${checkout.qr_image_base64}`}
                alt="Código QR de pago"
                className="mx-auto mt-4 h-56 w-56"
              />
            )}
            {checkout.cuenta_destino && (
              <p className="mt-2 text-xs text-slate-400">Cuenta destino: {checkout.cuenta_destino}</p>
            )}
            <p className="mt-4 text-xs text-slate-400">
              Esperando confirmación del pago… esto se actualiza solo.
            </p>
            <Button variant="secondary" className="mt-4 w-full" onClick={onClose}>
              Cancelar
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export function Plans() {
  const { data: current } = useCurrentSubscription()
  const { data: plans, isLoading, isError } = usePlans()
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')
  const checkout = useStartCheckout()
  const [activeCheckout, setActiveCheckout] = useState<SipCheckoutResponse | null>(null)
  const currentPlanName = plans?.find((p) => p.plan === current?.plan)?.name ?? current?.plan

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Planes</h1>
          {current && (
            <p className="text-sm text-slate-500">
              Plan actual: <span className="font-medium">{currentPlanName}</span>
            </p>
          )}
        </div>
        <div className="flex gap-1 rounded-md border border-slate-200 p-1 text-sm">
          <button
            onClick={() => setInterval('monthly')}
            className={`rounded px-3 py-1 ${interval === 'monthly' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Mensual
          </button>
          <button
            onClick={() => setInterval('annual')}
            className={`rounded px-3 py-1 ${interval === 'annual' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Anual
          </button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando planes…</p>}
      {isError && <p className="text-sm text-red-600">No se pudieron cargar los planes.</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans?.map((plan) => {
          const price = interval === 'monthly' ? plan.monthly_price : plan.annual_price
          const isCurrent = current?.plan === plan.plan

          return (
            <Card key={plan.plan} className={isCurrent ? 'border-slate-900' : ''}>
              <p className="text-sm font-medium text-slate-900">{plan.name}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                Bs {price}
                <span className="text-sm font-normal text-slate-400">
                  /{interval === 'monthly' ? 'mes' : 'año'}
                </span>
              </p>
              <ul className="mt-3 flex flex-col gap-1 text-xs text-slate-500">
                <li>
                  {plan.predictions_per_day === null
                    ? 'Predicciones ilimitadas/día'
                    : `${plan.predictions_per_day} predicciones/día`}
                </li>
                <li>
                  {plan.tournament_limit === null
                    ? 'Torneos ilimitados'
                    : `${plan.tournament_limit} torneos`}
                </li>
              </ul>
              <Button
                className="mt-4 w-full"
                variant={isCurrent ? 'secondary' : 'primary'}
                disabled={isCurrent}
                isLoading={checkout.isPending}
                onClick={() =>
                  checkout.mutate(
                    { plan: plan.plan, interval },
                    {
                      onSuccess: (data) => setActiveCheckout(data),
                      onError: (e) =>
                        toast.error(normalizeApiError(e).message || 'No se pudo iniciar la suscripción.'),
                    },
                  )
                }
              >
                {isCurrent ? 'Plan actual' : plan.plan === 'free' ? 'Volver a Free' : 'Suscribirme'}
              </Button>
            </Card>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Los torneos marcados como promocionales dan acceso completo temporal sin necesidad
        de upgrade, incluso en el plan Free.
      </p>

      {activeCheckout && (
        <SipQrModal checkout={activeCheckout} onClose={() => setActiveCheckout(null)} />
      )}
    </div>
  )
}
