import {Banknote, HandCoins, Receipt, Wallet} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

import {useI18n} from '../../i18n/I18nProvider';

type Kpi = { key: 'sales' | 'revenue' | 'debt' | 'expense'; value: number; tone: string; icon: LucideIcon };

const kpis: Kpi[] = [
    {key: 'sales', value: 48.6, tone: 'blue', icon: Receipt},
    {key: 'revenue', value: 41.2, tone: 'green', icon: Banknote},
    {key: 'debt', value: 7.4, tone: 'red', icon: HandCoins},
    {key: 'expense', value: 5.9, tone: 'orange', icon: Wallet},
];

const hourlySales = [1.2, 2.1, 3.4, 4.8, 4.1, 5.6, 6.9, 5.8, 6.4, 7.8, 6.2, 4.3];
const hours = ['09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
const payments = [
    {key: 'cash', share: 46, color: 'var(--chart-blue)'},
    {key: 'card', share: 31, color: 'var(--chart-green)'},
    {key: 'transfer', share: 15, color: 'var(--chart-orange)'},
    {key: 'credit', share: 8, color: 'var(--chart-red)'},
] as const;

const CHART_W = 320;
const CHART_H = 120;

function chartPath(values: number[]) {
    //
    const max = Math.max(...values) * 1.12;
    const step = CHART_W / (values.length - 1);
    const points = values.map((value, index) => [index * step, CHART_H - (value / max) * CHART_H] as const);
    const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    return {line, area: `${line} L${CHART_W} ${CHART_H} L0 ${CHART_H} Z`};
}

export function HeroDashboard() {
    //
    const {locale, t} = useI18n();
    const mock = t.mock;
    const format = (value: number) => new Intl.NumberFormat(locale, {maximumFractionDigits: 1}).format(value);
    const {line, area} = chartPath(hourlySales);
    const circumference = 2 * Math.PI * 38;
    let offset = 0;

    return (
        <figure className="dash" aria-label={mock.label}>
            <div className="dash__bar" aria-hidden="true"><i/><i/><i/></div>
            <div className="dash__body">
                <div className="dash__head">
                    <strong>{mock.title}</strong>
                    <span className="dash__chips">
                        <span className="chip">{mock.branchAll}</span>
                        <span className="chip chip--muted">{mock.period}</span>
                    </span>
                </div>

                <div className="dash__kpis">
                    {kpis.map(({key, value, tone, icon: Icon}) => (
                        <div className={`kpi kpi--${tone}`} key={key}>
                            <span className="kpi__icon" aria-hidden="true"><Icon size={14}/></span>
                            <span className="kpi__label">{mock.kpis[key]}</span>
                            <strong className="kpi__value">{format(value)} <small>{mock.millionShort} {mock.currency}</small></strong>
                        </div>
                    ))}
                </div>

                <div className="dash__charts">
                    <div className="dash-card dash-card--chart">
                        <span className="dash-card__title">{mock.chartTitle}</span>
                        <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 18}`} role="img" aria-hidden="true" className="line-chart">
                            <defs>
                                <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--chart-blue)" stopOpacity="0.28"/>
                                    <stop offset="100%" stopColor="var(--chart-blue)" stopOpacity="0"/>
                                </linearGradient>
                            </defs>
                            {[0.25, 0.5, 0.75].map((ratio) => (
                                <line key={ratio} x1="0" x2={CHART_W} y1={CHART_H * ratio} y2={CHART_H * ratio} className="line-chart__grid"/>
                            ))}
                            <path d={area} fill="url(#dash-area)"/>
                            <path d={line} className="line-chart__line" pathLength={1}/>
                            {hours.map((hour, index) => index % 2 === 0 ? (
                                <text key={hour} x={(CHART_W / (hours.length - 1)) * index} y={CHART_H + 14} className="line-chart__label">{hour}</text>
                            ) : null)}
                        </svg>
                    </div>

                    <div className="dash-card dash-card--donut">
                        <span className="dash-card__title">{mock.donutTitle}</span>
                        <div className="donut">
                            <svg viewBox="0 0 100 100" aria-hidden="true">
                                <circle cx="50" cy="50" r="38" className="donut__track"/>
                                {payments.map(({key, share, color}) => {
                                    //
                                    const length = (share / 100) * circumference;
                                    const segment = (
                                        <circle
                                            key={key}
                                            cx="50" cy="50" r="38"
                                            className="donut__segment"
                                            stroke={color}
                                            strokeDasharray={`${length - 1.5} ${circumference}`}
                                            strokeDashoffset={-offset}
                                        />
                                    );
                                    offset += length;
                                    return segment;
                                })}
                            </svg>
                            <ul className="donut__legend">
                                {payments.map(({key, share, color}) => (
                                    <li key={key}><i style={{background: color}}/>{mock.methods[key]}<b>{share}%</b></li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <figcaption className="dash__caption">{mock.sample}</figcaption>
        </figure>
    );
}
