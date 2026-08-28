import { useMemo, useState } from 'react'
import { DatePicker, Select, Table } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { PAYMENT_METHOD_LABELS } from '@store/store-shared/core'
import { formatDateTime } from '@store/store-shared/lib/formatters'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { DebtPayment, PaymentMethod } from '@store/store-stub'
import { useDebtPayments } from '../../sale/hooks/useSales'
import { useCustomers } from '../hooks/useCustomers'

interface DebtPaymentsListProps {
  t: (key: string) => string
  branchId?: string | null
}

const PAYMENT_METHODS: PaymentMethod[] = ['CASH_UZS', 'CASH_USD', 'CARD', 'TRANSFER']

export function DebtPaymentsList({ t, branchId }: DebtPaymentsListProps) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [range, setRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf('day'), dayjs().endOf('day')])
  const [customerId, setCustomerId] = useState<string>()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>()
  const payments = useDebtPayments({
    branchId: branchId ?? undefined,
    customerId,
    paymentMethod,
    from: range[0].toISOString(),
    to: range[1].toISOString(),
    page,
    pageSize,
  })
  const { data: customers = [] } = useCustomers({ branchId: branchId ?? undefined })
  const customerOptions = useMemo(() => customers.map((customer) => ({
    value: customer.id,
    label: customer.fullName,
  })), [customers])

  const resetPage = () => setPage(1)

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
          onChange: (nextPage, nextPageSize) => { setPage(nextPage); setPageSize(nextPageSize) },
        }}
        columns={[
          { title: t('common.date'), dataIndex: 'createdAt', width: 150, render: (value: string) => formatDateTime(value) },
          { title: t('nav.customers'), key: 'customer', render: (_, payment) => (
            <div><strong>{payment.sale.customer?.fullName ?? '—'}</strong><div style={{ color: 'var(--ink-3)', fontSize: 12 }}>{payment.sale.customer?.phone ?? '—'}</div></div>
          ) },
          { title: t('common.branch'), key: 'branch', width: 150, render: (_, payment) => <StatusBadge tone="muted">{payment.sale.branch.name}</StatusBadge> },
          { title: t('customers.paymentsAmount'), key: 'amount', width: 170, align: 'right', render: (_, payment) => (
            <strong className="num"><MoneyDisplay amount={payment.amountUzs + payment.amountUsd * (payment.usdToUzsRate ?? 0)} currency="UZS" /></strong>
          ) },
          { title: t('customers.paymentsMethod'), dataIndex: 'paymentMethod', width: 160, render: (method: PaymentMethod) => t(`payment.${method}`) || PAYMENT_METHOD_LABELS[method] },
          { title: t('customers.paymentsReceivedBy'), key: 'receivedBy', width: 170, render: (_, payment) => payment.receivedBy.fullName },
          { title: t('customers.paymentsRemainingDebt'), key: 'remainingDebt', width: 170, align: 'right', render: (_, payment) => <MoneyDisplay amount={payment.sale.debtAmountUzs} currency="UZS" /> },
        ]}
      />
    </div>
  )
}
