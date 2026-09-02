import { useI18n } from "../../i18n/I18nProvider";

const stepIcons = ['user-circle', 'building-02', 'chart_line'] as const;

export function HowItWorks() {
  //
  const { t } = useI18n();
  const section = t.howItWorks;

  return (
    <section className="steps-section" id="qanday-ishlaydi">
      <div className="container-page">
        <div className="section-heading section-heading--center" data-reveal="up">
          <h2>{section.heading}</h2>
        </div>

        <ol className="steps-grid" data-reveal-group>
          {section.steps.map((step, index) => {
            //
            const icon = stepIcons[index];
            if (!icon) return null;
            return (
              <li className="step-card" key={`step-${index}`} data-reveal="up">
                <span className="step-card__number">{index + 1}</span>
                <i className={`icons-${icon} icon-size-33 step-card__icon`} />
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                {index < section.steps.length - 1 ? (
                  <span className="step-card__arrow" aria-hidden="true">
                    <i className="icons-arrow-right icon-size-27" />
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
