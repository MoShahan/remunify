import { Prisma } from '@prisma/client'
import { prisma } from '../../db/prisma.js'

const DEMO_FX_LABEL =
  'Converted with fixed demo FX rates (not live market data)'

type HeadcountRow = {
  total: bigint
  active: bigint
  inactive: bigint
  with_salary: bigint
  without_salary: bigint
}

type CurrencyAggRow = {
  currency: string
  employee_count: bigint
  total_amount: Prisma.Decimal | string
  average_amount: Prisma.Decimal | string
  median_amount: Prisma.Decimal | string | null
}

type DimensionAggRow = {
  dimension: string
  currency: string
  employee_count: bigint
  total_amount: Prisma.Decimal | string
  average_amount: Prisma.Decimal | string
}

type UsdTotalRow = {
  total_amount_usd: Prisma.Decimal | string | null
  employee_count: bigint
  rates_as_of: Date | null
}

/** Format Prisma decimals / raw SQL numbers as fixed 2-decimal strings for the API. */
function decimalToString(value: Prisma.Decimal | string | null | undefined) {
  if (value === null || value === undefined) {
    return '0.00'
  }
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n.toFixed(2) : value
  }
  return value.toFixed(2)
}

/** Shared current-salary CTE: latest effectiveFrom per employee (DISTINCT ON). */
export const CURRENT_SALARY_CTE = Prisma.sql`
  current_salary AS (
    SELECT DISTINCT ON (s."employeeId")
      s."employeeId",
      s.amount,
      s.currency,
      s.period,
      s."effectiveFrom",
      e."employeeNumber",
      e."fullName",
      e.email,
      e."joinedAt",
      e.country,
      e.department,
      e.designation,
      e.status
    FROM "Salary" s
    INNER JOIN "Employee" e ON e.id = s."employeeId"
    ORDER BY s."employeeId", s."effectiveFrom" DESC
  )
`

/**
 * Org-wide analytics summary from current salaries only.
 * Runs headcount + currency/country/department aggregates + demo USD total in one transaction
 * (no Node-side aggregation of employee rows).
 */
export async function getAnalyticsSummary() {
  const [
    headcountRows,
    byCurrencyRows,
    byCountryRows,
    byDepartmentRows,
    usdRows,
  ] = await prisma.$transaction([
    // Employee status + salary coverage counts
    prisma.$queryRaw<HeadcountRow[]>`
        SELECT
          COUNT(*)::bigint AS total,
          COUNT(*) FILTER (WHERE status = 'ACTIVE')::bigint AS active,
          COUNT(*) FILTER (WHERE status = 'INACTIVE')::bigint AS inactive,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1 FROM "Salary" s WHERE s."employeeId" = e.id
            )
          )::bigint AS with_salary,
          COUNT(*) FILTER (
            WHERE NOT EXISTS (
              SELECT 1 FROM "Salary" s WHERE s."employeeId" = e.id
            )
          )::bigint AS without_salary
        FROM "Employee" e
      `,
    // Totals / avg / median per currency - never cross-sum mixed currencies
    prisma.$queryRaw<CurrencyAggRow[]>`
        WITH ${CURRENT_SALARY_CTE}
        SELECT
          currency,
          COUNT(*)::bigint AS employee_count,
          SUM(amount) AS total_amount,
          AVG(amount) AS average_amount,
          percentile_cont(0.5) WITHIN GROUP (ORDER BY amount::float8) AS median_amount
        FROM current_salary
        GROUP BY currency
        ORDER BY currency
      `,
    // Country × currency rollups
    prisma.$queryRaw<DimensionAggRow[]>`
        WITH ${CURRENT_SALARY_CTE}
        SELECT
          country AS dimension,
          currency,
          COUNT(*)::bigint AS employee_count,
          SUM(amount) AS total_amount,
          AVG(amount) AS average_amount
        FROM current_salary
        GROUP BY country, currency
        ORDER BY country, currency
      `,
    // Department × currency rollups
    prisma.$queryRaw<DimensionAggRow[]>`
        WITH ${CURRENT_SALARY_CTE}
        SELECT
          department AS dimension,
          currency,
          COUNT(*)::bigint AS employee_count,
          SUM(amount) AS total_amount,
          AVG(amount) AS average_amount
        FROM current_salary
        GROUP BY department, currency
        ORDER BY department, currency
      `,
    // Company-wide USD via seeded FxRate (labeled as demo, not live market data)
    prisma.$queryRaw<UsdTotalRow[]>`
        WITH ${CURRENT_SALARY_CTE}
        SELECT
          COALESCE(SUM(cs.amount * fx."usdPerUnit"), 0) AS total_amount_usd,
          COUNT(*)::bigint AS employee_count,
          MIN(fx."asOf") AS rates_as_of
        FROM current_salary cs
        LEFT JOIN "FxRate" fx ON fx.currency = cs.currency
      `,
  ])

  const headcount = headcountRows[0] ?? {
    total: 0n,
    active: 0n,
    inactive: 0n,
    with_salary: 0n,
    without_salary: 0n,
  }
  const usd = usdRows[0]

  return {
    headcount: {
      total: Number(headcount.total),
      active: Number(headcount.active),
      inactive: Number(headcount.inactive),
      withSalary: Number(headcount.with_salary),
      withoutSalary: Number(headcount.without_salary),
    },
    byCurrency: byCurrencyRows.map((row) => ({
      currency: row.currency,
      employeeCount: Number(row.employee_count),
      totalAmount: decimalToString(row.total_amount),
      averageAmount: decimalToString(row.average_amount),
      medianAmount: decimalToString(row.median_amount),
    })),
    byCountry: byCountryRows.map((row) => ({
      country: row.dimension,
      currency: row.currency,
      employeeCount: Number(row.employee_count),
      totalAmount: decimalToString(row.total_amount),
      averageAmount: decimalToString(row.average_amount),
    })),
    byDepartment: byDepartmentRows.map((row) => ({
      department: row.dimension,
      currency: row.currency,
      employeeCount: Number(row.employee_count),
      totalAmount: decimalToString(row.total_amount),
      averageAmount: decimalToString(row.average_amount),
    })),
    companyWideUsd: {
      totalAmountUsd: decimalToString(usd?.total_amount_usd),
      employeeCount: Number(usd?.employee_count ?? 0n),
      ratesAsOf: usd?.rates_as_of
        ? usd.rates_as_of.toISOString().slice(0, 10)
        : null,
      label: DEMO_FX_LABEL,
    },
  }
}
