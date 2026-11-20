# Remunify - Testing

How we run tests and the current **CLI-style coverage snapshot** (Statements / Branches / Functions / Lines), grouped by directory like the Vitest terminal report. Stack choices: [`technical-decisions.md`](./technical-decisions.md).

## Stack

| Area | Choice                         |
| ---- | ------------------------------ |
| API  | Vitest + Supertest             |
| Web  | Vitest + React Testing Library |

## Commands

```bash
npm run test                 # all workspaces
npm run test:web
npm run test:api

npm run test:coverage        # all workspaces (text + json-summary)
npm run test:coverage:web
npm run test:coverage:api
```

Coverage uses `@vitest/coverage-v8` with **text** and **json-summary** reporters. Do not commit generated `coverage/` folders (gitignored). HTML reports are local-only if you enable them yourself.

After `test:coverage`, each workspace writes `apps/<pkg>/coverage/coverage-summary.json`. Refresh the trees below from that JSON (or paste the CLI text table). Optional helper: `node .local/gen-coverage-md.mjs`.

## What we prioritize

- Salary validation, raise/history rules, currency handling
- Employee search/filter/sort/pagination
- Analytics grouping (per-currency + labeled USD rollup)
- Auth/export once those modules exist
- Fast, deterministic tests; no external services; no brittle markup asserts

## Coverage snapshot

As of **2026-11-20** (from `npm run test:coverage:web` / `test:coverage:api`):

| Package | Statements | Branches | Functions | Lines  |
| ------- | ---------- | -------- | --------- | ------ |
| web     | 83.86%     | 72.05%   | 80.79%    | 85.51% |
| api     | 90.27%     | 69.49%   | 97.22%    | 90.20% |

Refresh the package summary **and** the directory trees when finishing work that touches app source under test or `*.test.*` files (see quality-gates skill).

### web (`@remunify/web`)

```
File                           | % Stmts | % Branch | % Funcs | % Lines
-------------------------------|---------|----------|---------|---------
All files                      |  83.86 |  72.05 |  80.79 |  85.51
src                            |     50 |    100 |    100 |     50
  App.tsx                      |    100 |    100 |    100 |    100
  main.tsx                     |      0 |    100 |    100 |      0
src/app                        |  70.59 |    100 |     50 |    100
  providers.tsx                |    100 |    100 |    100 |    100
  router.tsx                   |  64.28 |    100 |   37.5 |    100
src/components                 |  94.64 |  70.91 |  96.77 |  94.44
  app-shell.tsx                |  93.33 |   62.5 |   87.5 |  93.33
  brand-mark.tsx               |    100 |    100 |    100 |    100
  country-flag.tsx             |    100 |  57.14 |    100 |    100
  empty-state.tsx              |    100 |     50 |    100 |    100
  error-state.tsx              |    100 |  33.33 |    100 |    100
  form-field-error.tsx         |    100 |    100 |    100 |    100
  money-text.tsx               |  83.33 |   62.5 |    100 |  83.33
  page-header.tsx              |    100 |     75 |    100 |    100
  scroll-to-top.tsx            |    100 |    100 |    100 |    100
  skeletons.tsx                |    100 |    100 |    100 |    100
  stale-data-banner.tsx        |     90 |     90 |    100 |  88.88
  status-badge.tsx             |    100 |    100 |    100 |    100
src/components/ui              |  88.89 |     64 |  82.93 |  90.32
  badge.tsx                    |    100 |    100 |    100 |    100
  button.tsx                   |    100 |    100 |    100 |    100
  card.tsx                     |    100 |    100 |    100 |    100
  dialog.tsx                   |    100 |    100 |    100 |    100
  dropdown-menu.tsx            |    100 |     60 |    100 |    100
  input.tsx                    |    100 |    100 |    100 |    100
  label.tsx                    |    100 |    100 |    100 |    100
  password-input.tsx           |     40 |     50 |     25 |     50
  select.tsx                   |    100 |    100 |    100 |    100
  separator.tsx                |      0 |      0 |      0 |      0
  sheet.tsx                    |  66.66 |    100 |     25 |  66.66
  skeleton.tsx                 |    100 |    100 |    100 |    100
  sonner.tsx                   |    100 |    100 |    100 |    100
  table.tsx                    |    100 |    100 |    100 |    100
  tooltip.tsx                  |    100 |    100 |    100 |    100
src/features/analytics         |   88.8 |  64.34 |  82.98 |   88.6
  avg-country-usd-chart.tsx    |  66.66 |   37.5 |     50 |     60
  avg-department-chart.tsx     |  83.33 |  16.66 |     80 |  83.33
  chart-theme.ts               |  85.71 |    100 |      0 |  85.71
  company-wide-usd-card.tsx    |    100 |    100 |    100 |    100
  currency-headcount-chart.tsx |    100 |    100 |    100 |    100
  median-vs-average-chart.tsx  |   37.5 |      5 |  66.66 |  28.57
  open-tables-links.tsx        |    100 |    100 |    100 |    100
  rollup-preview-footer.tsx    |    100 |    100 |    100 |    100
  rollup-table-model.ts        |  96.66 |  88.67 |    100 |  98.07
  rollup-tables.tsx            |  93.33 |  94.44 |     75 |  93.33
  salary-coverage-card.tsx     |    100 |     50 |    100 |    100
  status-pie-chart.tsx         |     75 |  33.33 |     75 |     75
  top-cohorts-card.tsx         |  83.33 |   37.5 |     75 |  83.33
  use-analytics-summary.ts     |    100 |    100 |    100 |    100
src/features/auth              |  97.22 |  83.33 |    100 |  96.97
  auth-context.tsx             |    100 |    100 |    100 |    100
  require-auth.tsx             |     90 |     75 |    100 |     90
src/features/employees         |  70.49 |  69.39 |  69.23 |  72.41
  salary-form-dialog.tsx       |  70.49 |  69.38 |  69.23 |  72.41
src/features/export            |    100 |    100 |    100 |    100
  use-export.ts                |    100 |    100 |    100 |    100
src/hooks                      |    100 |    100 |    100 |    100
  use-debounce.ts              |    100 |    100 |    100 |    100
src/lib                        |     76 |     50 |  83.33 |  78.26
  country-flags.ts             |    100 |    100 |    100 |    100
  env.ts                       |      0 |      0 |      0 |      0
  format-money.ts              |  88.88 |     70 |    100 |  93.75
  utils.ts                     |    100 |    100 |    100 |    100
src/lib/api                    |  92.78 |  88.71 |  90.63 |  92.63
  analytics.ts                 |  66.66 |    100 |     50 |  66.66
  auth-storage.ts              |  66.66 |     50 |  66.66 |   64.7
  auth.ts                      |    100 |    100 |    100 |    100
  client.ts                    |    100 |   90.9 |    100 |    100
  employees.ts                 |    100 |    100 |    100 |    100
  errors.ts                    |    100 |  86.66 |    100 |    100
  export.ts                    |    100 |    100 |    100 |    100
  index.ts                     |    100 |    100 |    100 |    100
  types.ts                     |    100 |    100 |    100 |    100
src/pages                      |  76.11 |  74.31 |  68.42 |  78.54
  analytics.tsx                |  85.71 |   87.5 |     50 |  84.61
  dashboard.tsx                |  77.77 |  81.81 |  66.66 |  77.77
  employee-detail.tsx          |  73.68 |  73.17 |  68.75 |     80
  employees.tsx                |  73.62 |   78.3 |  65.51 |     75
  login.tsx                    |  76.31 |     50 |    100 |  78.37
  tables.tsx                   |  78.94 |  64.28 |  68.75 |  81.81
```

### api (`@remunify/api`)

```
File                      | % Stmts | % Branch | % Funcs | % Lines
--------------------------|---------|----------|---------|---------
All files                 |  90.27 |  69.49 |  97.22 |   90.2
src                       |  68.42 |      0 |  66.67 |  68.42
  app.ts                  |    100 |    100 |    100 |    100
  index.ts                |      0 |      0 |      0 |      0
src/db                    |      0 |      0 |    100 |      0
  prisma.ts               |      0 |      0 |    100 |      0
src/lib                   |   90.7 |     75 |  92.86 |   90.7
  async-handler.ts        |    100 |    100 |    100 |    100
  errors.ts               |     90 |    100 |  83.33 |     90
  jwt.ts                  |  94.73 |  76.47 |    100 |  94.73
  password.ts             |  83.33 |  71.42 |    100 |  83.33
src/middleware            |   96.3 |   87.5 |    100 |  96.15
  error-handler.ts        |    100 |    100 |    100 |    100
  require-auth.ts         |     90 |  83.33 |    100 |     90
  validate.ts             |    100 |  83.33 |    100 |    100
src/modules/analytics     |     90 |  57.14 |    100 |     90
  analytics.controller.ts |    100 |    100 |    100 |    100
  analytics.routes.ts     |    100 |    100 |    100 |    100
  analytics.service.ts    |   87.5 |  57.14 |    100 |   87.5
src/modules/auth          |    100 |    100 |    100 |    100
  auth.controller.ts      |    100 |    100 |    100 |    100
  auth.routes.ts          |    100 |    100 |    100 |    100
  auth.schemas.ts         |    100 |    100 |    100 |    100
  auth.service.ts         |    100 |    100 |    100 |    100
src/modules/employees     |  88.14 |  59.09 |    100 |  87.93
  employees.controller.ts |    100 |    100 |    100 |    100
  employees.routes.ts     |    100 |    100 |    100 |    100
  employees.schemas.ts    |    100 |    100 |    100 |    100
  employees.service.ts    |  81.57 |  59.09 |    100 |  81.08
src/modules/export        |  95.74 |  81.25 |    100 |  95.74
  csv.ts                  |    100 |  83.33 |    100 |    100
  export.controller.ts    |    100 |    100 |    100 |    100
  export.routes.ts        |    100 |    100 |    100 |    100
  export.service.ts       |  94.59 |     80 |    100 |  94.59
src/modules/salaries      |  96.55 |     75 |    100 |  96.55
  salaries.controller.ts  |    100 |    100 |    100 |    100
  salaries.routes.ts      |    100 |    100 |    100 |    100
  salaries.schemas.ts     |    100 |    100 |    100 |    100
  salaries.service.ts     |  93.54 |     75 |    100 |  93.54
src/types                 |    100 |    100 |    100 |    100
  express.d.ts            |    100 |    100 |    100 |    100
```
