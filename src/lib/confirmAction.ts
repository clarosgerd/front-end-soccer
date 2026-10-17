import { useConfirmStore } from '@/store/confirmStore'

interface ConfirmOptions {
  description?: string
  confirmLabel?: string
  danger?: boolean
}

/**
 * Reemplazo de window.confirm(). Devuelve una promesa que resuelve true/false
 * según lo que elija el usuario en el modal (ConfirmDialog, montado una sola
 * vez en App.tsx).
 *
 * Uso: if (await confirmAction('¿Eliminar el torneo?')) { ... }
 */
export function confirmAction(title: string, options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.getState().ask({
      title,
      description: options.description,
      confirmLabel: options.confirmLabel ?? 'Confirmar',
      danger: options.danger ?? true,
      resolve,
    })
  })
}
