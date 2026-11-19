import { useState } from 'react'
import { toast } from 'sonner'
import { exportEmployeesCsv, exportEmployeesXlsx, isApiError } from '@/lib/api'

export function useExportActions() {
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null)

  const run = async (kind: 'csv' | 'xlsx') => {
    setExporting(kind)
    try {
      if (kind === 'csv') {
        await exportEmployeesCsv()
        toast.success('CSV download started')
      } else {
        await exportEmployeesXlsx()
        toast.success('Excel download started')
      }
    } catch (error) {
      toast.error(
        isApiError(error) ? error.message : 'Export failed. Please try again.',
      )
    } finally {
      setExporting(null)
    }
  }

  return {
    exporting,
    exportCsv: () => run('csv'),
    exportXlsx: () => run('xlsx'),
  }
}
