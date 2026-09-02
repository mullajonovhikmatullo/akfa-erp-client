import { Controller, type Control } from 'react-hook-form'
import { Button, Divider, Form, InputNumber, Select, Skeleton, Tag } from 'antd'
import { PlusIcon } from '@phosphor-icons/react'
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
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          {customer.fullName.charAt(0).toUpperCase()}
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: 18 }}>{customer.fullName}</h2>
        {customer.phone ? <div style={{ fontSize: 13, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{customer.phone}</div> : null}
        {customer.address ? <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{customer.address}</div> : null}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          <StatusBadge tone="info">{customer.branch.name}</StatusBadge>
          <StatusBadge tone={customer.isActive ? 'success' : 'danger'} dot>
            {t(customer.isActive ? 'common.active' : 'common.inactive')}
          </StatusBadge>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <SectionLabel>{t('customers.colBalance')}</SectionLabel>
        <div
          style={{
            padding: '14px 16px',
            border: '1px solid var(--border)',
            borderRadius: 8,
            background: 'var(--surface-2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{t('customers.drawerCurrentBalance')}</span>
          <div style={{ textAlign: 'right' }}>
            <div className="num" style={{ fontSize: 16, fontWeight: 700 }}>
              <MoneyDisplay amount={Math.abs(currentBalance)} currency="UZS" />
            </div>
            <StatusBadge tone={balanceTone}>{balanceLabel || '—'}</StatusBadge>
          </div>
        </div>

        <Divider style={{ margin: '0 0 16px' }} />
        <SectionLabel>{t('customers.drawerDebtPayment')}</SectionLabel>
        {debtSalesLoading ? (
          <Skeleton active paragraph={{ rows: 2 }} />
        ) : unpaidSales.length === 0 ? (
          <div style={{ padding: '12px 0 16px', color: 'var(--ink-3)', fontSize: 13 }}>{t('customers.drawerNoDebtSales')}</div>
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
                        <Tag style={{ margin: 0, fontSize: 11 }}>
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
                        <Button size="small" type="primary" icon={<PlusIcon size={13} />} onClick={() => onStartPayment(sale)}>
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
                                style={{ width: '100%' }}
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
                            render={({ field }) => <Select value={field.value} onChange={field.onChange} options={paymentOptions} style={{ width: '100%' }} />}
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

        <Divider style={{ margin: '0 0 16px' }} />
        <SectionLabel>{t('customers.drawerRecentSales')}</SectionLabel>
        {detailLoading ? (
          <Skeleton active paragraph={{ rows: 3 }} />
        ) : !detail || detail.recentSales.length === 0 ? (
          <div style={{ padding: '12px 0', color: 'var(--ink-3)', fontSize: 13 }}>{t('customers.drawerNoSales')}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {detail.recentSales.map((sale) => (
              <div
                key={sale.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  background: 'var(--surface-2)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>
                    {sale._count.items} {t('customers.drawerProductsSuffix')} ·{' '}
                    <Tag style={{ fontSize: 11 }}>
                      {t(sale.saleType === 'RETAIL' ? 'sales.typeRetail' : 'sales.typeWholesale')}
                    </Tag>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{formatDate(sale.createdAt)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="num" style={{ fontWeight: 700, fontSize: 13 }}>
                    <MoneyDisplay amount={sale.totalAmountUzs} currency="UZS" />
                  </div>
                  {sale.debtAmountUzs > 0 ? (
                    <div className="num" style={{ fontSize: 11.5, color: 'var(--danger)' }}>
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
