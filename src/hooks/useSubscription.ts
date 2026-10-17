import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subscriptionsApi } from '@/api/endpoints/subscriptions'
import type { SubscriptionPlan } from '@/api/types'

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => subscriptionsApi.current(),
  })
}

export function usePlans() {
  return useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: () => subscriptionsApi.plans(),
  })
}

// El checkout ahora genera un QR de pago SIP (16/10/2026) — ya no hay
// redirección externa, el componente muestra el QR y arranca el polling
// con usePaymentStatus() hasta que se confirme.
export function useStartCheckout() {
  return useMutation({
    mutationFn: (payload: { plan: SubscriptionPlan; interval: 'monthly' | 'annual' }) =>
      subscriptionsApi.checkout(payload),
  })
}

// Polling activo mientras el usuario mira la pantalla del QR — cada 5s,
// más frecuente que el de 30s de otras pantallas porque acá hay alguien
// esperando confirmar el pago en el momento, no en segundo plano.
export function usePaymentStatus(referencia: string | null) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['subscription', 'payment-status', referencia],
    queryFn: () => subscriptionsApi.paymentStatus(referencia as string),
    enabled: !!referencia,
    refetchInterval: (query) => (query.state.data?.status === 'active' ? false : 5000),
    select: (data) => {
      if (data.status === 'active') {
        queryClient.invalidateQueries({ queryKey: ['subscription'] })
      }

      return data
    },
  })
}

export function useCancelSubscription() {
  return useMutation({
    mutationFn: () => subscriptionsApi.cancel(),
  })
}
