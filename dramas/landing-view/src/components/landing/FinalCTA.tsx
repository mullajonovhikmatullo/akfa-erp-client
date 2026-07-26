import { site } from "../../config/site";

export function FinalCTA() {
  const cta = site.finalCta;

  return (
    <section className="final-cta-section">
      <div className="container-page">
        <div className="final-cta">
          <div className="final-cta__pattern" aria-hidden="true" />
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
