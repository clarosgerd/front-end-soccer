import apiClient from '../client'
import type { LoginResponse, User } from '../types'

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<LoginResponse>('/auth/register', payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>('/auth/login', payload).then((r) => r.data),

  logout: () => apiClient.post('/auth/logout'),

  me: () => apiClient.get<{ data: User }>('/user').then((r) => r.data.data),
}
