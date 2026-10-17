import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tournamentsApi, type CreateTournamentPayload } from '@/api/endpoints/tournaments'

export function useTournaments(page = 1, perPage = 12) {
  return useQuery({
    queryKey: ['tournaments', page, perPage],
    queryFn: () => tournamentsApi.list(page, perPage),
  })
}

export function useTournament(id: number) {
  return useQuery({
    queryKey: ['tournaments', id],
    queryFn: () => tournamentsApi.get(id),
    enabled: Number.isFinite(id),
  })
}

export function useCreateTournament() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTournamentPayload) => tournamentsApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments'] }),
  })
}

export function useUpdateTournament(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTournamentPayload) => tournamentsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      queryClient.invalidateQueries({ queryKey: ['tournaments', id] })
    },
  })
}

export function useDeleteTournament() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tournamentsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments'] }),
  })
}

export function useToggleTournamentActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tournamentsApi.toggleActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments'] }),
  })
}

export function usePublishTournament(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => tournamentsApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      queryClient.invalidateQueries({ queryKey: ['tournaments', id] })
    },
  })
}

export function useGoLiveTournament(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => tournamentsApi.goLive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      queryClient.invalidateQueries({ queryKey: ['tournaments', id] })
    },
  })
}

export function useCloseTournament(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => tournamentsApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
      queryClient.invalidateQueries({ queryKey: ['tournaments', id] })
    },
  })
}

export function useTournamentManagers(tournamentId: number) {
  return useQuery({
    queryKey: ['tournaments', tournamentId, 'managers'],
    queryFn: () => tournamentsApi.managers(tournamentId),
    enabled: Number.isFinite(tournamentId),
  })
}

export function useAssignManager(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => tournamentsApi.assignManager(tournamentId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId, 'managers'] }),
  })
}

export function useRemoveManager(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: number) => tournamentsApi.removeManager(tournamentId, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId, 'managers'] }),
  })
}

export function useAvailableTournaments(page = 1, perPage = 12) {
  return useQuery({
    queryKey: ['tournaments', 'available-for-me', page, perPage],
    queryFn: () => tournamentsApi.availableForMe(page, perPage),
  })
}

export function useSyncTournament(tournamentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => tournamentsApi.sync(tournamentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tournaments', tournamentId] }),
  })
}
