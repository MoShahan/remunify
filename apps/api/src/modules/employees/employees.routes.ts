import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler.js'
import { validate } from '../../middleware/validate.js'
import * as employeesController from './employees.controller.js'
import {
  employeeIdParamsSchema,
  listEmployeesQuerySchema,
} from './employees.schemas.js'

export const employeesRouter = Router()

employeesRouter.get(
  '/',
  validate(listEmployeesQuerySchema, 'query'),
  asyncHandler(employeesController.listEmployees),
)

employeesRouter.get(
  '/:id',
  validate(employeeIdParamsSchema, 'params'),
  asyncHandler(employeesController.getEmployee),
)
