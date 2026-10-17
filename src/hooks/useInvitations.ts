import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invitationsApi } from '@/api/endpoints/invitations'

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: () => invitationsApi.list(),
  })
}

export function useSendInvitation(groupId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (email: string) => invitationsApi.send({ group_id: groupId, email }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations'] }),
  })
}

export function useAcceptInvitationByCode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => invitationsApi.acceptByCode(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => invitationsApi.acceptById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useCancelInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => invitationsApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invitations'] }),
  })
}
