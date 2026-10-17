import { useNavigate, useParams } from 'react-router-dom'
import { useTournament, useUpdateTournament } from '@/hooks/useTournaments'
import { useAuthStore } from '@/store/authStore'
import { normalizeApiError } from '@/lib/errorHandler'
import { TournamentForm } from '@/components/domain/TournamentForm'
import { toast } from '@/lib/toast'
import { Card } from '@/components/ui/Card'

export function TournamentEdit() {
  const { tournamentId } = useParams()
  const id = Number(tournamentId)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data: tournament, isLoading } = useTournament(id)
  const updateTournament = useUpdateTournament(id)
  const error = updateTournament.error ? normalizeApiError(updateTournament.error) : null

  const canEdit = user?.role === 'admin' || tournament?.created_by === user?.user_id

  if (isLoading) return <p className="text-sm text-slate-500">Cargando torneo…</p>
  if (!tournament) return <p className="text-sm text-red-600">Torneo no encontrado.</p>
  if (!canEdit) return <p className="text-sm text-red-600">No tenés permisos para editar este torneo.</p>

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold text-slate-900">Editar {tournament.name}</h1>
      <Card>
        <TournamentForm
          initialValues={{
            name: tournament.name,
            season: tournament.season,
            country: tournament.country,
            country_code: tournament.country_code,
            start_date: tournament.start_date,
            end_date: tournament.end_date,
            actived: tournament.actived ? '1' : '0',
            is_promotional: tournament.is_promotional ? '1' : '0',
            promotional_tier_required: tournament.promotional_tier_required,
            promotional_ends_at: tournament.promotional_ends_at,
          }}
          onSubmit={(payload) =>
            updateTournament.mutate(payload, {
              onSuccess: () => {
                toast.success('Torneo actualizado')
                navigate(`/tournaments/${id}/bracket`)
              },
            })
          }
          isSubmitting={updateTournament.isPending}
          error={error}
          submitLabel="Guardar cambios"
        />
      </Card>
    </div>
  )
}
