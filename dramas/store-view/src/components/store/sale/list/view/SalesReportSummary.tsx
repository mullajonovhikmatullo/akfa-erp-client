import type { StoreTranslator } from '@store/store-i18n'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { SaleReportSummary } from '@store/store-stub'

interface SalesReportSummaryProps {
  t: StoreTranslator
  summary: SaleReportSummary
}

export function SalesReportSummary({ t, summary }: SalesReportSummaryProps) {
  //
  const stats = [
    { label: t('sales.reportRevenue'), amount: summary.totalUzs, tone: '' },
    { label: t('sales.reportReceived'), amount: summary.receivedUzs, tone: 'u-text-success' },
    { label: t('sales.reportOnDebt'), amount: summary.debtUzs, tone: summary.debtUzs > 0 ? 'u-text-danger' : '' },
    { label: t('sales.drawerDiscount'), amount: summary.discountUzs, tone: '' },
  ]

  return (
    <div className="sales-report-summary">
      {stats.map((stat) => (
        <div key={stat.label} className="sales-report-summary__item">
          <span className="u-text-muted u-fs-12">{stat.label}</span>
          <span className={`num u-fw-700 ${stat.tone}`}>
            <MoneyDisplay amount={stat.amount} currency="UZS" />
          </span>
        </div>
      ))}
    </div>
  )
}
