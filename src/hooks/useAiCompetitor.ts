import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiCompetitorApi } from '../api/endpoints/aiCompetitor'

export function useAiCompetitorStatus(groupId: number | undefined) {
  return useQuery({
    queryKey: ['ai-competitor-status', groupId],
    queryFn: () => aiCompetitorApi.status(groupId!),
    enabled: !!groupId,
  })
}

export function useAiCompetitorPrediction(groupId: number | undefined, matchId: number | undefined) {
  return useQuery({
    queryKey: ['ai-competitor-prediction', groupId, matchId],
    queryFn: () => aiCompetitorApi.prediction(groupId!, matchId!),
    enabled: !!groupId && !!matchId,
  })
}

export function useToggleAiCompetitor(groupId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => aiCompetitorApi.toggle(groupId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-competitor-status', groupId] })
      queryClient.invalidateQueries({ queryKey: ['group', groupId] })
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      queryClient.invalidateQueries({ queryKey: ['predictions'] })
    },
  })
}

export function useRegenerateAiCompetitor(groupId: number | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => aiCompetitorApi.regenerate(groupId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-competitor-status', groupId] })
      queryClient.invalidateQueries({ queryKey: ['ai-competitor-prediction'] })
    },
  })
}
