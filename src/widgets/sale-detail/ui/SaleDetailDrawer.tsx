import { Drawer, Skeleton, Divider, Tag, Button, Form, InputNumber, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useSaleDetail, useAddPayment } from '@/entities/sale';
import { StatusBadge, MoneyDisplay } from '@/shared/ui';
import {
  SALE_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  PRODUCT_UNIT_LABELS,
  type PaymentMethod,
  type SaleListItem,
} from '@/shared/types/domain';
import { formatDate } from '@/shared/lib/formatters';
import { useT } from '@/shared/lib/i18n';

interface SaleDetailDrawerProps {
  sale: SaleListItem | null;
  onClose: () => void;
}

const PAYMENT_OPTIONS = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[])
  .filter((k) => k !== 'MIXED')
  .map((k) => ({ value: k, label: PAYMENT_METHOD_LABELS[k] }));

export function SaleDetailDrawer({ sale, onClose }: SaleDetailDrawerProps) {
  const t = useT();
  const { data: detail, isLoading } = useSaleDetail(sale?.id ?? null);
  const addPayment = useAddPayment();
  const [showPayForm, setShowPayForm] = useState(false);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH_UZS');

  const handleAddPayment = () => {
    if (!sale || payAmount <= 0) return;
    addPayment.mutate(
      { saleId: sale.id, payload: { amountUzs: payAmount, paymentMethod: payMethod } },
      {
        onSuccess: () => {
          setShowPayForm(false);
          setPayAmount(0);
        },
      },
    );
  };

  const hasDebt = sale && sale.debtAmountUzs > 0;

  return (
    <Drawer
      title={null}
      open={Boolean(sale)}
      onClose={onClose}
      width={520}
      styles={{ body: { padding: 0 } }}
      destroyOnHidden
    >
      {sale && (
        <>
          {/* Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace', letterSpacing: '.04em' }}>
              #{(sale.id.split('-')[0] ?? '').toUpperCase()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 8px' }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>
                {sale.customer?.fullName ?? t('sales.drawerAnonymous')}
              </h2>
              <StatusBadge tone={sale.saleType === 'RETAIL' ? 'muted' : 'info'}>
                {SALE_TYPE_LABELS[sale.saleType]}
              </StatusBadge>
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

            {/* Financials */}
            <SectionLabel>{t('sales.drawerPaymentSection')}</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
              <StatBox label={t('sales.drawerTotal')} value={<MoneyDisplay amount={sale.totalAmountUzs} currency="UZS" />} />
              <StatBox label={t('sales.drawerPaid')} value={<MoneyDisplay amount={sale.paidAmountUzs} currency="UZS" />} tone="success" />
              <StatBox label={t('sales.drawerDebt')} value={<MoneyDisplay amount={sale.debtAmountUzs} currency="UZS" />} tone={sale.debtAmountUzs > 0 ? 'danger' : 'muted'} />
            </div>

            {/* Add payment */}
            {hasDebt && (
              <div style={{ marginBottom: 16 }}>
                {showPayForm ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <Form.Item label={t('sales.drawerAmountLabel')} style={{ flex: 1, minWidth: 140, margin: 0 }}>
                      <InputNumber
                        value={payAmount}
                        onChange={(v) => setPayAmount(v ?? 0)}
                        style={{ width: '100%' }}
                        min={1}
                        max={sale.debtAmountUzs}
                        step={10000}
                        formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                        parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
                      />
                    </Form.Item>
                    <Form.Item label={t('sales.drawerMethodLabel')} style={{ flex: 1, minWidth: 140, margin: 0 }}>
                      <Select
                        value={payMethod}
                        onChange={setPayMethod}
                        options={PAYMENT_OPTIONS}
                        style={{ width: '100%' }}
                      />
                    </Form.Item>
                    <Button
                      type="primary"
                      loading={addPayment.isPending}
                      disabled={payAmount <= 0}
                      onClick={handleAddPayment}
                    >
                      {t('sales.drawerAccept')}
                    </Button>
                    <Button onClick={() => setShowPayForm(false)}>{t('sales.drawerCancelShort')}</Button>
                  </div>
                ) : (
                  <Button icon={<PlusOutlined />} onClick={() => setShowPayForm(true)}>
                    {t('sales.drawerAddPayment')}
                  </Button>
                )}
              </div>
            )}

            <Divider style={{ margin: '0 0 16px' }} />

            {/* Items */}
            <SectionLabel>{t('sales.drawerItemsSection')} ({sale._count.items} {t('sales.drawerItemsSuffix')})</SectionLabel>
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
                      {item.product.sku && (
                        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                          {item.product.sku}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="num" style={{ fontWeight: 700 }}>
                        <MoneyDisplay amount={item.totalPrice} currency="UZS" />
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                        {item.quantity.toLocaleString('ru-RU')} {PRODUCT_UNIT_LABELS[item.product.unit]}{' '}
                        × <MoneyDisplay amount={item.unitPrice} currency="UZS" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payments */}
            {sale._count.payments > 0 && (
              <>
                <Divider style={{ margin: '0 0 16px' }} />
                <SectionLabel>{t('sales.drawerPaymentsSection')} ({sale._count.payments} {t('sales.drawerItemsSuffix')})</SectionLabel>
                {isLoading ? (
                  <Skeleton active paragraph={{ rows: 2 }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {detail?.payments.map((p) => (
                      <div
                        key={p.id}
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
                          <div style={{ fontWeight: 500 }}>
                            {PAYMENT_METHOD_LABELS[p.paymentMethod]}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                            {formatDate(p.createdAt)} · {p.receivedBy.fullName}
                          </div>
                        </div>
                        <div className="num" style={{ fontWeight: 700 }}>
                          {p.amountUzs > 0 && <MoneyDisplay amount={p.amountUzs} currency="UZS" />}
                          {p.amountUsd > 0 && (
                            <span style={{ marginLeft: 4 }}>
                              <MoneyDisplay amount={p.amountUsd} currency="USD" />
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {sale.note && (
              <>
                <Divider style={{ margin: '16px 0' }} />
                <div style={{ fontSize: 13, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                  "{sale.note}"
                </div>
              </>
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

function StatBox({ label, value, tone = 'muted' }: { label: string; value: React.ReactNode; tone?: 'success' | 'danger' | 'muted' }) {
  const color = tone === 'success' ? 'var(--success)' : tone === 'danger' ? 'var(--danger)' : 'var(--ink-1)';
  return (
    <div style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface-2)' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{label}</div>
      <div className="num" style={{ fontWeight: 700, fontSize: 14, color }}>{value}</div>
    </div>
  );
}
