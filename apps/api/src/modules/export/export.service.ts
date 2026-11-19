import { Prisma } from '@prisma/client'
import type { Response } from 'express'
import ExcelJS from 'exceljs'
import { prisma } from '../../db/prisma.js'
import { CURRENT_SALARY_CTE } from '../analytics/analytics.service.js'
import { toCsvRow } from './csv.js'

const EXPORT_HEADERS = [
  'employeeNumber',
  'fullName',
  'email',
  'joinedAt',
  'country',
  'department',
  'designation',
  'status',
  'amount',
  'currency',
  'period',
  'effectiveFrom',
] as const

export type EmployeeExportRow = {
  employeeNumber: string
  fullName: string
  email: string
  joinedAt: Date
  country: string
  department: string
  designation: string
  status: string
  amount: Prisma.Decimal | string
  currency: string
  period: string
  effectiveFrom: Date
}

const BATCH_SIZE = 1000

function amountString(value: Prisma.Decimal | string) {
  return typeof value === 'string' ? value : value.toFixed(2)
}

function dateString(value: Date) {
  return value.toISOString().slice(0, 10)
}

function rowValues(row: EmployeeExportRow) {
  return [
    row.employeeNumber,
    row.fullName,
    row.email,
    dateString(row.joinedAt),
    row.country,
    row.department,
    row.designation,
    row.status,
    amountString(row.amount),
    row.currency,
    row.period,
    dateString(row.effectiveFrom),
  ]
}

async function fetchExportBatch(offset: number) {
  return prisma.$queryRaw<EmployeeExportRow[]>`
    WITH ${CURRENT_SALARY_CTE}
    SELECT
      "employeeNumber",
      "fullName",
      email,
      "joinedAt",
      country,
      department,
      designation,
      status::text AS status,
      amount,
      currency,
      period::text AS period,
      "effectiveFrom"
    FROM current_salary
    ORDER BY "employeeNumber"
    LIMIT ${BATCH_SIZE}
    OFFSET ${offset}
  `
}

export async function streamEmployeesCsv(res: Response) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="remunify-employees.csv"',
  )

  res.write(toCsvRow([...EXPORT_HEADERS]))

  let offset = 0
  for (;;) {
    const batch = await fetchExportBatch(offset)
    if (batch.length === 0) {
      break
    }

    for (const row of batch) {
      res.write(toCsvRow(rowValues(row)))
    }

    if (batch.length < BATCH_SIZE) {
      break
    }
    offset += BATCH_SIZE
  }

  res.end()
}

export async function streamEmployeesXlsx(res: Response) {
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="remunify-employees.xlsx"',
  )

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    stream: res,
    useStyles: false,
    useSharedStrings: false,
  })
  const sheet = workbook.addWorksheet('Employees')
  sheet.addRow([...EXPORT_HEADERS]).commit()

  let offset = 0
  for (;;) {
    const batch = await fetchExportBatch(offset)
    if (batch.length === 0) {
      break
    }

    for (const row of batch) {
      sheet.addRow(rowValues(row)).commit()
    }

    if (batch.length < BATCH_SIZE) {
      break
    }
    offset += BATCH_SIZE
  }

  await workbook.commit()
}

/** Test helper: build one CSV header + data row. */
export function buildSampleCsv(row: EmployeeExportRow) {
  return `${toCsvRow([...EXPORT_HEADERS])}${toCsvRow(rowValues(row))}`
}
