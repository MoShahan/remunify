import type { Request, Response } from 'express'
import type { LoginBody } from './auth.schemas.js'
import * as authService from './auth.service.js'

export async function login(req: Request, res: Response) {
  const body = req.body as LoginBody
  const data = await authService.login(body)
  res.json({ data })
}
