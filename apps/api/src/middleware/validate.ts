import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { badRequest } from '../lib/errors.js'

type RequestPart = 'query' | 'params' | 'body'

export function validate<T>(schema: ZodType<T>, part: RequestPart) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part])
    if (!result.success) {
      const fieldErrors = result.error.issues.map((issue) => ({
        path: issue.path.join('.') || part,
        message: issue.message,
      }))

      next(
        badRequest(
          `Validation failed for ${part}. Check the details for each invalid field.`,
          fieldErrors,
        ),
      )
      return
    }

    if (part === 'query') {
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
