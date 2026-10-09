import {useRef, useState} from 'react';
import type {KeyboardEvent} from 'react';
import {Check} from 'lucide-react';

import {useI18n} from '../../i18n/I18nProvider';
import {AnalyticsMock, FinanceMock, SalesMock, WarehouseMock} from './ModuleMocks';
import {SectionHeading} from './SectionHeading';

const tabKeys = ['sales', 'warehouse', 'finance', 'analytics'] as const;
type TabKey = (typeof tabKeys)[number];

export function ModuleTour() {
    //
    const {t} = useI18n();
    const modules = t.modules;
    const [active, setActive] = useState<TabKey>('sales');
    const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const tab = modules.tabs[active];

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        //
        const index = tabKeys.indexOf(active);
        const offsets: Record<string, number> = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1};
        let next = index;
        if (event.key in offsets) next = (index + offsets[event.key]! + tabKeys.length) % tabKeys.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabKeys.length - 1;
        else return;
        event.preventDefault();
        setActive(tabKeys[next]!);
        tabRefs.current[next]?.focus();
    }

    return (
        <section className="section" id="modullar" aria-labelledby="modules-heading">
            <div className="container">
                <SectionHeading id="modules-heading" kicker={modules.kicker} heading={modules.heading} supporting={modules.supporting}/>
                <div className="tour" data-reveal="up">
                    <div className="tour__tabs" role="tablist" aria-label={modules.tabsLabel} onKeyDown={handleKeyDown}>
                        {tabKeys.map((key, index) => (
                            <button
                                key={key}
                                ref={(node) => { tabRefs.current[index] = node; }}
                                id={`tab-${key}`}
                                className="tour__tab"
                                type="button"
                                role="tab"
                                aria-selected={active === key}
                                aria-controls={`panel-${key}`}
                                tabIndex={active === key ? 0 : -1}
                                onClick={() => setActive(key)}
                            >
                                {modules.tabs[key].label}
                            </button>
                        ))}
                    </div>
                    <div className="tour__panel" id={`panel-${active}`} role="tabpanel" aria-labelledby={`tab-${active}`} key={active}>
                        <div className="tour__copy">
                            <h3>{tab.title}</h3>
                            <p>{tab.text}</p>
                            <ul className="check-list">
                                {tab.points.map((point) => <li key={point}><Check size={16} aria-hidden="true"/>{point}</li>)}
                            </ul>
                        </div>
                        <div className="tour__visual">
                            {active === 'sales' ? <SalesMock copy={modules.salesMock}/> : null}
                            {active === 'warehouse' ? <WarehouseMock copy={modules.warehouseMock}/> : null}
                            {active === 'finance' ? <FinanceMock copy={modules.financeMock}/> : null}
                            {active === 'analytics' ? <AnalyticsMock copy={modules.analyticsMock}/> : null}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
