import { useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTournament } from './useTournaments'
import { useMyMemberships } from './useGroupMembers'

export type TournamentRole = 'admin' | 'owner' | 'manager' | 'predictor' | 'viewer'

export function useTournamentRole(tournamentId: number) {
  const user = useAuthStore((s) => s.user)
  const { data: tournament } = useTournament(tournamentId)
  const { data: memberships } = useMyMemberships(tournamentId)

  const role = useMemo<TournamentRole>(() => {
    if (!user) return 'viewer'
    if (user.role === 'admin') return 'admin'
    if (tournament?.created_by === user.user_id) return 'owner'

    if (memberships?.data) {
      const groupAdmin = memberships.data.find(
        (m) => m.is_admin === 1 && m.status === 'accepted',
      )
      if (groupAdmin) return 'manager'

      const member = memberships.data.find((m) => m.status === 'accepted')
      if (member) return 'predictor'
    }

    return 'viewer'
  }, [user, tournament, memberships])

  return { role, isAdmin: role === 'admin', isOwner: role === 'owner', isManager: role === 'manager', isPredictor: role === 'predictor' }
}
