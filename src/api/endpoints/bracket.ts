import apiClient from '../client'
import type {
  AdvancementRule,
  ApiItemResponse,
  BracketResponse,
  BracketTournamentGroup,
} from '../types'

export const bracketApi = {
  // Bracket público completo o por stage
  getFull: (tournamentId: number) =>
    apiClient
      .get<BracketResponse>(`/tournament/${tournamentId}/bracket`)
      .then((r) => r.data),

  getStage: (tournamentId: number, stageId: number) =>
    apiClient
      .get<BracketResponse>(`/tournament/${tournamentId}/bracket/${stageId}`)
      .then((r) => r.data),

  // Tournament groups (Grupo A, B, C...)
  createGroup: (tournamentId: number, payload: { stage_id: number; name: string; group_order: number }) =>
    apiClient
      .post<ApiItemResponse<BracketTournamentGroup>>(`/tournament/${tournamentId}/group`, payload)
      .then((r) => r.data.data),

  getGroup: (groupId: number) =>
    apiClient
      .get<ApiItemResponse<BracketTournamentGroup>>(`/tournament-group/${groupId}`)
      .then((r) => r.data.data),

  assignTeams: (groupId: number, teamIds: number[]) =>
    apiClient.post(`/tournament-group/${groupId}/teams`, { team_ids: teamIds }),

  removeTeam: (groupId: number, teamId: number) =>
    apiClient.delete(`/tournament-group/${groupId}/teams/${teamId}`),

  approveGroup: (groupId: number) =>
    apiClient.post(`/tournament-group/${groupId}/approve`),

  rejectGroup: (groupId: number) =>
    apiClient.post(`/tournament-group/${groupId}/reject`),

  // Advancement rules
  listRules: (stageId: number) =>
    apiClient
      .get<ApiItemResponse<AdvancementRule[]>>(`/stage/${stageId}/advancement-rules`)
      .then((r) => r.data.data),

  createRule: (
    stageId: number,
    payload: { next_stage_id: number; rule_type: string; rule_value?: number; description?: string }
  ) => apiClient.post(`/stage/${stageId}/advancement-rule`, payload),

  // Advancements: sugerir y confirmar
  listAdvancements: (stageId: number) =>
    apiClient.get(`/stage/${stageId}/advancements`).then((r) => r.data),

  suggestAdvancements: (stageId: number) =>
    apiClient.post(`/stage/${stageId}/advancements/suggest`),

  confirmAdvancement: (advancementId: number) =>
    apiClient.put(`/advancement/${advancementId}/confirm`),

  confirmAllAdvancements: (stageId: number) =>
    apiClient.post(`/stage/${stageId}/advancements/confirm-all`),

  // Standings
  getStageStandings: (stageId: number) =>
    apiClient.get(`/stage/${stageId}/standings`).then((r) => r.data),

  getGroupStandings: (stageId: number, groupId: number) =>
    apiClient.get(`/stage/${stageId}/group/${groupId}/standings`).then((r) => r.data),
}
