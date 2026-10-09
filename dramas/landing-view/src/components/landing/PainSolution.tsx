import {CircleCheck, CircleX} from 'lucide-react';

import {useI18n} from '../../i18n/I18nProvider';
import {SectionHeading} from './SectionHeading';

export function PainSolution() {
    //
    const {t} = useI18n();
    const pain = t.pain;

    return (
        <section className="section" aria-labelledby="pain-heading">
            <div className="container">
                <SectionHeading id="pain-heading" kicker={pain.kicker} heading={pain.heading} supporting={pain.supporting}/>
                <div className="compare" data-reveal="up">
                    <div className="compare__head" aria-hidden="true">
                        <span className="compare__title compare__title--before">{pain.beforeTitle}</span>
                        <span className="compare__title compare__title--after">{pain.afterTitle}</span>
                    </div>
                    <ul className="compare__rows">
                        {pain.rows.map((row) => (
                            <li className="compare__row" key={row.before}>
                                <p className="compare__cell compare__cell--before">
                                    <CircleX size={18} aria-hidden="true"/>
                                    <span><span className="sr-only">{pain.beforeTitle}: </span>{row.before}</span>
                                </p>
                                <p className="compare__cell compare__cell--after">
                                    <CircleCheck size={18} aria-hidden="true"/>
                                    <span><span className="sr-only">{pain.afterTitle}: </span>{row.after}</span>
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
