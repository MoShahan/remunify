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
| web     | 64.64%     | 53.79%   | 62.26%    | 66.17% |
| api     | 68.05%     | 59.32%   | 77.77%    | 68.18% |

Refresh the package summary **and** the directory trees when finishing work that touches app source under test or `*.test.*` files (see quality-gates skill).

### web (`@remunify/web`)

```
File                       | % Stmts | % Branch | % Funcs | % Lines
---------------------------|---------|----------|---------|---------
All files                  |  64.64 |  53.79 |  62.26 |  66.17
src                        |     50 |    100 |    100 |     50
  App.tsx                  |    100 |    100 |    100 |    100
  main.tsx                 |      0 |    100 |    100 |      0
src/app                    |  70.59 |    100 |     50 |    100
  providers.tsx            |    100 |    100 |    100 |    100
  router.tsx               |  64.28 |    100 |   37.5 |    100
src/components             |  55.36 |  45.45 |  67.74 |  55.56
  app-shell.tsx            |   6.66 |      0 |      0 |   6.66
  brand-mark.tsx           |    100 |    100 |    100 |    100
  country-flag.tsx         |    100 |  57.14 |    100 |    100
  empty-state.tsx          |    100 |     50 |    100 |    100
  error-state.tsx          |    100 |  33.33 |    100 |    100
  form-field-error.tsx     |    100 |    100 |    100 |    100
  money-text.tsx           |  83.33 |   62.5 |    100 |  83.33
  page-header.tsx          |    100 |     75 |    100 |    100
  scroll-to-top.tsx        |    100 |    100 |    100 |    100
  skeletons.tsx            |    100 |    100 |    100 |    100
  stale-data-banner.tsx    |      0 |      0 |      0 |      0
  status-badge.tsx         |    100 |    100 |    100 |    100
src/components/ui          |  80.95 |     48 |  70.73 |  82.26
  badge.tsx                |    100 |    100 |    100 |    100
  button.tsx               |    100 |    100 |    100 |    100
  card.tsx                 |    100 |    100 |    100 |    100
  dialog.tsx               |    100 |    100 |    100 |    100
  dropdown-menu.tsx        |     50 |      0 |      0 |     50
  input.tsx                |    100 |    100 |    100 |    100
  label.tsx                |    100 |    100 |    100 |    100
  password-input.tsx       |     40 |     50 |     25 |     50
  select.tsx               |    100 |    100 |    100 |    100
  separator.tsx            |      0 |      0 |      0 |      0
  sheet.tsx                |  55.55 |      0 |      0 |  55.55
  skeleton.tsx             |    100 |    100 |    100 |    100
  sonner.tsx               |    100 |    100 |    100 |    100
  table.tsx                |    100 |    100 |    100 |    100
  tooltip.tsx              |    100 |    100 |    100 |    100
src/features/analytics     |  71.79 |  63.38 |  84.21 |  74.29
  rollup-table-model.ts    |     65 |  52.83 |  84.61 |   67.3
  rollup-tables.tsx        |  93.33 |  94.44 |     75 |  93.33
  use-analytics-summary.ts |    100 |    100 |    100 |    100
src/features/auth          |  80.56 |  66.67 |  81.82 |  78.79
  auth-context.tsx         |  76.92 |     50 |  77.77 |  73.91
  require-auth.tsx         |     90 |     75 |    100 |     90
src/features/employees     |  70.49 |  69.39 |  69.23 |  72.41
  salary-form-dialog.tsx   |  70.49 |  69.38 |  69.23 |  72.41
src/features/export        |      0 |      0 |      0 |      0
  use-export.ts            |      0 |      0 |      0 |      0
src/hooks                  |    100 |    100 |    100 |    100
  use-debounce.ts          |    100 |    100 |    100 |    100
src/lib                    |     76 |     50 |  83.33 |  78.26
  country-flags.ts         |    100 |    100 |    100 |    100
  env.ts                   |      0 |      0 |      0 |      0
  format-money.ts          |  88.88 |     70 |    100 |  93.75
  utils.ts                 |    100 |    100 |    100 |    100
src/lib/api                |  44.33 |  43.55 |     50 |  44.21
  analytics.ts             |  66.66 |    100 |     50 |  66.66
  auth-storage.ts          |  66.66 |     50 |  66.66 |   64.7
  auth.ts                  |      0 |    100 |      0 |      0
  client.ts                |      0 |      0 |      0 |      0
  employees.ts             |  31.57 |      0 |  41.66 |  33.33
  errors.ts                |    100 |  86.66 |    100 |    100
  export.ts                |      0 |    100 |      0 |      0
  index.ts                 |    100 |    100 |    100 |    100
  types.ts                 |    100 |    100 |    100 |    100
src/pages                  |  65.68 |  53.58 |  53.76 |  67.97
  analytics.tsx            |      0 |      0 |      0 |      0
  dashboard.tsx            |   62.5 |     60 |  45.45 |   62.5
  employee-detail.tsx      |  71.05 |  48.78 |   62.5 |  77.14
  employees.tsx            |  73.62 |   78.3 |  65.51 |     75
  login.tsx                |  76.31 |     50 |    100 |  78.37
  tables.tsx               |  78.94 |  64.28 |  68.75 |  81.81
```

### api (`@remunify/api`)

```
File                      | % Stmts | % Branch | % Funcs | % Lines
--------------------------|---------|----------|---------|---------
All files                 |  68.05 |  59.32 |  77.77 |  68.18
src                       |  68.42 |      0 |  66.67 |  68.42
  app.ts                  |    100 |    100 |    100 |    100
  index.ts                |      0 |      0 |      0 |      0
src/db                    |    100 |     75 |    100 |    100
  prisma.ts               |    100 |     75 |    100 |    100
src/lib                   |  76.74 |  54.17 |  92.86 |  76.74
  async-handler.ts        |    100 |    100 |    100 |    100
  errors.ts               |     90 |    100 |  83.33 |     90
  jwt.ts                  |  63.15 |  47.05 |    100 |  63.15
  password.ts             |  83.33 |  71.42 |    100 |  83.33
src/middleware            |  74.07 |  68.75 |     80 |  76.92
  error-handler.ts        |  66.66 |     75 |    100 |  66.66
  require-auth.ts         |     90 |  83.33 |    100 |     90
  validate.ts             |  63.63 |     50 |  66.66 |     70
src/modules/analytics     |     80 |  57.14 |  85.71 |     80
  analytics.controller.ts |      0 |    100 |      0 |      0
  analytics.routes.ts     |    100 |    100 |    100 |    100
  analytics.service.ts    |   87.5 |  57.14 |    100 |   87.5
src/modules/auth          |    100 |    100 |    100 |    100
  auth.controller.ts      |    100 |    100 |    100 |    100
  auth.routes.ts          |    100 |    100 |    100 |    100
  auth.schemas.ts         |    100 |    100 |    100 |    100
  auth.service.ts         |    100 |    100 |    100 |    100
src/modules/employees     |  72.88 |  59.09 |  78.57 |  72.41
  employees.controller.ts |     25 |    100 |     25 |     25
  employees.routes.ts     |    100 |    100 |    100 |    100
  employees.schemas.ts    |    100 |    100 |    100 |    100
  employees.service.ts    |  81.57 |  59.09 |    100 |  81.08
src/modules/export        |  29.79 |   37.5 |  54.55 |  29.79
  csv.ts                  |    100 |  83.33 |    100 |    100
  export.controller.ts    |      0 |    100 |      0 |      0
  export.routes.ts        |    100 |    100 |    100 |    100
  export.service.ts       |  16.21 |     10 |  57.14 |  16.21
src/modules/salaries      |  72.41 |     75 |     75 |  72.41
  salaries.controller.ts  |      0 |    100 |      0 |      0
  salaries.routes.ts      |    100 |    100 |    100 |    100
  salaries.schemas.ts     |    100 |    100 |    100 |    100
  salaries.service.ts     |  93.54 |     75 |    100 |  93.54
src/types                 |    100 |    100 |    100 |    100
  express.d.ts            |    100 |    100 |    100 |    100
```
