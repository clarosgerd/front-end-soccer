import apiClient from '../client'
import type { ApiItemResponse, ApiListResponse, Team } from '../types'

export interface TeamPayload {
  name: string
  country: string
}

export const teamsApi = {
  list: (params?: Record<string, string>, page = 1, perPage = 24) =>
    apiClient
      .get<ApiListResponse<Team>>('/team', { params: { ...params, page, per_page: perPage } })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient.get<ApiItemResponse<Team>>(`/team/${id}`).then((r) => r.data.data),

  create: (payload: TeamPayload) =>
    apiClient.post<ApiItemResponse<Team>>('/team', payload).then((r) => r.data.data),

  createBulk: (payload: TeamPayload[]) =>
    apiClient.post<{ data: Team[] }>('/team/bulk', payload).then((r) => r.data.data),

  // PUT requiere todos los campos
  update: (id: number, payload: TeamPayload) =>
    apiClient.put<ApiItemResponse<Team>>(`/team/${id}`, payload).then((r) => r.data.data),

  toggleActive: (id: number) =>
    apiClient
      .patch<ApiItemResponse<Team>>(`/team/${id}/toggle-active`)
      .then((r) => r.data.data),

  remove: (id: number) => apiClient.delete(`/team/${id}`),
}
