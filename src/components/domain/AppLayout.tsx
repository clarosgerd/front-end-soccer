import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import {
  LayoutDashboard,
  Trophy,
  Users,
  UsersRound,
  Target,
  Mail,
  CreditCard,
  RefreshCw,
  ChevronRight,
  Menu,
  ShieldCheck,
  Receipt,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tournaments', label: 'Torneos', icon: Trophy },
  { to: '/teams', label: 'Equipos', icon: Users },
  { to: '/groups', label: 'Grupos', icon: UsersRound },
  { to: '/predictions', label: 'Predicciones', icon: Target },
  { to: '/invitations', label: 'Invitaciones', icon: Mail },
  { to: '/subscription', label: 'Planes', icon: CreditCard },
]

const adminItems = [
  { to: '/admin/sync', label: 'Sync', icon: RefreshCw },
  { to: '/admin/users', label: 'Usuarios', icon: ShieldCheck },
  { to: '/admin/subscriptions', label: 'Suscripciones', icon: Receipt },
]

export function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/')
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    return { path, label }
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-900 transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-lg">
            FS
          </div>
          <span className="text-lg font-semibold text-white">Friend Soccer</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`}
                />
                {item.label}
                {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />}
              </Link>
            )
          })}

          {user?.role === 'admin' && (
            <>
              <div className="my-4 border-t border-slate-800" />
              <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Admin
              </p>
              {adminItems.map((item) => {
                const isActive = location.pathname === item.to
                const Icon = item.icon
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`}
                    />
                    {item.label}
                    {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />}
                  </Link>
                )
              })}
            </>
          )}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-bold text-white shadow-md">
              {user?.first_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-white">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => logout.mutate()}
            isLoading={logout.isPending}
            className="mt-3 w-full"
          >
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col md:ml-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm md:px-8">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <nav className="flex items-center gap-1 text-sm">
            <Link to="/dashboard" className="text-slate-500 hover:text-slate-700 transition-colors">
              Inicio
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-1">
                <ChevronRight size={16} className="text-slate-400" />
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-slate-900">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="text-slate-500 hover:text-slate-700 transition-colors">
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                Admin
              </span>
            )}
            <span className="text-sm text-slate-600">{user?.first_name}</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
