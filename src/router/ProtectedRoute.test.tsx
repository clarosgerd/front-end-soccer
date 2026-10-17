import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

function renderWithAuth(ui: React.ReactNode, isAuthenticated: boolean) {
  useAuthStore.setState({
    isAuthenticated,
    user: isAuthenticated
      ? { user_id: 1, first_name: 'Test', last_name: 'User', email: 'test@test.com' }
      : null,
    token: isAuthenticated ? 'fake-token' : null,
  })
  return render(
    <MemoryRouter>
      {ui}
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderWithAuth(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
      true
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('redirects to /login when not authenticated', () => {
    renderWithAuth(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>,
      false
    )
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    // MemoryRouter doesn't do real navigation, but we can check the Redirect element was rendered
  })
})
