import { Building2, CreditCard, ShoppingCart } from "lucide-react";
import { site } from "../../config/site";

export function Features() {
  return (
    <section className="features-section" id="imkoniyatlar">
      <div className="container-page">
        <div className="section-heading section-heading--center">
          <h2>Asosiy imkoniyatlar</h2>
        </div>

        <div className="features-grid">
          {site.features.map((feature) => (
            <article className="feature-card" key={feature.id}>
              <FeatureVisual type={feature.visual} />
              <div className="feature-card__copy">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureVisual({ type }: { type: (typeof site.features)[number]["visual"] }) {
  if (type === "chart") {
    return (
      <div className="feature-visual feature-visual--chart">
        <div className="feature-mini-heading">
          <div><span>Jami savdo</span><strong>92.3 M <small>so‘m</small></strong></div>
          <CreditCard size={16} />
        </div>
        <svg viewBox="0 0 190 82" aria-hidden="true">
          <g>
            <path d="M4 16H186M4 38H186M4 60H186" />
          </g>
          <path className="mini-line mini-line--blue" d="M3 70 C20 69 23 60 35 58 S53 66 63 59 S76 16 89 16 S103 67 118 60 S138 43 151 51 S170 58 187 38" />
          <path className="mini-line mini-line--orange" d="M3 72 C18 70 27 51 38 49 S55 68 68 61 S83 45 96 49 S111 68 128 61 S149 50 164 55 S178 62 188 56" />
        </svg>
        <div className="feature-mini-axis"><span>14 iy</span><span>18 iy</span><span>22 iy</span><span>26 iy</span></div>
      </div>
    );
  }

  if (type === "branches") {
    return (
      <div className="feature-visual feature-list-visual">
        <strong><Building2 size={13} /> Main Branch</strong>
        {[
          ["Chilonzor filial", "Toshkent"],
          ["Sergeli filial", "Toshkent"],
          ["Yunusobod filial", "Toshkent"],
        ].map(([name, city]) => (
          <div key={name}><Building2 size={12} /><span>{name}<small>{city}</small></span></div>
        ))}
      </div>
    );
  }

  if (type === "transfers") {
    return (
      <div className="feature-visual feature-table-visual">
        <div><b>ID</b><b>Jo‘natuvchi</b><b>Qabul qiluvchi</b></div>
        <div><span>#T-003</span><span>Main Branch</span><span>Chilonzor filial</span></div>
        <div><span>#T-002</span><span>Main Branch</span><span>Sergeli filial</span></div>
        <div><span>#T-001</span><span>Chilonzor</span><span>Main Branch</span></div>
      </div>
    );
  }

  if (type === "customers") {
    return (
      <div className="feature-visual feature-customer-visual">
        {[
          ["A", "Alisher T.", "+998 90 123 45 67"],
          ["M", "Madina Q.", "+998 99 876 54 33"],
          ["B", "Bekzod A.", "+998 90 885 11 22"],
        ].map(([letter, name, phone]) => (
          <div key={name}>
            <span>{letter}</span>
            <p><strong>{name}</strong><small>{phone}</small></p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="feature-visual feature-sales-visual">
      <div><b>So‘nggi sotuvlar</b><ShoppingCart size={14} /></div>
      {[
        ["#INV-1025", "26.07.2026", "2.4 M so‘m"],
        ["#INV-1024", "26.07.2026", "1.8 M so‘m"],
        ["#INV-1023", "25.07.2026", "3.1 M so‘m"],
      ].map(([id, date, amount]) => (
        <div key={id}><span>{id}</span><small>{date}</small><strong>{amount}</strong></div>
      ))}
    </div>
  );
}
