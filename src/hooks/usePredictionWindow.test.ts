import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePredictionWindow } from './usePredictionWindow'

describe('usePredictionWindow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-22T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns isOpen=false when matchDateIso is undefined', () => {
    const { result } = renderHook(() => usePredictionWindow(undefined))
    expect(result.current.isOpen).toBe(false)
    expect(result.current.msRemaining).toBe(0)
    expect(result.current.label).toBe('')
  })

  it('returns isOpen=true when match is more than 30 min away', () => {
    const matchDate = '2026-07-22T13:00:00Z'
    const { result } = renderHook(() => usePredictionWindow(matchDate))

    expect(result.current.isOpen).toBe(true)
    expect(result.current.msRemaining).toBeGreaterThan(0)
    expect(result.current.label).toContain('Cierra en')
  })

  it('returns isOpen=false when match is less than 30 min away', () => {
    const matchDate = '2026-07-22T12:20:00Z'
    const { result } = renderHook(() => usePredictionWindow(matchDate))

    expect(result.current.isOpen).toBe(false)
    expect(result.current.label).toBe('Ventana de predicción cerrada')
  })

  it('returns isOpen=false when match has already started', () => {
    const matchDate = '2026-07-22T11:30:00Z'
    const { result } = renderHook(() => usePredictionWindow(matchDate))

    expect(result.current.isOpen).toBe(false)
  })

  it('shows hours+minutes label when more than 1 hour remains', () => {
    const matchDate = '2026-07-22T14:00:00Z'
    const { result } = renderHook(() => usePredictionWindow(matchDate))

    expect(result.current.label).toMatch(/Cierra en \d+h \d+m/)
  })

  it('shows minutes+seconds label when less than 1 hour remains', () => {
    const matchDate = '2026-07-22T12:45:00Z'
    const { result } = renderHook(() => usePredictionWindow(matchDate))

    expect(result.current.label).toMatch(/Cierra en \d+m \d+s/)
  })

  it('closes the window when time passes the cutoff', () => {
    const matchDate = '2026-07-22T12:31:00Z'
    const { result } = renderHook(() => usePredictionWindow(matchDate))

    expect(result.current.isOpen).toBe(true)

    act(() => {
      vi.advanceTimersByTime(65_000)
    })

    expect(result.current.isOpen).toBe(false)
    expect(result.current.label).toBe('Ventana de predicción cerrada')
  })
})
