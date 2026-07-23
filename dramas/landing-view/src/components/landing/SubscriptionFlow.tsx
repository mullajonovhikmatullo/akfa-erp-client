import { ArrowRight, ShieldCheck } from "lucide-react";
import { site } from "../../config/site";

export function SubscriptionFlow() {
  const s = site.subscriptionFlow;
  return (
    <section className="py-16 sm:py-20 border-t border-border bg-surface/40">
      <div className="container-page grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 items-center">
        <div>
          <div className="eyebrow">Obuna jarayoni</div>
          <h2 className="section-heading mt-3 text-[26px] sm:text-[30px]">{s.heading}</h2>
          <p className="mt-4 text-muted-foreground text-[14.5px] leading-relaxed max-w-lg">
            {s.note}
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-[13px] text-primary">
            <ShieldCheck className="h-4 w-4" />
            To‘lov ma’lumotlari xavfsiz saqlanadi
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <ol className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
            {s.steps.map((step, i) => (
              <li key={step} className="flex-1 flex items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-primary-soft text-primary grid place-items-center text-[12px] font-semibold tabular">
                    {i + 1}
                  </div>
                  <div className="text-[13.5px] font-medium">{step}</div>
                </div>
                {i < s.steps.length - 1 && (
                  <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
