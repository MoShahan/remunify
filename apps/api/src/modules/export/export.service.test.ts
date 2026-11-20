import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Response } from 'express'
import { Prisma } from '@prisma/client'

const queryRawMock = vi.hoisted(() => vi.fn())

vi.mock('../../db/prisma.js', () => ({
  prisma: {
    $queryRaw: queryRawMock,
  },
}))

const workbookCommit = vi.hoisted(() => vi.fn())
const sheetAddRow = vi.hoisted(() =>
  vi.fn(() => ({
    commit: vi.fn(),
  })),
)

vi.mock('exceljs', () => ({
  default: {
    stream: {
      xlsx: {
        WorkbookWriter: vi.fn(function WorkbookWriter() {
          return {
            addWorksheet: vi.fn(() => ({
              addRow: sheetAddRow,
            })),
            commit: workbookCommit,
          }
        }),
      },
    },
  },
}))

import {
  buildSampleCsv,
  streamEmployeesCsv,
  streamEmployeesXlsx,
} from './export.service.js'
import { escapeCsvValue } from './csv.js'

const sampleRow = {
  employeeNumber: 'E00001',
  fullName: 'Aisha Shah',
  email: 'e00001@employees.remunify.local',
  joinedAt: new Date('2022-01-01T00:00:00.000Z'),
  country: 'India',
  department: 'Engineering',
  designation: 'Manager',
  status: 'ACTIVE',
  amount: new Prisma.Decimal('600000.00'),
  currency: 'INR',
  period: 'ANNUAL',
  effectiveFrom: new Date('2024-01-01T00:00:00.000Z'),
}

function mockResponse() {
  const writes: string[] = []
  return {
    res: {
      setHeader: vi.fn(),
      write: vi.fn((chunk: string) => {
        writes.push(String(chunk))
      }),
      end: vi.fn(),
    } as unknown as Response,
    writes,
  }
}

describe('export helpers', () => {
  beforeEach(() => {
    queryRawMock.mockReset()
    sheetAddRow.mockClear()
    workbookCommit.mockReset()
    workbookCommit.mockResolvedValue(undefined)
  })

  it('escapes CSV values that contain commas or quotes', () => {
    expect(escapeCsvValue('a,b')).toBe('"a,b"')
    expect(escapeCsvValue('say "hi"')).toBe('"say ""hi"""')
  })

  it('builds a CSV snapshot with headers and one employee row', () => {
    const csv = buildSampleCsv({
      ...sampleRow,
      amount: '600000.00',
    })

    expect(csv.split('\n')[0]).toContain('employeeNumber')
    expect(csv).toContain('E00001')
    expect(csv).toContain('600000.00')
  })

  it('streams CSV headers and rows then ends', async () => {
    queryRawMock.mockResolvedValueOnce([sampleRow]).mockResolvedValueOnce([])
    const { res, writes } = mockResponse()

    await streamEmployeesCsv(res)

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv; charset=utf-8',
    )
    expect(writes[0]).toContain('employeeNumber')
    expect(writes.some((chunk) => chunk.includes('E00001'))).toBe(true)
    expect(res.end).toHaveBeenCalled()
  })

  it('streams XLSX with workbook commit', async () => {
    queryRawMock.mockResolvedValueOnce([{ ...sampleRow, amount: '100.00' }])
    const { res } = mockResponse()

    await streamEmployeesXlsx(res)

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    expect(sheetAddRow).toHaveBeenCalled()
    expect(workbookCommit).toHaveBeenCalled()
  })

  it('stops CSV streaming when a full batch is followed by an empty one', async () => {
    const fullBatch = Array.from({ length: 1000 }, (_, i) => ({
      ...sampleRow,
      employeeNumber: `E${String(i).padStart(5, '0')}`,
      amount: '1.00',
    }))
    queryRawMock.mockResolvedValueOnce(fullBatch).mockResolvedValueOnce([])
    const { res } = mockResponse()

    await streamEmployeesCsv(res)

    expect(queryRawMock).toHaveBeenCalledTimes(2)
    expect(res.end).toHaveBeenCalled()
  })
})
