import { useState } from "react";

import { useI18n } from "../../i18n/I18nProvider";

export function FAQ() {
  //
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="faq-section" id="savollar">
      <div className="container-page faq-section__inner">
        <div className="section-heading section-heading--center" data-reveal="up">
          <h2>{t.faq.heading}</h2>
        </div>

        <div className="faq-list" data-reveal-group>
          {t.faq.items.map((item, index) => {
            //
            const isOpen = open === index;
            return (
              <article className={`faq-item${isOpen ? " is-open" : ""}`} key={`faq-${index}`}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : index)}>
                  <span>{item.question}</span>
                  <i className="icons-arrow-down icon-size-17" />
                </button>
                <p className={`faq-item__answer${isOpen ? " is-open" : ""}`}>{item.answer}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
