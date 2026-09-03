import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Drawer } from 'antd'
import { PAYMENT_METHOD_LABELS } from '@store/store-shared/core'
import type { Customer, PaymentMethod, SaleListItem } from '@store/store-stub'
import { useSaleMutation } from '../../sale/hooks/useSaleMutation'
import { useSalesList } from '../../sale/hooks/useSalesList'
import { useCustomerDetail } from '../hooks/useCustomerDetail'
import { CustomerDetailView, type DebtPaymentFormValues } from './view/CustomerDetailView'

interface CustomerDetailDrawerProps {
  t: (key: string) => string
  customer: Customer | null
  onClose: () => void
}

const DEBT_PAYMENT_METHODS: PaymentMethod[] = ['CASH_UZS', 'CARD', 'TRANSFER']

export function CustomerDetailDrawer({ t, customer, onClose }: CustomerDetailDrawerProps) {
  //
  const { data: detail, isLoading } = useCustomerDetail(customer?.id ?? null)
  const debtSales = useSalesList(customer ? { customerId: customer.id, hasDebt: true, limit: 100 } : undefined, {
    enabled: Boolean(customer),
  })
  const { addPayment } = useSaleMutation(t)
  const [payingSaleId, setPayingSaleId] = useState<string | null>(null)
  const { control, reset, watch, handleSubmit } = useForm<DebtPaymentFormValues>({
    defaultValues: { amount: 0, method: 'CASH_UZS' },
  })
  const payAmount = watch('amount') ?? 0
  const paymentOptions = useMemo(
    () => DEBT_PAYMENT_METHODS.map((method) => ({ value: method, label: t(`payment.${method}`) || PAYMENT_METHOD_LABELS[method] })),
    [t],
  )
  const currentBalance = detail?.balance ?? customer?.balance ?? 0
  const balanceTone = currentBalance > 0 ? 'danger' : currentBalance < 0 ? 'success' : 'muted'
  const balanceLabel =
    currentBalance > 0
      ? t('customers.balanceDebt')
      : currentBalance < 0
        ? t('customers.drawerBalanceCreditFull')
        : t('customers.drawerBalanceSettled')
  const unpaidSales = (debtSales.data ?? []).filter((sale) => sale.debtAmountUzs > 0)

  useEffect(() => {
    //
    setPayingSaleId(null)
    reset({ amount: 0, method: 'CASH_UZS' })
  }, [customer?.id, reset])

  function startPayment(sale: SaleListItem) {
    //
    setPayingSaleId(sale.id)
    reset({ amount: sale.debtAmountUzs, method: 'CASH_UZS' })
  }

  function cancelPayment() {
    //
    setPayingSaleId(null)
    reset({ amount: 0, method: 'CASH_UZS' })
  }

  function submitPayment(sale: SaleListItem, values: DebtPaymentFormValues) {
    //
    if (values.amount <= 0) return
    addPayment.mutate(
      {
        saleId: sale.id,
        payload: { amountUzs: Math.min(values.amount, sale.debtAmountUzs), paymentMethod: values.method },
      },
      { onSuccess: cancelPayment },
    )
  }

  return (
    <Drawer
      rootClassName="ant-drawer-root detail-drawer--flush"
      title={null}
      open={Boolean(customer)}
      onClose={onClose}
      width={560}
      closable={{ placement: 'end' }}
      destroyOnHidden
    >
      {customer ? (
        <CustomerDetailView
          t={t}
          customer={customer}
          detail={detail}
          detailLoading={isLoading}
          unpaidSales={unpaidSales}
          debtSalesLoading={debtSales.isLoading}
          currentBalance={currentBalance}
          balanceTone={balanceTone}
          balanceLabel={balanceLabel}
          payingSaleId={payingSaleId}
          control={control}
          paymentOptions={paymentOptions}
          payAmount={payAmount}
          paymentPending={addPayment.isPending}
          onStartPayment={startPayment}
          onCancelPayment={cancelPayment}
          onSubmitPayment={(sale) => handleSubmit((values) => submitPayment(sale, values))()}
        />
      ) : null}
    </Drawer>
  )
}
