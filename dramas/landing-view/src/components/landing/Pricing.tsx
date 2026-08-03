import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { LandingSeekApi } from "@store/landing-stub";
import type { PublicPlan, PublicPlanCode } from "@store/landing-stub";
import { site } from "../../config/site";
import { RegistrationModal } from "./RegistrationModal";

type StaticPlan = (typeof site.pricing.plans)[number];

type DisplayPlan = {
  code: string;
  name: string;
  price: string;
  unit: string;
  highlight: boolean;
  label: string;
  features: string[];
  cta: string;
  contactOnly?: boolean;
};

const normalizePlanCode = (code: string) => code.trim().toUpperCase();
const formatLimit = (value: number) => new Intl.NumberFormat("en-US").format(value);

const formatPlanFeatures = (plan: PublicPlan, template?: StaticPlan) => {
  const branchFeature =
    plan.maxBranches === null
      ? "Cheksiz filial"
      : plan.maxBranches <= 1
        ? "Faqat asosiy do‘kon"
        : `Asosiy do‘kon + ${plan.maxBranches - 1} tagacha filial`;
  const userFeature =
    plan.maxUsers === null
      ? "Cheksiz foydalanuvchi"
      : `${formatLimit(plan.maxUsers)} tagacha foydalanuvchi`;
  const productFeature =
    plan.maxProducts === null
      ? "Cheksiz mahsulot"
      : `${formatLimit(plan.maxProducts)} tagacha mahsulot`;
  const templateFeatures = (template?.features ?? []).filter(
    (feature) => !/filial|do‘kon|user|foydalanuvchi|mahsulot|branch|product/i.test(feature),
  );

  return [branchFeature, userFeature, productFeature, ...templateFeatures];
};

const pricingSkeletonKeys = ["one", "two", "three"] as const;

function PricingSkeleton() {
  return (
    <>
      {pricingSkeletonKeys.map((key) => (
        <article className="pricing-card pricing-card--skeleton" key={key} aria-hidden="true">
          <span className="pricing-skeleton__line pricing-skeleton__line--title" />
          <span className="pricing-skeleton__line pricing-skeleton__line--label" />
          <span className="pricing-skeleton__line pricing-skeleton__line--price" />
          <ul className="pricing-skeleton__features">
            <li><span className="pricing-skeleton__line" /></li>
            <li><span className="pricing-skeleton__line" /></li>
            <li><span className="pricing-skeleton__line" /></li>
            <li><span className="pricing-skeleton__line pricing-skeleton__line--short" /></li>
          </ul>
          <span className="pricing-skeleton__button" />
        </article>
      ))}
    </>
  );
}

export function Pricing() {
  const pricing = site.pricing;
  const [selectedPlan, setSelectedPlan] = useState<DisplayPlan | null>(null);
  const [publicPlans, setPublicPlans] = useState<PublicPlan[] | null>(null);

  useEffect(() => {
    let active = true;
    LandingSeekApi.listPublicPlans()
      .then((plans) => {
        if (active) setPublicPlans(plans);
      })
      .catch(() => {
        if (active) setPublicPlans([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const plans = useMemo<DisplayPlan[]>(
    () => {
      if (publicPlans === null) return [];

      const templates = new Map(
        pricing.plans.map((plan) => [normalizePlanCode(plan.code), plan]),
      );
      const livePlans = publicPlans
        .slice()
        .sort((left, right) => left.monthlyPriceUzs - right.monthlyPriceUzs)
        .map((livePlan): DisplayPlan => {
          const template = templates.get(normalizePlanCode(livePlan.code));
          return {
            code: livePlan.code,
            name: livePlan.name,
            price: new Intl.NumberFormat("uz-UZ").format(livePlan.monthlyPriceUzs),
            unit: "so‘m / oy",
            highlight: template?.highlight ?? false,
            label: template?.label ?? "",
            features: formatPlanFeatures(livePlan, template),
            cta: template?.cta ?? "Bepul sinovni boshlash",
          };
        });
      return livePlans;
    },
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

        <div
          className="pricing-grid"
          data-reveal-group
          aria-busy={publicPlans === null}
        >
          {publicPlans === null ? <PricingSkeleton /> : plans.length === 0 ? (
            <p className="pricing-empty-state">Tariflar hozircha mavjud emas.</p>
          ) : plans.map((plan) => (
            <article
              className={`pricing-card${plan.highlight ? " pricing-card--featured" : ""}${publicPlans !== null ? " is-revealed" : ""}`}
              key={plan.code}
              data-reveal="up"
            >
              {plan.highlight ? <span className="pricing-card__badge">{plan.label}</span> : null}
              <h3>{plan.name}</h3>
              <span className="pricing-card__price-label">Sinovdan keyingi narx</span>
              <div className={`pricing-card__price${plan.contactOnly ? " is-custom" : ""}`}>
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
                  if (plan.contactOnly) {
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
