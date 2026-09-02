import { Controller, type Control, type UseFormHandleSubmit, type UseFormSetValue } from 'react-hook-form'
import { Alert, Button, DatePicker, InputNumber, Select, Tooltip } from 'antd'
import { CheckCircleIcon, CheckIcon } from '@phosphor-icons/react'
import dayjs from 'dayjs'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { Label, Row } from './index'
import type { CartItem, SaleFormValues } from './types'
import type { PaymentMethod } from '@store/store-stub'

interface SaleSummaryViewProps {
  t: (key: string) => string
  control: Control<SaleFormValues>
  handleSubmit: UseFormHandleSubmit<SaleFormValues>
  setValue: UseFormSetValue<SaleFormValues>
  paymentOptions: { value: PaymentMethod; label: string }[]
  cart: CartItem[]
  isUsdPayment: boolean
  paidAmount: number
  paidAmountError: boolean
  onPaidAmountChange: (value: number | null) => void
  fullPaidAmount: number
  subtotal: number
  debtAmount: number
  needsCustomer: boolean
  customerId?: string
  isPending: boolean
  canSubmit: boolean
  onSubmit: (values: SaleFormValues) => void
}

export function SaleSummaryView({
  t,
  control,
  handleSubmit,
  setValue,
  paymentOptions,
  cart,
  isUsdPayment,
  paidAmount,
  paidAmountError,
  onPaidAmountChange,
  fullPaidAmount,
  subtotal,
  debtAmount,
  needsCustomer,
  customerId,
  isPending,
  canSubmit,
  onSubmit,
}: SaleSummaryViewProps) {
  //
  return (
    <div className="card" style={{ position: 'sticky', top: 76 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{t('newSale.summary')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Row label={t('newSale.rowProducts')} value={`${cart.length} ${t('newSale.typeSuffix')} · ${cart.reduce((sum, item) => sum + Math.max(item.quantity, 0), 0).toLocaleString('ru-RU')} ${t('newSale.qtySuffix')}`} />
        <Row label={t('newSale.rowTotal')} value={<span className="num" style={{ fontWeight: 700 }}><MoneyDisplay amount={subtotal} currency="UZS" /></span>} />
      </div>
      <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <Label>{t('newSale.paymentMethod')}</Label>
          <Controller name="paymentMethod" control={control} render={({ field }) => <Select value={field.value} onChange={(value) => field.onChange(value)} options={paymentOptions} style={{ width: '100%' }} />} />
        </div>
        <div>
          <Label>{isUsdPayment ? `${t('newSale.paidAmount')} (USD)` : t('newSale.paidAmount')}</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
            <Controller
              name="paidAmount"
              control={control}
              render={({ field }) => (
                <InputNumber<number>
                  value={field.value}
                  onChange={onPaidAmountChange}
                  status={paidAmountError ? 'error' : undefined}
                  style={{ width: '100%' }}
                  min={0}
                  max={fullPaidAmount}
                  step={isUsdPayment ? 1 : 10000}
                  precision={isUsdPayment ? 2 : 0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={(value) => Number(value?.replace(/\s/g, '')) as unknown as 0}
                />
              )}
            />
            <Tooltip title={t('newSale.markFullPaidTooltip')}>
              <Button icon={<CheckCircleIcon size={18} weight="duotone" />} disabled={fullPaidAmount <= 0 || paidAmount === fullPaidAmount} onClick={() => { setValue('paidAmount', fullPaidAmount, { shouldDirty: true }); onPaidAmountChange(fullPaidAmount) }}>{t('newSale.markFullPaid')}</Button>
            </Tooltip>
          </div>
          {paidAmountError ? <div role="alert" style={{ marginTop: 6, color: 'var(--danger)', fontSize: 12 }}>{t('newSale.paidAmountMaxError')}</div> : null}
        </div>
        {subtotal > 0 ? <div style={{ padding: '10px 12px', borderRadius: 8, border: `1px solid ${debtAmount > 0 ? 'var(--danger)' : 'var(--success)'}`, background: debtAmount > 0 ? 'rgba(220,38,38,.04)' : 'rgba(22,163,74,.04)' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span style={{ color: 'var(--ink-3)' }}>{t('sales.drawerDebt')}</span><span className="num" style={{ fontWeight: 700, color: debtAmount > 0 ? 'var(--danger)' : 'var(--success)' }}><MoneyDisplay amount={debtAmount} currency="UZS" /></span></div></div> : null}
        {needsCustomer ? <div><Label>{t('newSale.debtDeadlineOptional')}</Label><Controller name="debtDueDateIso" control={control} render={({ field }) => <DatePicker value={field.value ? dayjs(field.value) : null} onChange={(value) => field.onChange(value ? value.toISOString() : undefined)} style={{ width: '100%' }} format="DD.MM.YYYY" placeholder={t('newSale.debtDeadlinePlaceholder')} disabledDate={(current) => Boolean(current && current < dayjs().startOf('day'))} allowClear />} /></div> : null}
      </div>
      {needsCustomer && !customerId ? <Alert type="warning" showIcon message={t('newSale.debtNeedsCustomer')} style={{ marginTop: 12 }} /> : null}
      <Button type="primary" size="large" block icon={<CheckIcon size={18} weight="bold" />} loading={isPending} disabled={!canSubmit} style={{ marginTop: 16 }} onClick={handleSubmit(onSubmit)}>{t('newSale.confirmSale')}</Button>
    </div>
  )
}
