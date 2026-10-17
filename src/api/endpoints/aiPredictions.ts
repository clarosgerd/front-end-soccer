import apiClient from '../client'
import type { AiPrediction, AiPredictionAccuracy } from '../types'

export const aiPredictionsApi = {
  byMatch: (matchId: number) =>
    apiClient
      .get<{ data: AiPrediction | null }>(`/match/${matchId}/ai-prediction`)
      .then((r) => r.data.data),

  byTournament: (tournamentId: number) =>
    apiClient
      .get<{ data: AiPrediction[] }>(`/tournament/${tournamentId}/ai-predictions`)
      .then((r) => r.data.data),

  accuracy: () =>
    apiClient
      .get<{ data: AiPredictionAccuracy }>('/ai-predictions/accuracy')
      .then((r) => r.data.data),
}
