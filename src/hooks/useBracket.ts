import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bracketApi } from '@/api/endpoints/bracket'

// Polling cada 30s: no hay WebSocket todavía (ver TODO.md del backend),
// así que el bracket se refresca solo mientras la pestaña está activa.
const LIVE_REFETCH_MS = 30_000

export function useBracket(tournamentId: number) {
  return useQuery({
    queryKey: ['bracket', tournamentId],
    queryFn: () => bracketApi.getFull(tournamentId),
    refetchInterval: LIVE_REFETCH_MS,
    enabled: Number.isFinite(tournamentId),
  })
}

export function useApproveGroup(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groupId: number) => bracketApi.approveGroup(groupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] }),
  })
}

export function useRejectGroup(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (groupId: number) => bracketApi.rejectGroup(groupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] }),
  })
}

export function useSuggestAdvancements(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (stageId: number) => bracketApi.suggestAdvancements(stageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] }),
  })
}

export function useConfirmAdvancement(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (advancementId: number) => bracketApi.confirmAdvancement(advancementId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] }),
  })
}

export function useConfirmAllAdvancements(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (stageId: number) => bracketApi.confirmAllAdvancements(stageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] }),
  })
}

export function useCreateTournamentGroup(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { stage_id: number; name: string; group_order: number }) =>
      bracketApi.createGroup(tournamentId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] }),
  })
}

export function useAssignTeamsToGroup(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, teamIds }: { groupId: number; teamIds: number[] }) =>
      bracketApi.assignTeams(groupId, teamIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] }),
  })
}

export function useRemoveTeamFromGroup(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, teamId }: { groupId: number; teamId: number }) =>
      bracketApi.removeTeam(groupId, teamId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] }),
  })
}

export function useAdvancementRules(stageId: number) {
  return useQuery({
    queryKey: ['advancementRules', stageId],
    queryFn: () => bracketApi.listRules(stageId),
    enabled: Number.isFinite(stageId),
  })
}
