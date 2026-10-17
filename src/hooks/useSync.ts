import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { syncApi, type EspnLeagueId } from '@/api/endpoints/sync'

export function useSyncStatus() {
  return useQuery({
    queryKey: ['syncStatus'],
    queryFn: () => syncApi.status(),
  })
}

export function useSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      type: string
      league?: EspnLeagueId
      season?: number
      source?: string
      force?: boolean
    }) => syncApi.sync(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncStatus'] })
    },
  })
}
