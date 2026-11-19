import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler.js'
import * as analyticsController from './analytics.controller.js'

export const analyticsRouter = Router()

analyticsRouter.get('/summary', asyncHandler(analyticsController.getSummary))
