import { Controller, type Control, type UseFormHandleSubmit, type UseFormSetValue } from 'react-hook-form'
import { Alert, Button, DatePicker, InputNumber, Select, Tooltip } from 'antd'

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
    <div className="card u-sticky u-top-76" >
      <div className="u-fs-13 u-fw-700 u-mb-14">{t('newSale.summary')}</div>
      <div className="u-flex u-flex-col u-gap-10">
        <Row label={t('newSale.rowProducts')} value={`${cart.length} ${t('newSale.typeSuffix')} · ${cart.reduce((sum, item) => sum + Math.max(item.quantity, 0), 0).toLocaleString('ru-RU')} ${t('newSale.qtySuffix')}`} />
        <Row label={t('newSale.rowTotal')} value={<span className="num u-fw-700" ><MoneyDisplay amount={subtotal} currency="UZS" /></span>} />
      </div>
      <div className="u-border-t-default u-m-14-0" />
      <div className="u-flex u-flex-col u-gap-12">
        <div>
          <Label>{t('newSale.paymentMethod')}</Label>
          <Controller name="paymentMethod" control={control} render={({ field }) => <Select value={field.value} onChange={(value) => field.onChange(value)} options={paymentOptions} className="u-w-full" />} />
        </div>
        <div>
          <Label>{isUsdPayment ? `${t('newSale.paidAmount')} (USD)` : t('newSale.paidAmount')}</Label>
          <div className="u-grid u-gap-8 u-grid-cols-content-auto">
            <Controller
              name="paidAmount"
              control={control}
              render={({ field }) => (
                <InputNumber<number>
                  value={field.value}
                  onChange={onPaidAmountChange}
                  status={paidAmountError ? 'error' : undefined}
                  className="u-w-full"
                  min={0}
                  max={fullPaidAmount}
                  step={isUsdPayment ? 1 : 10000}
                  precision={isUsdPayment ? 2 : 0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  parser={(value) => Number(value?.replace(/\s/g, ''))}
                />
              )}
            />
            <Tooltip title={t('newSale.markFullPaidTooltip')}>
              <Button icon={<i className="icons-circle-check icon-size-18" />} disabled={fullPaidAmount <= 0 || paidAmount === fullPaidAmount} onClick={() => { setValue('paidAmount', fullPaidAmount, { shouldDirty: true }); onPaidAmountChange(fullPaidAmount) }}>{t('newSale.markFullPaid')}</Button>
            </Tooltip>
          </div>
          {paidAmountError ? <div role="alert" className="u-text-danger u-fs-12 u-mt-6">{t('newSale.paidAmountMaxError')}</div> : null}
        </div>
        {subtotal > 0 ? <div className={`sale-debt-summary sale-debt-summary--${debtAmount > 0 ? 'danger' : 'success'}`}><div className="u-flex u-fs-13 u-justify-between"><span className="u-text-muted">{t('sales.drawerDebt')}</span><span className={`num sale-debt-summary__value tone-${debtAmount > 0 ? 'danger' : 'success'}`}><MoneyDisplay amount={debtAmount} currency="UZS" /></span></div></div> : null}
        {needsCustomer ? <div><Label>{t('newSale.debtDeadlineOptional')}</Label><Controller name="debtDueDateIso" control={control} render={({ field }) => <DatePicker value={field.value ? dayjs(field.value) : null} onChange={(value) => field.onChange(value ? value.toISOString() : undefined)} className="u-w-full" format="DD.MM.YYYY" placeholder={t('newSale.debtDeadlinePlaceholder')} disabledDate={(current) => Boolean(current && current < dayjs().startOf('day'))} allowClear />} /></div> : null}
      </div>
      {needsCustomer && !customerId ? <Alert type="warning" showIcon message={t('newSale.debtNeedsCustomer')} className="u-mt-12" /> : null}
      <Button type="primary" size="large" block icon={<i className="icons-check icon-size-18" />} loading={isPending} disabled={!canSubmit} className="u-mt-16" onClick={handleSubmit(onSubmit)}>{t('newSale.confirmSale')}</Button>
    </div>
  )
}
