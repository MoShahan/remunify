# Remunify - ER Diagram

Canonical Mermaid ER for the locked v1 data model. Entity details and indexes: [`database-design.md`](./database-design.md).  
Product decisions: [`requirements.md`](./requirements.md).

- **User** - single HR login
- **Employee** - includes email + joining date
- **Salary** - multiple rows per employee (history); current = latest `effectiveFrom`
- **FxRate** - fixed demo USD conversion rates

```mermaid
erDiagram
  EMPLOYEE ||--|{ SALARY : has_history
  FX_RATE ||--o{ SALARY : converts_via_currency

  USER {
    string id PK
    string email UK
    string passwordHash
    string role
    string createdAt
    string updatedAt
  }

  EMPLOYEE {
    string id PK
    string employeeNumber UK
    string fullName
    string email UK
    string joinedAt
    string country
    string department
    string designation
    string status
    string createdAt
    string updatedAt
  }

  SALARY {
    string id PK
    string employeeId FK
    string amount
    string currency
    string period
    string effectiveFrom
    string createdAt
    string updatedAt
  }

  FX_RATE {
    string currency PK
    string usdPerUnit
    string asOf
    string updatedAt
  }
```

`User` has no FK to `Employee` in v1 (HR login only). `Salary.currency` matches `FxRate.currency` for labeled USD company totals.
