import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Divider, Drawer, Form, InputNumber, Select, Skeleton, Tag } from 'antd'
import { PlusIcon } from '@phosphor-icons/react'
import { PAYMENT_METHOD_LABELS } from '@store/store-shared/core'
import { formatDate } from '@store/store-shared/lib/formatters'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Customer, PaymentMethod, SaleListItem } from '@store/store-stub'
import { useAddPayment, useSales } from '../../sale/hooks/useSales'
import { useCustomerDetail } from '../hooks/useCustomers'

interface CustomerDetailDrawerProps {
  t: (key: string) => string
  customer: Customer | null
  onClose: () => void
}

const DEBT_PAYMENT_METHODS: PaymentMethod[] = ['CASH_UZS', 'CARD', 'TRANSFER']

type DebtPaymentFormValues = {
  amount: number
  method: PaymentMethod
}

export function CustomerDetailDrawer({ t, customer, onClose }: CustomerDetailDrawerProps) {
  //
  const { data: detail, isLoading } = useCustomerDetail(customer?.id ?? null)
  const debtSales = useSales(customer ? { customerId: customer.id, hasDebt: true, limit: 100 } : undefined, {
    enabled: Boolean(customer),
  })
  const addPayment = useAddPayment(t)
  const [payingSaleId, setPayingSaleId] = useState<string | null>(null)
  const { control, reset, watch, handleSubmit } = useForm<DebtPaymentFormValues>({
    defaultValues: {
      amount: 0,
      method: 'CASH_UZS',
    },
  })
  const payAmount = watch('amount') ?? 0

  useEffect(() => {
    //
    setPayingSaleId(null)
    reset({ amount: 0, method: 'CASH_UZS' })
  }, [customer?.id, reset])

  const paymentOptions = useMemo(
    () =>
      DEBT_PAYMENT_METHODS.map((method) => ({
        value: method,
        label: t(`payment.${method}`) || PAYMENT_METHOD_LABELS[method],
      })),
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

  const startPayment = (sale: SaleListItem) => {
    //
    setPayingSaleId(sale.id)
    reset({ amount: sale.debtAmountUzs, method: 'CASH_UZS' })
  }

  const submitPayment = (sale: SaleListItem, values: DebtPaymentFormValues) => {
    //
    if (values.amount <= 0) return

    addPayment.mutate(
      {
        saleId: sale.id,
        payload: {
          amountUzs: Math.min(values.amount, sale.debtAmountUzs),
          paymentMethod: values.method,
        },
      },
      {
        onSuccess: () => {
          //
          setPayingSaleId(null)
          reset({ amount: 0, method: 'CASH_UZS' })
        },
      },
    )
  }

  const unpaidSales = (debtSales.data ?? []).filter((sale) => sale.debtAmountUzs > 0)

  return (
    <Drawer title={null} open={Boolean(customer)} onClose={onClose} width={560} styles={{ body: { padding: 0 } }} destroyOnHidden>
      {customer && (
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
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{customer.fullName}</h2>
            {customer.phone && <div style={{ fontSize: 13, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{customer.phone}</div>}
            {customer.address && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{customer.address}</div>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              <StatusBadge tone="info">{customer.branch.name}</StatusBadge>
              {customer.isActive ? (
                <StatusBadge tone="success" dot>
                  {t('common.active')}
                </StatusBadge>
              ) : (
                <StatusBadge tone="danger" dot>
                  {t('common.inactive')}
                </StatusBadge>
              )}
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
                <div className="num" style={{ fontSize: 18, fontWeight: 700 }}>
                  <MoneyDisplay amount={Math.abs(currentBalance)} currency="UZS" />
                </div>
                <StatusBadge tone={balanceTone}>{balanceLabel || '—'}</StatusBadge>
              </div>
            </div>

            <Divider style={{ margin: '0 0 16px' }} />

            <SectionLabel>{t('customers.drawerDebtPayment')}</SectionLabel>
            {debtSales.isLoading ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : unpaidSales.length === 0 ? (
              <div style={{ padding: '12px 0 16px', color: 'var(--ink-3)', fontSize: 13 }}>{t('customers.drawerNoDebtSales')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                {unpaidSales.map((sale) => {
                  //
                  const isPaying = payingSaleId === sale.id
                  const isSubmitting = addPayment.isPending && isPaying

                  return (
                    <div key={sale.id} style={{ padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>#{(sale.id.split('-')[0] ?? '').toUpperCase()}</span>
                            <Tag style={{ margin: 0, fontSize: 11 }}>{sale.saleType}</Tag>
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3 }}>
                            {formatDate(sale.createdAt)} · {sale._count.items} {t('customers.drawerProductsSuffix')}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="num" style={{ fontWeight: 700, fontSize: 13, color: 'var(--danger)' }}>
                            <MoneyDisplay amount={sale.debtAmountUzs} currency="UZS" />
                          </div>
                          {!isPaying && (
                            <Button size="small" icon={<PlusIcon size={16} />} style={{ marginTop: 6 }} onClick={() => startPayment(sale)}>
                              {t('sales.drawerAddPayment')}
                            </Button>
                          )}
                        </div>
                      </div>

                      {isPaying && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' }}>
                            <Form.Item label={t('sales.drawerAmountLabel')} style={{ flex: '1 1 170px', margin: 0 }}>
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
                            <Form.Item label={t('sales.drawerMethodLabel')} style={{ flex: '1 1 130px', margin: 0 }}>
                              <Controller
                                name="method"
                                control={control}
                                render={({ field }) => <Select value={field.value} onChange={field.onChange} options={paymentOptions} style={{ width: '100%' }} />}
                              />
                            </Form.Item>
                          </div>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Button
                              type="primary"
                              loading={isSubmitting}
                              disabled={payAmount <= 0}
                              style={{ minWidth: 120 }}
                              onClick={handleSubmit((values) => submitPayment(sale, values))}
                            >
                              {t('sales.drawerAccept')}
                            </Button>
                            <Button
                              disabled={isSubmitting}
                              style={{ minWidth: 96 }}
                              onClick={() => {
                                //
                                setPayingSaleId(null)
                                reset({ amount: 0, method: 'CASH_UZS' })
                              }}
                            >
                              {t('sales.drawerCancelShort')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <Divider style={{ margin: '0 0 16px' }} />

            <SectionLabel>{t('customers.drawerRecentSales')}</SectionLabel>
            {isLoading ? (
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
                        {sale._count.items} {t('customers.drawerProductsSuffix')} · <Tag style={{ fontSize: 11 }}>{sale.saleType}</Tag>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{formatDate(sale.createdAt)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="num" style={{ fontWeight: 700, fontSize: 13 }}>
                        <MoneyDisplay amount={sale.totalAmountUzs} currency="UZS" />
                      </div>
                      {sale.debtAmountUzs > 0 && (
                        <div className="num" style={{ fontSize: 11.5, color: 'var(--danger)' }}>
                          {t('sales.drawerDebt')}: <MoneyDisplay amount={sale.debtAmountUzs} currency="UZS" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Drawer>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  //
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
      {children}
    </div>
  )
}
