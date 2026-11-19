import { type SubmitEvent, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { FormFieldError } from '@/components/form-field-error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createSalary,
  fieldErrorsFromDetails,
  isApiError,
  raiseSalary,
  type Salary,
} from '@/lib/api'

const salarySchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required.')
    .refine((v) => Number(v) > 0, 'Amount must be greater than zero.'),
  currency: z
    .string()
    .trim()
    .length(3, 'Currency must be a 3-letter ISO code.')
    .transform((v) => v.toUpperCase()),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD.'),
})

type SalaryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string
  mode: 'create' | 'raise'
  currentSalary: Salary | null
  onSuccess: () => void
}

export function SalaryFormDialog({
  open,
  onOpenChange,
  employeeId,
  mode,
  currentSalary,
  onSuccess,
}: SalaryFormDialogProps) {
  const [amount, setAmount] = useState(currentSalary?.amount ?? '')
  const [currency, setCurrency] = useState(currentSalary?.currency ?? 'USD')
  const [effectiveFrom, setEffectiveFrom] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const resetFromProps = () => {
    setAmount(currentSalary?.amount ?? '')
    setCurrency(currentSalary?.currency ?? 'USD')
    setEffectiveFrom('')
    setFieldErrors({})
  }

  const handleOpenChange = (next: boolean) => {
    if (next) resetFromProps()
    onOpenChange(next)
  }

  const onSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})

    const parsed = salarySchema.safeParse({ amount, currency, effectiveFrom })
    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'amount')
        if (!next[key]) next[key] = issue.message
      }
      setFieldErrors(next)
      return
    }

    setSubmitting(true)
    try {
      const input = {
        amount: parsed.data.amount,
        currency: parsed.data.currency,
        period: 'ANNUAL' as const,
        effectiveFrom: parsed.data.effectiveFrom,
      }
      if (mode === 'create') {
        await createSalary(employeeId, input)
        toast.success('Salary created')
      } else {
        await raiseSalary(employeeId, input)
        toast.success('Raise recorded')
      }
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      if (isApiError(error)) {
        const mapped = fieldErrorsFromDetails(error.details)
        if (
          typeof error.details === 'object' &&
          error.details !== null &&
          'currentEffectiveFrom' in error.details
        ) {
          mapped.effectiveFrom = error.message
        }
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped)
        }
        toast.error(error.message)
      } else {
        toast.error('Could not save salary. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Set first salary' : 'Record raise'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'raise'
              ? `Prior row is kept. effectiveFrom must be after ${currentSalary?.effectiveFrom ?? 'the current date'}.`
              : 'Creates the first current salary for this employee. Period is annual.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-4"
          noValidate
        >
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5"
            />
            <FormFieldError message={fieldErrors.amount} />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1.5 uppercase"
              maxLength={3}
            />
            <FormFieldError message={fieldErrors.currency} />
          </div>
          <div>
            <Label htmlFor="effectiveFrom">Effective from</Label>
            <Input
              id="effectiveFrom"
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="mt-1.5"
            />
            <FormFieldError message={fieldErrors.effectiveFrom} />
          </div>
          <div>
            <Label>Period</Label>
            <p className="mt-1.5 text-sm text-muted-foreground">Annual</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? 'Saving…'
                : mode === 'create'
                  ? 'Create'
                  : 'Save raise'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
