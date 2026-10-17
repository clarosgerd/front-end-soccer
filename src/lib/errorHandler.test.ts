import { describe, it, expect } from 'vitest'
import { normalizeApiError } from './errorHandler'
import { AxiosError, type AxiosHeaders } from 'axios'

function makeAxiosError(
  status: number,
  data?: { message: string; errors?: Record<string, string[]> }
): AxiosError {
  return new AxiosError(
    'Request failed',
    String(status),
    undefined,
    undefined,
    { data, status, statusText: '', headers: {} as AxiosHeaders, config: {} as never }
  )
}

describe('normalizeApiError', () => {
  it('returns a generic message for non-AxiosError inputs', () => {
    const result = normalizeApiError('unexpected string error')
    expect(result.message).toBe('Ocurrió un error inesperado.')
    expect(result.isValidationError).toBe(false)
    expect(result.isAuthError).toBe(false)
    expect(result.isForbidden).toBe(false)
    expect(result.fieldErrors).toEqual({})
  })

  it('returns a generic message for Error objects', () => {
    const result = normalizeApiError(new Error('boom'))
    expect(result.message).toBe('Ocurrió un error inesperado.')
  })

  it('normalizes a 422 validation error with field errors', () => {
    const error = makeAxiosError(422, {
      message: 'The given data was invalid.',
      errors: {
        email: ['The email has already been taken.'],
        password: ['The password must be at least 8 characters.', 'The password confirmation does not match.'],
      },
    })
    const result = normalizeApiError(error)

    expect(result.status).toBe(422)
    expect(result.isValidationError).toBe(true)
    expect(result.message).toBe('The given data was invalid.')
    expect(result.fieldErrors.email).toBe('The email has already been taken.')
    expect(result.fieldErrors.password).toBe('The password must be at least 8 characters.')
  })

  it('normalizes a 401 auth error', () => {
    const error = makeAxiosError(401, { message: 'Unauthenticated.' })
    const result = normalizeApiError(error)

    expect(result.status).toBe(401)
    expect(result.isAuthError).toBe(true)
    expect(result.message).toBe('Unauthenticated.')
    expect(result.fieldErrors).toEqual({})
  })

  it('normalizes a 403 forbidden error', () => {
    const error = makeAxiosError(403, { message: 'Forbidden.' })
    const result = normalizeApiError(error)

    expect(result.status).toBe(403)
    expect(result.isForbidden).toBe(true)
    expect(result.message).toBe('Forbidden.')
  })

  it('handles a 422 with no errors field', () => {
    const error = makeAxiosError(422, { message: 'Validation failed.' })
    const result = normalizeApiError(error)

    expect(result.isValidationError).toBe(true)
    expect(result.fieldErrors).toEqual({})
    expect(result.message).toBe('Validation failed.')
  })

  it('handles an AxiosError with no response data', () => {
    const error = new AxiosError('Network Error')
    const result = normalizeApiError(error)

    expect(result.message).toBe('Network Error')
    expect(result.fieldErrors).toEqual({})
  })
})
