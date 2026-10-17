// Tipos base de respuesta de la API (Laravel API Resources)

export interface ApiListResponse<T> {
  data: T[]
  links: {
    first: string | null
    last: string | null
    next: string | null
    prev: string | null
  }
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ApiItemResponse<T> {
  data: T
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
}

// Auth

export interface User {
  user_id: number
  first_name: string
  last_name: string
  email: string
  role?: string
  subscription_tier?: 0 | 1 | 2
  balance?: number
}

export interface LoginResponse {
  user: User
  token: string
}

// Torneos

export type TournamentStatus = 'draft' | 'published' | 'live' | 'closed'

export interface Tournament {
  tournament_id: number
  name: string
  season: string
  country: string
  country_code: string
  logo_url: string | null
  flag_url: string | null
  start_date: string
  end_date: string
  actived: number | boolean
  status: TournamentStatus
  created_by: number | null
  is_promotional: number | boolean
  promotional_tier_required: number | null
  promotional_ends_at: string | null
}

// Stages

export interface Stage {
  stage_id: number
  tournament_id: number
  name: string
  stage_order: number
  is_knockout: boolean
}

// Equipos

export interface Team {
  team_id: number
  name: string
  country: string
  logo_url?: string | null
  flag_url?: string | null
  active?: number | boolean
}

// Partidos

export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface Match {
  match_id: number
  home_team_id: number
  away_team_id: number
  tournament_id: number
  stage_id: number
  match_date: string
  status: MatchStatus
  home_score?: number | null
  away_score?: number | null
  home?: Team
  away?: Team
  stage?: Stage
}

// Grupos de predicciones

export interface Group {
  group_id: number
  tournament_id: number | null
  name: string
  description: string
  creator_id: number
  is_public: boolean
  invitation_code: string | null
  max_members: number
  active?: number | boolean
  bet_amount: number
  prize_1st_pct: number
  prize_2nd_pct: number
  prize_3rd_pct: number
  pool_active: boolean
  ai_competitor_enabled?: boolean
  exact_score_points: number
  match_result_points: number
  correct_goal_points: number
  unique_exact_points: number
  multiplier_dieciseisavos: number
  multiplier_octavos: number
  multiplier_cuartos: number
  multiplier_semifinal: number
  multiplier_final: number
}

// Miembros de grupo

export type GroupMemberStatus = 'pending' | 'accepted' | 'rejected'

export interface GroupMember {
  member_id: number
  group_id: number
  user_id: number
  joined_at: string
  is_admin: number | boolean
  status: GroupMemberStatus
  user?: User
}

// Predicciones

export type PredictedResult = 'home_win' | 'away_win' | 'draw'
export type BetType = 'exact_score' | 'match_result' | 'both_teams_score'

export interface Prediction {
  prediction_id: number
  match_id: number
  group_id: number
  predicted_home_score: number
  predicted_away_score: number
  predicted_result: PredictedResult
  bet_type: BetType
  confidence: number
}

// Leaderboard

export interface LeaderboardEntry {
  user_id: number
  first_name: string
  last_name?: string
  total_points: number
  total_predictions: number
  correct_predictions: number
  exact_scores: number
  unique_predictions: number
  pool_winnings: number
  is_admin?: number | boolean
}

export interface AiCompetitorPrediction {
  prediction_id: number
  match_id: number
  predicted_home_score: number
  predicted_away_score: number
  predicted_result: PredictedResult
  bet_type: string
}

export interface LeaderboardResponse {
  group_id: number
  leaderboard: LeaderboardEntry[]
}

// Scoring dashboard

export interface ScoringBreakdown {
  exact_score: number
  match_result: number
  correct_goal_home: number
  correct_goal_away: number
  unique_exact: number
  stage_multiplier: number
  subtotal: number
  total: number
}

export interface ScoringMatch {
  match_id: number
  match: string
  home_score: number
  away_score: number
  predicted_home_score: number
  predicted_away_score: number
  stage: string
  points_earned: number
  breakdown: ScoringBreakdown
}

// Pool de premios

export interface PoolDistributionEntry {
  place: '1st' | '2nd' | '3rd'
  user_id: number
  points: number
  percentage: number
  prize: number
}

// Bracket / multi-fase

export interface TournamentGroupTeam {
  team_id: number
  team_name: string
  points: number
  goal_diff: number
  goals_for?: number
  goals_against?: number
}

export interface TournamentGroupStanding extends TournamentGroupTeam {
  position: number
  matches_played: number
  wins: number
  draws: number
  losses: number
  logo_url?: string | null
}

export interface BracketMatch {
  match_id: number
  home: { team_id: number; name: string }
  away: { team_id: number; name: string }
  home_score: number | null
  away_score: number | null
  status: MatchStatus
}

export interface BracketTournamentGroup {
  group_id: number
  name: string
  status: 'pending' | 'approved' | 'rejected'
  teams: TournamentGroupTeam[]
  standings: TournamentGroupStanding[]
  matches: BracketMatch[]
}

export interface Advancement {
  advancement_id: number
  team_id: number
  team_name: string
  confirmed: boolean
}

export interface BracketStage {
  stage_id: number
  name: string
  is_knockout: boolean
  stage_order: number
  stage_multiplier?: number
  groups?: BracketTournamentGroup[]
  matches?: BracketMatch[]
  advancements?: Advancement[]
}

export interface BracketResponse {
  tournament_id: number
  tournament_name: string
  bracket: BracketStage[]
}

export type AdvancementRuleType = 'top_n' | 'best_third' | 'manual'

export interface AdvancementRule {
  rule_id: number
  stage_id: number
  next_stage_id: number
  rule_type: AdvancementRuleType
  rule_value: number | null
  description: string | null
}

// Suscripciones

export type SubscriptionPlan = 'free' | 'pro' | 'premium'

export interface SubscriptionPlanInfo {
  plan: SubscriptionPlan
  monthly_price: number
  annual_price: number
  predictions_per_day: number | null
  tournament_limit: number | null
}

// AI Predictions

export interface AiPrediction {
  match_id: number
  home_team: string
  away_team: string
  predicted_result: PredictedResult
  predicted_home_score: number
  predicted_away_score: number
  home_win_prob: number
  draw_prob: number
  away_win_prob: number
  confidence: number
  model_version: string
}

export interface AiPredictionAccuracy {
  total: number
  correct: number
  accuracy: number
  version: string
  by_result: Record<string, { total: number; correct: number }>
  by_confidence: { tier: string; total: number; correct: number }[]
}

// Países

export interface Country {
  country_id: number
  name: string
  code: string
  flag_url: string | null
}
