import { prisma } from '../../db/prisma.js'
import { badRequest, conflict, notFound } from '../../lib/errors.js'
import type { SalaryBody } from './salaries.schemas.js'

function serializeSalary(salary: {
  id: string
  employeeId: string
  amount: { toFixed: (digits: number) => string } | string
  currency: string
  period: string
  effectiveFrom: Date
  createdAt: Date
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
    createdAt: salary.createdAt.toISOString(),
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

async function findCurrentSalary(employeeId: string) {
  return prisma.salary.findFirst({
    where: { employeeId },
    orderBy: { effectiveFrom: 'desc' },
  })
}

export async function getSalaryForEmployee(employeeId: string) {
  await assertEmployeeExists(employeeId)

  const salary = await findCurrentSalary(employeeId)

  if (!salary) {
    throw notFound(`Salary not found for employee: ${employeeId}`)
  }

  return serializeSalary(salary)
}

export async function listSalaryHistoryForEmployee(employeeId: string) {
  await assertEmployeeExists(employeeId)

  const rows = await prisma.salary.findMany({
    where: { employeeId },
    orderBy: { effectiveFrom: 'desc' },
  })

  return rows.map(serializeSalary)
}

export async function createSalaryForEmployee(
  employeeId: string,
  body: SalaryBody,
) {
  await assertEmployeeExists(employeeId)

  const existing = await findCurrentSalary(employeeId)

  if (existing) {
    throw conflict(
      `Salary already exists for employee: ${employeeId}. Use PATCH to record a raise.`,
    )
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

/** Raise: keep prior rows; insert a new current salary. */
export async function updateSalaryForEmployee(
  employeeId: string,
  body: SalaryBody,
) {
  await assertEmployeeExists(employeeId)

  const current = await findCurrentSalary(employeeId)

  if (!current) {
    throw notFound(`Salary not found for employee: ${employeeId}`)
  }

  const currentEffectiveFrom = current.effectiveFrom.toISOString().slice(0, 10)

  if (body.effectiveFrom <= current.effectiveFrom) {
    throw badRequest(
      `effectiveFrom must be after the current salary effective date (${currentEffectiveFrom}).`,
      { currentEffectiveFrom },
    )
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
