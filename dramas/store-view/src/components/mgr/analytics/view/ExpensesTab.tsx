import { Skeleton } from 'antd'
import { formatDate } from '@store/store-shared/lib/formatters'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { ExpenseReportData } from '@store/store-stub'
import { Empty, ProgressBar, SectionTitle } from './AnalyticsShared'
import type { TFunc } from './types'

export function ExpensesTab({ data, loading, t }: { data?: ExpenseReportData; loading: boolean; t: TFunc }) {
  //
  if (loading || !data) return <Skeleton active paragraph={{ rows: 6 }} />
  const grandTotal = data.summary.total || 1
  const maxPeriodAmount = Math.max(...data.byPeriod.map((row) => row.amount), 1)

  return (
    <div className="u-items-start u-grid u-gap-12 u-grid-cols-content-280">
      <div className="card">
        <SectionTitle>{t('analytics.byPeriod')}</SectionTitle>
        {data.byPeriod.length === 0 ? <Empty t={t} /> : <div className="u-flex u-flex-col u-gap-6">{data.byPeriod.map((row, index) => <div key={index} className="u-items-center u-grid u-fs-12-5 u-gap-8 u-grid-cols-110-content-140"><span className="u-text-muted">{formatDate(String(row.period))}</span><div className="u-bg-border u-rounded-4 u-h-8 u-overflow-hidden"><div className={`progress-fill progress-fill--rounded-4 u-w-pct-${Math.round((row.amount / maxPeriodAmount) * 100)}`} /></div><span className="num u-text-right" ><MoneyDisplay amount={row.amount} currency="UZS" /></span></div>)}</div>}
      </div>
      <div className="card">
        <SectionTitle>{t('nav.categories')}</SectionTitle>
        <div className="u-flex u-flex-col u-gap-10">
          {data.byCategory.map((category) => { //
            const pct = (category.amount / grandTotal) * 100
            return <div key={category.categoryId}><div className="u-flex u-fs-12-5 u-justify-between u-mb-4"><span className="u-fw-500">{category.categoryName}</span><span className="num u-text-muted" >{pct.toFixed(0)}%</span></div><ProgressBar pct={pct} /><div className="num u-text-muted u-fs-11-5 u-mt-2" ><MoneyDisplay amount={category.amount} currency="UZS" /></div></div>
          })}
          {data.byCategory.length === 0 ? <Empty t={t} /> : null}
        </div>
        <div className="u-border-t-default u-flex u-fs-13 u-justify-between u-mt-14 u-pt-12"><span className="u-text-muted">{t('common.total')}</span><span className="num u-fw-700" ><MoneyDisplay amount={data.summary.total} currency="UZS" /></span></div>
      </div>
    </div>
  )
}
