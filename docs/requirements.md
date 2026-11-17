# Remunify - Product Requirements

> One-page requirements before build. Product name: **Remunify**. Scenario org: **ACME** (~10,000 employees, multiple countries).  
> **Status:** Provisional - items tagged **Q1-Q5** depend on Incubyte clarification replies ([`clarifications.md`](./clarifications.md)). Do not lock those decisions until answered.

## Goal

Replace ACME HR’s Excel-based salary tracking with a web app so an HR Manager can **manage employee compensation** and **answer questions about how the organization pays people**.

## Persona

**HR Manager** - owns compensation data day to day: find people, update pay, review org-wide pay patterns. Not an employee self-service user or payroll operator.

## In scope (v1)

| Area                       | Features                                                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **HR dashboard**           | Headcount; compensation summaries with clear population and currency context; breakdowns (e.g. country, department); loading/empty/error states |
| **Employee directory**     | Search by name / employee id; filter and sort; **server-side pagination** (do not load all 10k rows in the browser); open employee detail       |
| **Salary management**      | View and update an employee’s compensation with validation (amount, currency, pay period meaning)                                               |
| **Compensation analytics** | Backend/SQL aggregates by meaningful dimensions (e.g. department, country); every metric states currency and cohort                             |
| **Platform**               | End-to-end web UI + API + relational DB; seed **10,000** synthetic employees; automated tests; deployed app; short video demo                   |

**Provisional field set (Q4):** employee number, name, country, department, designation/title, employment status; salary amount, currency code, pay period (e.g. annual). Expand only if clarifications require it.

## Out of scope (and why)

| Excluded                                     | Why                                                                           |
| -------------------------------------------- | ----------------------------------------------------------------------------- |
| Payroll runs, bank transfers, payslips       | Separate product domain; not needed to manage records or answer pay questions |
| Tax / statutory deductions                   | Country-specific engines; high complexity, low signal for this goal           |
| Recruitment, attendance, leave, performance  | Full HRMS scope; dilutes focus on compensation                                |
| External HR/accounting integrations          | Not required to replace Excel for HR Manager workflows                        |
| Real-time FX conversion                      | Misleading without an agreed rate source (**related to Q2**)                  |
| Complex approval workflows / multi-role RBAC | Overbuilt for a single HR Manager persona unless **Q3** requires auth         |

## Non-functional

- **Stack direction:** TypeScript; React (Vite) UI; Node API; relational DB (Postgres + Prisma planned)
- **Quality:** Strict TypeScript (no `any`); lint + tests for web and api; Prettier; CI; modern minimal UI (Tailwind + component library)
- **Data:** Synthetic seed only; no real PII; money stored as decimal/numeric with explicit currency
- **Performance habits:** DB-side filter/sort/page/aggregate; sensible indexes; no N+1 for core lists
- **Delivery:** Incremental git history; engineering artifacts (architecture, ER, AI workflow, trade-offs, performance notes)

## Assumptions pending clarifications

| ID     | Topic                   | Provisional assumption until reply                                       | If they say otherwise                                      |
| ------ | ----------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **Q1** | Salary history          | Ship **current salary only** first; no history tables/UI until confirmed | Add effective-dated history and transactional updates      |
| **Q2** | Currencies              | Keep amounts **per currency**; never sum across currencies; no FX        | Adopt their rule (common currency and/or conversion basis) |
| **Q3** | Authentication          | **No login** in v1; single HR Manager surface                            | Add auth as specified                                      |
| **Q4** | Attributes / components | Use minimal field set above; no bonus/allowance breakdown unless asked   | Extend schema, seed, and forms                             |
| **Q5** | Import / export         | **No** CSV/Excel import-export in v1                                     | Add import and/or export flows                             |

## Success for this requirements doc

Readers can see: who Remunify is for, what v1 does, what we refuse to build and why, and which decisions are still waiting on Incubyte.
