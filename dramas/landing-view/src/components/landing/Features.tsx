import { useI18n } from "../../i18n/I18nProvider";

const featureIcons = ['chart-bar', 'payments', 'category', 'assignment', 'building-02', 'user_check'] as const;

export function Features() {
  //
  const { t } = useI18n();

  return (
    <section className="features-section" id="imkoniyatlar">
      <div className="container-page">
        <div className="section-heading section-heading--center" data-reveal="up"><h2>{t.features.heading}</h2></div>
        <div className="features-grid" data-reveal-group>
          {t.features.items.map(({ title, text }, index) => {
            //
            const icon = featureIcons[index];
            return icon ? (
              <article className="feature-card" key={`feature-${index}`} data-reveal="up">
                <span className="feature-card__icon"><i className={`icons-${icon} icon-size-23`} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ) : null;
          })}
        </div>
      </div>
    </section>
  );
}
