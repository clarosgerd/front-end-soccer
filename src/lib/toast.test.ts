import { describe, it, expect, beforeEach } from 'vitest'
import { toast } from './toast'
import { useToastStore } from '@/store/toastStore'

describe('toast', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it('adds a success toast', () => {
    toast.success('Guardado')
    const { toasts } = useToastStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('Guardado')
    expect(toasts[0].variant).toBe('success')
  })

  it('adds an error toast', () => {
    toast.error('Algo falló')
    const { toasts } = useToastStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].variant).toBe('error')
  })

  it('adds an info toast', () => {
    toast.info('Atención')
    const { toasts } = useToastStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].variant).toBe('info')
  })

  it('each toast has a unique id', () => {
    toast.success('One')
    toast.error('Two')
    const { toasts } = useToastStore.getState()
    expect(toasts[0].id).not.toBe(toasts[1].id)
  })
})
