import { useEffect, useState } from 'react'

const WINDOW_MS = 30 * 60 * 1000

export interface PredictionWindow {
  isOpen: boolean
  msRemaining: number
  label: string
}

/**
 * Calcula si todavía se puede predecir un match (>30min antes del inicio)
 * y devuelve un label legible para mostrar como countdown.
 * Se recalcula cada segundo mientras el componente esté montado.
 */
export function usePredictionWindow(matchDateIso: string | undefined): PredictionWindow {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!matchDateIso) {
    return { isOpen: false, msRemaining: 0, label: '' }
  }

  const matchTime = new Date(matchDateIso).getTime()
  const cutoff = matchTime - WINDOW_MS
  const msRemaining = cutoff - now
  const isOpen = msRemaining > 0

  if (!isOpen) {
    return { isOpen: false, msRemaining: 0, label: 'Ventana de predicción cerrada' }
  }

  const totalMinutes = Math.floor(msRemaining / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const seconds = Math.floor((msRemaining % 60000) / 1000)

  const label =
    hours > 0
      ? `Cierra en ${hours}h ${minutes}m`
      : `Cierra en ${minutes}m ${seconds}s`

  return { isOpen, msRemaining, label }
}
