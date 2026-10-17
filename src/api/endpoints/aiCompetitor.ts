import type { AiCompetitorPrediction } from '../types'
import { apiClient } from '../client'

export const aiCompetitorApi = {
  status: async (groupId: number): Promise<{
    ai_competitor_enabled: boolean
    is_member: boolean
    predictions_count: number
    name: string
  }> => {
    const { data } = await apiClient.get(`/group/${groupId}/ai-competitor`)
    return data.data
  },

  toggle: async (groupId: number): Promise<{
    ai_competitor_enabled: boolean
    message: string
  }> => {
    const { data } = await apiClient.post(`/group/${groupId}/ai-competitor`)
    return data.data
  },

  regenerate: async (groupId: number): Promise<{ message: string }> => {
    const { data } = await apiClient.post(`/group/${groupId}/ai-competitor/regenerate`)
    return data.data
  },

  prediction: async (groupId: number, matchId: number): Promise<AiCompetitorPrediction | null> => {
    const { data } = await apiClient.get(`/group/${groupId}/ai-competitor/prediction/${matchId}`)
    return data.data
  },
}
