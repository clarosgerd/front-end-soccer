import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/endpoints/admin'

export function useAdminUsers(params: { email?: string; role?: string; page?: number } = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.users(params),
  })
}

export function useAdminUser(userId: number | null) {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => adminApi.user(userId as number),
    enabled: userId !== null,
  })
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: Parameters<typeof adminApi.updateUser>[1] }) =>
      adminApi.updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: (userId: number) => adminApi.resetPassword(userId),
  })
}

export function useToggleUserSuspended() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => adminApi.toggleSuspended(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export function useAdminSubscriptions(params: { status?: string; page?: number } = {}) {
  return useQuery({
    queryKey: ['admin', 'subscriptions', params],
    queryFn: () => adminApi.subscriptions(params),
  })
}

export function useConfirmAdminSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (subscriptionId: number) => adminApi.confirmSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] })
    },
  })
}

export function useAdminPayments(params: { status?: string; page?: number } = {}) {
  return useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: () => adminApi.payments(params),
  })
}
