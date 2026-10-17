import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/api/types'

export interface FieldErrors {
  [field: string]: string
}

export interface NormalizedError {
  message: string
  fieldErrors: FieldErrors
  status?: number
  isValidationError: boolean
  isAuthError: boolean
  isForbidden: boolean
  // true solo en el 403 de "necesitás suscripción paga para pronosticar"
  // (ver CheckPredictionLimits) — distinto de otros 403 de límite de plan
  // (torneos/miembros), que no llevan este reason.
  requiresPaidSubscription: boolean
  currentTier?: string
  upgradeUrl?: string
}

/**
 * Normaliza cualquier error de la API (Laravel) a un shape consistente
 * que los formularios y componentes pueden consumir directamente.
 *
 * Laravel devuelve 422 como: { message, errors: { campo: ["msg1", "msg2"] } }
 * Este helper aplana eso a { campo: "msg1" } (primer mensaje por campo).
 */
export function normalizeApiError(error: unknown): NormalizedError {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const data = error.response?.data as ApiErrorResponse | undefined

    const fieldErrors: FieldErrors = {}
    if (data?.errors) {
      for (const [field, messages] of Object.entries(data.errors)) {
        fieldErrors[field] = messages[0]
      }
    }

    return {
      message: data?.message ?? error.message ?? 'Ocurrió un error inesperado.',
      fieldErrors,
      status,
      isValidationError: status === 422,
      isAuthError: status === 401,
      isForbidden: status === 403,
      requiresPaidSubscription: status === 403 && data?.reason === 'subscription_required',
      currentTier: data?.current_tier,
      upgradeUrl: data?.upgrade_url,
    }
  }

  return {
    message: 'Ocurrió un error inesperado.',
    fieldErrors: {},
    isValidationError: false,
    isAuthError: false,
    isForbidden: false,
    requiresPaidSubscription: false,
  }
}
