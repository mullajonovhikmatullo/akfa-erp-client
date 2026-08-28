import { CalendarCheck, CircleHelp, Clock3, CreditCard, ShieldCheck } from "lucide-react";
import { useI18n } from "../../i18n/I18nProvider";

const logos = [
  { icon: CalendarCheck, tone: "green" },
  { icon: CreditCard, tone: "blue" },
  { icon: Clock3, tone: "orange" },
  { icon: ShieldCheck, tone: "violet" },
  { icon: CircleHelp, tone: "blue" },
];

export function Trust() {
  const { t } = useI18n();

  return (
    <section className="trust-strip" aria-label={t.trust.heading}>
      <div className="container-page">
        <p data-reveal="up">{t.trust.heading}</p>
        <div className="trust-strip__logos" data-reveal-group>
          {t.trust.items.map((name, index) => {
            const item = logos[index];
            if (!item) return null;
            const Icon = item.icon;
            return (
              <div className={`trust-logo trust-logo--${item.tone}`} key={`trust-item-${index}`} data-reveal="up">
                <Icon size={25} strokeWidth={2} />
                <strong>{name}</strong>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
