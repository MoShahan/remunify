---
name: project-conventions
description: >-
  Remunify repo layout and how to work in this monorepo. Use when scaffolding,
  moving files, adding scripts, or unsure where code/docs belong.
---

# Remunify project conventions

## Layout

| Path              | Role                                   |
| ----------------- | -------------------------------------- |
| `apps/web`        | `@remunify/web` - React + Vite UI      |
| `apps/api`        | `@remunify/api` - Express + Prisma API |
| `docs/`           | Product engineering docs (tracked)     |
| `.agents/skills/` | Token-light agent skills               |

## Commands

- `npm install` then `npm run dev` (web + api, colored logs)
- `npm run lint` / `typecheck` / `format` / `format:check`
- Prefer workspace flags: `-w @remunify/web` or `-w @remunify/api`

## Rules

- TypeScript strict; **no `any`**
- Product decisions are **locked** in `docs/requirements.md` - build to those
- Keep UI modern/minimal (Tailwind + shadcn direction)
- Link deep design to `docs/architecture.md`, `docs/database-design.md`, `docs/technical-decisions.md`
- Small increments: inspect → plan → implement → test → verify → summarize; commit only when asked
