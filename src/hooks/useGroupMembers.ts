import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { groupMembersApi } from '@/api/endpoints/groupMembers'

export function useGroupMembers(groupId: number) {
  return useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => groupMembersApi.list(groupId),
    enabled: Number.isFinite(groupId),
  })
}

export function usePendingMembers(groupId: number) {
  return useQuery({
    queryKey: ['groupMembers', groupId, 'pending'],
    queryFn: () => groupMembersApi.pending(groupId),
    enabled: Number.isFinite(groupId),
  })
}

export function useMyMemberships(tournamentId: number) {
  return useQuery({
    queryKey: ['myMemberships', tournamentId],
    queryFn: () => groupMembersApi.myMemberships(tournamentId),
    enabled: Number.isFinite(tournamentId),
  })
}

export function useMyTournamentMemberships() {
  return useQuery({
    queryKey: ['myTournamentMemberships'],
    queryFn: () => groupMembersApi.myTournamentMemberships(),
  })
}

export function useJoinGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groupId: number) => groupMembersApi.joinRequest(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] })
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['myMemberships'] })
      queryClient.invalidateQueries({ queryKey: ['myTournamentMemberships'] })
    },
  })
}

export function useApproveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: number) => groupMembersApi.approve(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] })
    },
  })
}

export function useRejectMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: number) => groupMembersApi.reject(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers'] })
    },
  })
}
