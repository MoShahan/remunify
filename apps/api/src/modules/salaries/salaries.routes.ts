import { Router } from 'express'
import { asyncHandler } from '../../lib/async-handler.js'
import { validate } from '../../middleware/validate.js'
import * as salariesController from './salaries.controller.js'
import { employeeIdParamsSchema, salaryBodySchema } from './salaries.schemas.js'

export const salariesRouter = Router({ mergeParams: true })

salariesRouter.get(
  '/',
  validate(employeeIdParamsSchema, 'params'),
  asyncHandler(salariesController.getSalary),
)

salariesRouter.get(
  '/history',
  validate(employeeIdParamsSchema, 'params'),
  asyncHandler(salariesController.listSalaryHistory),
)

salariesRouter.post(
  '/',
  validate(employeeIdParamsSchema, 'params'),
  validate(salaryBodySchema, 'body'),
  asyncHandler(salariesController.createSalary),
)

salariesRouter.patch(
  '/',
  validate(employeeIdParamsSchema, 'params'),
  validate(salaryBodySchema, 'body'),
  asyncHandler(salariesController.updateSalary),
)
