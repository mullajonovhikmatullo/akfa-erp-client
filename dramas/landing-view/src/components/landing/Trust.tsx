import { useI18n } from "../../i18n/I18nProvider";

const logos = [
  { icon: 'calendar-check', tone: "green" },
  { icon: 'payments', tone: "blue" },
  { icon: 'clock', tone: "orange" },
  { icon: 'user_check', tone: "violet" },
  { icon: 'question-mark', tone: "blue" },
];

export function Trust() {
  //
  const { t } = useI18n();

  return (
    <section className="trust-strip" aria-label={t.trust.heading}>
      <div className="container-page">
        <p data-reveal="up">{t.trust.heading}</p>
        <div className="trust-strip__logos" data-reveal-group>
          {t.trust.items.map((name, index) => {
            //
            const item = logos[index];
            if (!item) return null;
            return (
              <div className={`trust-logo trust-logo--${item.tone}`} key={`trust-item-${index}`} data-reveal="up">
                <i className={`icons-${item.icon} icon-size-25`} />
                <strong>{name}</strong>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
