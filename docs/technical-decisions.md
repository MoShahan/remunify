# Remunify - Technical Decisions

> Stack and trade-offs for the take-home. Product scope: [`requirements.md`](./requirements.md). Architecture: [`architecture.md`](./architecture.md).

## Stack

| Area        | Choice                                  | Why                                                                                                    |
| ----------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Repo        | npm workspaces (`apps/web`, `apps/api`) | Matches role; one clone; shared tooling                                                                |
| Frontend    | React + TypeScript + Vite               | Assessment allows React; fast local DX                                                                 |
| UI          | Tailwind CSS + shadcn/ui                | Modern minimal HR UI without heavy kits                                                                |
| Backend     | Node + Express + TypeScript             | Aligns with Node/React/TS role                                                                         |
| DB          | PostgreSQL + Prisma                     | Relational requirement; typed access + migrations                                                      |
| Validation  | Zod                                     | Trusted API boundary; no `any`                                                                         |
| Client data | TanStack Query                          | Server state, cache, loading/error                                                                     |
| Charts      | Recharts split by page                  | Dashboard: status pie + table previews; Analytics: currency/avg/median charts; full grids on `/tables` |
| API tests   | Vitest + Supertest                      | Fast, deterministic                                                                                    |
| UI tests    | Vitest + React Testing Library          | Behavior over markup                                                                                   |
| E2E         | Playwright for a few critical flows     | Login + core HR path later (post v1 hardening)                                                         |
| CI          | GitHub Actions                          | Format, lint, typecheck, test, build on PR/push                                                        |
| Deploy      | Practical free/low-cost host (Phase 7)  | Required deliverable                                                                                   |

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
- Live CLI coverage snapshot (Statements / Branches / Functions / Lines): [`testing.md`](./testing.md)
