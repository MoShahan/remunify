import { Button } from '@/components/ui/button'

function App() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-6 py-10">
      <header className="flex items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="flex h-10 w-10 items-center justify-end gap-0.5 rounded-lg bg-primary px-2"
          >
            <span className="h-2.5 w-1 rounded-sm bg-brand-muted/80" />
            <span className="h-4 w-1 rounded-sm bg-teal-200" />
            <span className="h-6 w-1 rounded-sm bg-brand-foreground" />
          </div>
          <div>
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Remunify
            </p>
            <p className="text-sm text-muted-foreground">
              Salary management for modern HR teams
            </p>
          </div>
        </div>
        <Button type="button" variant="outline">
          Open directory
        </Button>
      </header>

      <main className="mt-10 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Compensation, clearly
          </h1>
          <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground">
            Manage employee pay records and answer how the organization
            compensates people - without spreadsheet sprawl.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button">View dashboard</Button>
            <Button type="button" variant="secondary">
              Browse employees
            </Button>
          </div>
        </section>

        <aside className="rounded-xl border border-border bg-brand-muted/60 p-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
            Design system
          </p>
          <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
            Tailwind + shadcn/ui with Remunify theme tokens (brand teal, radii,
            typography). Screens will build on this foundation.
          </p>
        </aside>
      </main>
    </div>
  )
}

export default App
