# Remunify - Database Design

> Locked relational model for PostgreSQL + Prisma (product decisions 2026-11-19).  
> Aligns with [`requirements.md`](./requirements.md) and [`architecture.md`](./architecture.md).  
> Implementation target: evolve `apps/api/prisma/schema.prisma` off the provisional migration.

## Principles

- Money: `DECIMAL` / Prisma `Decimal` - **never** float/double for stored amounts
- Every salary amount has an explicit **ISO currency code**
- Pay period in v1: **ANNUAL** only
- Synthetic seed only; deterministic where practical; **>= 10,000 employees**
- Prefer indexes that match real list/filter/sort/analytics queries
- Analytics: per-currency aggregates; company-wide totals only via **fixed demo FX → USD**

## Entities (v1)

### User (HR auth)

| Column                    | Type (logical) | Notes                 |
| ------------------------- | -------------- | --------------------- |
| `id`                      | UUID / cuid    | Primary key           |
| `email`                   | string         | Unique; login id      |
| `passwordHash`            | string         | Never store plaintext |
| `role`                    | enum/string    | `HR` for v1           |
| `createdAt` / `updatedAt` | timestamps     | Audit                 |

Seed **one** HR user (credentials via seed + env example; document in README).

### Employee

| Column                    | Type (logical) | Notes                          |
| ------------------------- | -------------- | ------------------------------ |
| `id`                      | UUID / cuid    | Primary key                    |
| `employeeNumber`          | string         | Unique business id; searchable |
| `fullName`                | string         | Searchable                     |
| `email`                   | string         | Unique; searchable             |
| `joinedAt`                | date           | Joining date                   |
| `country`                 | string         | Filter / analytics             |
| `department`              | string         | Filter / analytics             |
| `designation`             | string         | Job title                      |
| `status`                  | enum           | `ACTIVE`, `INACTIVE`           |
| `createdAt` / `updatedAt` | timestamps     | Audit                          |

**Not in v1 schema:** manager, location, salary components (upcoming).

### Salary (current + history)

Multiple rows per employee. **Current** = row with latest `effectiveFrom` for that employee. Raises **insert** a new row; prior rows stay (no delete / overwrite). No overlapping periods: a new `effectiveFrom` starts the new current period.

| Column                    | Type (logical) | Notes                        |
| ------------------------- | -------------- | ---------------------------- |
| `id`                      | UUID / cuid    | Primary key                  |
| `employeeId`              | FK -> Employee | Not unique (history allowed) |
| `amount`                  | decimal        | Precise money                |
| `currency`                | char(3)        | e.g. `USD`, `INR`, `AED`     |
| `period`                  | enum           | `ANNUAL` in v1               |
| `effectiveFrom`           | date           | Raise / start date           |
| `createdAt` / `updatedAt` | timestamps     | Audit                        |

### FxRate (demo conversion)

Fixed demo rates for company-wide USD totals (not live market data).

| Column       | Type (logical) | Notes                              |
| ------------ | -------------- | ---------------------------------- |
| `currency`   | char(3)        | PK (or unique)                     |
| `usdPerUnit` | decimal        | Multiply amount by this to get USD |
| `asOf`       | date           | Labeled “demo rates as of …” in UI |
| `updatedAt`  | timestamp      | Audit                              |

Alternatively rates may live in seed/config constants if a table is overkill - prefer a small table so analytics can join consistently.

## ER diagram

Canonical Mermaid ER lives in [`er-diagram.md`](./er-diagram.md).

## Relationships

| From            | To     | Cardinality | Rule                                                                   |
| --------------- | ------ | ----------- | ---------------------------------------------------------------------- |
| Employee        | Salary | 1:1..n      | At least one salary for seeded actives; current = max(`effectiveFrom`) |
| Salary.currency | FxRate | n:1         | Used only for labeled USD company totals                               |

## Indexes (planned)

| Index                                            | Why                     |
| ------------------------------------------------ | ----------------------- |
| `Employee.employeeNumber` unique                 | Lookup / search         |
| `Employee.email` unique                          | Lookup / search         |
| `(Employee.fullName)`                            | Name search             |
| `(Employee.country, Employee.department)`        | Filters + group-by      |
| `(Employee.status)`                              | Active cohort           |
| `(Salary.employeeId, Salary.effectiveFrom DESC)` | Current + history fetch |
| `(Salary.currency)`                              | Per-currency aggregates |
| `User.email` unique                              | Login                   |

## Money and currency rules

| Rule                       | Behavior                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| Store                      | Decimal amount + currency always together                                                    |
| Directory / detail current | Latest `effectiveFrom` only                                                                  |
| Detail history             | All salary rows for employee, newest first                                                   |
| Aggregate                  | Group by currency (+ dimension); never blind-sum mixed currencies                            |
| Company-wide               | Convert each **current** salary to USD via `FxRate`, then sum; UI labels demo rates + `asOf` |
| FX live API                | Upcoming - not in v1                                                                         |

## Seed expectations

- **10,000** employees; sensible ISO currency per country
- **Minimum countries** (add more if useful): UAE, Saudi Arabia, Qatar, Bahrain, Yemen, Mexico, USA, Canada, Russia, China, Japan, India, Sri Lanka, Pakistan, Bangladesh, Afghanistan, several African countries, Portugal, Spain, France, Italy, Norway
- Each employee: joining date; **one or more** salary rows (history depth can vary); current = latest
- Seed `FxRate` rows for every currency used
- Seed **one** HR `User`
- Re-runnable; documented in README

## Export (no extra tables required)

CSV/Excel export reads employees + **current** salary (and chosen columns). Import is upcoming - no import-run table in v1.

## Out of scope for the data model

- Payroll ledgers, bank accounts, payslip lines
- Tax tables by jurisdiction
- Live FX time series
- Salary component child tables (upcoming)
