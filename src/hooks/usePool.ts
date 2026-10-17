import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { poolApi } from '@/api/endpoints/pool'
import type { PoolDistributionEntry } from '@/api/types'

export function usePoolDetail(groupId: number) {
  return useQuery({
    queryKey: ['pool', groupId],
    queryFn: () => poolApi.getDetail(groupId),
    enabled: Number.isFinite(groupId),
  })
}

export function useContributeToPool(groupId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => poolApi.contribute(groupId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pool', groupId] }),
  })
}

export function useDistributePool(groupId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (distribution: PoolDistributionEntry[]) =>
      poolApi.distribute(groupId, distribution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'leaderboard'] })
    },
  })
}
