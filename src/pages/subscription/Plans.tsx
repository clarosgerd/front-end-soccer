import { useState } from 'react'
import { useCurrentSubscription, usePlans, useStartCheckout } from '@/hooks/useSubscription'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { SubscriptionPlan } from '@/api/types'

const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: 'Free',
  predictor: 'Predictor',
  pro: 'Pro',
  premium: 'Premium',
}

export function Plans() {
  const { data: current } = useCurrentSubscription()
  const { data: plans, isLoading, isError } = usePlans()
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')
  const checkout = useStartCheckout()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Planes</h1>
          {current && (
            <p className="text-sm text-slate-500">
              Plan actual: <span className="font-medium">{PLAN_LABELS[current.plan]}</span>
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
              <p className="text-sm font-medium text-slate-900">{PLAN_LABELS[plan.plan]}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                ${price}
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
                onClick={() => checkout.mutate({ plan: plan.plan, interval })}
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
    </div>
  )
}
