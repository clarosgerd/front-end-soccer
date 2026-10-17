import apiClient from '../client'

// Laravel paginate() crudo (distinto del shape de Resource de ApiListResponse)
export interface AdminPaginated<T> {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

export interface AdminUser {
  user_id: number
  first_name: string
  last_name: string
  email: string
  role: string | null
  subscription_tier: string
  subscription_expires_at: string | null
  suspended_at: string | null
}

export interface AdminUserDetail extends AdminUser {
  subscription?: {
    subscription_id: number
    plan: string
    status: string
    payments: AdminPayment[]
  } | null
}

export interface AdminSubscription {
  subscription_id: number
  user_id: number
  plan: string
  status: string
  is_annual: boolean
  sip_referencia: string | null
  monthly_price: number
  annual_price: number
  user: AdminUser
}

export interface AdminPayment {
  payment_id: number
  amount: number
  currency: string
  status: string
  description: string
  paid_at: string
}

export const adminApi = {
  users: (params: { email?: string; role?: string; page?: number } = {}) =>
    apiClient.get<AdminPaginated<AdminUser>>('/admin/users', { params }).then((r) => r.data),

  user: (userId: number) =>
    apiClient.get<{ data: AdminUserDetail }>(`/admin/users/${userId}`).then((r) => r.data.data),

  updateUser: (
    userId: number,
    payload: Partial<Pick<AdminUser, 'role' | 'subscription_tier' | 'subscription_expires_at'>>,
  ) =>
    apiClient.patch<{ data: AdminUser }>(`/admin/users/${userId}`, payload).then((r) => r.data.data),

  resetPassword: (userId: number) =>
    apiClient
      .post<{ message: string; temporary_password: string }>(`/admin/users/${userId}/reset-password`)
      .then((r) => r.data),

  toggleSuspended: (userId: number) =>
    apiClient.post<{ data: AdminUser }>(`/admin/users/${userId}/toggle-suspended`).then((r) => r.data.data),

  subscriptions: (params: { status?: string; page?: number } = {}) =>
    apiClient
      .get<AdminPaginated<AdminSubscription>>('/admin/subscriptions', { params })
      .then((r) => r.data),

  confirmSubscription: (subscriptionId: number) =>
    apiClient
      .post<{ data: AdminSubscription }>(`/admin/subscriptions/${subscriptionId}/confirm`)
      .then((r) => r.data.data),

  payments: (params: { status?: string; page?: number } = {}) =>
    apiClient.get<AdminPaginated<AdminPayment>>('/admin/payments', { params }).then((r) => r.data),
}
