/**
 * Original, Foundation-owned decorative interface specimen. It uses semantic
 * surfaces and status roles only; there is no copied artwork, product data, or
 * reference-specific structure. Because it adds no information beyond the
 * adjacent hero copy, the whole preview is hidden from assistive technology.
 */
export function NeutralPreview() {
  return (
    <div
      data-slot="marketing-preview"
      aria-hidden="true"
      className="aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-surface p-3 sm:p-4"
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border bg-background">
        <div className="flex h-10 shrink-0 items-center gap-2 border-b px-3">
          <span className="size-3 rounded-sm bg-primary" />
          <span className="h-2 w-16 rounded-sm bg-foreground/15" />
          <div className="ms-auto flex gap-1.5">
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,0.34fr)_minmax(0,1fr)] gap-3 p-3">
          <div className="flex min-w-0 flex-col gap-3 rounded-lg border bg-surface p-3">
            <span className="h-2 w-3/4 rounded-sm bg-foreground/20" />
            <span className="h-2 w-full rounded-sm bg-foreground/10" />
            <span className="h-2 w-4/5 rounded-sm bg-foreground/10" />
            <span className="mt-auto h-8 rounded-md border bg-background" />
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="h-2 w-1/2 rounded-sm bg-foreground/20" />
                <span className="h-2 w-4/5 rounded-sm bg-foreground/10" />
              </div>
              <div className="flex shrink-0 gap-1 rounded-md border bg-surface p-1">
                <span className="rounded-sm bg-background px-1.5 py-0.5 text-caption font-semibold">
                  Aa
                </span>
                <span className="rounded-sm bg-primary/15 px-1.5 py-0.5 text-caption font-semibold text-link">
                  ع
                </span>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-2 gap-3">
              <div className="flex min-w-0 flex-col justify-between rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2">
                  <span className="size-5 rounded-md bg-primary/15" />
                  <span className="h-2 w-1/2 rounded-sm bg-foreground/15" />
                </div>
                <div className="flex h-16 items-end gap-1.5">
                  <span className="h-1/3 flex-1 rounded-sm bg-info/30" />
                  <span className="h-2/3 flex-1 rounded-sm bg-info/50" />
                  <span className="h-1/2 flex-1 rounded-sm bg-primary/40" />
                  <span className="h-full flex-1 rounded-sm bg-primary/70" />
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-2 rounded-lg border bg-card p-3">
                <span className="h-2 w-2/3 rounded-sm bg-foreground/15" />
                <span className="mt-1 h-7 rounded-md bg-success/15" />
                <span className="h-7 rounded-md bg-warning/15" />
                <span className="h-7 rounded-md bg-info/15" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
