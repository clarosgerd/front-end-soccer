import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextField } from './TextField'

describe('TextField', () => {
  it('renders label and input', () => {
    render(<TextField label="Nombre" name="name" />)
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument()
  })

  it('displays the value', () => {
    render(<TextField label="Email" name="email" value="test@test.com" onChange={() => {}} />)
    expect(screen.getByLabelText('Email')).toHaveValue('test@test.com')
  })

  it('calls onChange when typed into', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<TextField label="Name" name="name" onChange={handleChange} />)

    await user.type(screen.getByLabelText('Name'), 'A')
    expect(handleChange).toHaveBeenCalled()
  })

  it('shows error message when error prop is provided', () => {
    render(<TextField label="Email" name="email" error="El email es obligatorio" />)
    expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
  })

  it('applies error border style when error is present', () => {
    render(<TextField label="Email" name="email" error="Error" />)
    const input = screen.getByLabelText('Email')
    expect(input.className).toContain('border-red-400')
  })

  it('applies normal border when no error', () => {
    render(<TextField label="Email" name="email" />)
    const input = screen.getByLabelText('Email')
    expect(input.className).toContain('border-slate-300')
  })

  it('passes through input props like type, placeholder, required', () => {
    render(
      <TextField
        label="Password"
        name="password"
        type="password"
        placeholder="Enter password"
        required
      />
    )
    const input = screen.getByLabelText('Password')
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toHaveAttribute('placeholder', 'Enter password')
    expect(input).toHaveAttribute('required')
  })

  it('renders empty label without breaking', () => {
    render(<TextField label="" name="field" />)
    expect(screen.getByRole('textbox', { name: '' })).toBeInTheDocument()
  })
})
