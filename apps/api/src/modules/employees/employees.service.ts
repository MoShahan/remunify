import type { Prisma } from '@prisma/client'
import { prisma } from '../../db/prisma.js'
import { notFound } from '../../lib/errors.js'
import type {
  ListEmployeesQuery,
  UpdateEmployeeBody,
} from './employees.schemas.js'

const salaryFields = {
  id: true,
  amount: true,
  currency: true,
  period: true,
  effectiveFrom: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SalarySelect

const employeeListSelect = {
  id: true,
  employeeNumber: true,
  fullName: true,
  email: true,
  joinedAt: true,
  country: true,
  department: true,
  designation: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  salaries: {
    orderBy: { effectiveFrom: 'desc' },
    take: 1,
    select: salaryFields,
  },
} satisfies Prisma.EmployeeSelect

const employeeDetailSelect = {
  ...employeeListSelect,
  salaries: {
    orderBy: { effectiveFrom: 'desc' },
    select: salaryFields,
  },
} satisfies Prisma.EmployeeSelect

function serializeSalary(
  salary: {
    id: string
    amount: { toFixed: (digits: number) => string } | string
    currency: string
    period: string
    effectiveFrom: Date
    createdAt: Date
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
    createdAt: salary.createdAt.toISOString(),
    updatedAt: salary.updatedAt.toISOString(),
  }
}

function serializeEmployeeListItem(
  employee: Prisma.EmployeeGetPayload<{ select: typeof employeeListSelect }>,
) {
  const current = employee.salaries[0] ?? null
  return {
    id: employee.id,
    employeeNumber: employee.employeeNumber,
    fullName: employee.fullName,
    email: employee.email,
    joinedAt: employee.joinedAt.toISOString().slice(0, 10),
    country: employee.country,
    department: employee.department,
    designation: employee.designation,
    status: employee.status,
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
    salary: serializeSalary(current),
  }
}

function serializeEmployeeDetail(
  employee: Prisma.EmployeeGetPayload<{ select: typeof employeeDetailSelect }>,
) {
  const history = employee.salaries.map((row) => serializeSalary(row)!)
  return {
    ...serializeEmployeeListItem({
      ...employee,
      salaries: employee.salaries.slice(0, 1),
    }),
    salaryHistory: history,
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
      {
        email: {
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
    data: rows.map(serializeEmployeeListItem),
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
    select: employeeDetailSelect,
  })

  if (!employee) {
    throw notFound(`Employee not found: ${id}`)
  }

  return serializeEmployeeDetail(employee)
}

export async function getEmployeeFacets() {
  const [countries, departments] = await Promise.all([
    prisma.employee.findMany({
      distinct: ['country'],
      select: { country: true },
      orderBy: { country: 'asc' },
    }),
    prisma.employee.findMany({
      distinct: ['department'],
      select: { department: true },
      orderBy: { department: 'asc' },
    }),
  ])

  return {
    countries: countries.map((row) => row.country),
    departments: departments.map((row) => row.department),
  }
}

export async function updateEmployeeStatus(
  id: string,
  body: UpdateEmployeeBody,
) {
  const existing = await prisma.employee.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!existing) {
    throw notFound(`Employee not found: ${id}`)
  }

  const employee = await prisma.employee.update({
    where: { id },
    data: { status: body.status },
    select: employeeDetailSelect,
  })

  return serializeEmployeeDetail(employee)
}
