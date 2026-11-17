/**
 * Deterministic provisional seed: 10,000 employees + current salary each.
 * Field set follows docs/database-design.md (Q4 still provisional).
 */
import {
  EmploymentStatus,
  PayPeriod,
  PrismaClient,
  type Prisma,
} from '@prisma/client'

const prisma = new PrismaClient()

const TOTAL_EMPLOYEES = 10_000
const BATCH_SIZE = 500

const COUNTRIES: { country: string; currency: string }[] = [
  { country: 'India', currency: 'INR' },
  { country: 'United States', currency: 'USD' },
  { country: 'United Kingdom', currency: 'GBP' },
  { country: 'Germany', currency: 'EUR' },
  { country: 'Singapore', currency: 'SGD' },
  { country: 'Australia', currency: 'AUD' },
  { country: 'Canada', currency: 'CAD' },
  { country: 'Japan', currency: 'JPY' },
]

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

/** Small deterministic PRNG (mulberry32). */
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
  return items[Math.floor(rng() * items.length)]!
}

function annualAmount(rng: () => number, currency: string): string {
  const baseByCurrency: Record<string, number> = {
    INR: 600_000,
    USD: 85_000,
    GBP: 65_000,
    EUR: 70_000,
    SGD: 90_000,
    AUD: 95_000,
    CAD: 88_000,
    JPY: 7_500_000,
  }
  const base = baseByCurrency[currency] ?? 50_000
  const jitter = Math.floor(rng() * base * 0.6)
  return (base + jitter).toFixed(2)
}

async function seed() {
  const rng = createRng(42)
  const effectiveFrom = new Date('2024-01-01')

  console.log('Clearing existing provisional data...')
  await prisma.salary.deleteMany()
  await prisma.employee.deleteMany()

  console.log(`Seeding ${TOTAL_EMPLOYEES} employees...`)

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
      const period = rng() < 0.85 ? PayPeriod.ANNUAL : PayPeriod.MONTHLY
      const amount = annualAmount(rng, locale.currency)

      employees.push({
        id,
        employeeNumber: `E${String(n).padStart(5, '0')}`,
        fullName: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
        country: locale.country,
        department: pick(rng, DEPARTMENTS),
        designation: pick(rng, DESIGNATIONS),
        status,
      })

      salaries.push({
        id: `sal_${String(n).padStart(5, '0')}`,
        employeeId: id,
        amount,
        currency: locale.currency,
        period,
        effectiveFrom,
      })
    }

    await prisma.employee.createMany({ data: employees })
    await prisma.salary.createMany({ data: salaries })
    console.log(`  inserted ${end}/${TOTAL_EMPLOYEES}`)
  }

  const employeeCount = await prisma.employee.count()
  const salaryCount = await prisma.salary.count()
  console.log(
    `Seed complete: ${employeeCount} employees, ${salaryCount} salaries.`,
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
