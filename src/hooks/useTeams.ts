import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teamsApi, type TeamPayload } from '@/api/endpoints/teams'

export function useTeams(params?: Record<string, string>, page = 1, perPage = 24) {
  return useQuery({
    queryKey: ['teams', params, page, perPage],
    queryFn: () => teamsApi.list(params, page, perPage),
  })
}

export function useCreateTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TeamPayload) => teamsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useCreateTeamsBulk() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TeamPayload[]) => teamsApi.createBulk(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useUpdateTeam(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TeamPayload) => teamsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => teamsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}

export function useToggleTeamActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => teamsApi.toggleActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
  })
}
