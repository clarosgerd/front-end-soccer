import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAvailableTournaments } from '@/hooks/useTournaments'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

/**
 * Onboarding: elegir torneo configurado vs crear uno propio (16/10/2026,
 * pedido real del usuario) — antes estos 2 caminos existían pero sin un
 * punto de entrada único que los presentara como la decisión inicial.
 *
 * "Elegir torneo" solo filtra la lista por plan+temporada
 * (GET /tournament/available-for-me) — una vez elegido, reusa el flujo de
 * invitación que ya existe (JoinTournamentFlow, vía /tournaments/:id/join)
 * en vez de reconstruir la creación de grupo acá.
 */
export function Onboarding() {
  const [showAvailable, setShowAvailable] = useState(false)
  const { data, isLoading, isError } = useAvailableTournaments()
  const navigate = useNavigate()
  const tournaments = data?.data ?? []

  if (showAvailable) {
    return (
      <div>
        <button
          onClick={() => setShowAvailable(false)}
          className="mb-4 text-sm text-slate-500 hover:text-slate-700"
        >
          ← Volver
        </button>
        <h1 className="mb-1 text-lg font-semibold text-slate-900">Torneos disponibles</h1>
        <p className="mb-4 text-sm text-slate-500">
          Según tu plan actual. Elegí uno para crear tu grupo e invitar pronosticadores.
        </p>

        {isLoading && <p className="text-sm text-slate-500">Cargando…</p>}
        {isError && <p className="text-sm text-red-600">No se pudieron cargar los torneos.</p>}

        {!isLoading && tournaments.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">No hay torneos disponibles para tu plan todavía.</p>
            <Link to="/subscription" className="mt-1 inline-block text-xs font-medium text-slate-900 underline">
              Ver planes →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tournaments.map((t) => (
            <Card key={t.tournament_id} className="flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900">{t.name}</h3>
                <p className="text-xs text-slate-500">{t.season} · {t.country}</p>
              </div>
              <Button onClick={() => navigate(`/tournaments/${t.tournament_id}/join`)} className="ml-3 flex-shrink-0 text-xs">
                Elegir
              </Button>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">¿Cómo querés empezar?</h1>
      <p className="mb-6 text-sm text-slate-500">
        Elegí un torneo ya configurado, o armá el tuyo desde cero.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Elegir un torneo disponible</h2>
          <p className="flex-1 text-xs text-slate-500">
            Ligas y copas ya configuradas, según tu plan y la temporada actual. Invitá gente a
            pronosticar — ellos no pagan nada por unirse, solo necesitan una suscripción para
            pronosticar.
          </p>
          <Button onClick={() => setShowAvailable(true)}>Ver torneos disponibles</Button>
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Crear mi propio torneo</h2>
          <p className="flex-1 text-xs text-slate-500">
            Armá tus propias fases, equipos y modalidad de premios. Ideal para torneos privados
            (campeonato de papás, de streamers, etc.).
          </p>
          <Link to="/tournaments">
            <Button variant="secondary" className="w-full">Crear torneo</Button>
          </Link>
        </Card>
      </div>
    </div>
  )
}
