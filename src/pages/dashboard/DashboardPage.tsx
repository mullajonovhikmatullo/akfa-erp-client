import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { PlusOutlined, DropboxOutlined, LineChartOutlined } from '@ant-design/icons';
import { useCurrentUser } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { formatDate } from '@/shared/lib/formatters';
import dayjs from 'dayjs';

// These widgets encapsulate all data fetching and computation
import { DashboardKpis } from '@/widgets/dashboard-kpis';
import { RevenueChartWidget } from '@/widgets/revenue-chart';
import { RecentSalesWidget } from '@/widgets/recent-sales';
import { LowStockWidget } from '@/widgets/low-stock';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const firstName = user?.name?.split(' ')[0] ?? 'Admin';

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Хуш келибсиз, {firstName}</h1>
          <div className="sub">
            {formatDate(dayjs().format('YYYY-MM-DD'))} · жорий маълумотлар.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button icon={<PlusOutlined />} onClick={() => navigate(ROUTES.SALES)}>
            Янги сотув
          </Button>
          <Button icon={<DropboxOutlined />} onClick={() => navigate(ROUTES.PURCHASES)}>
            Омборга кирим
          </Button>
          <Button type="primary" icon={<LineChartOutlined />} onClick={() => navigate(ROUTES.ANALYTICS)}>
            Таҳлилни очиш
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
