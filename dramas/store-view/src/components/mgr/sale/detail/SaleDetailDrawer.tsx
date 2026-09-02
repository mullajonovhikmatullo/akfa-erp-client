import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Drawer } from 'antd'
import { PAYMENT_METHOD_LABELS } from '@store/store-shared/core'
import type { PaymentMethod, SaleListItem } from '@store/store-stub'
import { useSaleDetail } from '../hooks/useSaleDetail'
import { useSaleMutation } from '../hooks/useSaleMutation'
import { SaleDetailView, type PaymentFormValues } from './view/SaleDetailView'

interface SaleDetailDrawerProps {
  t: (key: string) => string
  sale: SaleListItem | null
  onClose: () => void
}

export function SaleDetailDrawer({ t, sale, onClose }: SaleDetailDrawerProps) {
  //
  const { data: detail, isLoading } = useSaleDetail(sale?.id ?? null)
  const { addPayment } = useSaleMutation(t)
  const [showPayForm, setShowPayForm] = useState(false)
  const { control, handleSubmit, reset, watch } = useForm<PaymentFormValues>({
    defaultValues: { amount: 0, method: 'CASH_UZS' },
  })
  const payAmount = watch('amount') ?? 0
  const paymentOptions = useMemo(
    () =>
      (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[])
        .filter((method) => method !== 'MIXED')
        .map((method) => ({ value: method, label: t(`payment.${method}`) || PAYMENT_METHOD_LABELS[method] })),
    [t],
  )

  useEffect(() => {
    //
    setShowPayForm(false)
    reset({ amount: 0, method: 'CASH_UZS' })
  }, [reset, sale?.id])

  function openPayForm() {
    //
    reset({ amount: 0, method: 'CASH_UZS' })
    setShowPayForm(true)
  }

  function cancelPayment() {
    //
    setShowPayForm(false)
    reset({ amount: 0, method: 'CASH_UZS' })
  }

  function submitPayment(values: PaymentFormValues) {
    //
    if (!sale || values.amount <= 0) return
    addPayment.mutate(
      { saleId: sale.id, payload: { amountUzs: values.amount, paymentMethod: values.method } },
      { onSuccess: cancelPayment },
    )
  }

  return (
    <Drawer
      rootClassName="ant-drawer-root"
      title={null}
      open={Boolean(sale)}
      onClose={onClose}
      width={520}
      closable={{ placement: 'end' }}
      styles={{ body: { padding: 0 } }}
      destroyOnHidden
    >
      {sale ? (
        <SaleDetailView
          t={t}
          sale={sale}
          detail={detail}
          loading={isLoading}
          showPayForm={showPayForm}
          control={control}
          paymentOptions={paymentOptions}
          payAmount={payAmount}
          paymentPending={addPayment.isPending}
          onOpenPayForm={openPayForm}
          onCancelPayment={cancelPayment}
          onSubmitPayment={handleSubmit(submitPayment)}
        />
      ) : null}
    </Drawer>
  )
}
