import { Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export function PublicLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">
              FS
            </span>
            Friend Soccer
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
            <Link to="/" className="transition-colors hover:text-slate-900">
              Torneos
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="transition-colors hover:text-slate-900">
                  Dashboard
                </Link>
                <span className="text-slate-400">{user?.first_name}</span>
              </>
            ) : (
              <>
                <Link to="/login" className="transition-colors hover:text-slate-900">
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white transition-colors hover:bg-slate-700"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
            <div>
              <Link to="/" className="flex items-center gap-2 text-base font-bold text-slate-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[10px] font-black text-white">
                  FS
                </span>
                Friend Soccer
              </Link>
              <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-400">
                Plataforma de predicciones de fútbol. Creá grupos, hacé predicciones y competí con tus amigos.
              </p>
            </div>

            <div className="flex gap-12">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Plataforma</p>
                <ul className="flex flex-col gap-1.5 text-xs text-slate-400">
                  <li><Link to="/" className="transition-colors hover:text-slate-600">Torneos</Link></li>
                  <li><Link to="/login" className="transition-colors hover:text-slate-600">Iniciar sesión</Link></li>
                  <li><Link to="/register" className="transition-colors hover:text-slate-600">Crear cuenta</Link></li>
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Legal</p>
                <ul className="flex flex-col gap-1.5 text-xs text-slate-400">
                  <li><span className="cursor-default">Términos</span></li>
                  <li><span className="cursor-default">Privacidad</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-5 text-center text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} Friend Soccer. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
