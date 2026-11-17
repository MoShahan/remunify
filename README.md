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

| Path       | Package         | Role                     |
| ---------- | --------------- | ------------------------ |
| `apps/web` | `@remunify/web` | React + Vite frontend    |
| `apps/api` | `@remunify/api` | Express + TypeScript API |

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
| `npm run format`       | Prettier write across the repo                        |
| `npm run format:check` | Prettier check (CI-friendly)                          |

### Environment

| File                    | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `apps/api/.env.example` | API `PORT`, `DATABASE_URL` (copy to `apps/api/.env`) |
| `apps/web/.env.example` | `VITE_API_URL` (copy to `apps/web/.env`)             |
| `.env.example`          | Root convenience reference                           |

Never commit real `.env` files.

### Git hooks

On commit, Husky runs **lint-staged** on **staged files only**:

- Prettier on staged supported files
- ESLint on staged `apps/web` / `apps/api` TypeScript (fails the commit if lint fails)

Full-repo lint, typecheck, and tests are **not** run in the hook - use the npm scripts (and CI) for those.

More setup (DB migrate/seed, deploy) will be documented as those pieces land.
