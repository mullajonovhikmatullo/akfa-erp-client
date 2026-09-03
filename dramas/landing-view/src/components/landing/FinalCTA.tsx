import {useI18n} from "../../i18n/I18nProvider";

export function FinalCTA() {
    const {t} = useI18n();
    const cta = t.finalCta;

    return (
        <section className="final-cta-section">
            <div className="container-page">
                <div className="final-cta" data-reveal="scale">
                    <div className="final-cta__pattern" aria-hidden="true"/>
                    <div>
                        <h2>{cta.heading}</h2>
                        <p>{cta.text}</p>
                    </div>
                    <div className="final-cta__actions">
                        <a className="button button--white" href="#tariflar">
                            {cta.primary}
                        </a>
                        <a className="button button--glass" href="#tariflar">
                            {cta.secondary}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
