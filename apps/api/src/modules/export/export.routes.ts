import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler.js'
import * as exportController from './export.controller.js'

export const exportRouter = Router()

exportRouter.get(
  '/employees.csv',
  asyncHandler(exportController.exportEmployeesCsv),
)

exportRouter.get(
  '/employees.xlsx',
  asyncHandler(exportController.exportEmployeesXlsx),
)
