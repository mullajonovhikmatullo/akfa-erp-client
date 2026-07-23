import { site } from "../../config/site";

export function HowItWorks() {
  const h = site.howItWorks;
  return (
    <section id="qanday-ishlaydi" className="py-20 sm:py-28 border-t border-border bg-surface/40">
      <div className="container-page">
        <div className="max-w-2xl">
          <div className="eyebrow">Qanday ishlaydi</div>
          <h2 className="section-heading mt-3">{h.heading}</h2>
        </div>

        <div className="mt-14 relative">
          {/* horizontal connector on desktop */}
          <div className="hidden md:block absolute left-0 right-0 top-6 h-px bg-border" />
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
            {h.steps.map((s) => (
              <li key={s.n} className="relative">
                <div className="flex md:flex-col items-start gap-4 md:gap-5">
                  <div className="relative shrink-0 h-12 w-12 md:h-12 md:w-12 rounded-full border border-border bg-card grid place-items-center font-semibold tabular text-[15px]">
                    {s.n}
                  </div>
                  <div>
                    <div className="text-[18px] font-semibold">{s.title}</div>
                    <p className="mt-1.5 text-[14.5px] text-muted-foreground leading-relaxed max-w-xs">
                      {s.text}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
