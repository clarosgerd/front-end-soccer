import { Link } from 'react-router-dom'
import type { NormalizedError } from '@/lib/errorHandler'

/**
 * Banner de error genérico para mutaciones. Trata el 403 como un caso especial:
 * en esta API, un 403 en una acción de escritura casi siempre viene de
 * CheckGroupLimits o CheckSubscriptionTier (límites del plan free/pro), no de un
 * permiso arbitrario — así que en vez de mostrar "Forbidden" mostramos un CTA
 * directo para upgradear en vez de un error genérico que no explica qué hacer.
 */
export function ErrorBanner({ error }: { error: NormalizedError | null }) {
  if (!error) return null

  // Los errores de validación (422) se muestran inline en cada campo, no acá.
  if (error.isValidationError) return null

  if (error.isForbidden) {
    return (
      <div className="flex items-center justify-between rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
        <span>Llegaste al límite de tu plan actual.</span>
        <Link to="/subscription" className="font-medium underline hover:no-underline">
          Upgradeá tu plan →
        </Link>
      </div>
    )
  }

  return (
    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>
  )
}
