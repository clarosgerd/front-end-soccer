import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { stagesApi, type StagePayload } from '@/api/endpoints/stages'

export function useStages(tournamentId: number) {
  return useQuery({
    queryKey: ['stages', tournamentId],
    queryFn: () => stagesApi.listByTournament(tournamentId),
    enabled: Number.isFinite(tournamentId),
  })
}

export function useCreateStagesBulk(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StagePayload[]) => stagesApi.createBulk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages', tournamentId] })
      queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] })
    },
  })
}

export function useDeleteStage(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => stagesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stages', tournamentId] })
      queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] })
    },
  })
}
