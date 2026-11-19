import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler.js'
import { validate } from '../../middleware/validate.js'
import * as authController from './auth.controller.js'
import { loginBodySchema } from './auth.schemas.js'

export const authRouter = Router()

authRouter.post(
  '/login',
  validate(loginBodySchema, 'body'),
  asyncHandler(authController.login),
)
