import { BarChart3, Boxes, Building2, ClipboardList, ShieldCheck, ShoppingCart } from "lucide-react";

const features = [
  [BarChart3, "Boshqaruv paneli", "Barcha muhim ko‘rsatkichlar bir qarashda."],
  [ShoppingCart, "Savdo va tushumlar", "Kunlik savdo va tushumlarni kuzatib boring."],
  [Boxes, "Mahsulot va zaxiralar", "Qoldiq, kirim, chiqim va transfer nazorati."],
  [ClipboardList, "Moliyaviy nazorat", "Xarajatlar, foyda va to‘lovlar nazorati."],
  [Building2, "Hisobotlar", "Detallar bo‘yicha keng tahlil va hisobotlar."],
  [ShieldCheck, "Rollar va ruxsatlar", "Xodimlar uchun rollar va ruxsatlarni sozlang."],
] as const;

export function Features() {
  return (
    <section className="features-section" id="imkoniyatlar">
      <div className="container-page">
        <div className="section-heading section-heading--center" data-reveal="up"><h2>Asosiy imkoniyatlar</h2></div>
        <div className="features-grid" data-reveal-group>
          {features.map(([Icon,title,text]) => <article className="feature-card" key={title} data-reveal="up"><span className="feature-card__icon"><Icon size={23}/></span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </div>
    </section>
  );
}
