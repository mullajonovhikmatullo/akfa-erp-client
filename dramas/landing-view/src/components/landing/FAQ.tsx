import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { site } from "../../config/site";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="faq-section" id="savollar">
      <div className="container-page faq-section__inner">
        <div className="section-heading section-heading--center" data-reveal="up">
          <h2>Ko‘p so‘raladigan savollar</h2>
        </div>

        <div className="faq-list" data-reveal-group>
          {site.faq.map((item, index) => {
            const isOpen = open === index;
            return (
              <article className={`faq-item${isOpen ? " is-open" : ""}`} key={item.q}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : index)}>
                  <span>{item.q}</span>
                  <ChevronDown size={17} />
                </button>
                <p className={`faq-item__answer${isOpen ? " is-open" : ""}`}>{item.a}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
