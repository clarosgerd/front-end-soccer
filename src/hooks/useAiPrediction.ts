import { useQuery } from '@tanstack/react-query'
import { aiPredictionsApi } from '@/api/endpoints/aiPredictions'

export function useAiPrediction(matchId: number | undefined) {
  return useQuery({
    queryKey: ['aiPrediction', matchId],
    queryFn: () => aiPredictionsApi.byMatch(matchId!),
    enabled: !!matchId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useTournamentAiPredictions(tournamentId: number | undefined) {
  return useQuery({
    queryKey: ['aiPredictions', 'tournament', tournamentId],
    queryFn: () => aiPredictionsApi.byTournament(tournamentId!),
    enabled: !!tournamentId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAiPredictionAccuracy() {
  return useQuery({
    queryKey: ['aiPredictions', 'accuracy'],
    queryFn: () => aiPredictionsApi.accuracy(),
    staleTime: 60 * 60 * 1000,
  })
}
