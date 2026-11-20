import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api/errors'

const exportEmployeesCsv = vi.hoisted(() => vi.fn())
const exportEmployeesXlsx = vi.hoisted(() => vi.fn())
const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}))

vi.mock('sonner', () => ({ toast }))
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api')>('@/lib/api')
  return {
    ...actual,
    exportEmployeesCsv: (...args: unknown[]) => exportEmployeesCsv(...args),
    exportEmployeesXlsx: (...args: unknown[]) => exportEmployeesXlsx(...args),
  }
})

import { useExportActions } from './use-export'

describe('useExportActions', () => {
  beforeEach(() => {
    exportEmployeesCsv.mockReset()
    exportEmployeesXlsx.mockReset()
    toast.success.mockReset()
    toast.error.mockReset()
  })

  it('exports CSV and shows a success toast', async () => {
    exportEmployeesCsv.mockResolvedValue(undefined)
    const { result } = renderHook(() => useExportActions())

    await act(async () => {
      await result.current.exportCsv()
    })

    expect(exportEmployeesCsv).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('CSV download started')
    expect(result.current.exporting).toBeNull()
  })

  it('exports XLSX and shows a success toast', async () => {
    exportEmployeesXlsx.mockResolvedValue(undefined)
    const { result } = renderHook(() => useExportActions())

    await act(async () => {
      await result.current.exportXlsx()
    })

    expect(exportEmployeesXlsx).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Excel download started')
  })

  it('surfaces ApiError messages on failure', async () => {
    exportEmployeesCsv.mockRejectedValue(
      new ApiError(500, 'INTERNAL', 'Export boom'),
    )
    const { result } = renderHook(() => useExportActions())

    await act(async () => {
      await result.current.exportCsv()
    })

    expect(toast.error).toHaveBeenCalledWith('Export boom')
    await waitFor(() => expect(result.current.exporting).toBeNull())
  })

  it('surfaces a generic message for unknown errors', async () => {
    exportEmployeesXlsx.mockRejectedValue(new Error('network'))
    const { result } = renderHook(() => useExportActions())

    await act(async () => {
      await result.current.exportXlsx()
    })

    expect(toast.error).toHaveBeenCalledWith('Export failed. Please try again.')
  })
})
