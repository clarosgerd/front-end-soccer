import apiClient from '../client'

export interface LeagueSyncStatus {
  tournament_id: number
  name: string
  season: string
  country: string
  logo_url: string | null
  last_synced_at: string | null
  matches: number
  teams: number
  players: number
}

export interface SyncStatus {
  counts: {
    tournaments: number
    teams: number
    players: number
    matches: number
  }
  world_cup: {
    tournament_id: number
    name: string
    season: string
    last_synced_at: string | null
  } | null
  leagues: LeagueSyncStatus[]
  conmebol?: LeagueSyncStatus[]
  football_data?: LeagueSyncStatus[]
}

export interface SyncQueued {
  run_id: number
  status: 'queued'
  type: string
  season: number
  source: string
}

export type SyncRunStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface SyncRun {
  run_id: number
  status: SyncRunStatus
  success: boolean
  message: string | null
  log: string | null
  error: string | null
}

export const ESPN_LEAGUES = [
  { id: 'eng.1', name: 'Premier League', country: 'England' },
  { id: 'esp.1', name: 'La Liga', country: 'Spain' },
  { id: 'ger.1', name: 'Bundesliga', country: 'Germany' },
  { id: 'ita.1', name: 'Serie A', country: 'Italy' },
  { id: 'fra.1', name: 'Ligue 1', country: 'France' },
  { id: 'mex.1', name: 'Liga MX', country: 'Mexico' },
  { id: 'usa.1', name: 'MLS', country: 'USA' },
  { id: 'bra.1', name: 'Brasileirão', country: 'Brazil' },
  { id: 'arg.1', name: 'Liga Argentina', country: 'Argentina' },
  { id: 'ned.1', name: 'Eredivisie', country: 'Netherlands' },
] as const

export type EspnLeagueId = (typeof ESPN_LEAGUES)[number]['id']

export interface FootballCompetition {
  external_id: number
  name: string
}

export const syncApi = {
  status: () =>
    apiClient.get<{ data: SyncStatus }>('/sync/status').then((r) => r.data.data),

  // Lista de competiciones football-data.org sincronizables individualmente
  // (ver --competition de football:sync) — viene del backend para no
  // duplicar la lista acá.
  footballCompetitions: () =>
    apiClient
      .get<{ competitions: FootballCompetition[] }>('/sync/competitions')
      .then((r) => r.data.competitions),

  sync: (params: {
    type: string
    league?: EspnLeagueId
    competition?: number
    season?: number
    source?: string
    force?: boolean
  }) =>
    apiClient
      .post<SyncQueued>('/sync', {
        type: params.type,
        league: params.league ?? null,
        competition: params.competition ?? null,
        season: params.season ?? new Date().getFullYear(),
        source: params.source ?? 'espn',
        force: params.force ?? false,
      })
      .then((r) => r.data),

  runStatus: (runId: number) =>
    apiClient.get<SyncRun>(`/sync/runs/${runId}`).then((r) => r.data),
}
