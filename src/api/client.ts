import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import type { ApiErrorResponse } from './types'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Interceptor de request: agrega el Bearer token si el usuario está logueado.
// Los GET públicos no se ven afectados porque simplemente no se agrega el header
// cuando no hay token, y el backend no lo exige para lectura.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de response: normaliza errores y limpia sesión en 401.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export default apiClient
