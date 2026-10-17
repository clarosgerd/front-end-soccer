import { useParams } from 'react-router-dom'
import { JoinTournamentFlow } from '@/components/domain/JoinTournamentFlow'

export function JoinTournamentPage() {
  const { tournamentId } = useParams<{ tournamentId: string }>()
  const id = Number(tournamentId)

  if (!Number.isFinite(id)) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-medium text-red-700">ID de torneo inválido.</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">Unirse al torneo</h1>
      <JoinTournamentFlow tournamentId={id} />
    </div>
  )
}
