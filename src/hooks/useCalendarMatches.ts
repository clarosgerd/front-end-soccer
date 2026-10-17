import { useQuery } from '@tanstack/react-query'
import { matchesApi } from '@/api/endpoints/matches'

export function useCalendarMatches(tournamentId: number) {
  return useQuery({
    queryKey: ['calendar', tournamentId],
    queryFn: () =>
      matchesApi.list({
        'tournament_id[eq]': String(tournamentId),
        includeHome: '1',
        includeAway: '1',
        includeStage: '1',
      }),
    enabled: Number.isFinite(tournamentId),
  })
}
