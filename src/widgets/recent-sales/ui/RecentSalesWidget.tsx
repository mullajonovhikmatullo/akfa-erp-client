import { useNavigate } from 'react-router-dom';
import { useSales } from '@/entities/sale';
import { MoneyDisplay, StatusBadge } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import { SALE_TYPE_LABELS } from '@/shared/types/domain';
import { ROUTES } from '@/shared/config/routes';
import type { SaleListItem } from '@/shared/types/domain';

export function RecentSalesWidget() {
  const navigate = useNavigate();
  const { data: sales = [] } = useSales({ limit: 6 });

  return (
    <div className="card">
      <div className="card-head">
        <h3>Recent sales</h3>
        <button
          className="link-btn"
          onClick={() => navigate(ROUTES.SALES)}
          style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          View all →
        </button>
      </div>
      <div className="col" style={{ gap: 8 }}>
        {sales.map((s: SaleListItem) => (
          <div
            key={s.id}
            style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, alignItems: 'center' }}
          >
            <CustomerAvatar name={s.customer?.fullName} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.customer?.fullName ?? '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                #{s.id.slice(-6).toUpperCase()} · {s._count.items} items · {formatDate(s.createdAt)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="num" style={{ fontWeight: 600 }}>
                <MoneyDisplay amount={s.totalAmountUzs} currency="UZS" />
              </div>
              <StatusBadge tone={s.saleType === 'WHOLESALE' ? 'info' : 'muted'}>
                {SALE_TYPE_LABELS[s.saleType]}
              </StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerAvatar({ name }: { name?: string }) {
  const initials = (name ?? '?').split(' ').slice(0, 2).map((s: string) => s[0]).join('').toUpperCase();
  return (
    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #1e4dd8, #1e4dd8cc)', color: '#fff', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {initials}
    </span>
  );
}
