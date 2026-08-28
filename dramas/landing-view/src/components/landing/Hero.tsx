import { Check } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";
import { DashboardMock } from "./DashboardMock";

export function Hero() {
  const { t } = useI18n();
  const hero = t.hero;

  return (
    <section className="landing-hero">
      <div className="landing-hero__glow" aria-hidden="true" />
      <div className="container-page landing-hero__grid">
        <div className="landing-hero__copy" data-reveal="up">
          <div className="pill-label">{hero.eyebrow}</div>
          <h1>{hero.heading}</h1>
          <p>{hero.supporting}</p>
          <div className="landing-hero__actions">
            <a className="button button--primary" href="#tariflar">
              {hero.primaryCta}
            </a>
            <a className="button button--outline" href="#imkoniyatlar">
              {hero.secondaryCta}
            </a>
          </div>
          <div className="landing-hero__note">
            <span>
              <Check size={13} strokeWidth={2.5} />
              {hero.trial}
            </span>
            <i aria-hidden="true" />
            <span>{hero.note}</span>
          </div>
        </div>

        <div className="landing-hero__dashboard" data-reveal="scale">
          <DashboardMock />
        </div>
      </div>
    </section>
  );
}
