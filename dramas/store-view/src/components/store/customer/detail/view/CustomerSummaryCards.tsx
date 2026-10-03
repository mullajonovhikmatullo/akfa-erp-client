import type { StoreTranslator } from '@store/store-i18n'
import { Skeleton } from 'antd'
import { formatUZS } from '@store/store-shared/lib/formatters'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { CustomerSummary } from '@store/store-stub'
import { CustomerKpiBox } from '../../list/view/CustomerKpiBox'

interface CustomerSummaryCardsProps {
  t: StoreTranslator
  summary?: CustomerSummary
  loading: boolean
}

export function CustomerSummaryCards({ t, summary, loading }: CustomerSummaryCardsProps) {
  //
  if (loading || !summary) {
    return (
      <div className="u-grid u-gap-12 u-grid-cols-fit-220 u-mb-16">
        {[0, 1, 2, 3].map((key) => <div key={key} className="card u-p-14-16"><Skeleton active paragraph={{ rows: 1 }} /></div>)}
      </div>
    )
  }

  const balanceLabel =
    summary.balance > 0
      ? t('customers.balanceDebt')
      : summary.balance < 0
        ? t('customers.drawerBalanceCreditFull')
        : t('customers.drawerBalanceSettled')
  const scopeLabel = t(summary.balanceScope === 'branch' ? 'customerDetail.scopeBranch' : 'customerDetail.scopeStore')

  return (
    <div className="u-grid u-gap-12 u-grid-cols-fit-220 u-mb-16">
      <CustomerKpiBox
        label={t('customerDetail.kpiBalance')}
        value={<MoneyDisplay amount={Math.abs(summary.balance)} currency="UZS" />}
        hint={`${balanceLabel} · ${scopeLabel}`}
        tone={summary.balance > 0 ? 'danger' : summary.balance < 0 ? 'success' : 'muted'}
      />
      <CustomerKpiBox
        label={t('customerDetail.kpiPurchases')}
        value={<MoneyDisplay amount={summary.totalAmountUzs} currency="UZS" />}
        hint={t('customerDetail.purchasesHint', { count: summary.salesCount, average: formatUZS(summary.averageSaleUzs) })}
        tone="muted"
      />
      <CustomerKpiBox
        label={t('customerDetail.kpiPaid')}
        value={<MoneyDisplay amount={summary.paidAmountUzs} currency="UZS" />}
        hint={t('customerDetail.paidHint', { amount: formatUZS(summary.debtPaymentsUzs), count: summary.debtPaymentCount })}
        tone="success"
      />
      <CustomerKpiBox
        label={t('customerDetail.kpiOverdue')}
        value={<MoneyDisplay amount={summary.overdueDebtUzs} currency="UZS" />}
        hint={t('customerDetail.overdueHint', { overdue: summary.overdueCount, open: summary.openDebtCount })}
        tone={summary.overdueDebtUzs > 0 ? 'danger' : 'muted'}
      />
    </div>
  )
}
