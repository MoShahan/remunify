import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { badRequest } from '../lib/errors.js'

type RequestPart = 'query' | 'params' | 'body'

export function validate<T>(schema: ZodType<T>, part: RequestPart) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part])
    if (!result.success) {
      next(badRequest('Validation failed', result.error.flatten().fieldErrors))
      return
    }

    if (part === 'query') {
      // Express query is typed loosely; replace with parsed values for handlers.
      Object.defineProperty(req, 'query', {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      })
    } else {
      req[part] = result.data as (typeof req)[typeof part]
    }

    next()
  }
}
