import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { groupsApi, type CreateGroupPayload } from '@/api/endpoints/groups'

export function useGroups(page = 1, perPage = 12) {
  return useQuery({
    queryKey: ['groups', page, perPage],
    queryFn: () => groupsApi.list(page, perPage),
  })
}

export function useTournamentGroups(tournamentId: number | null, page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['groups', 'tournament', tournamentId, page, perPage],
    queryFn: () => groupsApi.listByTournament(tournamentId!, page, perPage),
    enabled: Number.isFinite(tournamentId) && tournamentId !== null,
  })
}

export function useGroup(id: number) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => groupsApi.get(id),
    enabled: Number.isFinite(id),
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => groupsApi.createWithDefaults(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useUpdateGroup(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateGroupPayload) => groupsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['groups', id] })
    },
  })
}

export function useDeleteGroup() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => groupsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })
}

export function useToggleGroupActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => groupsApi.toggleActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })
}

// Leaderboard con polling: se actualiza automático tras el scoring de cada match,
// así que conviene refrescarlo periódicamente mientras hay partidos en vivo.
export function useLeaderboard(groupId: number) {
  return useQuery({
    queryKey: ['groups', groupId, 'leaderboard'],
    queryFn: () => groupsApi.leaderboard(groupId),
    enabled: Number.isFinite(groupId),
    refetchInterval: 30_000,
  })
}

export function useScoringDashboard(groupId: number) {
  return useQuery({
    queryKey: ['groups', groupId, 'scoring'],
    queryFn: () => groupsApi.scoringDashboard(groupId),
    enabled: Number.isFinite(groupId),
    refetchInterval: 30_000,
  })
}
