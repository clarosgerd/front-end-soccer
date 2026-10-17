import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { PublicLayout } from '@/components/domain/PublicLayout'
import { AppLayout } from '@/components/domain/AppLayout'
import { LandingPage } from '@/pages/LandingPage'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { Dashboard } from '@/pages/Dashboard'
import { TournamentList } from '@/pages/tournaments/TournamentList'
import { TournamentEdit } from '@/pages/tournaments/TournamentEdit'
import { Stages } from '@/pages/tournaments/Stages'
import { BracketView } from '@/pages/tournaments/Bracket/BracketView'
import { CalendarPage } from '@/pages/tournaments/Calendar/CalendarPage'
import { TournamentManager } from '@/pages/tournaments/TournamentManager'
import { JoinTournamentPage } from '@/pages/tournaments/JoinTournamentPage'
import { AdminBracket } from '@/pages/tournaments/admin/AdminBracket'
import { ManageGroups } from '@/pages/tournaments/admin/ManageGroups'
import { GroupList } from '@/pages/groups/GroupList'
import { GroupDetail } from '@/pages/groups/GroupDetail'
import { GroupSettings } from '@/pages/groups/GroupSettings'
import { Invitations } from '@/pages/groups/Invitations'
import { ScoringDashboard } from '@/pages/groups/ScoringDashboard'
import { MyPredictions } from '@/pages/predictions/MyPredictions'
import { PoolDetail } from '@/pages/pool/PoolDetail'
import { Plans } from '@/pages/subscription/Plans'
import { CheckoutRedirect } from '@/pages/subscription/CheckoutRedirect'
import { TeamList } from '@/pages/teams/TeamList'
import { MatchList } from '@/pages/matches/MatchList'
import { SyncAdmin } from '@/pages/admin/SyncAdmin'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'tournaments', element: <TournamentList /> },
      { path: 'tournaments/:tournamentId/edit', element: <TournamentEdit /> },
      { path: 'tournaments/:tournamentId/stages', element: <Stages /> },
      { path: 'tournaments/:tournamentId/matches', element: <MatchList /> },
      { path: 'tournaments/:tournamentId/bracket', element: <BracketView /> },
      { path: 'tournaments/:tournamentId/calendar', element: <CalendarPage /> },
      { path: 'tournaments/:tournamentId/manage', element: <TournamentManager /> },
      { path: 'tournaments/:tournamentId/join', element: <JoinTournamentPage /> },
      { path: 'tournaments/:tournamentId/admin', element: <AdminBracket /> },
      { path: 'tournaments/:tournamentId/groups-admin', element: <ManageGroups /> },
      { path: 'teams', element: <TeamList /> },
      { path: 'groups', element: <GroupList /> },
      { path: 'groups/:groupId', element: <GroupDetail /> },
      { path: 'groups/:groupId/settings', element: <GroupSettings /> },
      { path: 'groups/:groupId/pool', element: <PoolDetail /> },
      { path: 'groups/:groupId/scoring', element: <ScoringDashboard /> },
      { path: 'invitations', element: <Invitations /> },
      { path: 'predictions', element: <MyPredictions /> },
      { path: 'subscription', element: <Plans /> },
      { path: 'subscription/checkout-redirect', element: <CheckoutRedirect /> },
      { path: 'admin/sync', element: <AdminRoute><SyncAdmin /></AdminRoute> },
    ],
  },
])
