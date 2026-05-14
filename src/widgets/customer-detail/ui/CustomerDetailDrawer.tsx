import { Drawer, Skeleton, Divider, Tag } from 'antd';
import { useCustomerDetail } from '@/entities/customer';
import { StatusBadge, MoneyDisplay } from '@/shared/ui';
import type { Customer } from '@/shared/types/domain';
import { formatDate } from '@/shared/lib/formatters';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  onClose: () => void;
}

export function CustomerDetailDrawer({ customer, onClose }: CustomerDetailDrawerProps) {
  const { data: detail, isLoading } = useCustomerDetail(customer?.id ?? null);

  const balanceTone =
    !detail ? 'muted' :
    detail.balance > 0 ? 'danger' :
    detail.balance < 0 ? 'success' : 'muted';

  const balanceLabel =
    !detail ? '' :
    detail.balance > 0 ? 'Қарздор' :
    detail.balance < 0 ? 'Ортиқча тўлов' : 'Ҳисоб-китоб';

  return (
    <Drawer
      title={null}
      open={Boolean(customer)}
      onClose={onClose}
      width={480}
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
                <StatusBadge tone="success" dot>Фаол</StatusBadge>
              ) : (
                <StatusBadge tone="danger" dot>Нофаол</StatusBadge>
              )}
            </div>
          </div>

          <div style={{ padding: '20px 24px' }}>

            {/* Balance */}
            <SectionLabel>Баланс</SectionLabel>
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
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Жорий баланс</span>
              <div style={{ textAlign: 'right' }}>
                <div className="num" style={{ fontSize: 18, fontWeight: 700 }}>
                  <MoneyDisplay amount={Math.abs(customer.balance)} currency="UZS" />
                </div>
                <StatusBadge tone={balanceTone}>{balanceLabel || '—'}</StatusBadge>
              </div>
            </div>

            <Divider style={{ margin: '0 0 16px' }} />

            {/* Recent sales */}
            <SectionLabel>Сўнгги сотувлар</SectionLabel>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : !detail || detail.recentSales.length === 0 ? (
              <div style={{ padding: '12px 0', color: 'var(--ink-3)', fontSize: 13 }}>
                Ҳали сотув амалга оширилмаган
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
                        {s._count.items} та маҳсулот ·{' '}
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
                          Қарз: <MoneyDisplay amount={s.debtAmountUzs} currency="UZS" />
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
