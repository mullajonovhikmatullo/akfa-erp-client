export const PageLoader = () => (
  <div className="flex min-h-[60dvh] items-center justify-center" role="status" aria-live="polite">
    <div className="flex flex-col items-center gap-3">
      <span className="size-10 animate-spin rounded-full border-2 border-volt border-t-transparent" aria-hidden="true" />
      <span className="text-sm text-mist">Yuklanmoqda…</span>
    </div>
  </div>
)
