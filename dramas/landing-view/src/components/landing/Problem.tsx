import { useI18n } from "../../i18n/I18nProvider";

const benefitIcons = ['chart-bar', 'building-02', 'category', 'payments'] as const;
const productValues = [12_400, 9_100, 7_800, 6_200] as const;

export function Problem() {
  //
  const { locale, t } = useI18n();
  const { problem } = t;
  const compactNumber = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });

  return (
    <section className="problem-section" id="kompaniya">
      <div className="container-page">
        <div className="section-heading section-heading--center problem-section__heading" data-reveal="up">
          <h2>{problem.heading}</h2>
          <p>{problem.supporting}</p>
        </div>
        <div className="benefits-layout">
          <div className="benefits-list" data-reveal-group>
            {problem.benefits.map(({ title, text }, index) => {
              //
              const icon = benefitIcons[index];
              return icon ? (
                <article key={`benefit-${index}`} data-reveal="left">
                  <span><i className={`icons-${icon} icon-size-19`} /></span>
                  <div><h3>{title}</h3><p>{text}</p></div>
                </article>
              ) : null;
            })}
          </div>
          <div className="benefits-dashboard" aria-label={problem.dashboardLabel} data-reveal="scale">
            <div className="benefits-stat benefits-stat--income"><small>{problem.stats.income}</small><strong>346.7 <i>{t.dashboard.currency}</i></strong><em>+16%</em><svg viewBox="0 0 190 45" aria-hidden="true"><path d="M2 37 C24 35 29 21 45 25 S67 35 84 24 S108 14 124 22 S151 30 188 7" /></svg></div>
            <div className="benefits-stat benefits-stat--branches"><small>{problem.stats.activeBranches}</small><strong>12</strong><em>+2</em></div>
            <div className="benefits-stat benefits-stat--products"><small>{problem.stats.productCount}</small><strong>1 248</strong><div className="benefits-bars" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div></div>
            <div className="benefits-stat benefits-stat--top">
              <small>{problem.stats.topProducts}</small>
              {problem.stats.products.map((product, index) => (
                <p key={`product-${index}`}><i className="icons-search icon-size-13" /><span>{product}</span><b>{compactNumber.format(productValues[index] ?? 0)}</b></p>
              ))}
            </div>
            <i className="icons-chart_line icon-size-120 benefits-bg-icon" />
          </div>
        </div>
      </div>
    </section>
  );
}
