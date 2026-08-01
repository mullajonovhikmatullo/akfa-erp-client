import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { LandingSeekApi } from "@store/landing-stub";
import type { PublicPlan, PublicPlanCode } from "@store/landing-stub";
import { site } from "../../config/site";
import { RegistrationModal } from "./RegistrationModal";

type DisplayPlan = (typeof site.pricing.plans)[number];

export function Pricing() {
  const pricing = site.pricing;
  const [selectedPlan, setSelectedPlan] = useState<DisplayPlan | null>(null);
  const [publicPlans, setPublicPlans] = useState<PublicPlan[]>([]);

  useEffect(() => {
    let active = true;
    LandingSeekApi.listPublicPlans()
      .then((plans) => {
        if (active) setPublicPlans(plans);
      })
      .catch(() => {
        // Static tariflar landing ishlashi uchun doim mavjud.
      });
    return () => {
      active = false;
    };
  }, []);

  const plans = useMemo(
    () =>
      pricing.plans.map((plan) => {
        const livePlan = plan.code === "NETWORK"
          ? undefined
          : publicPlans.find((item) => item.code === plan.code);
        return livePlan
          ? { ...plan, price: new Intl.NumberFormat("uz-UZ").format(livePlan.monthlyPriceUzs) }
          : plan;
      }),
    [pricing.plans, publicPlans],
  );

  return (
    <section className="pricing-section" id="tariflar">
      <div className="container-page">
        <div className="section-heading section-heading--center" data-reveal="up">
          <div className="section-kicker">Oddiy va shaffof narxlar</div>
          <h2>{pricing.heading}</h2>
          <p>{pricing.note}</p>
        </div>

        <div className="pricing-grid" data-reveal-group>
          {plans.map((plan) => (
            <article className={`pricing-card${plan.highlight ? " pricing-card--featured" : ""}`} key={plan.code} data-reveal="up">
              {plan.highlight ? <span className="pricing-card__badge">{plan.label}</span> : null}
              <h3>{plan.name}</h3>
              <div className={`pricing-card__price${plan.code === "NETWORK" ? " is-custom" : ""}`}>
                <strong>{plan.price}</strong>
                {plan.unit ? <span>{plan.unit}</span> : null}
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={14} strokeWidth={2.5} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`button ${plan.highlight ? "button--primary" : "button--ghost"}`}
                type="button"
                onClick={() => {
                  if (plan.code === "NETWORK") {
                    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent("Mavion Pro tarifi")}`;
                    return;
                  }
                  setSelectedPlan(plan);
                }}
              >
                {plan.cta}
              </button>
            </article>
          ))}
        </div>
      </div>

      {selectedPlan ? (
        <RegistrationModal
          open
          planCode={selectedPlan.code as PublicPlanCode}
          planName={selectedPlan.name}
          onClose={() => setSelectedPlan(null)}
        />
      ) : null}
    </section>
  );
}
