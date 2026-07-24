import { site } from "../../config/site";

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28 border-t border-border bg-surface/40">
      <div className="container-page">
        <div className="max-w-2xl mb-12">
          <div className="eyebrow">Foydalanuvchilar</div>
          <h2 className="section-heading mt-3">
            Do‘kon egalari va platform admin jamoasi uchun
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {site.testimonials.map((t) => {
            const initials = t.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <figure
                key={t.name}
                className="rounded-2xl border border-border bg-card p-6 sm:p-8"
              >
                <blockquote className="text-[17px] sm:text-[18px] leading-relaxed text-foreground/90">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-soft text-primary grid place-items-center font-semibold text-[13px]">
                    {initials}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold">{t.name}</div>
                    <div className="text-[12.5px] text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
