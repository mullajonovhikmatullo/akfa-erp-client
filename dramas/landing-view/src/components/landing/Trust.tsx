import { site } from "../../config/site";

export function Trust() {
  return (
    <section className="border-y border-border bg-surface/50">
      <div className="container-page py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
          <p className="text-[12.5px] uppercase tracking-[0.14em] font-semibold text-muted-foreground shrink-0">
            {site.trust.line}
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {site.trust.logos.map((l) => (
              <span
                key={l}
                className="text-[15px] font-semibold tracking-tight text-foreground/50"
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
