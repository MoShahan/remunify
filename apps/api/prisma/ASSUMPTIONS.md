# Provisional Prisma schema - assumptions

Source of truth for product intent: [`docs/database-design.md`](../../../docs/database-design.md).

## Included now

- `Employee` with minimal fields (Q4 provisional set)
- `Salary` as **at most one current row** per employee (`employeeId` unique)
- Money as `Decimal(14, 2)` + `Char(3)` currency
- Indexes for search/filter/analytics habits

## Explicitly not included yet

| Topic                                       | Why               |
| ------------------------------------------- | ----------------- |
| `SalaryHistory`                             | **Q1** unanswered |
| Bonus/allowance components, extra HR fields | **Q4** unanswered |
| Auth/user tables                            | **Q3** unanswered |
| Import-run tables                           | **Q5** unanswered |

## Apply migration + seed

Requires a running Postgres matching `DATABASE_URL` in `apps/api/.env`:

```bash
cp apps/api/.env.example apps/api/.env
npm run db:migrate
npm run db:seed
```

`db:seed` runs `prisma/seed.ts`: deterministic RNG (seed 42), **10,000** employees, one current salary each, clears prior rows first.
