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
- Do not invent Incubyte clarification answers (Q1-Q5) - see `docs/clarifications.md` / requirements
- Keep UI modern/minimal (Tailwind + shadcn direction)
- Link deep design to `docs/architecture.md` and `docs/database-design.md` - do not paste them into skills
