import {useState} from 'react';
import {ChevronDown} from 'lucide-react';

import {useI18n} from '../../i18n/I18nProvider';
import {SectionHeading} from './SectionHeading';

export function FAQ() {
    //
    const {t} = useI18n();
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section className="section" id="savollar" aria-labelledby="faq-heading">
            <div className="container container--narrow">
                <SectionHeading id="faq-heading" kicker={t.faq.kicker} heading={t.faq.heading}/>
                <div className="faq" data-reveal="up">
                    {t.faq.items.map((item, index) => {
                        //
                        const isOpen = open === index;
                        const answerId = `faq-answer-${index}`;
                        const buttonId = `faq-question-${index}`;
                        return (
                            <div className={`faq__item${isOpen ? ' is-open' : ''}`} key={item.question}>
                                <h3>
                                    <button id={buttonId} type="button" aria-controls={answerId} aria-expanded={isOpen}
                                            onClick={() => setOpen(isOpen ? null : index)}>
                                        <span>{item.question}</span>
                                        <ChevronDown className="faq__icon" size={18} aria-hidden="true"/>
                                    </button>
                                </h3>
                                <div id={answerId} className="faq__answer" role="region" aria-labelledby={buttonId} hidden={!isOpen}>
                                    <p>{item.answer}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
