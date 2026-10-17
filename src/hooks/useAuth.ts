import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi, type LoginPayload, type RegisterPayload } from '@/api/endpoints/auth'
import { useAuthStore } from '@/store/authStore'
import { normalizeApiError } from '@/lib/errorHandler'

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setSession(data.user, data.token)
      navigate('/dashboard')
    },
    onError: (error) => normalizeApiError(error),
  })
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setSession(data.user, data.token)
      navigate('/dashboard')
    },
    onError: (error) => normalizeApiError(error),
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Se limpia la sesión local incluso si la llamada al backend falla
      logout()
      navigate('/login')
    },
  })
}
