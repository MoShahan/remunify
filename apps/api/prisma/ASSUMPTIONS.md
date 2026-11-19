# Prisma schema - locked v1

Source of truth: [`docs/database-design.md`](../../../docs/database-design.md), [`docs/requirements.md`](../../../docs/requirements.md).

## Included

- `User` - single HR login (`email`, `passwordHash`, role `HR`)
- `Employee` - number, name, email, `joinedAt`, country, department, designation, status
- `Salary` - **history rows** (many per employee); current = latest `effectiveFrom`
- Raise = insert new row (keep old); unique `(employeeId, effectiveFrom)`
- Period = **ANNUAL** only
- `FxRate` - fixed demo USD conversion rates
- Money as `Decimal(14, 2)` + `Char(3)` currency

## Not in v1

| Topic              | Why              |
| ------------------ | ---------------- |
| Salary components  | Upcoming         |
| Monthly period     | Upcoming         |
| Live FX API        | Fixed demo rates |
| Import-run tables  | Export only      |
| Manager / location | Upcoming         |

## Apply migration + seed

```bash
cp apps/api/.env.example apps/api/.env
npm run db:migrate
npm run db:seed
```

Optional env for seeded HR user: `HR_EMAIL`, `HR_PASSWORD` (defaults `hr@remunify.com` / `HR@123`).

Seed: deterministic RNG (42), **10,000** employees across many countries, salary history depth 1-3, FxRate rows, one HR user. Re-run clears and reloads.
