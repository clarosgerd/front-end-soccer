import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useBracket } from '@/hooks/useBracket'
import { useTournament } from '@/hooks/useTournaments'

type ViewTab = 'groups' | 'knockout'

export function BracketView() {
  const { tournamentId } = useParams()
  const id = Number(tournamentId)
  const { data, isLoading, isError } = useBracket(id)
  const { data: tournament } = useTournament(id)
  const [activeTab, setActiveTab] = useState<ViewTab>('groups')

  if (isLoading) return <p className="text-sm text-slate-500">Cargando bracket…</p>
  if (isError) return <p className="text-sm text-red-600">No se pudo cargar el bracket.</p>

  const groupStages = data?.bracket.filter((s) => !s.is_knockout) ?? []
  const knockoutStages = data?.bracket.filter((s) => s.is_knockout) ?? []

  const isPromotional = tournament && Number(tournament.is_promotional) === 1

  return (
    <div>
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{data?.tournament_name}</h1>
          {tournament && (
            <p className="text-xs text-slate-500">
              {tournament.season} · {tournament.country}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPromotional && (
            <span className="rounded bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              Torneo promocional
              {tournament.promotional_ends_at && (
                <> · hasta {new Date(tournament.promotional_ends_at).toLocaleDateString('es-AR')}</>
              )}
            </span>
          )}
          <Link
            to={`/tournaments/${id}/admin`}
            className="text-sm text-slate-500 hover:text-slate-900 hover:underline"
          >
            Administrar →
          </Link>
        </div>
      </div>

      <div className="mb-5 flex gap-2 border-b border-slate-200 pb-3">
        {groupStages.length > 0 && (
          <button
            onClick={() => setActiveTab('groups')}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'groups'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fase de grupos
          </button>
        )}
        {knockoutStages.length > 0 && (
          <button
            onClick={() => setActiveTab('knockout')}
            className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'knockout'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Eliminación directa
          </button>
        )}
      </div>

      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {groupStages.map((stage) =>
            stage.groups?.map((group) => (
              <div
                key={group.group_id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium">{group.name}</p>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      group.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {group.status === 'approved' ? 'Aprobado' : 'Pendiente'}
                  </span>
                </div>

                <table className="mb-3 w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="pb-1.5 text-left font-normal">#</th>
                      <th className="pb-1.5 text-left font-normal">Equipo</th>
                      <th className="hidden pb-1.5 text-center font-normal sm:table-cell">PJ</th>
                      <th className="hidden pb-1.5 text-center font-normal sm:table-cell">PG</th>
                      <th className="hidden pb-1.5 text-center font-normal sm:table-cell">PE</th>
                      <th className="hidden pb-1.5 text-center font-normal sm:table-cell">PP</th>
                      <th className="hidden pb-1.5 text-center font-normal md:table-cell">GF</th>
                      <th className="hidden pb-1.5 text-center font-normal md:table-cell">GC</th>
                      <th className="pb-1.5 text-center font-normal">DG</th>
                      <th className="pb-1.5 text-right font-normal">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.standings.map((s, i) => {
                      const isTop = i < 2
                      const initial = s.team_name.charAt(0).toUpperCase()
                      return (
                        <tr
                          key={s.team_id}
                          className={`border-t border-slate-50 ${isTop ? '' : ''}`}
                        >
                          <td className="py-1.5">
                            <span className={`font-medium ${isTop ? 'text-slate-900' : 'text-slate-400'}`}>
                              {s.position}
                            </span>
                          </td>
                          <td className="py-1.5">
                            <div className="flex items-center gap-2">
                              {s.logo_url ? (
                                <img
                                  src={s.logo_url}
                                  alt=""
                                  className="h-5 w-5 rounded-full border border-slate-200 object-cover"
                                />
                              ) : (
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-400">
                                  {initial}
                                </div>
                              )}
                              <span className={`font-medium ${isTop ? 'text-slate-900' : 'text-slate-500'}`}>
                                {s.team_name}
                              </span>
                            </div>
                          </td>
                          <td className={`hidden py-1.5 text-center sm:table-cell ${isTop ? 'text-slate-700' : 'text-slate-400'}`}>
                            {s.matches_played}
                          </td>
                          <td className={`hidden py-1.5 text-center sm:table-cell ${isTop ? 'text-slate-700' : 'text-slate-400'}`}>
                            {s.wins}
                          </td>
                          <td className={`hidden py-1.5 text-center sm:table-cell ${isTop ? 'text-slate-700' : 'text-slate-400'}`}>
                            {s.draws}
                          </td>
                          <td className={`hidden py-1.5 text-center sm:table-cell ${isTop ? 'text-slate-700' : 'text-slate-400'}`}>
                            {s.losses}
                          </td>
                          <td className={`hidden py-1.5 text-center md:table-cell ${isTop ? 'text-slate-700' : 'text-slate-400'}`}>
                            {s.goals_for}
                          </td>
                          <td className={`hidden py-1.5 text-center md:table-cell ${isTop ? 'text-slate-700' : 'text-slate-400'}`}>
                            {s.goals_against}
                          </td>
                          <td className={`py-1.5 text-center ${isTop ? 'text-slate-700' : 'text-slate-400'}`}>
                            {s.goal_diff > 0 ? `+${s.goal_diff}` : s.goal_diff}
                          </td>
                          <td className={`py-1.5 text-right font-bold ${isTop ? 'text-slate-900' : 'text-slate-500'}`}>
                            {s.points}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {group.matches.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                    {group.matches.map((m) => {
                      const isLive = m.status === 'live'
                      const isScheduled = m.status === 'scheduled' && m.home_score == null
                      const hasScore = m.home_score != null || m.away_score != null
                      const matchDate = new Date(m.match_date)
                      const timeStr = matchDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                      
                      return (
                        <div
                          key={m.match_id}
                          className={`rounded-lg border px-3 py-2 ${
                            isLive ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              {m.home.logo_url ? (
                                <img src={m.home.logo_url} alt="" className="h-5 w-5 rounded-full border border-slate-200 object-cover flex-shrink-0" />
                              ) : (
                                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-400">
                                  {m.home.name.charAt(0)}
                                </div>
                              )}
                              <span className="text-xs font-medium text-slate-900 truncate">{m.home.name}</span>
                            </div>
                            
                            <div className="flex flex-col items-center flex-shrink-0 px-2">
                              {hasScore ? (
                                <span className="text-sm font-bold text-slate-900 tabular-nums">
                                  {m.home_score} - {m.away_score}
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-slate-400">vs</span>
                              )}
                              {isLive ? (
                                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold text-red-700 animate-pulse">
                                  En vivo
                                </span>
                              ) : isScheduled ? (
                                <span className="text-[10px] text-slate-400">{timeStr}</span>
                              ) : (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                                  Finalizado
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                              <span className="text-xs font-medium text-slate-900 truncate">{m.away.name}</span>
                              {m.away.logo_url ? (
                                <img src={m.away.logo_url} alt="" className="h-5 w-5 rounded-full border border-slate-200 object-cover flex-shrink-0" />
                              ) : (
                                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-400">
                                  {m.away.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'knockout' && (
        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {knockoutStages.map((stage) => (
              <div key={stage.stage_id}>
                <p className="mb-2 text-xs font-medium text-slate-500">{stage.name}</p>
                <div className="flex flex-col gap-2">
                  {stage.matches && stage.matches.length > 0 ? (
                    stage.matches.map((m) => {
                      const isPending = m.home_score == null && m.away_score == null
                      return (
                        <div
                          key={m.match_id}
                          className={`rounded-md bg-white px-3 py-2 text-xs ${
                            isPending
                              ? 'border-2 border-dashed border-slate-300'
                              : 'border border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-slate-700">{m.home.name}</span>
                            <span className={isPending ? 'text-slate-400' : 'text-slate-500'}>
                              {m.home_score ?? '–'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={isPending ? 'text-slate-400 italic' : 'text-slate-700'}>
                              {m.away.name}
                            </span>
                            <span className={isPending ? 'text-slate-400' : 'text-slate-500'}>
                              {m.away_score ?? '–'}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="rounded-md border-2 border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs text-slate-400">
                      Por definir
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {knockoutStages.some((s) => s.stage_multiplier) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {knockoutStages
                .filter((s) => s.stage_multiplier)
                .map((s) => (
                  <span
                    key={s.stage_id}
                    className="inline-block rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700"
                  >
                    {s.name}: ×{s.stage_multiplier}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
