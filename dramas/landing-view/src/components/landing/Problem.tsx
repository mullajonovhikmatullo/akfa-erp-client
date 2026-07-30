import { ArrowRight, Check, TrendingUp, X } from "lucide-react";
import storeOwnerPhoto from "../../assets/store-owner.jpg";
import { site } from "../../config/site";

export function Problem() {
  const problem = site.problem;

  return (
    <section className="problem-section" id="biz-haqimizda">
      <div className="container-page problem-section__grid">
        <div className="problem-section__content">
          <div className="section-kicker">Muammo va yechim</div>
          <h2>{problem.heading}</h2>

          <div className="problem-compare">
            <CompareCard variant="before" title={problem.before.title} items={problem.before.items} />
            <div className="problem-compare__arrow" aria-hidden="true">
              <ArrowRight size={23} />
            </div>
            <CompareCard variant="after" title={problem.after.title} items={problem.after.items} />
          </div>
        </div>

        <figure className="problem-photo">
          <img src={storeOwnerPhoto} alt="Store Manager tizimida ishlayotgan savdo biznesi egasi" />
          <figcaption>
            <span>Bugungi savdo</span>
            <strong>12.4 M so‘m</strong>
            <small>
              <TrendingUp size={12} />
              +18% vs kecha
            </small>
            <svg viewBox="0 0 130 34" aria-hidden="true">
              <path d="M2 28 C12 27 15 19 24 21 S38 29 47 23 S60 12 70 16 S82 25 92 18 S108 6 128 8" />
            </svg>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function CompareCard({
  variant,
  title,
  items,
}: {
  variant: "before" | "after";
  title: string;
  items: readonly string[];
}) {
  const positive = variant === "after";

  return (
    <div className={`compare-card compare-card--${variant}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>
            <span>{positive ? <Check size={13} /> : <X size={13} />}</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
