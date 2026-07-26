import { Handbag, House, ShoppingBasket, ShoppingCart } from "lucide-react";
import { site } from "../../config/site";

const logos = [
  { icon: ShoppingBasket, tone: "green" },
  { icon: House, tone: "orange" },
  { icon: ShoppingCart, tone: "blue" },
  { icon: Handbag, tone: "violet" },
];

export function Trust() {
  return (
    <section className="trust-strip" aria-label={site.trust.line}>
      <div className="container-page">
        <p>{site.trust.line}</p>
        <div className="trust-strip__logos">
          {site.trust.logos.map((name, index) => {
            const item = logos[index];
            if (!item) return null;
            const Icon = item.icon;
            return (
              <div className={`trust-logo trust-logo--${item.tone}`} key={name}>
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
