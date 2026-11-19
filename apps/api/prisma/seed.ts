/**
 * Deterministic seed: 10,000 employees, salary history, FxRate rows, one HR user.
 * Aligns with docs/database-design.md.
 */
/// <reference types="node" />
import {
  EmploymentStatus,
  PayPeriod,
  PrismaClient,
  UserRole,
  type Prisma,
} from '@prisma/client'
import { hashPassword } from '../src/lib/password.js'

const prisma = new PrismaClient()

const TOTAL_EMPLOYEES = 10_000
const BATCH_SIZE = 500
const FX_AS_OF = new Date('2026-01-01T00:00:00.000Z')
/** Do not invent salary rows after this date. */
const HISTORY_CUTOFF = new Date('2026-01-01T00:00:00.000Z')

const COUNTRIES: { country: string; currency: string; baseAnnual: number }[] = [
  { country: 'United Arab Emirates', currency: 'AED', baseAnnual: 220_000 },
  { country: 'Saudi Arabia', currency: 'SAR', baseAnnual: 180_000 },
  { country: 'Qatar', currency: 'QAR', baseAnnual: 200_000 },
  { country: 'Bahrain', currency: 'BHD', baseAnnual: 18_000 },
  { country: 'Yemen', currency: 'YER', baseAnnual: 2_500_000 },
  { country: 'Mexico', currency: 'MXN', baseAnnual: 450_000 },
  { country: 'United States', currency: 'USD', baseAnnual: 95_000 },
  { country: 'Canada', currency: 'CAD', baseAnnual: 90_000 },
  { country: 'Russia', currency: 'RUB', baseAnnual: 2_200_000 },
  { country: 'China', currency: 'CNY', baseAnnual: 280_000 },
  { country: 'Japan', currency: 'JPY', baseAnnual: 7_500_000 },
  { country: 'India', currency: 'INR', baseAnnual: 900_000 },
  { country: 'Sri Lanka', currency: 'LKR', baseAnnual: 2_400_000 },
  { country: 'Pakistan', currency: 'PKR', baseAnnual: 2_800_000 },
  { country: 'Bangladesh', currency: 'BDT', baseAnnual: 1_200_000 },
  { country: 'Afghanistan', currency: 'AFN', baseAnnual: 650_000 },
  { country: 'Nigeria', currency: 'NGN', baseAnnual: 12_000_000 },
  { country: 'Kenya', currency: 'KES', baseAnnual: 2_400_000 },
  { country: 'South Africa', currency: 'ZAR', baseAnnual: 550_000 },
  { country: 'Egypt', currency: 'EGP', baseAnnual: 480_000 },
  { country: 'Portugal', currency: 'EUR', baseAnnual: 42_000 },
  { country: 'Spain', currency: 'EUR', baseAnnual: 45_000 },
  { country: 'France', currency: 'EUR', baseAnnual: 55_000 },
  { country: 'Italy', currency: 'EUR', baseAnnual: 48_000 },
  { country: 'Norway', currency: 'NOK', baseAnnual: 720_000 },
  { country: 'United Kingdom', currency: 'GBP', baseAnnual: 65_000 },
  { country: 'Germany', currency: 'EUR', baseAnnual: 58_000 },
  { country: 'Singapore', currency: 'SGD', baseAnnual: 95_000 },
  { country: 'Australia', currency: 'AUD', baseAnnual: 100_000 },
]

/** Demo USD per 1 unit of currency (illustrative, not live market). */
const USD_PER_UNIT: Record<string, string> = {
  USD: '1.00000000',
  AED: '0.27230000',
  SAR: '0.26660000',
  QAR: '0.27470000',
  BHD: '2.65250000',
  YER: '0.00400000',
  MXN: '0.04950000',
  CAD: '0.71000000',
  RUB: '0.01120000',
  CNY: '0.13700000',
  JPY: '0.00670000',
  INR: '0.01140000',
  LKR: '0.00330000',
  PKR: '0.00360000',
  BDT: '0.00820000',
  AFN: '0.01450000',
  NGN: '0.00065000',
  KES: '0.00770000',
  ZAR: '0.05500000',
  EGP: '0.02000000',
  EUR: '1.08000000',
  NOK: '0.09000000',
  GBP: '1.27000000',
  SGD: '0.74000000',
  AUD: '0.63000000',
}

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'People',
  'Finance',
  'Sales',
  'Operations',
  'Support',
]

const DESIGNATIONS = [
  'Associate',
  'Specialist',
  'Senior Specialist',
  'Manager',
  'Senior Manager',
  'Director',
]

const FIRST_NAMES = [
  'Aisha',
  'Ben',
  'Chen',
  'Diego',
  'Elena',
  'Farah',
  'Gabriel',
  'Hana',
  'Ivan',
  'Jade',
  'Kai',
  'Lina',
  'Mateo',
  'Noor',
  'Omar',
  'Priya',
  'Quinn',
  'Ravi',
  'Sofia',
  'Tomas',
  'Uma',
  'Victor',
  'Wendy',
  'Xavier',
  'Yara',
  'Zain',
]

const LAST_NAMES = [
  'Shah',
  'Nguyen',
  'Patel',
  'Silva',
  'Kim',
  'Garcia',
  'Okoro',
  'Andersen',
  'Rossi',
  'Nakamura',
  'Brown',
  'Khan',
  'Lopez',
  'Martin',
  'Singh',
]

function createRng(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  const item = items[Math.floor(rng() * items.length)]
  if (item === undefined) {
    throw new Error('pick() called with empty list')
  }
  return item
}

function annualAmount(rng: () => number, base: number): string {
  const jitter = Math.floor(rng() * base * 0.6)
  return (base + jitter).toFixed(2)
}

function addYears(date: Date, years: number): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear() + years,
      date.getUTCMonth(),
      date.getUTCDate(),
    ),
  )
}

/**
 * Starting salary at join, then optional raises ~1 year apart.
 * ~50% stay on starting pay; ~30% one raise; ~20% two raises (when tenure allows).
 */
function buildSalaryHistory(
  rng: () => number,
  joinedAt: Date,
  currency: string,
  baseAnnual: number,
): { amount: string; currency: string; effectiveFrom: Date }[] {
  const rows: { amount: string; currency: string; effectiveFrom: Date }[] = []
  let amount = annualAmount(rng, baseAnnual)

  rows.push({
    amount,
    currency,
    effectiveFrom: joinedAt,
  })

  const roll = rng()
  const desiredRaises = roll < 0.5 ? 0 : roll < 0.8 ? 1 : 2

  for (let raise = 1; raise <= desiredRaises; raise += 1) {
    const effectiveFrom = addYears(joinedAt, raise)
    if (effectiveFrom >= HISTORY_CUTOFF) {
      break
    }
    amount = (Number(amount) * (1.05 + rng() * 0.1)).toFixed(2)
    rows.push({ amount, currency, effectiveFrom })
  }

  return rows
}

async function seed() {
  const rng = createRng(42)
  const hrEmail = process.env.HR_EMAIL ?? 'hr@remunify.com'
  const hrPassword = process.env.HR_PASSWORD ?? 'HR@123'

  console.log('Clearing existing data...')
  await prisma.salary.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.fxRate.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding FxRate demo table...')
  const currencies = [...new Set(COUNTRIES.map((c) => c.currency))]
  await prisma.fxRate.createMany({
    data: currencies.map((currency) => ({
      currency,
      usdPerUnit: USD_PER_UNIT[currency] ?? '0.01000000',
      asOf: FX_AS_OF,
    })),
  })

  console.log(`Seeding HR user (${hrEmail})...`)
  await prisma.user.create({
    data: {
      id: 'user_hr_001',
      email: hrEmail,
      passwordHash: hashPassword(hrPassword),
      role: UserRole.HR,
    },
  })

  console.log(`Seeding ${TOTAL_EMPLOYEES} employees with salary history...`)

  let salarySeq = 0
  let withOneRaise = 0
  let withTwoRaises = 0

  for (let start = 0; start < TOTAL_EMPLOYEES; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, TOTAL_EMPLOYEES)
    const employees: Prisma.EmployeeCreateManyInput[] = []
    const salaries: Prisma.SalaryCreateManyInput[] = []

    for (let i = start; i < end; i += 1) {
      const n = i + 1
      const id = `emp_${String(n).padStart(5, '0')}`
      const locale = pick(rng, COUNTRIES)
      const status =
        rng() < 0.92 ? EmploymentStatus.ACTIVE : EmploymentStatus.INACTIVE
      // Join 2016-2023 so many tenures allow 1-2 yearly raises before HISTORY_CUTOFF
      const joinedYear = 2016 + Math.floor(rng() * 8)
      const joinedAt = new Date(Date.UTC(joinedYear, Math.floor(rng() * 12), 1))
      const history = buildSalaryHistory(
        rng,
        joinedAt,
        locale.currency,
        locale.baseAnnual,
      )

      if (history.length === 2) {
        withOneRaise += 1
      } else if (history.length >= 3) {
        withTwoRaises += 1
      }

      employees.push({
        id,
        employeeNumber: `E${String(n).padStart(5, '0')}`,
        fullName: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
        email: `e${String(n).padStart(5, '0')}@employees.remunify.local`,
        joinedAt,
        country: locale.country,
        department: pick(rng, DEPARTMENTS),
        designation: pick(rng, DESIGNATIONS),
        status,
      })

      for (const row of history) {
        salarySeq += 1
        salaries.push({
          id: `sal_${String(salarySeq).padStart(6, '0')}`,
          employeeId: id,
          amount: row.amount,
          currency: row.currency,
          period: PayPeriod.ANNUAL,
          effectiveFrom: row.effectiveFrom,
        })
      }
    }

    await prisma.employee.createMany({ data: employees })
    await prisma.salary.createMany({ data: salaries })
    console.log(`  inserted employees ${end}/${TOTAL_EMPLOYEES}`)
  }

  const employeeCount = await prisma.employee.count()
  const salaryCount = await prisma.salary.count()
  const fxCount = await prisma.fxRate.count()
  const userCount = await prisma.user.count()
  console.log(
    `Seed complete: ${employeeCount} employees, ${salaryCount} salaries, ${fxCount} fx rates, ${userCount} users.`,
  )
  console.log(
    `History: ${withOneRaise} employees with 1 raise, ${withTwoRaises} with 2 raises (rest starting salary only).`,
  )
}

seed()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
