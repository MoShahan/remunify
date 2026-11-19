import { Badge } from '@/components/ui/badge'
import type { EmploymentStatus } from '@/lib/api/types'

export function StatusBadge({ status }: { status: EmploymentStatus }) {
  return (
    <Badge variant={status === 'ACTIVE' ? 'success' : 'muted'}>
      {status === 'ACTIVE' ? 'Active' : 'Inactive'}
    </Badge>
  )
}
