import { create } from 'zustand'

interface ConfirmRequest {
  title: string
  description?: string
  confirmLabel: string
  danger: boolean
  resolve: (value: boolean) => void
}

interface ConfirmState {
  request: ConfirmRequest | null
  ask: (request: ConfirmRequest) => void
  clear: () => void
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  request: null,
  ask: (request) => set({ request }),
  clear: () => set({ request: null }),
}))
