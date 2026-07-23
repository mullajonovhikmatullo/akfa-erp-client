import { ArrowRight } from "lucide-react";
import { site } from "../../config/site";
import { DashboardMock } from "./DashboardMock";

export function Hero() {
  const h = site.hero;
  return (
    <section className="relative pt-10 sm:pt-16 pb-12 sm:pb-20">
      <div className="container-page">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-10 lg:gap-14 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[12px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {h.eyebrow}
            </div>
            <h1 className="mt-5 text-[36px] sm:text-[44px] lg:text-[52px] font-semibold tracking-tight leading-[1.05]">
              {h.heading}
            </h1>
            <p className="mt-5 text-[15.5px] sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              {h.supporting}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a href="#tariflar" className="btn-primary">
                {h.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#imkoniyatlar" className="btn-secondary">
                {h.secondaryCta}
              </a>
            </div>
            <p className="mt-4 text-[12.5px] text-muted-foreground">{h.note}</p>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="absolute -inset-x-6 -top-6 -bottom-6 -z-10 rounded-[28px] bg-gradient-to-br from-primary-soft/60 via-transparent to-accent-soft/50 blur-2xl opacity-70" />
            <DashboardMock />
          </div>
        </div>
      </div>
    </section>
  );
}
