import { ArrowRight, Building2, ChartNoAxesCombined, UserRound } from "lucide-react";
import { site } from "../../config/site";

const stepIcons = {
  user: UserRound,
  building: Building2,
  growth: ChartNoAxesCombined,
};

export function HowItWorks() {
  const section = site.howItWorks;

  return (
    <section className="steps-section" id="qanday-ishlaydi">
      <div className="container-page">
        <div className="section-heading section-heading--center" data-reveal="up">
          <h2>{section.heading}</h2>
        </div>

        <ol className="steps-grid" data-reveal-group>
          {section.steps.map((step, index) => {
            const Icon = stepIcons[step.icon];
            return (
              <li className="step-card" key={step.n} data-reveal="up">
                <span className="step-card__number">{step.n}</span>
                <Icon className="step-card__icon" size={33} strokeWidth={1.7} />
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                {index < section.steps.length - 1 ? (
                  <span className="step-card__arrow" aria-hidden="true">
                    <ArrowRight size={27} />
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
