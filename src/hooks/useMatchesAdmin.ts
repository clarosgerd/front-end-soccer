import { useMutation, useQueryClient } from '@tanstack/react-query'
import { matchesApi, type MatchPayload } from '@/api/endpoints/matches'

export function useCreateMatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: MatchPayload) => matchesApi.create(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['bracket', payload.tournament_id] })
    },
  })
}

export function useCreateMatchesBulk() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: MatchPayload[]) => matchesApi.createBulk(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      if (payload.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['bracket', payload[0].tournament_id] })
      }
    },
  })
}

export function useUpdateMatch(id: number, tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: MatchPayload) => matchesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] })
    },
  })
}

export function useDeleteMatch(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => matchesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] })
      queryClient.invalidateQueries({ queryKey: ['bracket', tournamentId] })
    },
  })
}
