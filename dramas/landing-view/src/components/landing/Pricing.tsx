import {useEffect, useMemo, useState} from 'react';

import {LandingSeekApi, type PublicPlan, type PublicPlanCode} from '@store/landing-stub';
import {useI18n} from '../../i18n/I18nProvider';
import {formatMessage} from '../../i18n/translations';
import type {TranslationDictionary} from '../../i18n/types';
import {RegistrationModal} from './RegistrationModal';

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

const pricingSkeletonKeys = ['one', 'two', 'three'] as const;

function PricingSkeleton() {
    //
    return (
        <>
            {pricingSkeletonKeys.map((key) => (
                <article className="pricing-card pricing-card--skeleton" key={key} aria-hidden="true">
                    <span className="pricing-skeleton__line pricing-skeleton__line--title"/>
                    <span className="pricing-skeleton__line pricing-skeleton__line--label"/>
                    <span className="pricing-skeleton__line pricing-skeleton__line--price"/>
                    <ul className="pricing-skeleton__features">
                        <li><span className="pricing-skeleton__line"/></li>
                        <li><span className="pricing-skeleton__line"/></li>
                        <li><span className="pricing-skeleton__line"/></li>
                        <li><span className="pricing-skeleton__line pricing-skeleton__line--short"/></li>
                    </ul>
                    <span className="pricing-skeleton__button"/>
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
        <section className="pricing-section" id="tariflar">
            <div className="container-page">
                <div className="section-heading section-heading--center" data-reveal="up">
                    <div className="section-kicker">{pricing.kicker}</div>
                    <h2>{pricing.heading}</h2>
                    <p>{pricing.note}</p>
                </div>

                <div className="pricing-grid" data-reveal-group aria-busy={loadState === 'loading'}>
                    {loadState === 'loading' ? <PricingSkeleton/> : loadState === 'error' ? (
                        <p className="pricing-empty-state" role="alert">{pricing.loadError}</p>
                    ) : plans.length === 0 ? (
                        <p className="pricing-empty-state">{pricing.empty}</p>
                    ) : plans.map((plan) => (
                        <article
                            className={`pricing-card${plan.highlight ? ' pricing-card--featured' : ''} is-revealed`}
                            key={plan.code}
                            data-reveal="up"
                        >
                            {plan.badge ? <span className="pricing-card__badge">{plan.badge}</span> : null}
                            <h3>{plan.name}</h3>
                            <span className="pricing-card__price-label">{pricing.afterTrial}</span>
                            <div className="pricing-card__price"><strong>{plan.price}</strong><span>{plan.unit}</span>
                            </div>
                            <ul>
                                {plan.features.map((feature, featureIndex) => <li key={`feature-${featureIndex}`}><i
                                    className="icons-check icon-size-14"/>{feature}</li>)}
                            </ul>
                            <button className={`button ${plan.highlight ? 'button--primary' : 'button--ghost'}`}
                                    type="button" onClick={() => setSelectedPlan(plan)}>
                                {plan.cta}
                            </button>
                        </article>
                    ))}
                </div>
            </div>

            {selectedPlan ? (
                <RegistrationModal
                    open
                    planCode={selectedPlan.code}
                    planName={selectedPlan.name}
                    onClose={() => setSelectedPlan(null)}
                />
            ) : null}
        </section>
    );
}
