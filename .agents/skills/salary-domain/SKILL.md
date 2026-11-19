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
- Pay period in v1: **annual** only
- Synthetic data only - no real PII

## Currencies (locked / Q2)

- Always offer **per-currency** breakdowns; label currency + population
- Company-wide totals only via **fixed demo FX → USD**; label rates as demo
- Never blind-sum mixed currencies
- Live FX API is upcoming - do not call external rate APIs in v1

## Salary history (locked / Q1)

- Multiple salary rows per employee; **current** = latest `effectiveFrom`
- Directory / dashboard / analytics use **current only**
- Detail page shows full history
- On raise: **insert** new row; keep old; no overlaps; no overwrite/delete

## Attributes (locked / Q4)

Employee: number, name, email, joinedAt, country, department, designation, status.  
Salary: amount, currency, annual period, effectiveFrom.  
No component breakdown in v1.

Details: `docs/requirements.md`, `docs/database-design.md`
