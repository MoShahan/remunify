import type { Request, Response } from 'express'
import type {
  EmployeeIdParams,
  ListEmployeesQuery,
  UpdateEmployeeBody,
} from './employees.schemas.js'
import * as employeesService from './employees.service.js'

export async function listEmployees(req: Request, res: Response) {
  const query = req.query as unknown as ListEmployeesQuery
  const result = await employeesService.listEmployees(query)
  res.json(result)
}

export async function getEmployeeFacets(_req: Request, res: Response) {
  const facets = await employeesService.getEmployeeFacets()
  res.json({ data: facets })
}

export async function getEmployee(req: Request, res: Response) {
  const { id } = req.params as unknown as EmployeeIdParams
  const employee = await employeesService.getEmployeeById(id)
  res.json({ data: employee })
}

export async function updateEmployee(req: Request, res: Response) {
  const { id } = req.params as unknown as EmployeeIdParams
  const body = req.body as UpdateEmployeeBody
  const employee = await employeesService.updateEmployeeStatus(id, body)
  res.json({ data: employee })
}
