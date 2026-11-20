import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TABLE_VIEWS } from '@/features/analytics/rollup-table-model'

/** Analytics jump-off to full rollup grids (tables live on /tables, not here). */
export function OpenTablesLinks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Full tables</CardTitle>
        <CardDescription>
          Open paginated rollups by currency, country, or department.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {TABLE_VIEWS.map((view) => (
          <Button key={view.id} asChild variant="outline" size="sm">
            <Link to={`/tables?view=${view.id}`}>{view.title}</Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
