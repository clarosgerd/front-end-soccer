import apiClient from '../client'
import type { ApiItemResponse, ApiListResponse, GroupMember } from '../types'

export const groupMembersApi = {
  list: (groupId: number) =>
    apiClient
      .get<ApiListResponse<GroupMember>>('/member', { params: { group_id: groupId } })
      .then((r) => r.data),

  joinRequest: (groupId: number) =>
    apiClient
      .post<ApiItemResponse<GroupMember>>(`/group/${groupId}/join`)
      .then((r) => r.data.data),

  approve: (memberId: number) =>
    apiClient
      .post<ApiItemResponse<GroupMember>>(`/member/${memberId}/approve`)
      .then((r) => r.data.data),

  reject: (memberId: number) =>
    apiClient.post(`/member/${memberId}/reject`).then((r) => r.data),

  pending: (groupId: number) =>
    apiClient
      .get<ApiListResponse<GroupMember>>(`/group/${groupId}/pending-members`)
      .then((r) => r.data),

  myMemberships: (tournamentId: number) =>
    apiClient
      .get<{ data: { group_id: number; status: string; is_admin: number }[] }>(
        `/tournament/${tournamentId}/my-memberships`,
      )
      .then((r) => r.data.data),

  myTournamentMemberships: () =>
    apiClient
      .get<{ data: number[] }>('/my-tournament-memberships')
      .then((r) => r.data.data),
}
