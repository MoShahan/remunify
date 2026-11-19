import type { NextFunction, Request, Response } from 'express'
import { verifyAuthToken } from '../lib/jwt.js'
import { unauthorized } from '../lib/errors.js'

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const header = req.header('authorization')
    if (!header) {
      throw unauthorized(
        'Authorization header is required. Use: Bearer <token>.',
      )
    }

    const [scheme, token] = header.split(' ')
    if (scheme !== 'Bearer' || !token) {
      throw unauthorized(
        'Missing or invalid Authorization header. Expected: Bearer <token>.',
      )
    }

    req.user = await verifyAuthToken(token)
    next()
  } catch (error) {
    next(error)
  }
}
