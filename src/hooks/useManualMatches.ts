import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { manualMatchesApi } from '@/api/endpoints/manualMatches'

export function usePendingResults(tournamentId: number) {
  return useQuery({
    queryKey: ['pendingResults', tournamentId],
    queryFn: () => manualMatchesApi.pendingResults(tournamentId),
    enabled: Number.isFinite(tournamentId),
  })
}

export function useUpdateMatchResult(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      matchId,
      homeScore,
      awayScore,
    }: {
      matchId: number
      homeScore: number
      awayScore: number
    }) => manualMatchesApi.updateResult(tournamentId, matchId, homeScore, awayScore),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingResults', tournamentId] })
      queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] })
    },
  })
}

export function useUpdateMatchStatus(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ matchId, status }: { matchId: number; status: string }) =>
      manualMatchesApi.updateStatus(tournamentId, matchId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingResults', tournamentId] })
      queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] })
    },
  })
}
