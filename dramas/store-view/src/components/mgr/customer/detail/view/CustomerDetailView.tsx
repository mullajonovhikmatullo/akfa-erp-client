import { Controller, type Control } from 'react-hook-form'
import { Button, Divider, Form, InputNumber, Select, Skeleton, Tag } from 'antd'

import { formatDate } from '@store/store-shared/lib/formatters'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Customer, CustomerDetail, PaymentMethod, SaleListItem } from '@store/store-stub'
import { SectionLabel } from './SectionLabel'

export interface DebtPaymentFormValues {
  amount: number
  method: PaymentMethod
}

interface PaymentOption {
  value: PaymentMethod
  label: string
}

interface CustomerDetailViewProps {
  t: (key: string) => string
  customer: Customer
  detail?: CustomerDetail
  detailLoading: boolean
  unpaidSales: SaleListItem[]
  debtSalesLoading: boolean
  currentBalance: number
  balanceTone: 'danger' | 'success' | 'muted'
  balanceLabel: string
  payingSaleId: string | null
  control: Control<DebtPaymentFormValues>
  paymentOptions: PaymentOption[]
  payAmount: number
  paymentPending: boolean
  onStartPayment: (sale: SaleListItem) => void
  onCancelPayment: () => void
  onSubmitPayment: (sale: SaleListItem) => void
}

export function CustomerDetailView({
  t,
  customer,
  detail,
  detailLoading,
  unpaidSales,
  debtSalesLoading,
  currentBalance,
  balanceTone,
  balanceLabel,
  payingSaleId,
  control,
  paymentOptions,
  payAmount,
  paymentPending,
  onStartPayment,
  onCancelPayment,
  onSubmitPayment,
}: CustomerDetailViewProps) {
  //
  return (
    <>
      <div className="u-border-b-default u-p-20-24">
        <div
          className="u-items-center u-bg-primary u-rounded-full u-text-white u-flex u-fs-18 u-fw-700 u-h-48 u-justify-center u-mb-12 u-w-48"
        >
          {customer.fullName.charAt(0).toUpperCase()}
        </div>
        <h2 className="u-fs-18 u-m-0-0-4">{customer.fullName}</h2>
        {customer.phone ? <div className="u-text-muted u-font-mono u-fs-13">{customer.phone}</div> : null}
        {customer.address ? <div className="u-text-muted u-fs-13 u-mt-2">{customer.address}</div> : null}
        <div className="u-flex u-flex-wrap u-gap-8 u-mt-10">
          <StatusBadge tone="info">{customer.branch.name}</StatusBadge>
          <StatusBadge tone={customer.isActive ? 'success' : 'danger'} dot>
            {t(customer.isActive ? 'common.active' : 'common.inactive')}
          </StatusBadge>
        </div>
      </div>

      <div className="u-p-20-24">
        <SectionLabel>{t('customers.colBalance')}</SectionLabel>
        <div
          className="u-items-center u-bg-surface-2 u-rounded-8 u-border-default u-flex u-justify-between u-mb-20 u-p-14-16"
        >
          <span className="u-text-muted u-fs-13">{t('customers.drawerCurrentBalance')}</span>
          <div className="u-text-right">
            <div className="num u-fs-16 u-fw-700" >
              <MoneyDisplay amount={Math.abs(currentBalance)} currency="UZS" />
            </div>
            <StatusBadge tone={balanceTone}>{balanceLabel || '—'}</StatusBadge>
          </div>
        </div>

        <Divider className="u-m-0-0-16" />
        <SectionLabel>{t('customers.drawerDebtPayment')}</SectionLabel>
        {debtSalesLoading ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : unpaidSales.length === 0 ? (
          <div className="u-text-muted u-fs-13 u-p-12-0-16">{t('customers.drawerNoDebtSales')}</div>
        ) : (
          <div className="customer-payment-list">
            {unpaidSales.map((sale) => {
              //
              const isPaying = payingSaleId === sale.id
              const isSubmitting = paymentPending && isPaying

              return (
                <div key={sale.id} className={`customer-payment-card${isPaying ? ' is-paying' : ''}`}>
                  <div className="customer-payment-card__summary">
                    <div className="customer-payment-card__meta">
                      <div className="customer-payment-card__identity">
                        <span>#{(sale.id.split('-')[0] ?? '').toUpperCase()}</span>
                        <Tag className="u-fs-11 u-m-0">
                          {t(sale.saleType === 'RETAIL' ? 'sales.typeRetail' : 'sales.typeWholesale')}
                        </Tag>
                      </div>
                      <div className="customer-payment-card__date">
                        {formatDate(sale.createdAt)} · {sale._count.items} {t('customers.drawerProductsSuffix')}
                      </div>
                    </div>
                    <div className="customer-payment-card__amount">
                      <div className="num">
                        <MoneyDisplay amount={sale.debtAmountUzs} currency="UZS" />
                      </div>
                      {!isPaying ? (
                        <Button size="small" type="primary" icon={<i className="icons-plus icon-size-13" />} onClick={() => onStartPayment(sale)}>
                          {t('sales.drawerAddPayment')}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {isPaying ? (
                    <div className="customer-payment-editor">
                      <div className="customer-payment-editor__fields">
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
                            render={({ field }) => <Select value={field.value} onChange={field.onChange} options={paymentOptions} className="u-w-full" />}
                          />
                        </Form.Item>
                      </div>
                      <div className="customer-payment-editor__actions">
                        <Button disabled={isSubmitting} onClick={onCancelPayment}>
                          {t('sales.drawerCancelShort')}
                        </Button>
                        <Button type="primary" loading={isSubmitting} disabled={payAmount <= 0} onClick={() => onSubmitPayment(sale)}>
                          {t('sales.drawerAccept')}
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}

        <Divider className="u-m-0-0-16" />
        <SectionLabel>{t('customers.drawerRecentSales')}</SectionLabel>
        {detailLoading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : !detail || detail.recentSales.length === 0 ? (
          <div className="u-text-muted u-fs-13 u-p-12-0">{t('customers.drawerNoSales')}</div>
        ) : (
          <div className="u-flex u-flex-col u-gap-8">
            {detail.recentSales.map((sale) => (
              <div
                key={sale.id}
                className="u-items-center u-bg-surface-2 u-rounded-8 u-border-default u-flex u-justify-between u-p-10-14"
              >
                <div>
                  <div className="u-fs-13 u-fw-500">
                    {sale._count.items} {t('customers.drawerProductsSuffix')} ·{' '}
                    <Tag className="u-fs-11">
                      {t(sale.saleType === 'RETAIL' ? 'sales.typeRetail' : 'sales.typeWholesale')}
                    </Tag>
                  </div>
                  <div className="u-text-muted u-fs-11-5 u-mt-2">{formatDate(sale.createdAt)}</div>
                </div>
                <div className="u-text-right">
                  <div className="num u-fs-13 u-fw-700" >
                    <MoneyDisplay amount={sale.totalAmountUzs} currency="UZS" />
                  </div>
                  {sale.debtAmountUzs > 0 ? (
                    <div className="num u-text-danger u-fs-11-5" >
                      {t('sales.drawerDebt')}: <MoneyDisplay amount={sale.debtAmountUzs} currency="UZS" />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
