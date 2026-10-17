import apiClient from '../client'
import type { ApiItemResponse, ApiListResponse, Stage } from '../types'

export interface StagePayload {
  tournament_id: number
  name: string
  stage_order: string
  is_knockout: '0' | '1'
}

export const stagesApi = {
  listByTournament: (tournamentId: number) =>
    apiClient
      .get<ApiListResponse<Stage>>('/stage', { params: { 'tournament_id[eq]': String(tournamentId) } })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient.get<ApiItemResponse<Stage>>(`/stage/${id}`).then((r) => r.data.data),

  create: (payload: StagePayload) =>
    apiClient.post<ApiItemResponse<Stage>>('/stage', payload).then((r) => r.data.data),

  createBulk: (payload: StagePayload[]) =>
    apiClient.post<{ data: Stage[] }>('/stage/bulk', payload).then((r) => r.data.data),

  update: (id: number, payload: StagePayload) =>
    apiClient.put<ApiItemResponse<Stage>>(`/stage/${id}`, payload).then((r) => r.data.data),

  remove: (id: number) => apiClient.delete(`/stage/${id}`),
}
