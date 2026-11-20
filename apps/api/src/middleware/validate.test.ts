import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import type { Request, Response } from 'express'
import { AppError } from '../lib/errors.js'
import { validate } from './validate.js'

describe('validate middleware', () => {
  it('assigns parsed body and calls next', () => {
    const middleware = validate(
      z.object({ status: z.enum(['ACTIVE', 'INACTIVE']) }),
      'body',
    )
    const req = { body: { status: 'ACTIVE' } } as unknown as Request
    const next = vi.fn()

    middleware(req, {} as Response, next)

    expect(req.body).toEqual({ status: 'ACTIVE' })
    expect(next).toHaveBeenCalledWith()
  })

  it('replaces query via defineProperty', () => {
    const middleware = validate(
      z.object({ page: z.coerce.number().int().positive() }),
      'query',
    )
    const req = { query: { page: '2' } } as unknown as Request
    const next = vi.fn()

    middleware(req, {} as Response, next)

    expect(req.query).toEqual({ page: 2 })
    expect(next).toHaveBeenCalledWith()
  })

  it('forwards AppError on invalid input', () => {
    const middleware = validate(z.object({ amount: z.string().min(1) }), 'body')
    const req = { body: {} } as unknown as Request
    const next = vi.fn()

    middleware(req, {} as Response, next)

    expect(next).toHaveBeenCalledWith(expect.any(AppError))
    const err = next.mock.calls[0]?.[0] as AppError
    expect(err.statusCode).toBe(400)
    expect(err.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'amount' })]),
    )
  })
})
