# Remunify

Web software for managing employee compensation - built for organizations with thousands of employees across multiple countries.

Today that work often lives in spreadsheets. Remunify replaces that with a focused web app so HR can maintain salary records and understand how the organization pays people - without turning into a full HRMS or payroll engine.

## Who this is for

| Audience          | Role                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| **Primary users** | HR managers and HR team members who own compensation data                                                      |
| **Organization**  | Mid-to-large employers with multi-country headcount                                                            |
| **Not aimed at**  | Employees viewing their own pay, payroll processors running bank runs, or recruiters managing hiring pipelines |

## Users

- **HR Manager** - day-to-day owner of employee salary data: look people up, update compensation, and answer questions about pay across the org
- **HR operators** (same product surface) - search, filter, and review compensation information with clear currency and population context

## What you can do

- **HR dashboard** - headcount and compensation overview with clear totals, averages, and breakdowns (currency-aware; no misleading cross-currency sums)
- **Employee directory** - search and filter a large employee base (on the order of 10,000 records) with server-side pagination, sorting, and an employee detail view
- **Salary management** - view and update compensation for an employee with validated inputs and explicit currency and pay-period meaning
- **Compensation analytics** - insights by dimensions such as department and country, computed on the server so the browser never has to load the full dataset

## What this is not

Out of scope for this product:

- Running payroll, bank transfers, or payslips
- Tax and statutory deduction engines
- Recruitment, attendance, leave, or performance management
- Deep integrations with external HR or accounting systems

The focus stays on **salary records** and **compensation insight**.

## Repo layout

| Path       | Package         | Role                                |
| ---------- | --------------- | ----------------------------------- |
| `apps/web` | `@remunify/web` | React + Vite + Tailwind + shadcn/ui |
| `apps/api` | `@remunify/api` | Express + TypeScript API            |

## API (provisional)

| Method  | Path                                | Purpose                                                                       |
| ------- | ----------------------------------- | ----------------------------------------------------------------------------- |
| `GET`   | `/health`                           | Health check                                                                  |
| `GET`   | `/api/employees`                    | List employees (`page`, `pageSize`, `search`, filters, `sortBy`, `sortOrder`) |
| `GET`   | `/api/employees/:id`                | Employee detail (includes current salary if any)                              |
| `GET`   | `/api/employees/:employeeId/salary` | Current salary                                                                |
| `POST`  | `/api/employees/:employeeId/salary` | Create current salary (409 if exists)                                         |
| `PATCH` | `/api/employees/:employeeId/salary` | Update current salary                                                         |

## Local development

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run dev
```

`npm install` also runs the `prepare` script, which sets up **Husky** git hooks.

`npm run dev` starts **web** and **api** together (colored logs via `concurrently`).

| Command                | What it does                                          |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Frontend + backend                                    |
| `npm run dev:web`      | Frontend only (Vite, default `http://localhost:5173`) |
| `npm run dev:api`      | API only (default `http://localhost:3001`)            |
| `npm run lint`         | Lint both apps (`no-explicit-any` error)              |
| `npm run typecheck`    | Typecheck both apps (shared strict TS)                |
| `npm run test`         | Run Vitest suites in both apps                        |
| `npm run test:web`     | Frontend tests (RTL + jsdom)                          |
| `npm run test:api`     | Backend tests (Supertest + mocked Prisma)             |
| `npm run format`       | Prettier write across the repo                        |
| `npm run format:check` | Prettier check (CI-friendly)                          |

### Environment

| File                    | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `apps/api/.env.example` | API `PORT`, `DATABASE_URL` (copy to `apps/api/.env`) |
| `apps/web/.env.example` | `VITE_API_URL` (copy to `apps/web/.env`)             |
| `.env.example`          | Root convenience reference                           |

Never commit real `.env` files.

### Database

Postgres + Prisma live under `apps/api`. Product model is locked (salary history, multi-currency + demo FX, HR login, CSV/Excel export) - see `docs/requirements.md` and `apps/api/prisma/ASSUMPTIONS.md`. The checked-in schema may still be catching up to that target via the next migration.

```bash
cp apps/api/.env.example apps/api/.env
# start Postgres matching DATABASE_URL, then:
npm run db:generate
npm run db:migrate
npm run db:seed
```

| Command                  | What it does                                                           |
| ------------------------ | ---------------------------------------------------------------------- |
| `npm run db:generate`    | Generate Prisma Client                                                 |
| `npm run db:migrate`     | Apply migrations (`prisma migrate deploy`)                             |
| `npm run db:migrate:dev` | Dev migrations (`prisma migrate dev`)                                  |
| `npm run db:seed`        | Seed **10,000** synthetic employees + current salaries (deterministic) |

Seed implementation: `apps/api/prisma/seed.ts` (provisional fields; re-run clears and reloads).

### Git hooks

On commit, Husky runs **lint-staged** on **staged files only**:

- Prettier on staged supported files
- ESLint on staged `apps/web` / `apps/api` TypeScript (fails the commit if lint fails)

Full-repo lint, typecheck, and tests are **not** run in the hook - use the npm scripts (and CI) for those.

### Agent skills

Short, tool-agnostic skills live under `.agents/skills/` (conventions, salary domain, quality gates, docs/commits). Load only the skill that matches the task - they stay small on purpose.

### CI

GitHub Actions (`.github/workflows/ci.yml`) runs parallel jobs on push/PR:

- Format check
- FE lint / FE typecheck / FE test
- BE lint / BE typecheck / BE test

Any failing job fails the workflow. No secrets required for this pipeline yet.

More setup (DB migrate/seed, deploy) will be documented as those pieces land.

### Upcoming features

Planned after v1 (not built yet):

- Live FX API (replace fixed demo USD rates)
- CSV/Excel **import**
- Employee self-service accounts (view own salary history)
- Monthly salary display (v1 is annual only)
- Salary component breakdown (base / allowance / bonus)
- Manager, location, and richer org fields
