import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { predictionsApi, type CreatePredictionPayload } from '@/api/endpoints/predictions'
import { matchesApi } from '@/api/endpoints/matches'

export function useMatches(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['matches', params],
    queryFn: () => matchesApi.list(params),
  })
}

export function usePredictionsByGroup(groupId: number) {
  return useQuery({
    queryKey: ['predictions', groupId],
    queryFn: () => predictionsApi.listByGroup(groupId),
    enabled: Number.isFinite(groupId),
  })
}

export function useCreatePrediction(groupId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePredictionPayload) => predictionsApi.create(payload),
    onSuccess: () => {
      // Invalida predicciones y el leaderboard del grupo (aunque el punteo
      // recién se calcula cuando el match termina, mantiene todo consistente)
      queryClient.invalidateQueries({ queryKey: ['predictions', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'leaderboard'] })
    },
  })
}

export function useDeletePrediction(groupId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (predictionId: number) => predictionsApi.remove(predictionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['predictions', groupId] }),
  })
}
