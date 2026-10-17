import apiClient from '../client'
import type { ApiListResponse, Country } from '../types'

export const countriesApi = {
  list: () =>
    apiClient
      .get<ApiListResponse<Country>>('/country')
      .then((r) => r.data.data),
}
