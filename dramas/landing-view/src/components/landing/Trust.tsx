import { CalendarCheck, CircleHelp, Clock3, CreditCard, ShieldCheck } from "lucide-react";
import { site } from "../../config/site";

const logos = [
  { icon: CalendarCheck, tone: "green" },
  { icon: CreditCard, tone: "blue" },
  { icon: Clock3, tone: "orange" },
  { icon: ShieldCheck, tone: "violet" },
  { icon: CircleHelp, tone: "blue" },
];

export function Trust() {
  return (
    <section className="trust-strip" aria-label={site.trust.line}>
      <div className="container-page">
        <p data-reveal="up">{site.trust.line}</p>
        <div className="trust-strip__logos" data-reveal-group>
          {site.trust.logos.map((name, index) => {
            const item = logos[index];
            if (!item) return null;
            const Icon = item.icon;
            return (
              <div className={`trust-logo trust-logo--${item.tone}`} key={name} data-reveal="up">
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
