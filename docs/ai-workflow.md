# Remunify - AI Workflow

> How we used AI while building Remunify. Product scope stays locked in [`requirements.md`](./requirements.md). This doc is for interview explainability, not hiring/assessment framing.

## Tools

| Tool                     | Role                                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| Cursor agent             | Incremental implementation, refactors, tests, docs                     |
| `.agents/skills/`        | Short, task-scoped project skills (conventions, domain, quality, docs) |
| Prisma                   | Schema, migrations, typed client, seed                                 |
| Vitest + RTL / Supertest | Unit and route tests without brittle markup                            |
| Husky + lint-staged      | Staged Prettier + ESLint on commit                                     |
| GitHub Actions           | Format, lint, typecheck, test, build on PR/push                        |

## Skills we leaned on

| Skill                 | When                                                                   |
| --------------------- | ---------------------------------------------------------------------- |
| `project-conventions` | Where code/docs live; workspace commands                               |
| `salary-domain`       | Money as decimal + currency; history/raise semantics; no blind FX sums |
| `quality-gates`       | Lint/typecheck/test/format before claiming done; no `any`              |
| `docs-and-commits`    | Tracked vs gitignored docs; commit only when asked                     |

Skills stay small on purpose: load only the one that matches the task.

## Product decisions with AI in the loop

1. Clarification questions (Q1–Q5) were drafted for Incubyte; after no reply, the product owner locked answers and we folded them into `docs/` (requirements, architecture, database, ER, technical decisions).
2. Transient clarification / brief files were deleted once locked docs existed so the repo stayed the source of truth.
3. Phased build (schema → APIs → UI → hardening) was planned and executed against `PROJECT_PLAN.md` locally; tracked docs describe the shipped design.

## Accepted (shipped)

- npm workspaces (`apps/web`, `apps/api`)
- Express + Zod + Prisma + PostgreSQL
- jose JWT bearer auth; cheap middleware verify (no User DB hit per request)
- SQL-side current salary (`DISTINCT ON` / CTE) for list, analytics, export
- Streaming/batched CSV + Excel export
- TanStack Query + React Router + Tailwind/shadcn UI
- Descriptive API errors (`message` + Zod `details`) surfaced as toasts / field helpers
- Thin `fetch` API client (no Axios) - enough for Bearer, JSON, and blob downloads

## Rejected or deferred

| Choice                               | Outcome                                                    |
| ------------------------------------ | ---------------------------------------------------------- |
| Next.js                              | Deferred; Vite SPA + separate API is enough                |
| Microservices / queues / K8s         | Rejected for take-home scope                               |
| Live FX in v1                        | Deferred (upcoming); fixed demo `FxRate` labeled in UI/API |
| CSV/Excel import                     | Deferred (upcoming); export only                           |
| Employee self-service / registration | Deferred (upcoming); single HR login                       |
| Blind cross-currency sums            | Rejected                                                   |
| Axios                                | Rejected; native `fetch` wrapper is sufficient             |
| Playwright in Phase 6                | Deferred (technical-decisions: later critical flows)       |

## What we did not outsource to the model

- Locked product decisions (salary history, currencies, auth, attributes, export)
- Final judgment on performance: SQL aggregation vs Node, streaming export, index alignment
- Secrets and real PII: synthetic seed only; `.env` never committed
