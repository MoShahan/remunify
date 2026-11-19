-- AlterEnum: remove MONTHLY (recreate PayPeriod as ANNUAL-only)
CREATE TYPE "PayPeriod_new" AS ENUM ('ANNUAL');
ALTER TABLE "Salary" ALTER COLUMN "period" DROP DEFAULT;
ALTER TABLE "Salary" ALTER COLUMN "period" TYPE "PayPeriod_new" USING (
  CASE WHEN "period"::text = 'ANNUAL' THEN 'ANNUAL'::"PayPeriod_new" ELSE 'ANNUAL'::"PayPeriod_new" END
);
ALTER TYPE "PayPeriod" RENAME TO "PayPeriod_old";
ALTER TYPE "PayPeriod_new" RENAME TO "PayPeriod";
DROP TYPE "PayPeriod_old";
ALTER TABLE "Salary" ALTER COLUMN "period" SET DEFAULT 'ANNUAL';

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('HR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'HR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FxRate" (
    "currency" CHAR(3) NOT NULL,
    "usdPerUnit" DECIMAL(18,8) NOT NULL,
    "asOf" DATE NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FxRate_pkey" PRIMARY KEY ("currency")
);

-- AlterTable Employee
ALTER TABLE "Employee" ADD COLUMN "email" TEXT;
ALTER TABLE "Employee" ADD COLUMN "joinedAt" DATE;

UPDATE "Employee"
SET
  "email" = lower("employeeNumber") || '@employees.remunify.local',
  "joinedAt" = DATE '2022-01-01'
WHERE "email" IS NULL OR "joinedAt" IS NULL;

ALTER TABLE "Employee" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "joinedAt" SET NOT NULL;

CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");
CREATE INDEX "Employee_email_idx" ON "Employee"("email");

-- AlterTable Salary: history support
ALTER TABLE "Salary" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DROP INDEX IF EXISTS "Salary_employeeId_key";

CREATE UNIQUE INDEX "Salary_employeeId_effectiveFrom_key" ON "Salary"("employeeId", "effectiveFrom");
CREATE INDEX "Salary_employeeId_effectiveFrom_idx" ON "Salary"("employeeId", "effectiveFrom" DESC);

-- CreateIndex User
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
