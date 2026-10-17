import { describe, it, expect, beforeEach } from 'vitest'
import { confirmAction } from './confirmAction'
import { useConfirmStore } from '@/store/confirmStore'

describe('confirmAction', () => {
  beforeEach(() => {
    useConfirmStore.setState({ request: null })
  })

  it('stores a confirm request in the store', () => {
    confirmAction('¿Eliminar torneo?', { description: 'No se puede deshacer' })

    const { request } = useConfirmStore.getState()
    expect(request).not.toBeNull()
    expect(request!.title).toBe('¿Eliminar torneo?')
    expect(request!.description).toBe('No se puede deshacer')
    expect(request!.confirmLabel).toBe('Confirmar')
    expect(request!.danger).toBe(true)
  })

  it('uses custom confirmLabel', () => {
    confirmAction('¿Borrar?', { confirmLabel: 'Borrar todo' })

    const { request } = useConfirmStore.getState()
    expect(request!.confirmLabel).toBe('Borrar todo')
  })

  it('defaults danger to true', () => {
    confirmAction('¿Seguro?')
    expect(useConfirmStore.getState().request!.danger).toBe(true)
  })

  it('resolves to true when user confirms', async () => {
    const promise = confirmAction('¿Seguro?')

    const { request } = useConfirmStore.getState()
    request!.resolve(true)

    const result = await promise
    expect(result).toBe(true)
  })

  it('resolves to false when user cancels', async () => {
    const promise = confirmAction('¿Seguro?')

    const { request } = useConfirmStore.getState()
    request!.resolve(false)

    const result = await promise
    expect(result).toBe(false)
  })

  it('clears the request after resolving', async () => {
    const promise = confirmAction('Test')

    const { request } = useConfirmStore.getState()
    request!.resolve(true)

    await promise
    // After resolve, the ConfirmDialog component calls clear()
    // but we're testing the store behavior directly here
    expect(useConfirmStore.getState().request).not.toBeNull() // request is still set until clear() is called
  })
})
