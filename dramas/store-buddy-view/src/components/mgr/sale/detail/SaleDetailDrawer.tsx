import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Divider, Drawer, Form, InputNumber, Select, Skeleton } from 'antd'
import { PlusIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { PAYMENT_METHOD_LABELS, PRODUCT_UNIT_LABELS, SALE_TYPE_LABELS } from '@erp/erp-shared/core'
import { formatDate } from '@erp/erp-shared/lib/formatters'
import { MoneyDisplay } from '@erp/erp-shared/ui/money-display'
import { StatusBadge } from '@erp/erp-shared/ui/status-badge'
import type { PaymentMethod, SaleListItem } from '@erp/store-buddy-stub'
import { useAddPayment, useSaleDetail } from '../hooks/useSales'

interface SaleDetailDrawerProps {
  t: (key: string) => string
  sale: SaleListItem | null
  onClose: () => void
}

const PAYMENT_OPTIONS = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[])
  .filter((key) => key !== 'MIXED')
  .map((key) => ({ value: key, label: PAYMENT_METHOD_LABELS[key] }))

type PaymentFormValues = {
  amount: number
  method: PaymentMethod
}

export function SaleDetailDrawer({ t, sale, onClose }: SaleDetailDrawerProps) {
  //
  const { data: detail, isLoading } = useSaleDetail(sale?.id ?? null)
  const addPayment = useAddPayment(t)
  const [showPayForm, setShowPayForm] = useState(false)
  const { control, handleSubmit, reset, watch } = useForm<PaymentFormValues>({
    defaultValues: {
      amount: 0,
      method: 'CASH_UZS',
    },
  })
  const payAmount = watch('amount') ?? 0

  const submitPayment = (values: PaymentFormValues) => {
    //
    if (!sale || values.amount <= 0) return
    addPayment.mutate(
      { saleId: sale.id, payload: { amountUzs: values.amount, paymentMethod: values.method } },
      {
        onSuccess: () => {
          //
          setShowPayForm(false)
          reset({ amount: 0, method: 'CASH_UZS' })
        },
      },
    )
  }

  const hasDebt = Boolean(sale && sale.debtAmountUzs > 0)

  return (
    <Drawer title={null} open={Boolean(sale)} onClose={onClose} width={520} styles={{ body: { padding: 0 } }} destroyOnHidden>
      {sale ? (
        <>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace', letterSpacing: '.04em' }}>
              #{(sale.id.split('-')[0] ?? '').toUpperCase()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 8px' }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>{sale.customer?.fullName ?? t('sales.drawerAnonymous')}</h2>
              <StatusBadge tone={sale.saleType === 'RETAIL' ? 'muted' : 'info'}>{SALE_TYPE_LABELS[sale.saleType]}</StatusBadge>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--ink-3)' }}>
              <span>{sale.branch.name}</span>
              <span>·</span>
              <span>{formatDate(sale.createdAt)}</span>
              <span>·</span>
              <span>{sale.soldBy.fullName}</span>
            </div>
          </div>

          <div style={{ padding: '20px 24px' }}>
            <SectionLabel>{t('sales.drawerPaymentSection')}</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              <StatBox label={t('sales.drawerTotal')} value={<MoneyDisplay amount={sale.totalAmountUzs} currency="UZS" />} />
              <StatBox label={t('sales.drawerPaid')} value={<MoneyDisplay amount={sale.paidAmountUzs} currency="UZS" />} tone="success" />
              <StatBox
                label={t('sales.drawerDebt')}
                value={<MoneyDisplay amount={sale.debtAmountUzs} currency="UZS" />}
                tone={sale.debtAmountUzs > 0 ? 'danger' : 'muted'}
              />
            </div>

            {hasDebt ? (
              <div style={{ marginBottom: 16 }}>
                {showPayForm ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <Form.Item label={t('sales.drawerAmountLabel')} style={{ flex: 1, minWidth: 140, margin: 0 }}>
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
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                            parser={(value) => Number(value?.replace(/\s/g, '') || 0)}
                          />
                        )}
                      />
                    </Form.Item>
                    <Form.Item label={t('sales.drawerMethodLabel')} style={{ flex: 1, minWidth: 140, margin: 0 }}>
                      <Controller
                        name="method"
                        control={control}
                        render={({ field }) => <Select value={field.value} onChange={field.onChange} options={PAYMENT_OPTIONS} style={{ width: '100%' }} />}
                      />
                    </Form.Item>
                    <Button type="primary" loading={addPayment.isPending} disabled={payAmount <= 0} onClick={handleSubmit(submitPayment)}>
                      {t('sales.drawerAccept')}
                    </Button>
                    <Button
                      onClick={() => {
                        //
                        setShowPayForm(false)
                        reset({ amount: 0, method: 'CASH_UZS' })
                      }}
                    >
                      {t('sales.drawerCancelShort')}
                    </Button>
                  </div>
                ) : (
                  <Button
                    icon={<PlusIcon size={18} />}
                    onClick={() => {
                      //
                      reset({ amount: 0, method: 'CASH_UZS' })
                      setShowPayForm(true)
                    }}
                  >
                    {t('sales.drawerAddPayment')}
                  </Button>
                )}
              </div>
            ) : null}

            <Divider style={{ margin: '0 0 16px' }} />

            <SectionLabel>
              {t('sales.drawerItemsSection')} ({sale._count.items} {t('sales.drawerItemsSuffix')})
            </SectionLabel>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {detail?.items.map((item) => (
                  <div
                    key={item.id}
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
                      <div style={{ fontWeight: 500 }}>{item.product.name}</div>
                      {item.product.sku ? (
                        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{item.product.sku}</div>
                      ) : null}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="num" style={{ fontWeight: 700 }}>
                        <MoneyDisplay amount={item.totalPrice} currency="UZS" />
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                        {item.quantity.toLocaleString('ru-RU')} {PRODUCT_UNIT_LABELS[item.product.unit]} x{' '}
                        <MoneyDisplay amount={item.unitPrice} currency="UZS" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sale._count.payments > 0 ? (
              <>
                <Divider style={{ margin: '0 0 16px' }} />
                <SectionLabel>
                  {t('sales.drawerPaymentsSection')} ({sale._count.payments} {t('sales.drawerItemsSuffix')})
                </SectionLabel>
                {isLoading ? (
                  <Skeleton active paragraph={{ rows: 2 }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {detail?.payments.map((payment) => (
                      <div
                        key={payment.id}
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
                          <div style={{ fontWeight: 500 }}>{PAYMENT_METHOD_LABELS[payment.paymentMethod]}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                            {formatDate(payment.createdAt)} · {payment.receivedBy.fullName}
                          </div>
                        </div>
                        <div className="num" style={{ fontWeight: 700 }}>
                          {payment.amountUzs > 0 ? <MoneyDisplay amount={payment.amountUzs} currency="UZS" /> : null}
                          {payment.amountUsd > 0 ? (
                            <span style={{ marginLeft: 4 }}>
                              <MoneyDisplay amount={payment.amountUsd} currency="USD" />
                            </span>
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
                <Divider style={{ margin: '16px 0' }} />
                <div style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic' }}>"{sale.note}"</div>
              </>
            ) : null}
          </div>
        </>
      ) : null}
    </Drawer>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  //
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
      {children}
    </div>
  )
}

function StatBox({ label, value, tone = 'muted' }: { label: string; value: ReactNode; tone?: 'success' | 'danger' | 'muted' }) {
  //
  const color = tone === 'success' ? 'var(--success)' : tone === 'danger' ? 'var(--danger)' : 'var(--ink-1)'
  return (
    <div style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      <div className="num" style={{ fontWeight: 700, fontSize: 14, color }}>
        {value}
      </div>
    </div>
  )
}
