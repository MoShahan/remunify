# Remunify

Web software for managing employee compensation - built for organizations with thousands of employees across multiple countries.

Today that work often lives in spreadsheets. Remunify replaces that with a focused web app so HR can maintain salary records and understand how the organization pays people - without turning into a full HRMS or payroll engine.

## Who this is for

| Audience | Role |
|---|---|
| **Primary users** | HR managers and HR team members who own compensation data |
| **Organization** | Mid-to-large employers with multi-country headcount |
| **Not aimed at** | Employees viewing their own pay, payroll processors running bank runs, or recruiters managing hiring pipelines |

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

| Path | Package | Role |
|---|---|---|
| `apps/web` | `@remunify/web` | React + Vite frontend |
| `apps/api` | `@remunify/api` | Express + TypeScript API |

## Local development

```bash
npm install
npm run dev
```

`npm run dev` starts **web** and **api** together (colored logs via `concurrently`).

| Command | What it does |
|---|---|
| `npm run dev` | Frontend + backend |
| `npm run dev:web` | Frontend only (Vite) |
| `npm run dev:api` | API only (default `http://localhost:3001`) |
| `npm run lint` | Lint both apps |
| `npm run typecheck` | Typecheck both apps |

More setup (env, DB, seed, deploy) will be documented as those pieces land.
