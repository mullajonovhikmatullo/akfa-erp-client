import {ArrowRight} from 'lucide-react';

import {getAdminUrl} from '@store/landing-stub';
import {useI18n} from '../../i18n/I18nProvider';

const storeLoginUrl = getAdminUrl();

export function FinalCTA() {
    //
    const {t} = useI18n();
    const cta = t.finalCta;

    return (
        <section className="section section--cta" aria-labelledby="final-cta-heading">
            <div className="container">
                <div className="cta-panel" data-reveal="up">
                    <h2 id="final-cta-heading">{cta.heading}</h2>
                    <p>{cta.text}</p>
                    <div className="cta-panel__actions">
                        <a className="btn btn--light btn--lg" href="#tariflar">{cta.primary}<ArrowRight size={18} aria-hidden="true"/></a>
                        <a className="btn btn--on-dark btn--lg" href={storeLoginUrl}>{cta.secondary}</a>
                    </div>
                </div>
            </div>
        </section>
    );
}
