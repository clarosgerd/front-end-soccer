import apiClient from '../client'
import type { ApiItemResponse, ApiListResponse, BetType, PredictedResult, Prediction } from '../types'

export interface CreatePredictionPayload {
  match_id: number
  group_id: number
  predicted_home_score: number
  predicted_away_score: number
  predicted_result: PredictedResult
  bet_type: BetType
  confidence: number
}

export const predictionsApi = {
  listByGroup: (groupId: number) =>
    apiClient
      .get<ApiListResponse<Prediction>>('/prediction', { params: { group_id: groupId } })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient.get<ApiItemResponse<Prediction>>(`/prediction/${id}`).then((r) => r.data.data),

  create: (payload: CreatePredictionPayload) =>
    apiClient.post<ApiItemResponse<Prediction>>('/prediction', payload).then((r) => r.data.data),

  // PUT requiere todos los campos
  update: (id: number, payload: CreatePredictionPayload) =>
    apiClient
      .put<ApiItemResponse<Prediction>>(`/prediction/${id}`, payload)
      .then((r) => r.data.data),

  remove: (id: number) => apiClient.delete(`/prediction/${id}`),
}
