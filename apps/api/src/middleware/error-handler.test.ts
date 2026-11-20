import { describe, expect, it, vi } from 'vitest'
import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../lib/errors.js'
import { errorHandler } from './error-handler.js'

describe('errorHandler', () => {
  it('serializes AppError responses', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    errorHandler(
      new AppError(404, 'NOT_FOUND', 'Missing', { id: '1' }),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    )

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'Missing',
        details: { id: '1' },
      },
    })
  })

  it('maps unknown errors to 500', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    errorHandler(
      new Error('boom'),
      {} as Request,
      res as unknown as Response,
      vi.fn() as NextFunction,
    )

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected server error',
        details: null,
      },
    })
    consoleSpy.mockRestore()
  })
})
