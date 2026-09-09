import {useState} from "react";

import {useI18n} from "../../i18n/I18nProvider";

export function FAQ() {
    //
    const {t} = useI18n();
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
                        const answerId = `faq-answer-${index}`;
                        const buttonId = `faq-question-${index}`;
                        return (
                            <article className={`faq-item${isOpen ? " is-open" : ""}`} key={`faq-${index}`}>
                                <button id={buttonId} type="button" aria-controls={answerId} aria-expanded={isOpen}
                                        onClick={() => setOpen(isOpen ? null : index)}>
                                    <span>{item.question}</span>
                                    <svg className="faq-item__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                        <path d="m4.75 7.25 5.25 5.5 5.25-5.5" stroke="currentColor" strokeLinecap="round"
                                              strokeLinejoin="round" strokeWidth="1.75"/>
                                    </svg>
                                </button>
                                <div id={answerId} className={`faq-item__answer${isOpen ? " is-open" : ""}`} role="region"
                                     aria-hidden={!isOpen} aria-labelledby={buttonId}>
                                    <p>{item.answer}</p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
