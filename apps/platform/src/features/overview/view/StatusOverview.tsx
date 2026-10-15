import { Link } from 'react-router-dom';
import type { StoreStatus } from '@store/platform-stub';
import { routes } from '../../../config/routes';
import { formatNumber, storeStatusLabels } from '../../../shared/lib/format';
import { Card, Skeleton } from '../../../shared/ui/display';

const order: StoreStatus[] = ['ACTIVE', 'TRIALING', 'PAST_DUE', 'SUSPENDED', 'CANCELLED'];

export const statusColor: Record<StoreStatus, string> = {
  ACTIVE: 'bg-success',
  TRIALING: 'bg-primary',
  PAST_DUE: 'bg-warning',
  SUSPENDED: 'bg-danger',
  CANCELLED: 'bg-border-strong',
};

export function StatusOverview({ byStatus, loading }: { byStatus: Record<string, number> | undefined; loading: boolean }) {
  //
  const total = order.reduce((sum, status) => sum + (byStatus?.[status] ?? 0), 0);
  const highlighted: StoreStatus[] = ['ACTIVE', 'TRIALING', 'PAST_DUE'];

  return (
    <Card className="p-5">
      <div className="grid gap-5 sm:grid-cols-[1.2fr_repeat(3,1fr)] sm:items-end">
        <Link to={routes.companies} className="group grid gap-1">
          <span className="text-[13px] text-muted-foreground">Jami kompaniyalar</span>
          {loading ? <Skeleton className="h-9 w-16" /> : (
            <span className="tabular text-3xl font-semibold tracking-tight group-hover:text-primary">{formatNumber(total)}</span>
          )}
        </Link>
        {highlighted.map((status) => (
          <Link key={status} to={`${routes.companies}?status=${status}`} className="group grid gap-1 rounded-lg">
            <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <span className={`size-2 rounded-full ${statusColor[status]}`} />
              {storeStatusLabels[status]}
            </span>
            {loading ? <Skeleton className="h-7 w-10" /> : (
              <span className="tabular text-2xl font-semibold tracking-tight group-hover:text-primary">
                {formatNumber(byStatus?.[status] ?? 0)}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-surface-2">
        {total > 0 ? order.map((status) => {
          const count = byStatus?.[status] ?? 0;
          return count ? (
            <div
              key={status}
              title={`${storeStatusLabels[status]}: ${count}`}
              className={`${statusColor[status]} transition-[width] duration-500`}
              style={{ width: `${(count / total) * 100}%` }}
            />
          ) : null;
        }) : null}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {order.filter((status) => !highlighted.includes(status)).map((status) => (
          <Link key={status} to={`${routes.companies}?status=${status}`} className="inline-flex items-center gap-1.5 hover:text-foreground">
            <span className={`size-1.5 rounded-full ${statusColor[status]}`} />
            {storeStatusLabels[status]} <span className="tabular">{byStatus?.[status] ?? 0}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
