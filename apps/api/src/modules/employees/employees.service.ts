import type { Prisma } from '@prisma/client'
import { prisma } from '../../db/prisma.js'
import { notFound } from '../../lib/errors.js'
import type { ListEmployeesQuery } from './employees.schemas.js'

const employeeListSelect = {
  id: true,
  employeeNumber: true,
  fullName: true,
  country: true,
  department: true,
  designation: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  salary: {
    select: {
      id: true,
      amount: true,
      currency: true,
      period: true,
      effectiveFrom: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.EmployeeSelect

function serializeSalary(
  salary: {
    id: string
    amount: { toFixed: (digits: number) => string } | string
    currency: string
    period: string
    effectiveFrom: Date
    updatedAt: Date
  } | null,
) {
  if (!salary) {
    return null
  }

  return {
    id: salary.id,
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

function serializeEmployee(
  employee: Prisma.EmployeeGetPayload<{ select: typeof employeeListSelect }>,
) {
  return {
    id: employee.id,
    employeeNumber: employee.employeeNumber,
    fullName: employee.fullName,
    country: employee.country,
    department: employee.department,
    designation: employee.designation,
    status: employee.status,
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
    salary: serializeSalary(employee.salary),
  }
}

export async function listEmployees(query: ListEmployeesQuery) {
  const where: Prisma.EmployeeWhereInput = {}

  if (query.search) {
    where.OR = [
      {
        fullName: {
          contains: query.search,
          mode: 'insensitive',
        },
      },
      {
        employeeNumber: {
          contains: query.search,
          mode: 'insensitive',
        },
      },
    ]
  }

  if (query.country) {
    where.country = query.country
  }
  if (query.department) {
    where.department = query.department
  }
  if (query.designation) {
    where.designation = query.designation
  }
  if (query.status) {
    where.status = query.status
  }

  const skip = (query.page - 1) * query.pageSize

  const [total, rows] = await prisma.$transaction([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where,
      select: employeeListSelect,
      orderBy: { [query.sortBy]: query.sortOrder },
      skip,
      take: query.pageSize,
    }),
  ])

  return {
    data: rows.map(serializeEmployee),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
    },
  }
}

export async function getEmployeeById(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: employeeListSelect,
  })

  if (!employee) {
    throw notFound(`Employee not found: ${id}`)
  }

  return serializeEmployee(employee)
}
