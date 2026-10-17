import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCurrentSubscription } from '@/hooks/useSubscription'
import { Card } from '@/components/ui/Card'

export function Dashboard() {
  const user = useAuthStore((s) => s.user)
  const { data: subscription } = useCurrentSubscription()

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Hola, {user?.first_name}</h1>
      <p className="mt-1 text-sm text-slate-500">
        Desde acá vas a poder ver tus torneos, grupos y predicciones.
      </p>

      {subscription && subscription.plan === 'free' && (
        <Card className="mt-6 flex items-center justify-between bg-amber-50">
          <div>
            <p className="text-sm font-medium text-amber-900">Estás en el plan Free</p>
            <p className="text-xs text-amber-700">
              Límites de predicciones diarias y torneos activos. Los torneos promocionales
              no cuentan contra tu límite.
            </p>
          </div>
          <Link
            to="/subscription"
            className="whitespace-nowrap rounded-md bg-amber-900 px-3 py-1.5 text-sm text-white hover:bg-amber-800"
          >
            Ver planes
          </Link>
        </Card>
      )}
    </div>
  )
}
