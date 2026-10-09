import {ArrowRight, Search, TriangleAlert} from 'lucide-react';

import type {TranslationDictionary} from '../../i18n/types';

type Modules = TranslationDictionary['modules'];

export function SalesMock({copy}: { copy: Modules['salesMock'] }) {
    //
    return (
        <div className="mini" aria-hidden="true">
            <div className="mini__row mini__row--between">
                <span className="segmented"><b>{copy.retail}</b><span>{copy.wholesale}</span></span>
                <span className="chip">{copy.customer}: {copy.customerName}</span>
            </div>
            <div className="mini__search"><Search size={14}/>{copy.search}</div>
            <ul className="mini__list">
                {copy.items.map((item) => (
                    <li key={item.name}><span>{item.name}</span><span className="mini__muted">{item.qty}</span><b>{item.price}</b></li>
                ))}
            </ul>
            <div className="mini__summary">
                <span>{copy.total}</span><b>136 312</b>
                <span>{copy.paid}</span><b className="tone-green">100 000</b>
                <span>{copy.debt}</span><b className="tone-red">36 312</b>
            </div>
            <div className="mini__chips">
                {copy.methods.map((method, index) => (
                    <span className={`chip${index === copy.methods.length - 1 ? ' chip--active' : ''}`} key={method}>{method}</span>
                ))}
            </div>
        </div>
    );
}

export function WarehouseMock({copy}: { copy: Modules['warehouseMock'] }) {
    //
    return (
        <div className="mini" aria-hidden="true">
            <span className="mini__title">{copy.title}</span>
            <ul className="mini__table">
                <li className="mini__table-head"><span>{copy.product}</span><span>{copy.stock}</span></li>
                {copy.rows.map((row) => (
                    <li key={row.name}>
                        <span>{row.name}</span>
                        <span className={row.low ? 'tone-orange' : undefined}>
                            {row.low ? <TriangleAlert size={13}/> : null}{row.stock}{row.low ? ` · ${copy.low}` : ''}
                        </span>
                    </li>
                ))}
            </ul>
            <div className="mini__transfer">
                <span className="mini__muted">{copy.transfer}</span>
                <b>{copy.transferRoute}</b>
                <span className="status status--pending">{copy.pending}</span>
                <ArrowRight size={14}/>
                <span className="status status--done">{copy.confirmed}</span>
            </div>
        </div>
    );
}

export function FinanceMock({copy}: { copy: Modules['financeMock'] }) {
    //
    return (
        <div className="mini" aria-hidden="true">
            <span className="mini__title">{copy.title}</span>
            <ul className="mini__list">
                {copy.rows.map((row) => <li key={row.category}><span>{row.category}</span><b className="tone-orange">{row.amount}</b></li>)}
            </ul>
            <div className="profit">
                <div><span className="mini__muted">{copy.paid}</span><b className="tone-green">41 200 000</b></div>
                <span className="profit__op">−</span>
                <div><span className="mini__muted">{copy.expenses}</span><b className="tone-orange">16 700 000</b></div>
                <span className="profit__op">=</span>
                <div><span className="mini__muted">{copy.netProfit}</span><b className="tone-blue">24 500 000</b></div>
            </div>
        </div>
    );
}

const topShares = [100, 78, 61, 44];

export function AnalyticsMock({copy}: { copy: Modules['analyticsMock'] }) {
    //
    return (
        <div className="mini mini--split" aria-hidden="true">
            <div>
                <span className="mini__title">{copy.topTitle}</span>
                <ul className="bars">
                    {copy.top.map((name, index) => (
                        <li key={name}><span>{name}</span><i style={{width: `${topShares[index] ?? 30}%`}}/></li>
                    ))}
                </ul>
            </div>
            <div>
                <span className="mini__title">{copy.debtorsTitle}</span>
                <ul className="mini__list">
                    {copy.debtors.map((debtor) => <li key={debtor.name}><span>{debtor.name}</span><b className="tone-red">{debtor.amount}</b></li>)}
                </ul>
                <div className="mini__stat"><span className="mini__muted">{copy.avgCheck}</span><b>86 400</b></div>
            </div>
        </div>
    );
}
