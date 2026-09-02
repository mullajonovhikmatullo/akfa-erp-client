import { useMemo, useState } from 'react'
import { DatePicker, Select, Table } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { PAYMENT_METHOD_LABELS } from '@store/store-shared/core'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { DebtPayment, PaymentMethod } from '@store/store-stub'
import { useDebtPaymentsPage } from '../../sale/hooks/useDebtPaymentsPage'
import { usePagination } from '../../shared/hooks/usePagination'
import { useCustomersList } from '../hooks/useCustomersList'
import { createDebtPaymentColumns } from './view/debtPaymentColumns'

interface DebtPaymentsListProps {
  t: (key: string) => string
  branchId?: string | null
}

const PAYMENT_METHODS: PaymentMethod[] = ['CASH_UZS', 'CASH_USD', 'CARD', 'TRANSFER']

export function DebtPaymentsList({ t, branchId }: DebtPaymentsListProps) {
  //
  const { page, pageSize, onChange: onPageChange } = usePagination()
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('day'), dayjs().endOf('day')])
  const [customerId, setCustomerId] = useState<string>()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>()
  const payments = useDebtPaymentsPage({
    branchId: branchId ?? undefined,
    customerId,
    paymentMethod,
    from: range[0].toISOString(),
    to: range[1].toISOString(),
    page,
    pageSize,
  })
  const { data: customers = [] } = useCustomersList({ branchId: branchId ?? undefined })
  const customerOptions = useMemo(() => customers.map((customer) => ({
    value: customer.id,
    label: customer.fullName,
  })), [customers])

  const resetPage = () => onPageChange(1, pageSize)

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="debt-payment-filters">
        <DatePicker.RangePicker
          value={range}
          format="DD.MM.YYYY"
          presets={[
            { label: t('common.today'), value: [dayjs().startOf('day'), dayjs().endOf('day')] },
            { label: t('common.yesterday'), value: [dayjs().subtract(1, 'day').startOf('day'), dayjs().subtract(1, 'day').endOf('day')] },
            { label: t('analytics.last7Days'), value: [dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')] },
          ]}
          onChange={(value) => {
            if (!value?.[0] || !value[1]) return
            setRange([value[0].startOf('day'), value[1].endOf('day')])
            resetPage()
          }}
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder={t('customers.paymentsCustomerFilter')}
          value={customerId}
          options={customerOptions}
          onChange={(value) => { setCustomerId(value); resetPage() }}
        />
        <Select<PaymentMethod>
          allowClear
          placeholder={t('customers.paymentsMethodFilter')}
          value={paymentMethod}
          options={PAYMENT_METHODS.map((method) => ({ value: method, label: t(`payment.${method}`) || PAYMENT_METHOD_LABELS[method] }))}
          onChange={(value) => { setPaymentMethod(value); resetPage() }}
        />
        <div className="debt-payment-filters__total">
          {t('customers.paymentsPeriodTotal')}: <strong><MoneyDisplay amount={(payments.data?.items ?? []).reduce((sum, item) => sum + item.amountUzs + item.amountUsd * (item.usdToUzsRate ?? 0), 0)} currency="UZS" /></strong>
        </div>
      </div>
      <Table<DebtPayment>
        rowKey="id"
        size="small"
        loading={payments.isLoading || payments.isFetching}
        dataSource={payments.data?.items ?? []}
        scroll={{ x: 950 }}
        locale={{ emptyText: t('customers.paymentsEmpty') }}
        pagination={{
          current: page,
          pageSize,
          total: payments.data?.total ?? 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '25', '50'],
          showTotal: (total) => `${total} ${t('common.countSuffix')}`,
          onChange: onPageChange,
        }}
        columns={createDebtPaymentColumns(t)}
      />
    </div>
  )
}
