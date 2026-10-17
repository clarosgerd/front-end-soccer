import { useToastStore, type ToastVariant } from '@/store/toastStore'

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-slate-800',
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${VARIANT_STYLES[t.variant]}`}
        >
          <span>{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="text-white/70 hover:text-white"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
