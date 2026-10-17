import { StoreIcon } from '@store/store-shared/ui/store-icon'
import type { StoreLocale, StoreTranslator } from '@store/store-i18n'
import { Controller, type Control } from 'react-hook-form'
import { Button, Divider, Dropdown, Form, InputNumber, Select, Skeleton } from 'antd'

import { formatDate } from '@store/store-shared/lib/formatters'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { PaymentMethod, SaleDetail, SaleListItem } from '@store/store-stub'
import { SectionLabel } from './SectionLabel'
import { StatBox } from './StatBox'

export interface PaymentFormValues {
  amount: number
  method: PaymentMethod
}

interface PaymentOption {
  value: PaymentMethod
  label: string
}

interface SaleDetailViewProps {
  t: StoreTranslator
  sale: SaleListItem
  detail?: SaleDetail
  loading: boolean
  showPayForm: boolean
  control: Control<PaymentFormValues>
  paymentOptions: PaymentOption[]
  payAmount: number
  paymentPending: boolean
  onOpenPayForm: () => void
  onCancelPayment: () => void
  onSubmitPayment: () => void
  printing: boolean
  onPrint: (locale: StoreLocale) => void
}

export function SaleDetailView({
  t,
  sale,
  detail,
  loading,
  showPayForm,
  control,
  paymentOptions,
  payAmount,
  paymentPending,
  onOpenPayForm,
  onCancelPayment,
  onSubmitPayment,
  printing,
  onPrint,
}: SaleDetailViewProps) {
  //
  const hasDebt = sale.debtAmountUzs > 0

  return (
    <>
      <div className="u-border-b-default u-p-20-24">
        <div className="u-items-center u-flex u-justify-between u-gap-8">
          <div className="u-text-muted u-font-mono u-fs-11 u-tracking-normal">
            #{(sale.id.split('-')[0] ?? '').toUpperCase()}
          </div>
          <Dropdown
            trigger={['click']}
            disabled={printing}
            menu={{
              items: [
                { key: 'uz-la', label: t('settings.langUzLatn') },
                { key: 'uz-cy', label: t('settings.langUzCy') },
                { key: 'ru', label: t('settings.langRu') },
                { key: 'en', label: t('settings.langEn') },
              ],
              onClick: ({ key }) => onPrint(key as StoreLocale),
            }}
          >
            <Button size="small" icon={<StoreIcon name="printer" size={14} />} loading={printing}>
              {t('sales.print')}
            </Button>
          </Dropdown>
        </div>
        <div className="u-items-center u-flex u-gap-8 u-m-6-0-8">
          <h2 className="u-fs-16 u-m-0">{sale.customer?.fullName ?? t('sales.drawerAnonymous')}</h2>
          <StatusBadge tone={sale.saleType === 'RETAIL' ? 'muted' : 'info'}>
            {t(sale.saleType === 'RETAIL' ? 'sales.typeRetail' : 'sales.typeWholesale')}
          </StatusBadge>
        </div>
        <div className="u-text-muted u-flex u-flex-wrap u-fs-12-5 u-gap-8">
          <span>{sale.branch.name}</span>
          <span>·</span>
          <span>{formatDate(sale.createdAt)}</span>
          <span>·</span>
          <span>{sale.soldBy.fullName}</span>
        </div>
      </div>

      <div className="u-p-20-24">
        <SectionLabel>{t('sales.drawerPaymentSection')}</SectionLabel>
        <div className="u-grid u-gap-8 u-grid-cols-3-equal u-mb-16">
          <StatBox label={t('sales.drawerTotal')} value={<MoneyDisplay amount={sale.totalAmountUzs} currency="UZS" />} />
          <StatBox label={t('sales.drawerPaid')} value={<MoneyDisplay amount={sale.paidAmountUzs} currency="UZS" />} tone="success" />
          <StatBox
            label={t('sales.drawerDebt')}
            value={<MoneyDisplay amount={sale.debtAmountUzs} currency="UZS" />}
            tone={hasDebt ? 'danger' : 'muted'}
          />
        </div>
        {sale.discountAmountUzs > 0 ? (
          <div className="u-flex u-fs-13 u-justify-between u-mb-16">
            <span className="u-text-muted">{t('sales.drawerDiscount')}</span>
            <span className="num u-text-success">
              {sale.discountPercent > 0 ? `${sale.discountPercent.toLocaleString('ru-RU')}% · ` : null}−<MoneyDisplay amount={sale.discountAmountUzs} currency="UZS" />
            </span>
          </div>
        ) : null}

        {hasDebt ? (
          <div className="u-mb-16">
            {showPayForm ? (
              <div className="u-items-end u-flex u-flex-wrap u-gap-8">
                <Form.Item label={t('sales.drawerAmountLabel')} className="u-flex-1 u-m-0 u-min-w-140">
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
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                        parser={(value) => Number(value?.replace(/\s/g, '') || 0)}
                      />
                    )}
                  />
                </Form.Item>
                <Form.Item label={t('sales.drawerMethodLabel')} className="u-flex-1 u-m-0 u-min-w-140">
                  <Controller
                    name="method"
                    control={control}
                    render={({ field }) => <Select value={field.value} onChange={field.onChange} options={paymentOptions} className="u-w-full" />}
                  />
                </Form.Item>
                <Button type="primary" loading={paymentPending} disabled={payAmount <= 0} onClick={onSubmitPayment}>
                  {t('sales.drawerAccept')}
                </Button>
                <Button onClick={onCancelPayment}>{t('sales.drawerCancelShort')}</Button>
              </div>
            ) : (
              <Button icon={<StoreIcon name="plus" size={16} />} onClick={onOpenPayForm}>
                {t('sales.drawerAddPayment')}
              </Button>
            )}
          </div>
        ) : null}

        <Divider className="u-m-0-0-16" />
        <SectionLabel>
          {t('sales.drawerItemsSection')} ({sale._count.items} {t('sales.drawerItemsSuffix')})
        </SectionLabel>
        {loading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : (
          <div className="u-flex u-flex-col u-gap-6 u-mb-16">
            {detail?.items.map((item) => (
              <div
                key={item.id}
                className="u-items-center u-bg-surface-2 u-rounded-8 u-border-default u-flex u-justify-between u-p-10-14"
              >
                <div>
                  <div className="u-fw-500">{item.product.name}</div>
                  {item.product.sku ? <div className="u-text-muted u-font-mono u-fs-11-5">{item.product.sku}</div> : null}
                </div>
                <div className="u-text-right">
                  <div className="num u-fw-700" >
                    <MoneyDisplay amount={item.totalPrice} currency="UZS" />
                  </div>
                  <div className="u-text-muted u-fs-11-5">
                    {item.quantity.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)} x{' '}
                    {item.discountPercent > 0 && item.listUnitPrice != null ? (
                      <>
                        <span className="sale-price-cell__list">
                          <MoneyDisplay amount={item.listUnitPrice} currency="UZS" />
                        </span>{' '}
                      </>
                    ) : null}
                    <MoneyDisplay amount={item.unitPrice} currency="UZS" />
                    {item.discountPercent > 0 ? <span className="u-text-success"> −{item.discountPercent.toLocaleString('ru-RU')}%</span> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {sale._count.payments > 0 ? (
          <>
            <Divider className="u-m-0-0-16" />
            <SectionLabel>
              {t('sales.drawerPaymentsSection')} ({sale._count.payments} {t('sales.drawerItemsSuffix')})
            </SectionLabel>
            {loading ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : (
              <div className="u-flex u-flex-col u-gap-6">
                {detail?.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="u-items-center u-bg-surface-2 u-rounded-8 u-border-default u-flex u-justify-between u-p-10-14"
                  >
                    <div>
                      <div className="u-fw-500">
                        {t(`payment.${payment.paymentMethod}`)}
                      </div>
                      <div className="u-text-muted u-fs-11-5">
                        {formatDate(payment.createdAt)} · {payment.receivedBy.fullName}
                      </div>
                    </div>
                    <div className="num u-fw-700" >
                      {payment.amountUzs > 0 ? <MoneyDisplay amount={payment.amountUzs} currency="UZS" /> : null}
                      {payment.amountUsd > 0 ? (
                        <span className="u-ml-4"><MoneyDisplay amount={payment.amountUsd} currency="USD" /></span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}

        {sale.note ? (
          <>
            <Divider className="u-m-16-0" />
            <div className="u-text-muted u-fs-13 u-font-italic">&quot;{sale.note}&quot;</div>
          </>
        ) : null}
      </div>
    </>
  )
}
