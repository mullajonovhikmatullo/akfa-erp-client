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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, alignItems: 'flex-start' }}>
      <div className="card">
        <SectionTitle>{t('analytics.byPeriod')}</SectionTitle>
        {data.byPeriod.length === 0 ? <Empty t={t} /> : <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{data.byPeriod.map((row, index) => <div key={index} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 140px', gap: 8, alignItems: 'center', fontSize: 12.5 }}><span style={{ color: 'var(--ink-3)' }}>{formatDate(String(row.period))}</span><div style={{ height: 8, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}><div style={{ width: `${(row.amount / maxPeriodAmount) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }} /></div><span className="num" style={{ textAlign: 'right' }}><MoneyDisplay amount={row.amount} currency="UZS" /></span></div>)}</div>}
      </div>
      <div className="card">
        <SectionTitle>{t('nav.categories')}</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.byCategory.map((category) => { //
            const pct = (category.amount / grandTotal) * 100
            return <div key={category.categoryId}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}><span style={{ fontWeight: 500 }}>{category.categoryName}</span><span className="num" style={{ color: 'var(--ink-3)' }}>{pct.toFixed(0)}%</span></div><ProgressBar pct={pct} /><div className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}><MoneyDisplay amount={category.amount} currency="UZS" /></div></div>
          })}
          {data.byCategory.length === 0 ? <Empty t={t} /> : null}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 14, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--ink-3)' }}>{t('common.total')}</span><span className="num" style={{ fontWeight: 700 }}><MoneyDisplay amount={data.summary.total} currency="UZS" /></span></div>
      </div>
    </div>
  )
}
