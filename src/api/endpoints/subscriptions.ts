import apiClient from '../client'
import type { SubscriptionPlan, SubscriptionPlanInfo } from '../types'

export interface CurrentSubscription {
  plan: SubscriptionPlan
  renews_at: string | null
  status: 'active' | 'cancelled' | 'past_due'
}

export const subscriptionsApi = {
  current: () =>
    apiClient.get<{ data: CurrentSubscription }>('/user/subscription').then((r) => r.data.data),

  plans: () =>
    apiClient
      .get<{ data: SubscriptionPlanInfo[] }>('/user/subscription/plans')
      .then((r) => r.data.data),

  // Devuelve una URL de Stripe Checkout; el front redirige con window.location.href
  checkout: (payload: { plan: SubscriptionPlan; interval: 'monthly' | 'annual' }) =>
    apiClient
      .post<{ url: string }>('/user/subscription/checkout', payload)
      .then((r) => r.data.url),

  cancel: () => apiClient.post('/user/subscription/cancel'),
}
