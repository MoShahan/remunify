import type { Request, Response } from 'express'
import * as analyticsService from './analytics.service.js'

export async function getSummary(_req: Request, res: Response) {
  const data = await analyticsService.getAnalyticsSummary()
  res.json({ data })
}
