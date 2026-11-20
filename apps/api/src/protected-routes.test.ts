import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signAuthToken } from './lib/jwt.js'

const getAnalyticsSummary = vi.hoisted(() => vi.fn())
const listEmployees = vi.hoisted(() => vi.fn())
const getEmployeeFacets = vi.hoisted(() => vi.fn())
const getEmployeeById = vi.hoisted(() => vi.fn())
const updateEmployeeStatus = vi.hoisted(() => vi.fn())
const getSalaryForEmployee = vi.hoisted(() => vi.fn())
const listSalaryHistoryForEmployee = vi.hoisted(() => vi.fn())
const createSalaryForEmployee = vi.hoisted(() => vi.fn())
const updateSalaryForEmployee = vi.hoisted(() => vi.fn())
const streamEmployeesCsv = vi.hoisted(() => vi.fn())
const streamEmployeesXlsx = vi.hoisted(() => vi.fn())

vi.mock('./db/prisma.js', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    employee: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
  },
}))

vi.mock('./modules/analytics/analytics.service.js', () => ({
  getAnalyticsSummary: (...args: unknown[]) => getAnalyticsSummary(...args),
}))

vi.mock('./modules/employees/employees.service.js', () => ({
  listEmployees: (...args: unknown[]) => listEmployees(...args),
  getEmployeeFacets: (...args: unknown[]) => getEmployeeFacets(...args),
  getEmployeeById: (...args: unknown[]) => getEmployeeById(...args),
  updateEmployeeStatus: (...args: unknown[]) => updateEmployeeStatus(...args),
}))

vi.mock('./modules/salaries/salaries.service.js', () => ({
  getSalaryForEmployee: (...args: unknown[]) => getSalaryForEmployee(...args),
  listSalaryHistoryForEmployee: (...args: unknown[]) =>
    listSalaryHistoryForEmployee(...args),
  createSalaryForEmployee: (...args: unknown[]) =>
    createSalaryForEmployee(...args),
  updateSalaryForEmployee: (...args: unknown[]) =>
    updateSalaryForEmployee(...args),
}))

vi.mock('./modules/export/export.service.js', () => ({
  streamEmployeesCsv: (...args: unknown[]) => streamEmployeesCsv(...args),
  streamEmployeesXlsx: (...args: unknown[]) => streamEmployeesXlsx(...args),
  buildSampleCsv: vi.fn(),
}))

import { createApp } from './app.js'

async function authHeader() {
  process.env.JWT_SECRET = 'test-secret-for-routes'
  const token = await signAuthToken({
    sub: 'user_hr_001',
    email: 'hr@remunify.com',
    role: 'HR',
  })
  return `Bearer ${token}`
}

describe('protected API routes', () => {
  const app = createApp()

  beforeEach(() => {
    vi.clearAllMocks()
    streamEmployeesCsv.mockImplementation(
      async (res: {
        setHeader: (k: string, v: string) => void
        end: () => void
      }) => {
        res.setHeader('Content-Type', 'text/csv')
        res.end()
      },
    )
    streamEmployeesXlsx.mockImplementation(
      async (res: {
        setHeader: (k: string, v: string) => void
        end: () => void
      }) => {
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        res.end()
      },
    )
  })

  it('returns analytics summary', async () => {
    getAnalyticsSummary.mockResolvedValue({
      headcount: {
        total: 1,
        active: 1,
        inactive: 0,
        withSalary: 1,
        withoutSalary: 0,
      },
      byCurrency: [],
      byCountry: [],
      byDepartment: [],
      averageByCountryUsd: [],
      companyWideUsd: {
        totalAmountUsd: '0.00',
        employeeCount: 0,
        ratesAsOf: null,
        label: 'demo',
      },
    })

    const response = await request(app)
      .get('/api/analytics/summary')
      .set('Authorization', await authHeader())

    expect(response.status).toBe(200)
    expect(response.body.data.headcount.total).toBe(1)
    expect(getAnalyticsSummary).toHaveBeenCalled()
  })

  it('lists employees, facets, detail, and status update', async () => {
    const employee = {
      id: 'emp_00001',
      employeeNumber: 'E00001',
      fullName: 'Aisha Shah',
      email: 'a@example.com',
      status: 'ACTIVE',
    }
    listEmployees.mockResolvedValue({
      data: [employee],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    })
    getEmployeeFacets.mockResolvedValue({
      countries: ['India'],
      departments: ['Engineering'],
      designations: ['Manager'],
    })
    getEmployeeById.mockResolvedValue(employee)
    updateEmployeeStatus.mockResolvedValue({ ...employee, status: 'INACTIVE' })

    const auth = await authHeader()

    const list = await request(app)
      .get('/api/employees?page=1&pageSize=20')
      .set('Authorization', auth)
    expect(list.status).toBe(200)
    expect(list.body.data).toHaveLength(1)

    const facets = await request(app)
      .get('/api/employees/facets')
      .set('Authorization', auth)
    expect(facets.status).toBe(200)
    expect(facets.body.data.countries).toEqual(['India'])

    const detail = await request(app)
      .get('/api/employees/emp_00001')
      .set('Authorization', auth)
    expect(detail.status).toBe(200)
    expect(detail.body.data.id).toBe('emp_00001')

    const patch = await request(app)
      .patch('/api/employees/emp_00001')
      .set('Authorization', auth)
      .send({ status: 'INACTIVE' })
    expect(patch.status).toBe(200)
    expect(patch.body.data.status).toBe('INACTIVE')
  })

  it('covers salary get/history/create/update routes', async () => {
    const salary = {
      id: 'sal_1',
      amount: '100.00',
      currency: 'USD',
      period: 'ANNUAL',
      effectiveFrom: '2024-01-01',
    }
    getSalaryForEmployee.mockResolvedValue(salary)
    listSalaryHistoryForEmployee.mockResolvedValue([salary])
    createSalaryForEmployee.mockResolvedValue(salary)
    updateSalaryForEmployee.mockResolvedValue({
      ...salary,
      amount: '120.00',
    })

    const auth = await authHeader()
    const base = '/api/employees/emp_00001/salary'

    expect(
      (await request(app).get(base).set('Authorization', auth)).status,
    ).toBe(200)
    expect(
      (await request(app).get(`${base}/history`).set('Authorization', auth))
        .status,
    ).toBe(200)

    const created = await request(app)
      .post(base)
      .set('Authorization', auth)
      .send({
        amount: '100.00',
        currency: 'USD',
        effectiveFrom: '2024-01-01',
      })
    expect(created.status).toBe(201)

    const raised = await request(app)
      .patch(base)
      .set('Authorization', auth)
      .send({
        amount: '120.00',
        currency: 'USD',
        effectiveFrom: '2025-01-01',
      })
    expect(raised.status).toBe(200)
    expect(raised.body.data.amount).toBe('120.00')
  })

  it('streams export CSV and XLSX', async () => {
    const auth = await authHeader()

    const csv = await request(app)
      .get('/api/export/employees.csv')
      .set('Authorization', auth)
    expect(csv.status).toBe(200)
    expect(streamEmployeesCsv).toHaveBeenCalled()

    const xlsx = await request(app)
      .get('/api/export/employees.xlsx')
      .set('Authorization', auth)
    expect(xlsx.status).toBe(200)
    expect(streamEmployeesXlsx).toHaveBeenCalled()
  })
})
