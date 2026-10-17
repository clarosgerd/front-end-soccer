import apiClient from '../client'

export interface PendingResultsResponse {
  matches: Array<{
    match_id: number
    home_score: number | null
    away_score: number | null
    status: string
    match_date: string
    home?: { team_id: number; name: string; logo_url?: string | null }
    away?: { team_id: number; name: string; logo_url?: string | null }
    stage?: { stage_id: number; name: string }
  }>
  summary: {
    total: number
    finished: number
    pending: number
  }
}

export const manualMatchesApi = {
  pendingResults: (tournamentId: number) =>
    apiClient
      .get<PendingResultsResponse>(`/tournament/${tournamentId}/pending-results`)
      .then((r) => r.data),

  updateResult: (tournamentId: number, matchId: number, homeScore: number, awayScore: number) =>
    apiClient
      .patch(`/tournament/${tournamentId}/match/${matchId}/result`, {
        home_score: homeScore,
        away_score: awayScore,
      })
      .then((r) => r.data),

  updateStatus: (tournamentId: number, matchId: number, status: string) =>
    apiClient
      .patch(`/tournament/${tournamentId}/match/${matchId}/status`, { status })
      .then((r) => r.data),
}
