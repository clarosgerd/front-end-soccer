import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { syncApi, type EspnLeagueId } from '@/api/endpoints/sync'

export function useSyncStatus() {
  return useQuery({
    queryKey: ['syncStatus'],
    queryFn: () => syncApi.status(),
  })
}

export function useFootballCompetitions() {
  return useQuery({
    queryKey: ['syncFootballCompetitions'],
    queryFn: () => syncApi.footballCompetitions(),
    staleTime: Infinity, // lista fija del free tier, no cambia en runtime
  })
}

export function useSync() {
  return useMutation({
    mutationFn: (params: {
      type: string
      league?: EspnLeagueId
      competition?: number
      season?: number
      source?: string
      force?: boolean
    }) => syncApi.sync(params),
  })
}

// El sync corre en background (ver RunSyncJob en el backend) — pollea cada
// 5s hasta que el run termina (completed/failed), igual al patrón de
// usePaymentStatus para el pago SIP.
export function useSyncRunStatus(runId: number | null) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['sync', 'run', runId],
    queryFn: () => syncApi.runStatus(runId as number),
    enabled: !!runId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'completed' || status === 'failed' ? false : 5000
    },
    select: (data) => {
      if (data.status === 'completed' || data.status === 'failed') {
        queryClient.invalidateQueries({ queryKey: ['syncStatus'] })
      }

      return data
    },
  })
}
