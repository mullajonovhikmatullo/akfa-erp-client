import {ArrowRight, CircleCheck} from 'lucide-react';

import {useI18n} from '../../i18n/I18nProvider';
import {HeroDashboard} from './HeroDashboard';

export function Hero() {
    //
    const {t} = useI18n();
    const hero = t.hero;

    return (
        <section className="hero" id="top">
            <div className="hero__backdrop" aria-hidden="true"/>
            <div className="container hero__grid">
                <div className="hero__copy">
                    <span className="eyebrow">{hero.eyebrow}</span>
                    <h1>
                        {hero.headingLead}{' '}
                        <span className="text-gradient">{hero.headingAccent}</span>
                    </h1>
                    <p className="hero__lead">{hero.supporting}</p>
                    <div className="hero__actions">
                        <a className="btn btn--primary btn--lg" href="#tariflar">
                            {t.cta.primary}
                            <ArrowRight size={18} aria-hidden="true"/>
                        </a>
                        <a className="btn btn--outline btn--lg" href="#modullar">{t.cta.tour}</a>
                    </div>
                    <ul className="hero__badges">
                        {hero.badges.map((badge) => (
                            <li key={badge}><CircleCheck size={16} aria-hidden="true"/>{badge}</li>
                        ))}
                    </ul>
                </div>

                <div className="hero__visual">
                    <HeroDashboard/>
                </div>
            </div>
        </section>
    );
}
