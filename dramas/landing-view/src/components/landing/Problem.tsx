import { BarChart3, Boxes, Building2, CreditCard, PackageSearch, TrendingUp } from "lucide-react";
import { site } from "../../config/site";

const benefits = [
  { icon: BarChart3, title: "Real vaqt tahlili va hisobotlar", text: "Savdo, tushum, foyda va xarajatlarni real vaqtda kuzating." },
  { icon: Building2, title: "Filiallar bo‘yicha yagona nazorat", text: "Barcha filiallaringiz faoliyatini bitta panelda boshqaring." },
  { icon: Boxes, title: "Zaxira va ombor nazorati", text: "Mahsulot qoldiqlari, kirim va transferlarni oson boshqaring." },
  { icon: CreditCard, title: "To‘lovlar va qarzlar nazorati", text: "Naqd va to‘lovlarni kuzatib, qarzdorlarni boshqaring." },
];

export function Problem() {
  return (
    <section className="problem-section" id="kompaniya">
      <div className="container-page">
        <div className="section-heading section-heading--center problem-section__heading" data-reveal="up">
          <h2>{site.problem.heading}</h2>
          <p>Barcha jarayonlaringizni markazdan boshqaring va biznesingizni rivojlantiring.</p>
        </div>
        <div className="benefits-layout">
          <div className="benefits-list" data-reveal-group>
            {benefits.map(({ icon: Icon, title, text }) => (
              <article key={title} data-reveal="left"><span><Icon size={19} /></span><div><h3>{title}</h3><p>{text}</p></div></article>
            ))}
          </div>
          <div className="benefits-dashboard" aria-label="Mavion ko‘rsatkichlari" data-reveal="scale">
            <div className="benefits-stat benefits-stat--income"><small>Joriy daromad</small><strong>346.7 M <i>so‘m</i></strong><em>+16%</em><svg viewBox="0 0 190 45"><path d="M2 37 C24 35 29 21 45 25 S67 35 84 24 S108 14 124 22 S151 30 188 7" /></svg></div>
            <div className="benefits-stat benefits-stat--branches"><small>Faol filiallar</small><strong>12</strong><em>+2</em></div>
            <div className="benefits-stat benefits-stat--products"><small>Mahsulotlar soni</small><strong>1 248</strong><div className="benefits-bars"><i/><i/><i/><i/><i/><i/></div></div>
            <div className="benefits-stat benefits-stat--top"><small>Top mahsulotlar</small>{["Mineral suv", "Shakar", "Kofe", "Guruch"].map((x,i)=><p key={x}><PackageSearch size={13}/><span>{x}</span><b>{["12.4K","9.1K","7.8K","6.2K"][i]}</b></p>)}</div>
            <TrendingUp className="benefits-bg-icon" size={120} />
          </div>
        </div>
      </div>
    </section>
  );
}
