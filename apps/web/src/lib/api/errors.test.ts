import { describe, expect, it } from 'vitest'
import {
  ApiError,
  fieldErrorsFromDetails,
  isFieldErrorDetails,
  parseApiError,
} from './errors'

describe('fieldErrorsFromDetails', () => {
  it('maps body.* paths to form fields', () => {
    expect(
      fieldErrorsFromDetails([
        { path: 'body.amount', message: 'Required' },
        { path: 'body.currency', message: 'Invalid' },
      ]),
    ).toEqual({
      amount: 'Required',
      currency: 'Invalid',
    })
  })

  it('keeps first message per field', () => {
    expect(
      fieldErrorsFromDetails([
        { path: 'amount', message: 'First' },
        { path: 'amount', message: 'Second' },
      ]),
    ).toEqual({ amount: 'First' })
  })

  it('returns empty object for non-array details', () => {
    expect(
      fieldErrorsFromDetails({ currentEffectiveFrom: '2024-01-01' }),
    ).toEqual({})
    expect(isFieldErrorDetails(null)).toBe(false)
  })
})

describe('parseApiError', () => {
  it('reads message and code from JSON body', async () => {
    const response = new Response(
      JSON.stringify({
        error: {
          code: 'UNAUTHORIZED',
          message:
            'Invalid email or password. Check your credentials and try again.',
          details: null,
        },
      }),
      { status: 401 },
    )

    const error = await parseApiError(response)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(401)
    expect(error.code).toBe('UNAUTHORIZED')
    expect(error.message).toContain('Invalid email or password')
  })
})
