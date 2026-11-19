# Remunify - Product Requirements

> One-page requirements before build. Product name: **Remunify**. Scenario org: **ACME** (~10,000 employees, multiple countries).  
> **Status:** Locked for v1 (2026-11-19) by product owner after no Incubyte reply to the clarification email.

## Goal

Replace ACME HR’s Excel-based salary tracking with a web app so an HR Manager can **manage employee compensation** and **answer questions about how the organization pays people**.

## Persona

**HR Manager** - owns compensation data day to day: find people, update pay, review org-wide pay patterns. Not an employee self-service user or payroll operator (employee login is upcoming).

## In scope (v1)

| Area                       | Features                                                                                                                                                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**                   | Login only (no registration); single seeded HR user; bearer token; protect API + app routes                                                                                                                                               |
| **HR dashboard**           | Headcount; **per-currency** compensation summaries (incl. averages / medians where useful); optional **company-wide USD** total using fixed demo FX rates (clearly labeled); breakdowns by country/department; loading/empty/error states |
| **Employee directory**     | Search by name / employee id / email; filter and sort; **server-side pagination**; show **current** salary only in the table                                                                                                              |
| **Employee detail**        | Profile fields; **current** salary edit (annual); **full salary history** timeline (effective dates + amounts)                                                                                                                            |
| **Salary management**      | Raise = keep prior row, insert new current (no overlap / no overwrite); validate amount + currency; period = **annual**                                                                                                                   |
| **Compensation analytics** | Aggregates by department/country **per currency**; company-wide metrics via USD conversion with demo rates                                                                                                                                |
| **Export**                 | CSV and Excel export of employee/compensation data (current salary semantics)                                                                                                                                                             |
| **Platform**               | Web UI + API + Postgres; seed **10,000** employees across many countries; tests; deployed app; short video demo                                                                                                                           |

**Employee fields (v1):** employee number, full name, email, joining date, country, department, designation, status.  
**Salary fields (v1):** amount (decimal), currency (ISO), period = annual, effectiveFrom. History = multiple rows per employee.

## Out of scope (and why)

| Excluded                                          | Why                                            |
| ------------------------------------------------- | ---------------------------------------------- |
| Payroll runs, bank transfers, payslips            | Separate product domain                        |
| Tax / statutory deductions                        | Country-specific; low signal for this goal     |
| Recruitment, attendance, leave, performance       | Full HRMS; dilutes compensation focus          |
| External HR/accounting integrations               | Not required to replace Excel for HR workflows |
| Live / real-time FX APIs                          | Demo uses fixed rates; live FX is upcoming     |
| Salary component breakdown (base/bonus/allowance) | Too heavy for raise UX in a demo; upcoming     |
| Monthly pay period UI                             | Annual only in v1; monthly upcoming            |
| Registration / employee self-service              | Single HR login; employee accounts upcoming    |
| CSV/Excel **import**                              | Export only in v1; import upcoming             |
| Complex multi-role RBAC                           | One HR persona for v1                          |

## Non-functional

- **Stack:** TypeScript; React (Vite) UI; Node API; Postgres + Prisma
- **Quality:** Strict TypeScript (no `any`); lint + tests for web and api; Prettier; CI; modern minimal UI (Tailwind + shadcn/ui)
- **Data:** Synthetic seed only; no real PII; money as decimal + currency; multi-country seed (country list in [`database-design.md`](./database-design.md))
- **Performance:** DB-side filter/sort/page/aggregate; sensible indexes; no N+1 for core lists
- **Delivery:** Incremental git history; architecture, ER, AI workflow, trade-offs, performance notes

## Product decisions (locked)

| Topic              | v1 decision                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Salary history** | Yes. List/dashboard/analytics = **current only**. Detail = full timeline. No overlapping periods. Raise = keep old row, **insert** new current. Current = latest `effectiveFrom`. Relational rows (not JSON array). |
| **Currencies**     | Per-currency breakdowns always. Company-wide total in **USD** via **fixed demo FX** (labeled). Never blind-sum mixed currencies. Live FX upcoming.                                                                  |
| **Auth**           | Login required; **no** registration; **one** HR user; bearer token; employee self-service upcoming.                                                                                                                 |
| **Attributes**     | Keep country/dept/designation/status; add **email** + **joinedAt**; **annual** salary only; no base/bonus/allowance breakdown (upcoming).                                                                           |
| **Export**         | **CSV + Excel** export in v1; **import** upcoming.                                                                                                                                                                  |

## Success for this requirements doc

Readers can see who Remunify is for, what v1 does, what we refuse to build and why, and the locked product decisions above.
