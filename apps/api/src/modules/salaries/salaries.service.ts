import { prisma } from '../../db/prisma.js'
import { conflict, notFound } from '../../lib/errors.js'
import type { SalaryBody } from './salaries.schemas.js'

function serializeSalary(salary: {
  id: string
  employeeId: string
  amount: { toFixed: (digits: number) => string } | string
  currency: string
  period: string
  effectiveFrom: Date
  updatedAt: Date
}) {
  return {
    id: salary.id,
    employeeId: salary.employeeId,
    amount:
      typeof salary.amount === 'string'
        ? salary.amount
        : salary.amount.toFixed(2),
    currency: salary.currency,
    period: salary.period,
    effectiveFrom: salary.effectiveFrom.toISOString().slice(0, 10),
    updatedAt: salary.updatedAt.toISOString(),
  }
}

async function assertEmployeeExists(employeeId: string) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  })

  if (!employee) {
    throw notFound(`Employee not found: ${employeeId}`)
  }
}

export async function getSalaryForEmployee(employeeId: string) {
  await assertEmployeeExists(employeeId)

  const salary = await prisma.salary.findUnique({
    where: { employeeId },
  })

  if (!salary) {
    throw notFound(`Salary not found for employee: ${employeeId}`)
  }

  return serializeSalary(salary)
}

export async function createSalaryForEmployee(
  employeeId: string,
  body: SalaryBody,
) {
  await assertEmployeeExists(employeeId)

  const existing = await prisma.salary.findUnique({
    where: { employeeId },
    select: { id: true },
  })

  if (existing) {
    throw conflict(`Salary already exists for employee: ${employeeId}`)
  }

  const salary = await prisma.salary.create({
    data: {
      employeeId,
      amount: body.amount,
      currency: body.currency,
      period: body.period,
      effectiveFrom: body.effectiveFrom,
    },
  })

  return serializeSalary(salary)
}

export async function updateSalaryForEmployee(
  employeeId: string,
  body: SalaryBody,
) {
  await assertEmployeeExists(employeeId)

  const existing = await prisma.salary.findUnique({
    where: { employeeId },
    select: { id: true },
  })

  if (!existing) {
    throw notFound(`Salary not found for employee: ${employeeId}`)
  }

  const salary = await prisma.salary.update({
    where: { employeeId },
    data: {
      amount: body.amount,
      currency: body.currency,
      period: body.period,
      effectiveFrom: body.effectiveFrom,
    },
  })

  return serializeSalary(salary)
}
