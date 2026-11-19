import type { Request, Response } from 'express'
import * as exportService from './export.service.js'

export async function exportEmployeesCsv(_req: Request, res: Response) {
  await exportService.streamEmployeesCsv(res)
}

export async function exportEmployeesXlsx(_req: Request, res: Response) {
  await exportService.streamEmployeesXlsx(res)
}
