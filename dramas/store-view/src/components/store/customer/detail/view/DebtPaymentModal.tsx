import type { StoreTranslator } from '@store/store-i18n'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Form, InputNumber, Modal, Select } from 'antd'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { PaymentMethod, SaleListItem } from '@store/store-stub'
import { saleNumber } from './customerSalesColumns'

export interface DebtPaymentValues {
  amount: number
  method: PaymentMethod
}

const DEBT_PAYMENT_METHODS: PaymentMethod[] = ['CASH_UZS', 'CARD', 'TRANSFER']

interface DebtPaymentModalProps {
  t: StoreTranslator
  sale: SaleListItem | null
  pending: boolean
  onCancel: () => void
  onSubmit: (sale: SaleListItem, values: DebtPaymentValues) => void
}

export function DebtPaymentModal({ t, sale, pending, onCancel, onSubmit }: DebtPaymentModalProps) {
  //
  const { control, handleSubmit, reset, watch } = useForm<DebtPaymentValues>({
    defaultValues: { amount: 0, method: 'CASH_UZS' },
  })
  const amount = watch('amount') ?? 0

  useEffect(() => {
    //
    if (sale) reset({ amount: sale.debtAmountUzs, method: 'CASH_UZS' })
  }, [reset, sale])

  return (
    <Modal
      open={Boolean(sale)}
      title={sale ? t('customerDetail.payTitle', { sale: saleNumber(sale.id) }) : null}
      okText={t('sales.drawerAccept')}
      cancelText={t('sales.drawerCancelShort')}
      okButtonProps={{ loading: pending, disabled: amount <= 0 }}
      onCancel={onCancel}
      onOk={handleSubmit((values) => sale && onSubmit(sale, values))}
      destroyOnHidden
    >
      {sale ? (
        <Form layout="vertical" component="div" className="u-mt-4">
          <div className="customer-info-line u-mb-12">
            <span>{t('customerDetail.remainingDebt')}</span>
            <strong className="num u-text-danger"><MoneyDisplay amount={sale.debtAmountUzs} currency="UZS" /></strong>
          </div>
          <Form.Item label={t('sales.drawerAmountLabel')}>
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <InputNumber<number>
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 0)}
                  className="u-w-full"
                  min={1}
                  max={sale.debtAmountUzs}
                  step={10000}
                  formatter={(value) => `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={(value) => Number(value?.replace(/\s/g, '') || 0)}
                />
              )}
            />
          </Form.Item>
          <Form.Item label={t('sales.drawerMethodLabel')}>
            <Controller
              name="method"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  className="u-w-full"
                  options={DEBT_PAYMENT_METHODS.map((method) => ({ value: method, label: t(`payment.${method}`) }))}
                />
              )}
            />
          </Form.Item>
        </Form>
      ) : null}
    </Modal>
  )
}
