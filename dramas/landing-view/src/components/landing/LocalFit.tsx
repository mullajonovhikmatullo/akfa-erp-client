import {Coins, FileSpreadsheet, Landmark, Languages, MonitorSmartphone, MoonStar} from 'lucide-react';

import {useI18n} from '../../i18n/I18nProvider';
import {SectionHeading} from './SectionHeading';

const icons = [Languages, Coins, Landmark, MoonStar, MonitorSmartphone, FileSpreadsheet];

export function LocalFit() {
    //
    const {t} = useI18n();
    const local = t.local;

    return (
        <section className="section section--tint" aria-labelledby="local-heading">
            <div className="container">
                <SectionHeading id="local-heading" kicker={local.kicker} heading={local.heading}/>
                <ul className="tiles">
                    {local.items.map((item, index) => {
                        //
                        const Icon = icons[index] ?? Languages;
                        return (
                            <li className="tile" key={item.title} data-reveal="up">
                                <span className="feature-icon feature-icon--blue" aria-hidden="true"><Icon size={18}/></span>
                                <div><h3>{item.title}</h3><p>{item.text}</p></div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
