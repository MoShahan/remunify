import { type SubmitEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { BrandMark } from '@/components/brand-mark'
import { FormFieldError } from '@/components/form-field-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { useAuth } from '@/features/auth/auth-context'
import { fieldErrorsFromDetails, isApiError } from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
})

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('hr@remunify.com')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'email')
        if (!next[key]) next[key] = issue.message
      }
      setFieldErrors(next)
      return
    }

    setSubmitting(true)
    try {
      await login(parsed.data.email, parsed.data.password)
      const from = searchParams.get('from')
      navigate(from && from.startsWith('/') ? from : '/dashboard', {
        replace: true,
      })
    } catch (error) {
      if (isApiError(error)) {
        const mapped = fieldErrorsFromDetails(error.details)
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped)
        }
        setFormError(error.message)
      } else {
        setFormError('Unable to sign in. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-svh">
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_15%_10%,hsl(270_55%_90%_/_0.9),transparent_55%),radial-gradient(700px_400px_at_90%_80%,hsl(262_40%_92%_/_0.75),transparent_50%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col justifying-center gap-10 px-6 py-12 lg:flex-row lg:items-center lg:gap-16">
        <div className="max-w-md flex-1 animate-in fade-in-0 slide-in-from-left-2 duration-500">
          <BrandMark className="h-12 w-12" />
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Remunify
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Compensation clarity for ACME HR - manage pay records and answer how
            the organization compensates people.
          </p>
        </div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="relative w-full max-w-md flex-1 animate-in fade-in-0 slide-in-from-right-2 duration-500 rounded-2xl border border-border/80 bg-card/95 p-7 shadow-sm backdrop-blur"
          noValidate
        >
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Sign in
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your ACME HR account.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
                aria-invalid={Boolean(fieldErrors.email)}
              />
              <FormFieldError message={fieldErrors.email} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
                aria-invalid={Boolean(fieldErrors.password)}
              />
              <FormFieldError message={fieldErrors.password} />
            </div>
          </div>

          {formError ? (
            <p
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {formError}
            </p>
          ) : null}

          <Button type="submit" className="mt-6 w-full" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
