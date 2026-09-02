import type { ReactNode } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import type { TranslationDictionary } from '../../i18n/types';
import { Logo } from './Logo';

type DashboardCopy = TranslationDictionary['dashboard'];
type GroupKey = keyof DashboardCopy['groups'];
type MenuKey = keyof DashboardCopy['menu'];

const sidebarGroups: ReadonlyArray<{
  title: GroupKey;
  items: ReadonlyArray<{ label: MenuKey; icon: string; active?: boolean }>;
}> = [
  { title: 'main', items: [{ label: 'dashboard', icon: 'dashboard2', active: true }] },
  { title: 'sales', items: [{ label: 'sales', icon: 'payments' }, { label: 'customers', icon: 'users' }] },
  { title: 'warehouse', items: [{ label: 'categories', icon: 'category' }, { label: 'products', icon: 'unit' }, { label: 'transfers', icon: 'transfer' }] },
  { title: 'finance', items: [{ label: 'expenses', icon: 'payments' }, { label: 'reports', icon: 'file' }] },
  { title: 'analysis', items: [{ label: 'analytics', icon: 'chart-bar' }] },
  { title: 'management', items: [{ label: 'branches', icon: 'building-02' }, { label: 'administrators', icon: 'users' }] },
];

const metricData = [
  { value: '92.8', tone: 'blue' },
  { value: '67.7', tone: 'green' },
  { value: '25.1', tone: 'red' },
  { value: '28.5', tone: 'orange' },
] as const;

const branchData = [
  { value: '67.7', color: '#3f6ee8', percentage: 72 },
  { value: '25.1', color: '#8b6de3', percentage: 17 },
  { value: '7.4', color: '#61b983', percentage: 8 },
  { value: '3.1', color: '#ef9a4d', percentage: 3 },
] as const;

const chartDays = ['14', '16', '18', '20', '22', '24', '26'] as const;

export function DashboardMock() {
  //
  const { t } = useI18n();
  const dashboard = t.dashboard;

  return (
    <figure className="dashboard-window" aria-label={dashboard.previewLabel}>
      <div className="dashboard-window__chrome">
        <div className="dashboard-window__dots" aria-hidden="true"><span /><span /><span /></div>
        <Logo markSize={18} />
        <div className="dashboard-window__chrome-meta">
          <span className="dashboard-window__period">{dashboard.period}</span>
          <i className="icons-bell-ring icon-size-13" aria-hidden="true" />
          <span>{dashboard.language}</span>
          <i className="icons-arrow-down icon-size-11" aria-hidden="true" />
        </div>
      </div>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          {sidebarGroups.map((group) => (
            <DashboardNavGroup title={dashboard.groups[group.title]} key={group.title}>
              {group.items.map((item) => {
                //
                return (
                  <DashboardNavItem
                    icon={<i className={`icons-${item.icon}`} />}
                    label={dashboard.menu[item.label]}
                    active={item.active}
                    key={item.label}
                  />
                );
              })}
            </DashboardNavGroup>
          ))}
          <div className="dashboard-sidebar__settings">
            <DashboardNavItem icon={<i className="icons-settings" />} label={dashboard.menu.settings} />
          </div>
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-main__topbar">
            <div><span>Mavion</span><strong>{dashboard.breadcrumb}</strong></div>
            <div className="dashboard-main__branch">
              <i className="icons-building icon-size-13" aria-hidden="true" />
              {dashboard.branch}
              <i className="icons-arrow-down icon-size-11" aria-hidden="true" />
              <i className="icons-user-circle icon-size-18" aria-hidden="true" />
              <strong>{dashboard.admin}</strong>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="dashboard-heading">
              <div><h3>{dashboard.heading}</h3><p>{dashboard.welcome}</p></div>
              <div className="dashboard-heading__actions">
                <button type="button"><i className="icons-plus icon-size-11" />{dashboard.actions.newSale}</button>
                <button type="button"><i className="icons-print icon-size-11" />{dashboard.actions.export}</button>
                <button type="button"><i className="icons-reload icon-size-11" />{dashboard.actions.refresh}</button>
                <button className="is-primary" type="button"><i className="icons-chart-bar icon-size-11" />{dashboard.actions.analysis}</button>
              </div>
            </div>

            <div className="dashboard-trial">
              <div><strong>{dashboard.reviewPeriod}</strong><span>14.07.2026 – 26.07.2026</span></div>
              <div><i className="icons-calendar-days icon-size-12" /><span>14.07.2026</span><i /><span>26.07.2026</span></div>
            </div>

            <div className="dashboard-metrics">
              {metricData.map((metric, index) => (
                <div className={`dashboard-metric dashboard-metric--${metric.tone}`} key={metric.tone}>
                  <div><span>{dashboard.metrics[index]}</span><MetricIcon tone={metric.tone} /></div>
                  <strong>{metric.value} <small>{dashboard.currency}</small></strong>
                  <p>{metric.tone === 'red' ? dashboard.unpaidSales : dashboard.comparison}</p>
                </div>
              ))}
            </div>

            <div className="dashboard-analytics">
              <div className="dashboard-chart-card">
                <div className="dashboard-card-title"><strong>{dashboard.chartTitle}</strong><span>14.07.2026 – 26.07.2026</span></div>
                <div className="dashboard-line-chart">
                  <span className="dashboard-line-chart__axis">60.0 {dashboard.currency}</span>
                  <span className="dashboard-line-chart__axis">45.0 {dashboard.currency}</span>
                  <span className="dashboard-line-chart__axis">30.0 {dashboard.currency}</span>
                  <span className="dashboard-line-chart__axis">15.0 {dashboard.currency}</span>
                  <svg viewBox="0 0 420 172" role="img" aria-label={dashboard.chartLabel}>
                    <g className="chart-grid"><path d="M20 22H410M20 60H410M20 98H410M20 136H410" /><path d="M75 14V145M130 14V145M185 14V145M240 14V145M295 14V145M350 14V145" /></g>
                    <path className="chart-line chart-line--blue" d="M20 140 C55 137 65 124 84 124 S118 137 140 130 S177 118 198 112 S229 26 249 26 S275 139 303 131 S335 116 355 112 S389 121 410 105" />
                    <path className="chart-line chart-line--orange" d="M20 141 C57 139 70 118 91 113 S125 137 150 133 S184 121 207 123 S238 104 260 112 S292 134 315 128 S348 107 370 117 S392 129 410 121" />
                    <path className="chart-line chart-line--red" d="M20 143 C61 142 75 134 96 135 S130 142 151 139 S189 128 212 131 S245 119 267 126 S302 139 324 136 S360 125 382 130 S400 137 410 133" />
                  </svg>
                  <div className="dashboard-line-chart__labels">{chartDays.map((day) => <span key={day}>{day}</span>)}</div>
                </div>
              </div>

              <div className="dashboard-share-card">
                <div className="dashboard-card-title"><strong>{dashboard.shareTitle}</strong><span>14.07.2026</span></div>
                <div className="dashboard-share-card__body">
                  <div className="dashboard-donut"><div><span>{dashboard.total}</span><strong>92.8 {dashboard.currency}</strong></div></div>
                  <ul>
                    {branchData.map((branch, index) => (
                      <li key={branch.color}>
                        <span className={`dashboard-branch-color dashboard-branch-color--${index}`} />
                        <div><strong>{dashboard.branches[index]}</strong><small>{branch.value} {dashboard.currency}</small></div>
                        <b>{branch.percentage}%</b>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="dashboard-summary-row">
              <div><span>{dashboard.summary[0]}</span><strong>2.5 {dashboard.currency}</strong></div>
              <div><span>{dashboard.summary[1]}</span><strong className="is-success">0.0 {dashboard.currency}</strong></div>
              <div><span>{dashboard.summary[2]}</span><strong className="is-danger">29</strong></div>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}

function DashboardNavGroup({ title, children }: { title: string; children: ReactNode }) {
  //
  return <div className="dashboard-nav-group"><span>{title}</span>{children}</div>;
}

function DashboardNavItem({ icon, label, active = false }: { icon: ReactNode; label: string; active?: boolean }) {
  //
  return <div className={`dashboard-nav-item${active ? ' is-active' : ''}`}>{icon}<strong>{label}</strong></div>;
}

function MetricIcon({ tone }: { tone: string }) {
  //
  if (tone === 'blue') return <i className="icons-payments icon-size-13" />;
  if (tone === 'green') return <i className="icons-payments icon-size-13" />;
  if (tone === 'red') return <i className="icons-unit icon-size-13" />;
  return <i className="icons-assignment icon-size-13" />;
}
