# Remunify - Technical Decisions

> Stack and trade-offs for the take-home. Product scope: [`requirements.md`](./requirements.md). Architecture: [`architecture.md`](./architecture.md).

## Stack

| Area        | Choice                                  | Why                                               |
| ----------- | --------------------------------------- | ------------------------------------------------- |
| Repo        | npm workspaces (`apps/web`, `apps/api`) | Matches role; one clone; shared tooling           |
| Frontend    | React + TypeScript + Vite               | Assessment allows React; fast local DX            |
| UI          | Tailwind CSS + shadcn/ui                | Modern minimal HR UI without heavy kits           |
| Backend     | Node + Express + TypeScript             | Aligns with Node/React/TS role                    |
| DB          | PostgreSQL + Prisma                     | Relational requirement; typed access + migrations |
| Validation  | Zod                                     | Trusted API boundary; no `any`                    |
| Client data | TanStack Query (planned)                | Server state, cache, loading/error                |
| Charts      | Recharts only if a metric needs a chart | Avoid decorative charts                           |
| API tests   | Vitest + Supertest                      | Fast, deterministic                               |
| UI tests    | Vitest + React Testing Library          | Behavior over markup                              |
| E2E         | Playwright for a few critical flows     | Login + core HR path later                        |
| CI          | GitHub Actions                          | Lint, typecheck, test on PR/push                  |
| Deploy      | Practical free/low-cost host (TBD)      | Required deliverable                              |

## Deliberate non-choices

| Avoided                      | Why                                       |
| ---------------------------- | ----------------------------------------- |
| Microservices / queues / K8s | Assessment wants judgment, not complexity |
| Next.js                      | Vite SPA is enough; API stays separate    |
| Float money                  | Decimal + currency only                   |
| Live FX in v1                | Fixed demo rates; live FX upcoming        |
| Blind cross-currency sums    | Misleading for HR                         |

## Working rules

- Prefer the simplest correct design that is easy to explain in interview
- Small reviewable increments; verify lint/typecheck/tests before claiming done
- Synthetic data only; never commit secrets
- Update `docs/` when decisions change
