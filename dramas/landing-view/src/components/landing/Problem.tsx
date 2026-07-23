import { X, Check } from "lucide-react";
import { site } from "../../config/site";

export function Problem() {
  const p = site.problem;
  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <div className="max-w-2xl">
          <div className="eyebrow">Muammo</div>
          <h2 className="section-heading mt-3">{p.heading}</h2>
          <p className="mt-4 text-muted-foreground max-w-xl">{p.description}</p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground">
                Hozirgi holat
              </div>
              <span className="text-[11px] px-2 py-1 rounded-md bg-danger/10 text-danger font-medium">
                Tarqoq
              </span>
            </div>
            <h3 className="mt-3 text-xl font-semibold">{p.before.title}</h3>
            <ul className="mt-5 flex flex-col gap-3">
              {p.before.items.map((it) => (
                <li key={it} className="flex items-start gap-2.5 text-[14px]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-danger/10 text-danger">
                    <X className="h-3 w-3" />
                  </span>
                  <span className="text-foreground/85">{it}</span>
                </li>
              ))}
            </ul>
            {/* messy lines */}
            <svg
              aria-hidden
              className="pointer-events-none absolute -right-8 -bottom-8 opacity-[0.08]"
              width="180"
              height="180"
              viewBox="0 0 180 180"
              fill="none"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <path
                  key={i}
                  d={`M ${10 + i * 8} 170 C ${40 + i * 4} ${100 - i * 5}, ${120 - i * 3} ${60 + i * 6}, 170 ${10 + i * 8}`}
                  stroke="currentColor"
                  strokeWidth="1"
                  fill="none"
                />
              ))}
            </svg>
          </div>

          {/* After */}
          <div className="rounded-2xl border border-primary/20 bg-primary-soft/40 p-6 sm:p-7 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-primary">
                Kvon Admin bilan
              </div>
              <span className="text-[11px] px-2 py-1 rounded-md bg-primary text-primary-foreground font-medium">
                Yagona
              </span>
            </div>
            <h3 className="mt-3 text-xl font-semibold">{p.after.title}</h3>
            <ul className="mt-5 flex flex-col gap-3">
              {p.after.items.map((it) => (
                <li key={it} className="flex items-start gap-2.5 text-[14px]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-foreground/90">{it}</span>
                </li>
              ))}
            </ul>
            <svg
              aria-hidden
              className="pointer-events-none absolute -right-8 -bottom-8 opacity-[0.12] text-primary"
              width="180"
              height="180"
              viewBox="0 0 180 180"
              fill="none"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <line
                  key={i}
                  x1="10"
                  y1={30 + i * 22}
                  x2="170"
                  y2={30 + i * 22}
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
