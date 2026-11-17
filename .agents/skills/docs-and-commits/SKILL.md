---
name: docs-and-commits
description: >-
  Docs that belong in the Remunify repo and commit expectations. Use when
  writing docs, choosing commit messages, or deciding what not to commit.
---

# Docs and commits

## Tracked docs (GitHub)

Keep in `docs/`: `requirements.md`, `architecture.md`, `database-design.md`, `er-diagram.md`, later technical-decisions / AI workflow / performance.

`README.md` is product-facing - no hiring/assessment framing.

## Local-only (gitignored)

Do not commit: `PROJECT_PLAN.md`, `CURSOR_PROJECT_BRIEF.md`, `docs/hiring-email.md`, `docs/assessment.md`, `docs/clarifications.md`, `.local/`

## Commits

- Small, honest, incremental commits
- Message focuses on why
- Never commit secrets or `.env`
- Do not commit unless the user asks

## Artifacts expected for the submission

Requirements, design/architecture (incl. ER), AI workflow notes, trade-offs, performance notes - see assessment; write them in tracked `docs/` as we go.
