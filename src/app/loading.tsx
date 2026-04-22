export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4 rounded-3xl border bg-card p-5">
            <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="space-y-4 rounded-3xl border bg-card p-6">
            <div className="h-10 w-3/5 animate-pulse rounded-xl bg-muted" />
            <div className="h-5 w-full animate-pulse rounded bg-muted" />
            <div className="h-5 w-11/12 animate-pulse rounded bg-muted" />
            <div className="h-5 w-10/12 animate-pulse rounded bg-muted" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-40 animate-pulse rounded-2xl bg-muted" />
              <div className="h-40 animate-pulse rounded-2xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
