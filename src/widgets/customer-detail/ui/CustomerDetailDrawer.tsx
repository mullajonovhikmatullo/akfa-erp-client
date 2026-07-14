import { useEffect, useMemo, useState } from 'react';
import { Drawer, Skeleton, Divider, Tag, Button, Form, InputNumber, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useCustomerDetail } from '@/entities/customer';
import { useAddPayment, useSales } from '@/entities/sale';
import { StatusBadge, MoneyDisplay } from '@/shared/ui';
import {
  PAYMENT_METHOD_LABELS,
  type Customer,
  type PaymentMethod,
  type SaleListItem,
} from '@/shared/types/domain';
import { formatDate } from '@/shared/lib/formatters';
import { useT } from '@/shared/lib/i18n';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  onClose: () => void;
}

const DEBT_PAYMENT_METHODS: PaymentMethod[] = ['CASH_UZS', 'CARD', 'TRANSFER'];

export function CustomerDetailDrawer({ customer, onClose }: CustomerDetailDrawerProps) {
  const t = useT();
  const { data: detail, isLoading } = useCustomerDetail(customer?.id ?? null);
  const debtSales = useSales(
    customer ? { customerId: customer.id, hasDebt: true, limit: 100 } : undefined,
    { enabled: Boolean(customer) },
  );
  const addPayment = useAddPayment();
  const [payingSaleId, setPayingSaleId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH_UZS');

  useEffect(() => {
    setPayingSaleId(null);
    setPayAmount(0);
    setPayMethod('CASH_UZS');
  }, [customer?.id]);

  const paymentOptions = useMemo(
    () => DEBT_PAYMENT_METHODS.map((method) => ({
      value: method,
      label: t(`payment.${method}`) || PAYMENT_METHOD_LABELS[method],
    })),
    [t],
  );

  const currentBalance = detail?.balance ?? customer?.balance ?? 0;

  const balanceTone =
    currentBalance > 0 ? 'danger' :
    currentBalance < 0 ? 'success' : 'muted';

  const balanceLabel =
    currentBalance > 0 ? t('customers.balanceDebt') :
    currentBalance < 0 ? t('customers.drawerBalanceCreditFull') : t('customers.drawerBalanceSettled');

  const startPayment = (sale: SaleListItem) => {
    setPayingSaleId(sale.id);
    setPayAmount(sale.debtAmountUzs);
    setPayMethod('CASH_UZS');
  };

  const handleAddPayment = (sale: SaleListItem) => {
    if (payAmount <= 0) return;

    addPayment.mutate(
      {
        saleId: sale.id,
        payload: {
          amountUzs: Math.min(payAmount, sale.debtAmountUzs),
          paymentMethod: payMethod,
        },
      },
      {
        onSuccess: () => {
          setPayingSaleId(null);
          setPayAmount(0);
        },
      },
    );
  };

  const unpaidSales = (debtSales.data ?? []).filter((sale) => sale.debtAmountUzs > 0);

  return (
    <Drawer
      title={null}
      open={Boolean(customer)}
      onClose={onClose}
      width={560}
      styles={{ body: { padding: 0 } }}
      destroyOnHidden
    >
      {customer && (
        <>
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, marginBottom: 12,
              }}
            >
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{customer.fullName}</h2>
            {customer.phone && (
              <div style={{ fontSize: 13, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                {customer.phone}
              </div>
            )}
            {customer.address && (
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
                {customer.address}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              <StatusBadge tone="info">{customer.branch.name}</StatusBadge>
              {customer.isActive ? (
                <StatusBadge tone="success" dot>{t('common.active')}</StatusBadge>
              ) : (
                <StatusBadge tone="danger" dot>{t('common.inactive')}</StatusBadge>
              )}
            </div>
          </div>

          <div style={{ padding: '20px 24px' }}>

            {/* Balance */}
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

            {/* Debt payment */}
            <SectionLabel>{t('customers.drawerDebtPayment')}</SectionLabel>
            {debtSales.isLoading ? (
              <Skeleton active paragraph={{ rows: 2 }} />
            ) : unpaidSales.length === 0 ? (
              <div style={{ padding: '12px 0 16px', color: 'var(--ink-3)', fontSize: 13 }}>
                {t('customers.drawerNoDebtSales')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                {unpaidSales.map((sale) => {
                  const isPaying = payingSaleId === sale.id;
                  const isSubmitting = addPayment.isPending && isPaying;

                  return (
                    <div
                      key={sale.id}
                      style={{
                        padding: '12px 14px',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        background: 'var(--surface-2)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>
                              #{(sale.id.split('-')[0] ?? '').toUpperCase()}
                            </span>
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
                            <Button
                              size="small"
                              icon={<PlusOutlined />}
                              style={{ marginTop: 6 }}
                              onClick={() => startPayment(sale)}
                            >
                              {t('sales.drawerAddPayment')}
                            </Button>
                          )}
                        </div>
                      </div>

                      {isPaying && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            marginTop: 12,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 8,
                              alignItems: 'flex-end',
                            }}
                          >
                            <Form.Item
                              label={t('sales.drawerAmountLabel')}
                              style={{ flex: '1 1 170px', margin: 0 }}
                            >
                              <InputNumber<number>
                                value={payAmount}
                                onChange={(v) => setPayAmount(v ?? 0)}
                                style={{ width: '100%' }}
                                min={1}
                                max={sale.debtAmountUzs}
                                step={10000}
                                formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                                parser={(v) => Number(v?.replace(/\s/g, '') || 0)}
                              />
                            </Form.Item>
                            <Form.Item
                              label={t('sales.drawerMethodLabel')}
                              style={{ flex: '1 1 130px', margin: 0 }}
                            >
                              <Select
                                value={payMethod}
                                onChange={setPayMethod}
                                options={paymentOptions}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              justifyContent: 'flex-end',
                            }}
                          >
                            <Button
                              type="primary"
                              loading={isSubmitting}
                              disabled={payAmount <= 0}
                              style={{ minWidth: 120 }}
                              onClick={() => handleAddPayment(sale)}
                            >
                              {t('sales.drawerAccept')}
                            </Button>
                            <Button
                              disabled={isSubmitting}
                              style={{ minWidth: 96 }}
                              onClick={() => {
                                setPayingSaleId(null);
                                setPayAmount(0);
                              }}
                            >
                              {t('sales.drawerCancelShort')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <Divider style={{ margin: '0 0 16px' }} />

            {/* Recent sales */}
            <SectionLabel>{t('customers.drawerRecentSales')}</SectionLabel>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : !detail || detail.recentSales.length === 0 ? (
              <div style={{ padding: '12px 0', color: 'var(--ink-3)', fontSize: 13 }}>
                {t('customers.drawerNoSales')}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {detail.recentSales.map((s) => (
                  <div
                    key={s.id}
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
                        {s._count.items} {t('customers.drawerProductsSuffix')} ·{' '}
                        <Tag style={{ fontSize: 11 }}>{s.saleType}</Tag>
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
                        {formatDate(s.createdAt)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="num" style={{ fontWeight: 700, fontSize: 13 }}>
                        <MoneyDisplay amount={s.totalAmountUzs} currency="UZS" />
                      </div>
                      {s.debtAmountUzs > 0 && (
                        <div className="num" style={{ fontSize: 11.5, color: 'var(--danger)' }}>
                          {t('sales.drawerDebt')}: <MoneyDisplay amount={s.debtAmountUzs} currency="UZS" />
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
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
      {children}
    </div>
  );
}
