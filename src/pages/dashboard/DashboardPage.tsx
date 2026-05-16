import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { PlusOutlined, DropboxOutlined, LineChartOutlined } from '@ant-design/icons';
import { useCurrentUser } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { formatDate } from '@/shared/lib/formatters';
import { useT } from '@/shared/lib/i18n';
import dayjs from 'dayjs';

// These widgets encapsulate all data fetching and computation
import { DashboardKpis } from '@/widgets/dashboard-kpis';
import { RevenueChartWidget } from '@/widgets/revenue-chart';
import { RecentSalesWidget } from '@/widgets/recent-sales';
import { LowStockWidget } from '@/widgets/low-stock';

export function DashboardPage() {
  const t = useT();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const firstName = user?.name?.split(' ')[0] ?? 'Admin';

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('dashboard.welcome')}, {firstName}</h1>
          <div className="sub">
            {formatDate(dayjs().format('YYYY-MM-DD'))} · {t('dashboard.currentData')}.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button icon={<PlusOutlined />} onClick={() => navigate(ROUTES.SALES)}>
            {t('dashboard.newSale')}
          </Button>
          <Button icon={<DropboxOutlined />} onClick={() => navigate(ROUTES.PURCHASES)}>
            {t('dashboard.stockIn')}
          </Button>
          <Button type="primary" icon={<LineChartOutlined />} onClick={() => navigate(ROUTES.ANALYTICS)}>
            {t('dashboard.openAnalytics')}
          </Button>
        </div>
      </div>

      <DashboardKpis />

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <RevenueChartWidget />
      </div>

      <div className="grid-2">
        <RecentSalesWidget />
        <LowStockWidget />
      </div>
    </>
  );
}
