import {lazy, Suspense, useEffect, useMemo, useState} from 'react';
import {Check, Gift} from 'lucide-react';

import {LandingSeekApi, type PublicPlan, type PublicPlanCode} from '@store/landing-stub';
import {useI18n} from '../../i18n/I18nProvider';
import {formatMessage} from '../../i18n/translations';
import type {TranslationDictionary} from '../../i18n/types';
import {SectionHeading} from './SectionHeading';

type PlanTemplate = TranslationDictionary['pricing']['plans'][keyof TranslationDictionary['pricing']['plans']];

type DisplayPlan = {
    code: PublicPlanCode;
    name: string;
    price: string;
    unit: string;
    highlight: boolean;
    badge: string;
    features: string[];
    cta: string;
};

const RegistrationModal = lazy(() => import('./RegistrationModal').then((module) => ({default: module.RegistrationModal})));

const normalizePlanCode = (code: string) => code.trim().toUpperCase();

function formatPlanFeatures(
    plan: PublicPlan,
    template: PlanTemplate | undefined,
    pricing: TranslationDictionary['pricing'],
    locale: string,
) {
    //
    const formatLimit = (value: number) => new Intl.NumberFormat(locale).format(value);
    const branchFeature = plan.maxBranches === null
        ? pricing.limits.unlimitedBranches
        : plan.maxBranches <= 1
            ? pricing.limits.mainStoreOnly
            : formatMessage(pricing.limits.additionalBranches, {count: formatLimit(plan.maxBranches - 1)});
    const userFeature = plan.maxUsers === null
        ? pricing.limits.unlimitedUsers
        : formatMessage(pricing.limits.users, {count: formatLimit(plan.maxUsers)});
    const productFeature = plan.maxProducts === null
        ? pricing.limits.unlimitedProducts
        : formatMessage(pricing.limits.products, {count: formatLimit(plan.maxProducts)});

    return [branchFeature, userFeature, productFeature, ...(template?.features ?? [])];
}

const pricingSkeletonKeys = ['one', 'two'] as const;

function PricingSkeleton() {
    //
    return (
        <>
            {pricingSkeletonKeys.map((key) => (
                <article className="price-card price-card--skeleton" key={key} aria-hidden="true">
                    <span className="skeleton skeleton--title"/>
                    <span className="skeleton skeleton--price"/>
                    <span className="skeleton"/>
                    <span className="skeleton"/>
                    <span className="skeleton skeleton--short"/>
                    <span className="skeleton skeleton--button"/>
                </article>
            ))}
        </>
    );
}

export function Pricing() {
    //
    const {locale, t} = useI18n();
    const {pricing} = t;
    const [selectedPlan, setSelectedPlan] = useState<DisplayPlan | null>(null);
    const [publicPlans, setPublicPlans] = useState<PublicPlan[]>([]);
    const [loadState, setLoadState] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        //
        let active = true;
        setLoadState('loading');

        LandingSeekApi.listPublicPlans()
            .then((plans) => {
                //
                if (!active) return;
                setPublicPlans(plans);
                setLoadState('success');
            })
            .catch(() => {
                //
                if (!active) return;
                setPublicPlans([]);
                setLoadState('error');
            });

        return () => {
            active = false;
        };
    }, []);

    const plans = useMemo<DisplayPlan[]>(() => {
        //
        const templates = new Map<string, PlanTemplate>(Object.entries(pricing.plans));

        return publicPlans
            .slice()
            .sort((left, right) => left.monthlyPriceUzs - right.monthlyPriceUzs)
            .map((livePlan) => {
                //
                const template = templates.get(normalizePlanCode(livePlan.code));
                return {
                    code: livePlan.code,
                    name: template?.name ?? livePlan.code,
                    price: new Intl.NumberFormat(locale).format(livePlan.monthlyPriceUzs),
                    unit: pricing.monthlyUnit,
                    highlight: template?.highlight ?? false,
                    badge: template?.badge ?? '',
                    features: formatPlanFeatures(livePlan, template, pricing, locale),
                    cta: template?.cta ?? pricing.defaultCta,
                };
            });
    }, [locale, pricing, publicPlans]);

    return (
        <section className="section section--tint" id="tariflar" aria-labelledby="pricing-heading">
            <div className="container">
                <SectionHeading id="pricing-heading" kicker={pricing.kicker} heading={pricing.heading} supporting={pricing.note}/>

                <div className="trial-banner" data-reveal="up">
                    <span className="feature-icon feature-icon--green" aria-hidden="true"><Gift size={20}/></span>
                    <div><b>{pricing.trialTitle}</b><span>{pricing.trialText}</span></div>
                </div>

                <div className="pricing-grid" aria-busy={loadState === 'loading'}>
                    {loadState === 'loading' ? <PricingSkeleton/> : loadState === 'error' ? (
                        <p className="pricing-empty" role="alert">{pricing.loadError}</p>
                    ) : plans.length === 0 ? (
                        <p className="pricing-empty">{pricing.empty}</p>
                    ) : plans.map((plan) => (
                        <article className={`price-card${plan.highlight ? ' price-card--featured' : ''}`} key={plan.code}>
                            <div className="price-card__head">
                                <h3>{plan.name}</h3>
                                {plan.badge ? <span className="price-card__badge">{plan.badge}</span> : null}
                            </div>
                            <span className="price-card__label">{pricing.afterTrial}</span>
                            <div className="price-card__price"><strong>{plan.price}</strong><span>{plan.unit}</span></div>
                            <ul className="check-list">
                                {plan.features.map((feature, featureIndex) => (
                                    <li key={`feature-${featureIndex}`}><Check size={16} aria-hidden="true"/>{feature}</li>
                                ))}
                            </ul>
                            <button className={`btn btn--block ${plan.highlight ? 'btn--primary' : 'btn--outline'}`}
                                    type="button" onClick={() => setSelectedPlan(plan)}>
                                {plan.cta}
                            </button>
                        </article>
                    ))}
                </div>
            </div>

            {selectedPlan ? (
                <Suspense fallback={null}>
                    <RegistrationModal
                        open
                        planCode={selectedPlan.code}
                        planName={selectedPlan.name}
                        onClose={() => setSelectedPlan(null)}
                    />
                </Suspense>
            ) : null}
        </section>
    );
}
