import apiClient from '../client'
import type {
  SipCheckoutResponse,
  SipPaymentStatus,
  SubscriptionPlan,
  SubscriptionPlanInfo,
} from '../types'

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

  // Genera un QR de pago SIP (Bolivianos); el front lo muestra y hace polling
  // de paymentStatus() hasta que se confirme — ya no hay redirección externa.
  checkout: (payload: { plan: SubscriptionPlan; interval: 'monthly' | 'annual' }) =>
    apiClient
      .post<SipCheckoutResponse>('/user/subscription/checkout', {
        plan: payload.plan,
        billing: payload.interval,
      })
      .then((r) => r.data),

  paymentStatus: (referencia: string) =>
    apiClient
      .get<SipPaymentStatus>(`/user/subscription/payment-status/${referencia}`)
      .then((r) => r.data),

  cancel: () => apiClient.post('/user/subscription/cancel'),
}
