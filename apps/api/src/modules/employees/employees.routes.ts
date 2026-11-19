import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler.js'
import { validate } from '../../middleware/validate.js'
import * as employeesController from './employees.controller.js'
import {
  employeeIdParamsSchema,
  listEmployeesQuerySchema,
  updateEmployeeBodySchema,
} from './employees.schemas.js'

export const employeesRouter = Router()

employeesRouter.get(
  '/',
  validate(listEmployeesQuerySchema, 'query'),
  asyncHandler(employeesController.listEmployees),
)

employeesRouter.get(
  '/facets',
  asyncHandler(employeesController.getEmployeeFacets),
)

employeesRouter.get(
  '/:id',
  validate(employeeIdParamsSchema, 'params'),
  asyncHandler(employeesController.getEmployee),
)

employeesRouter.patch(
  '/:id',
  validate(employeeIdParamsSchema, 'params'),
  validate(updateEmployeeBodySchema, 'body'),
  asyncHandler(employeesController.updateEmployee),
)
