import type { TournamentRole } from '@/hooks/useTournamentRole'

const ROLE_CONFIG: Record<TournamentRole, { label: string; color: string; bg: string }> = {
  admin: { label: 'Admin', color: 'text-white', bg: 'bg-blue-600' },
  owner: { label: 'Dueño', color: 'text-white', bg: 'bg-violet-600' },
  manager: { label: 'Manager', color: 'text-amber-800', bg: 'bg-amber-100' },
  predictor: { label: 'Predictor', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  viewer: { label: 'Espectador', color: 'text-slate-500', bg: 'bg-slate-100' },
}

export function RoleBadge({ role }: { role: TournamentRole }) {
  const cfg = ROLE_CONFIG[role]
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}
