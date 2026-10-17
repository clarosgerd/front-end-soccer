import apiClient from '../client'
import type { ApiItemResponse, ApiListResponse, Group } from '../types'

export interface CreateGroupPayload {
  tournament_id?: number | null
  name: string
  description: string
  is_public: '0' | '1'
  max_members: string
  bet_amount: string
  prize_1st_pct: string
  prize_2nd_pct: string
  prize_3rd_pct: string
  pool_active: '0' | '1'
  exact_score_points: string
  match_result_points: string
  correct_goal_points: string
  unique_exact_points: string
  multiplier_dieciseisavos: string
  multiplier_octavos: string
  multiplier_cuartos: string
  multiplier_semifinal: string
  multiplier_final: string
}

export const groupsApi = {
  list: (page = 1, perPage = 12) =>
    apiClient
      .get<ApiListResponse<Group>>('/group', { params: { page, per_page: perPage } })
      .then((r) => r.data),

  listByTournament: (tournamentId: number, page = 1, perPage = 20) =>
    apiClient
      .get<ApiListResponse<Group>>('/group', {
        params: { tournament_id: tournamentId, page, per_page: perPage },
      })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient.get<ApiItemResponse<Group>>(`/group/${id}`).then((r) => r.data.data),

  // Recomendado por la API: crea el grupo con scoring/pool defaults ya seteados
  createWithDefaults: (payload: CreateGroupPayload) =>
    apiClient.post<ApiItemResponse<Group>>('/group/first', payload).then((r) => r.data.data),

  // PUT requiere todos los campos
  update: (id: number, payload: CreateGroupPayload) =>
    apiClient.put<ApiItemResponse<Group>>(`/group/${id}`, payload).then((r) => r.data.data),

  toggleActive: (id: number) =>
    apiClient
      .patch<ApiItemResponse<Group>>(`/group/${id}/toggle-active`)
      .then((r) => r.data.data),

  remove: (id: number) => apiClient.delete(`/group/${id}`),

  leaderboard: (groupId: number) =>
    apiClient.get(`/group/${groupId}/leaderboard`).then((r) => r.data),

  scoringDashboard: (groupId: number) =>
    apiClient.get(`/group/${groupId}/scoring`).then((r) => r.data.data),

  userScoring: (groupId: number, userId: number) =>
    apiClient.get(`/group/${groupId}/scoring/user/${userId}`).then((r) => r.data.data),
}

// Valores default recomendados por la API para no obligar al usuario a llenar
// los 15 campos de scoring/pool a mano al crear un grupo.
export const DEFAULT_GROUP_VALUES: Omit<CreateGroupPayload, 'name' | 'description'> = {
  is_public: '1',
  max_members: '20',
  bet_amount: '0',
  prize_1st_pct: '60',
  prize_2nd_pct: '30',
  prize_3rd_pct: '10',
  pool_active: '0',
  exact_score_points: '10',
  match_result_points: '5',
  correct_goal_points: '3',
  unique_exact_points: '15',
  multiplier_dieciseisavos: '1.5',
  multiplier_octavos: '2.0',
  multiplier_cuartos: '3.0',
  multiplier_semifinal: '5.0',
  multiplier_final: '10.0',
}
