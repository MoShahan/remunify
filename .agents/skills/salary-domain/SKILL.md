---
name: salary-domain
description: >-
  Money, currency, and salary semantics for Remunify. Use when modeling schema,
  APIs, analytics, seed data, or UI that shows pay amounts.
---

# Salary domain rules

## Money

- Persist amounts as decimal/numeric - **never** float/double
- Always store **currency code** with every amount
- Define pay **period** explicitly (provisional: annual)
- Synthetic data only - no real PII

## Currencies (provisional / Q2)

- Do **not** sum across currencies into one total
- Group analytics by currency; label every metric with currency + population
- No invented FX rates until clarifications say otherwise

## Salary history (provisional / Q1)

- Default: **current salary only**
- Do not build history tables/UI until Q1 is answered
- If history is required later: effective dates, clear "current" rule, transactional writes

## Attributes (provisional / Q4)

Minimal set until clarified: employee number, name, country, department, designation, status; salary amount, currency, period.

Details: `docs/requirements.md`, `docs/database-design.md`
