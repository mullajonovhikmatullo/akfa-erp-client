import { ArrowRight } from "lucide-react";
import { site } from "../../config/site";

export function FinalCTA() {
  const c = site.finalCta;
  return (
    <section className="py-20 sm:py-24 border-t border-border">
      <div className="container-page">
        <div className="relative rounded-3xl border border-border bg-card overflow-hidden">
          {/* subtle retail pattern */}
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full text-primary/[0.05]"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="relative px-6 sm:px-12 py-14 sm:py-16 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-8 items-center">
            <div>
              <h2 className="section-heading">{c.heading}</h2>
              <p className="mt-4 text-muted-foreground max-w-lg">{c.text}</p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
              <a href="#" className="btn-primary sm:w-auto w-full">
                {c.primary}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#tariflar" className="text-[13.5px] font-medium text-foreground/80 hover:text-foreground underline underline-offset-4">
                {c.secondary}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
