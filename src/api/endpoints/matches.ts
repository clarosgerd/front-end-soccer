import apiClient from '../client'
import type { ApiItemResponse, ApiListResponse, Match, MatchStatus } from '../types'

export interface MatchPayload {
  home_team_id: number
  away_team_id: number
  tournament_id: number
  stage_id: number
  match_date: string
  status: MatchStatus
}

export const matchesApi = {
  list: (params?: Record<string, string>) =>
    apiClient.get<ApiListResponse<Match>>('/match', { params }).then((r) => r.data),

  get: (id: number) =>
    apiClient
      .get<ApiItemResponse<Match>>(`/match/${id}`, { params: { includeHome: 1, includeAway: 1 } })
      .then((r) => r.data.data),

  create: (payload: MatchPayload) =>
    apiClient.post<ApiItemResponse<Match>>('/match', payload).then((r) => r.data.data),

  createBulk: (payload: MatchPayload[]) =>
    apiClient.post<{ data: Match[] }>('/match/bulk', payload).then((r) => r.data.data),

  // PUT requiere todos los campos
  update: (id: number, payload: MatchPayload) =>
    apiClient.put<ApiItemResponse<Match>>(`/match/${id}`, payload).then((r) => r.data.data),

  remove: (id: number) => apiClient.delete(`/match/${id}`),
}
