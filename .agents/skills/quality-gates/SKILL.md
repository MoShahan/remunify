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
5. **Coverage snapshot:** if the change touched app source under test or `*.test.*` files, run `npm run test:coverage` (or `test:coverage:web` / `test:coverage:api` for the affected workspace) and rewrite in `docs/testing.md`: the date, package summary table, **and the CLI-style directory trees** under web/api (directory rollup rows + indented filenames in a fenced code block; source: CLI text table, `apps/<pkg>/coverage/coverage-summary.json`, or `node .local/gen-coverage-md.mjs`). Treat an outdated or missing snapshot like skipped tests for submission hygiene. Do **not** commit generated `coverage/` folders.
6. Do not claim green builds/tests unless you actually ran them

## Pre-commit

- Husky + lint-staged: **staged files only** (Prettier + ESLint)
- Commit fails if staged lint fails
- Full-repo lint/typecheck/tests stay in scripts + CI - not in the hook
- Coverage doc refresh is an agent checklist step, not a pre-commit hook

## Test priorities

- Salary validation, raise/history rules, currency handling
- Employee search/filter/sort/pagination
- Analytics grouping (per-currency + labeled USD rollup)
- Auth/export once those modules exist
- Fast, deterministic, no external services; no brittle markup asserts

## Definition of done (submission)

Requirements documented; end-to-end app; migrate + 10k seed; core HR flows; accurate currency analytics; tests/lint/typecheck/build green; coverage snapshot in `docs/testing.md` current; README setup; deploy + video; incremental git history; no secrets/real PII.

## Do not

- Bypass hooks for convenience
- Add `any` to silence TypeScript
- Skip validation on money/currency inputs
- Claim tests/builds succeeded unless actually run
- Commit `coverage/` HTML/lcov output
- Skip refreshing `docs/testing.md` after test or covered-source changes
