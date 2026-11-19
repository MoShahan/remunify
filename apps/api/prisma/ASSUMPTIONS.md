# Prisma schema - locked product assumptions

Source of truth: [`docs/database-design.md`](../../../docs/database-design.md), [`docs/requirements.md`](../../../docs/requirements.md).

**Note:** The checked-in `schema.prisma` may still be the older _provisional_ draft until the next migration lands. Treat this file + docs as the target model.

## Target v1 includes

- `Employee` with email + `joinedAt`, plus country/department/designation/status
- `Salary` **history rows** (many per employee); current = latest `effectiveFrom`
- Raise = insert new row (keep old); no overlapping periods
- Period = **ANNUAL** only
- Money as `Decimal(14, 2)` + `Char(3)` currency
- `User` for single HR login
- `FxRate` (or equivalent) for fixed demo USD conversion
- Indexes for search/filter/analytics/history

## Explicitly not in v1

| Topic                                    | Why                             |
| ---------------------------------------- | ------------------------------- |
| Salary components (base/bonus/allowance) | Product: upcoming               |
| Monthly period UI                        | Annual only; monthly upcoming   |
| Live FX API                              | Fixed demo rates; live upcoming |
| Import-run tables                        | Export only; import upcoming    |
| Manager / location fields                | Upcoming                        |

## Apply migration + seed

```bash
cp apps/api/.env.example apps/api/.env
npm run db:migrate
npm run db:seed
```

Seed target: deterministic RNG, **10,000** employees across many countries/currencies, salary history depth, FxRate rows, one HR user. Re-run clears and reloads.
