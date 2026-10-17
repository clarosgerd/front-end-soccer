import { useMutation, useQuery } from '@tanstack/react-query'
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

// El checkout de Stripe es por redirección, no modal embebido:
// pedimos la URL y navegamos el browser entero hacia Stripe.
export function useStartCheckout() {
  return useMutation({
    mutationFn: (payload: { plan: SubscriptionPlan; interval: 'monthly' | 'annual' }) =>
      subscriptionsApi.checkout(payload),
    onSuccess: (url) => {
      window.location.href = url
    },
  })
}

export function useCancelSubscription() {
  return useMutation({
    mutationFn: () => subscriptionsApi.cancel(),
  })
}
