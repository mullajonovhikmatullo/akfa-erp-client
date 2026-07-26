import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { site } from "../../config/site";
import { RegistrationModal } from "./RegistrationModal";
import { LandingSeekApi } from "@store/landing-stub";
import type { PublicPlan, PublicPlanCode } from "@store/landing-stub";

type DisplayPlan = (typeof site.pricing.plans)[number] & {
  features: string[];
};

const formatLimit = (value: number | null, noun: string) =>
  value === null ? `Cheklanmagan ${noun}` : `${value} tagacha ${noun}`;

export function Pricing() {
  const p = site.pricing;
  const [selectedPlan, setSelectedPlan] = useState<DisplayPlan | null>(null);
  const [publicPlans, setPublicPlans] = useState<PublicPlan[] | null>(null);
  const [plansError, setPlansError] = useState(false);

  useEffect(() => {
    let active = true;
    LandingSeekApi.listPublicPlans()
      .then((plans) => {
        if (active) setPublicPlans(plans);
      })
      .catch(() => {
        if (active) setPlansError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const plans = useMemo<DisplayPlan[]>(() => {
    const networkPlan = p.plans.find((plan) => plan.code === "NETWORK")!;
    const billablePlans = (publicPlans ?? []).flatMap((plan) => {
      const template = p.plans.find((item) => item.code === plan.code);
      if (!template || template.code === "NETWORK") return [];

      return [{
        ...template,
        name: plan.name,
        price: new Intl.NumberFormat("uz-UZ").format(plan.monthlyPriceUzs),
        features: [
          formatLimit(plan.maxBranches, "filial"),
          formatLimit(plan.maxUsers, "faol foydalanuvchi"),
          formatLimit(plan.maxProducts, "faol mahsulot"),
          ...template.features.slice(-2),
        ],
      }];
    });

    return [...billablePlans, networkPlan];
  }, [p.plans, publicPlans]);

  return (
    <section id="tariflar" className="py-20 sm:py-28 border-t border-border">
      <div className="container-page">
        <div className="max-w-2xl">
          <div className="eyebrow">Tariflar</div>
          <h2 className="section-heading mt-3">{p.heading}</h2>
          <p className="mt-3 text-muted-foreground">{p.note}</p>
        </div>

        {plansError ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Ochiq tariflarni hozir yuklab bo‘lmadi. Individual tarif uchun bog‘lanishingiz mumkin.
          </p>
        ) : null}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 sm:p-7 flex flex-col bg-card ${
                plan.highlight
                  ? "border-primary/40 ring-1 ring-primary/20"
                  : "border-border"
              }`}
            >
              {plan.highlight && plan.label && (
                <div className="absolute -top-2.5 left-6 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-primary text-primary-foreground">
                  {plan.label}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="text-[15px] font-semibold">{plan.name}</div>
              </div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <div className="text-[30px] font-semibold tracking-tight tabular">
                  {plan.price}
                </div>
                <div className="text-[13px] text-muted-foreground">{plan.unit}</div>
              </div>
              <ul className="mt-6 flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px]">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  if (plan.code === "NETWORK") {
                    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent("Network Admin tarifi")}`;
                    return;
                  }
                  setSelectedPlan(plan);
                }}
                className={`mt-7 w-full ${plan.highlight ? "btn-primary" : "btn-secondary"}`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <RegistrationModal
          open
          planCode={selectedPlan.code as PublicPlanCode}
          planName={selectedPlan.name}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </section>
  );
}
