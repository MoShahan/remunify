# Remunify - Performance Considerations

> How v1 stays responsive with ~10,000 employees. Product rules: [`requirements.md`](./requirements.md). Schema/indexes: [`database-design.md`](./database-design.md).

## Goals

- Interactive directory and analytics on seeded ACME-scale data
- Predictable API latency: heavy work in Postgres, small JSON payloads
- Export of the full current-salary snapshot without loading the entire file into one Node string/object graph

## Backend

### Current salary (shared rule)

List, analytics, and export all treat **current** salary as the latest `effectiveFrom` per employee. That is computed in SQL (`DISTINCT ON ("employeeId") … ORDER BY "employeeId", "effectiveFrom" DESC` / shared CTE), not by loading full history into Node and reducing.

Indexes that support this path (see Prisma schema):

- `Salary`: `@@unique([employeeId, effectiveFrom])`, `@@index([employeeId, effectiveFrom(sort: Desc)])`, `@@index([currency])`
- `Employee`: `@@index([country, department])`, `@@index([status])`, plus name/email for search

### Analytics

- Aggregates (per currency, country×currency, department×currency, labeled USD total) run as `$queryRaw` inside one transaction
- Median via Postgres `percentile_cont(0.5)` - no in-memory sort of 10k amounts
- Amounts returned as decimal strings; never blind-sum mixed currencies
- Company-wide USD uses seeded `FxRate` join and is labeled as demo rates

### Employees directory

- Server-side `page` / `pageSize` / `search` / filters / `sortBy` / `sortOrder`
- List payload includes only fields the table needs, plus a nested **current** salary (or `null`)
- No N+1: one list query path; detail loads history in the detail endpoint only

### Export

- CSV and Excel endpoints batch SQL reads and **stream** to the response
- CSV writes rows as batches arrive; Excel uses a streaming workbook writer where practical
- Auth required; same current-salary semantics as analytics

### Auth

- JWT verified in middleware (`jose`); **no** `User` table lookup on every request
- Login is the only place that hashes/verifies the password

## Frontend

- TanStack Query: shared keys (e.g. analytics summary reused by Dashboard and Analytics), `staleTime` ~30s, keep previous list data while refetching
- Route-level `React.lazy` + Suspense with layout skeletons (not a global circle spinner)
- Directory search debounced (~300ms); employee detail prefetched on row hover
- Recharts loaded only with the Analytics route bundle

## Explicit non-goals (v1)

| Avoided                               | Why                                                 |
| ------------------------------------- | --------------------------------------------------- |
| Virtualizing the directory table      | Page size ≤ 100; server paging is enough            |
| N+1 Prisma loops for analytics/export | Forbidden; use SQL                                  |
| Load-all-then-aggregate in Node       | Forbidden for org analytics                         |
| Blind cross-currency totals           | Misleading for HR; USD path is labeled demo FX only |

## Smoke expectations

On local Postgres with the 10k seed, analytics summary and a paged directory request should feel interactive (target well under ~1–2s for summary on a typical laptop). If `EXPLAIN` shows a sequential-scan problem on the current-salary CTE, add a targeted index migration - do not paper over with Node caching.
