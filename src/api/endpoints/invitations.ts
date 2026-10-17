import apiClient from '../client'

export interface Invitation {
  invitation_id: number
  group_id: number
  email: string
  code: string
  status: 'pending' | 'accepted' | 'cancelled'
  group?: { group_id: number; name: string }
}

export const invitationsApi = {
  list: () => apiClient.get<{ data: Invitation[] }>('/invitation').then((r) => r.data.data),

  send: (payload: { group_id: number; email: string }) =>
    apiClient.post<{ data: Invitation }>('/invitation', payload).then((r) => r.data.data),

  acceptByCode: (code: string) =>
    apiClient.post('/invitation/accept-code', { code }).then((r) => r.data),

  acceptById: (id: number) =>
    apiClient.post(`/invitation/${id}/accept`).then((r) => r.data),

  cancel: (id: number) => apiClient.delete(`/invitation/${id}`),
}
