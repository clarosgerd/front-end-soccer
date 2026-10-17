import { useConfirmStore } from '@/store/confirmStore'
import { Button } from '@/components/ui/Button'

export function ConfirmDialog() {
  const request = useConfirmStore((s) => s.request)
  const clear = useConfirmStore((s) => s.clear)

  if (!request) return null

  function handle(value: boolean) {
    request!.resolve(value)
    clear()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      onClick={() => handle(false)}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 className="text-base font-semibold text-slate-900">{request.title}</h2>
        {request.description && (
          <p className="mt-2 text-sm text-slate-500">{request.description}</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => handle(false)}>
            Cancelar
          </Button>
          <Button variant={request.danger ? 'danger' : 'primary'} onClick={() => handle(true)}>
            {request.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
