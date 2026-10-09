import {FileSpreadsheet, ShoppingBag, UserPlus} from 'lucide-react';

import {useI18n} from '../../i18n/I18nProvider';
import {SectionHeading} from './SectionHeading';

const icons = [UserPlus, FileSpreadsheet, ShoppingBag];

export function HowItWorks() {
    //
    const {t} = useI18n();
    const how = t.howItWorks;

    return (
        <section className="section" id="qanday-ishlaydi" aria-labelledby="how-heading">
            <div className="container">
                <SectionHeading id="how-heading" kicker={how.kicker} heading={how.heading}/>
                <ol className="steps">
                    {how.steps.map((step, index) => {
                        //
                        const Icon = icons[index] ?? UserPlus;
                        return (
                            <li className="step" key={step.title} data-reveal="up">
                                <span className="step__number" aria-hidden="true">{index + 1}</span>
                                <span className="feature-icon feature-icon--blue" aria-hidden="true"><Icon size={20}/></span>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
