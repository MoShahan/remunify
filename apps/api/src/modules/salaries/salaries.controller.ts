import type { Request, Response } from 'express'
import type { EmployeeIdParams, SalaryBody } from './salaries.schemas.js'
import * as salariesService from './salaries.service.js'

export async function getSalary(req: Request, res: Response) {
  const { employeeId } = req.params as unknown as EmployeeIdParams
  const salary = await salariesService.getSalaryForEmployee(employeeId)
  res.json({ data: salary })
}

export async function createSalary(req: Request, res: Response) {
  const { employeeId } = req.params as unknown as EmployeeIdParams
  const body = req.body as SalaryBody
  const salary = await salariesService.createSalaryForEmployee(employeeId, body)
  res.status(201).json({ data: salary })
}

export async function updateSalary(req: Request, res: Response) {
  const { employeeId } = req.params as unknown as EmployeeIdParams
  const body = req.body as SalaryBody
  const salary = await salariesService.updateSalaryForEmployee(employeeId, body)
  res.json({ data: salary })
}
