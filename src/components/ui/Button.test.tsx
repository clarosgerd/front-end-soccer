import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Guardar</Button>)
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    render(<Button>Click</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-slate-900')
    expect(btn.className).toContain('text-white')
  })

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Click</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border')
    expect(btn.className).toContain('text-slate-700')
  })

  it('applies danger variant', () => {
    render(<Button variant="danger">Eliminar</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('text-red-700')
  })

  it('is disabled when isLoading', () => {
    render(<Button isLoading>Enviar</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Enviar</Button>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Click me</Button>)

    await user.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
