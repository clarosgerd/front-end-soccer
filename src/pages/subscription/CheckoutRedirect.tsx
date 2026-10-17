import { Link, useSearchParams } from 'react-router-dom'
import { useCurrentSubscription } from '@/hooks/useSubscription'
import { Card } from '@/components/ui/Card'

export function CheckoutRedirect() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status') // 'success' | 'cancelled', según config del webhook
  const { data: current } = useCurrentSubscription()

  return (
    <div className="mx-auto max-w-sm">
      <Card className="text-center">
        {status === 'success' ? (
          <>
            <p className="text-lg font-semibold text-emerald-700">¡Listo! 🎉</p>
            <p className="mt-2 text-sm text-slate-600">
              Tu suscripción {current ? `al plan ${current.plan}` : ''} quedó activa.
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-slate-900">Checkout cancelado</p>
            <p className="mt-2 text-sm text-slate-600">No se realizó ningún cargo.</p>
          </>
        )}
        <Link
          to="/subscription"
          className="mt-4 inline-block text-sm text-slate-500 hover:underline"
        >
          Volver a planes
        </Link>
      </Card>
    </div>
  )
}
