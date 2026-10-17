import apiClient from '../client'
import type { PoolDistributionEntry } from '../types'

export const poolApi = {
  getByGroup: (groupId: number) =>
    apiClient.get('/pool', { params: { group_id: groupId } }).then((r) => r.data),

  getDetail: (groupId: number) => apiClient.get(`/pool/${groupId}`).then((r) => r.data),

  contribute: (groupId: number) =>
    apiClient.post('/pool', { group_id: groupId }).then((r) => r.data),

  distribute: (groupId: number, distribution: PoolDistributionEntry[]) =>
    apiClient.post(`/pool/${groupId}/distribute`, { distribution }).then((r) => r.data),
}
