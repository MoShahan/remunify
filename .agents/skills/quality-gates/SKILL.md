---
name: quality-gates
description: >-
  Lint, typecheck, format, and test expectations for Remunify. Use before
  finishing a task, opening a PR, or claiming work is done.
---

# Quality gates

## Before calling work done

1. `npm run lint` (web + api) - must pass; `no-explicit-any` is **error**
2. `npm run typecheck`
3. `npm run format:check` (or `format` then re-check)
4. Run relevant tests once suites exist (`test:web` / `test:api`)
5. Do not claim green builds/tests unless you actually ran them

## Pre-commit

- Husky + lint-staged: **staged files only** (Prettier + ESLint)
- Commit fails if staged lint fails
- Full-repo lint/typecheck/tests stay in scripts + CI - not in the hook

## Do not

- Bypass hooks for convenience
- Add `any` to silence TypeScript
- Skip validation on money/currency inputs
