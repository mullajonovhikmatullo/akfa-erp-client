import { Table } from 'antd'
import type { TenantPayment } from '@store/store-stub'
import { createBillingPaymentColumns } from './billingPaymentColumns'
import type { BillingTranslate } from './types'

interface BillingHistoryProps {
  payments: TenantPayment[]
  loading: boolean
  openingReceiptId: string | null
  t: BillingTranslate
  onOpenReceipt: (payment: TenantPayment) => void
}

export function BillingHistory({
  payments,
  loading,
  openingReceiptId,
  t,
  onOpenReceipt,
}: BillingHistoryProps) {
  //
  const columns = createBillingPaymentColumns({ t, openingReceiptId, onOpenReceipt })

  return (
    <div className="billing-panel">
      <div className="billing-panel__header">
        <div>
          <h2>{t('billing.history')}</h2>
          <span>{t('billing.historyDescription')}</span>
        </div>
      </div>
      <Table<TenantPayment>
        rowKey="id"
        className="billing-payments-table"
        size="middle"
        loading={loading}
        dataSource={payments}
        locale={{ emptyText: t('common.noData') }}
        scroll={{ x: 1020 }}
        pagination={false}
        columns={columns}
      />
    </div>
  )
}
