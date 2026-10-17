import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card><p>Contenido</p></Card>)
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })

  it('applies default styles with border and rounded corners', () => {
    render(<Card data-testid="card">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card.tagName).toBe('DIV')
    expect(card).toHaveClass('rounded-lg')
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('bg-white')
  })

  it('accepts custom className', () => {
    render(<Card data-testid="card" className="mt-4 custom">Content</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('mt-4')
    expect(card).toHaveClass('custom')
  })

  it('passes through additional HTML attributes', () => {
    render(<Card data-testid="my-card">Content</Card>)
    expect(screen.getByTestId('my-card')).toBeInTheDocument()
  })
})
