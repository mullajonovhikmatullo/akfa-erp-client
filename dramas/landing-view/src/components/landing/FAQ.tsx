import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { site } from "../../config/site";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="savollar" className="py-20 sm:py-28 border-t border-border">
      <div className="container-page grid grid-cols-1 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-10 lg:gap-16">
        <div>
          <div className="eyebrow">Savollar</div>
          <h2 className="section-heading mt-3">Ko‘p so‘raladigan savollar</h2>
          <p className="mt-3 text-muted-foreground text-[14.5px]">
            Javob topolmadingizmi? Bizga yozing — jamoamiz yordam beradi.
          </p>
        </div>
        <div className="divide-y divide-border border-t border-b border-border">
          {site.faq.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-[15.5px] font-medium">{item.q}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground">
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="pb-6 pr-10 text-[14.5px] leading-relaxed text-muted-foreground">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
