import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { SwapOutlined, WalletOutlined, TeamOutlined, InboxOutlined } from '@ant-design/icons';
import { useInventoryReport } from '@/entities/analytics';
import { useSel } from '@/app/store.jsx';
import { StatusBadge } from '@/shared/ui';
import { ROUTES } from '@/shared/config/routes';
import { PRODUCT_UNIT_LABELS } from '@/shared/types/domain';
import { useT } from '@/shared/lib/i18n';

export function LowStockWidget() {
  const t = useT();
  const navigate = useNavigate();
  const lowStockThreshold = useSel((s: { settings: { lowStockThreshold: number } }) => s.settings.lowStockThreshold);
  const { data } = useInventoryReport({ lowStockThreshold });
  const lowStock = (data?.lowStock ?? []).slice(0, 5);

  return (
    <div className="card">
      <div className="card-head">
        <h3>{t('dashboard.lowStockTitle')}</h3>
        <button
          className="link-btn"
          onClick={() => navigate(ROUTES.PRODUCTS)}
          style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {t('dashboard.manage')}
        </button>
      </div>

      {lowStock.length === 0 ? (
        <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--ink-3)', border: '1px dashed var(--border)', borderRadius: 10, background: 'var(--surface-2)' }}>
          <div style={{ fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>{t('dashboard.stockOkTitle')}</div>
          <div style={{ fontSize: 12.5 }}>{t('dashboard.stockOkDesc')}</div>
        </div>
      ) : (
        <div className="col" style={{ gap: 8 }}>
          {lowStock.map((p) => {
            const unit = PRODUCT_UNIT_LABELS[p.unit as keyof typeof PRODUCT_UNIT_LABELS] ?? p.unit;
            return (
              <div key={`${p.productId}-${p.branchId}`} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 8, alignItems: 'center', background: '#fff7f5' }}>
                <div className="placeholder-img" style={{ width: 36, height: 36, fontSize: 9 }}>IMG</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.branchName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="num" style={{ fontWeight: 700, color: 'var(--danger)' }}>{p.currentStock} {unit}</div>
                  <StatusBadge tone="danger">{t('dashboard.thresholdLabel')}: {p.threshold}</StatusBadge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '.06em', margin: '8px 0 12px' }}>
        {t('dashboard.quickActions')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <Button icon={<SwapOutlined />} onClick={() => navigate(ROUTES.TRANSFERS)}>{t('dashboard.newTransfer')}</Button>
        <Button icon={<WalletOutlined />} onClick={() => navigate(ROUTES.EXPENSES)}>{t('dashboard.addExpense')}</Button>
        <Button icon={<TeamOutlined />} onClick={() => navigate(ROUTES.CUSTOMERS)}>{t('dashboard.addCustomer')}</Button>
        <Button icon={<InboxOutlined />} onClick={() => navigate(ROUTES.PRODUCTS)}>{t('dashboard.addProduct')}</Button>
      </div>
    </div>
  );
}
