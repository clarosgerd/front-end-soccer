import type { ReactNode } from 'react'
import { useTournamentRole, type TournamentRole } from '@/hooks/useTournamentRole'

interface TournamentRoleGuardProps {
  tournamentId: number
  allowed: TournamentRole[]
  children: ReactNode
  fallback?: ReactNode
}

export function TournamentRoleGuard({ tournamentId, allowed, children, fallback = null }: TournamentRoleGuardProps) {
  const { role } = useTournamentRole(tournamentId)

  if (!allowed.includes(role)) {
    return fallback
  }

  return children
}
