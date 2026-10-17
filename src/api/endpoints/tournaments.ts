import apiClient from '../client'
import type { ApiItemResponse, ApiListResponse, Tournament } from '../types'

export interface CreateTournamentPayload {
  name: string
  season: string
  country: string
  country_code: string
  start_date: string
  end_date: string
  actived: '0' | '1'
  is_promotional?: '0' | '1'
  promotional_tier_required?: number | null
  promotional_ends_at?: string | null
}

export const tournamentsApi = {
  list: (page = 1, perPage = 12) =>
    apiClient
      .get<ApiListResponse<Tournament>>('/tournament', { params: { page, per_page: perPage } })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient
      .get<ApiItemResponse<Tournament>>(`/tournament/${id}`)
      .then((r) => r.data.data),

  create: (payload: CreateTournamentPayload) =>
    apiClient
      .post<ApiItemResponse<Tournament>>('/tournament', payload)
      .then((r) => r.data.data),

  // PUT requiere todos los campos (no hay PATCH en esta API)
  update: (id: number, payload: CreateTournamentPayload) =>
    apiClient
      .put<ApiItemResponse<Tournament>>(`/tournament/${id}`, payload)
      .then((r) => r.data.data),

  toggleActive: (id: number) =>
    apiClient
      .patch<ApiItemResponse<Tournament>>(`/tournament/${id}/toggle-active`)
      .then((r) => r.data.data),

  publish: (id: number) =>
    apiClient
      .patch<ApiItemResponse<Tournament>>(`/tournament/${id}/publish`)
      .then((r) => r.data.data),

  goLive: (id: number) =>
    apiClient
      .patch<ApiItemResponse<Tournament>>(`/tournament/${id}/go-live`)
      .then((r) => r.data.data),

  close: (id: number) =>
    apiClient
      .patch<ApiItemResponse<Tournament>>(`/tournament/${id}/close`)
      .then((r) => r.data.data),

  remove: (id: number) => apiClient.delete(`/tournament/${id}`),

  managers: (id: number) =>
    apiClient
      .get<{ managers: { member_id: number; user_id: number; name: string; email: string }[] }>(
        `/tournament/${id}/managers`,
      )
      .then((r) => r.data.managers),

  assignManager: (id: number, userId: number) =>
    apiClient
      .post(`/tournament/${id}/assign-manager`, { user_id: userId })
      .then((r) => r.data),

  removeManager: (id: number, userId: number) =>
    apiClient
      .post(`/tournament/${id}/remove-manager`, { user_id: userId })
      .then((r) => r.data),
}
