import {ArrowLeftRight, Boxes, ChartColumn, Coins, ShieldCheck, ShoppingCart, Users, Wallet} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

import {useI18n} from '../../i18n/I18nProvider';
import {SectionHeading} from './SectionHeading';

const icons: LucideIcon[] = [ShoppingCart, Users, Boxes, ArrowLeftRight, Wallet, ChartColumn, ShieldCheck, Coins];
const tones = ['blue', 'red', 'green', 'blue', 'orange', 'blue', 'green', 'orange'];

export function FeatureBento() {
    //
    const {t} = useI18n();
    const features = t.features;

    return (
        <section className="section section--tint" id="imkoniyatlar" aria-labelledby="features-heading">
            <div className="container">
                <SectionHeading id="features-heading" kicker={features.kicker} heading={features.heading} supporting={features.supporting}/>
                <ul className="bento">
                    {features.items.map((item, index) => {
                        //
                        const Icon = icons[index] ?? ShoppingCart;
                        return (
                            <li className={`bento__card bento__card--${index < 2 || index > 5 ? 'wide' : 'base'}`} key={item.title} data-reveal="up">
                                <span className={`feature-icon feature-icon--${tones[index]}`} aria-hidden="true"><Icon size={20}/></span>
                                <h3>{item.title}</h3>
                                <p>{item.text}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
