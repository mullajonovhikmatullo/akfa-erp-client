import type { PlatformStore, StoreStatus } from '@store/platform-stub';
import { billingTypeLabels, daysUntil, formatDate, formatPlanPrice, storeStatusLabels } from '../../../shared/lib/format';
import { Badge } from '../../../shared/ui/display';
import type { Tone } from '../../../shared/ui/display';

export const statusTone: Record<StoreStatus, Tone> = {
  ACTIVE: 'success',
  TRIALING: 'primary',
  PAST_DUE: 'warning',
  SUSPENDED: 'danger',
  CANCELLED: 'neutral',
};

export function StatusBadge({ status }: { status: StoreStatus }) {
  //
  return <Badge tone={statusTone[status]} dot>{storeStatusLabels[status]}</Badge>;
}

export function PlanCell({ store }: { store: PlatformStore }) {
  //
  if (!store.plan) return <span className="text-muted-foreground">Tarifsiz</span>;
  const lifetime = Boolean(store.subscription?.lifetimeAccessAt);
  return (
    <div className="grid gap-1">
      <div className="flex items-center gap-1.5">
        <span className="font-medium">{store.plan.name}</span>
        {store.plan.billingType === 'LIFETIME' ? <Badge tone="gold">{lifetime ? 'Doimiy' : billingTypeLabels.LIFETIME}</Badge> : null}
      </div>
      <span className="text-xs text-muted-foreground">{formatPlanPrice(store.plan)}</span>
    </div>
  );
}

export function UsageCell({ store }: { store: PlatformStore }) {
  //
  const rows = [
    { label: 'filial', used: store._count.branches, limit: store.plan?.maxBranches ?? null },
    { label: 'user', used: store._count.users, limit: store.plan?.maxUsers ?? null },
    { label: 'mahsulot', used: store._count.products, limit: store.plan?.maxProducts ?? null },
  ];
  return (
    <div className="grid gap-1">
      {rows.map((row) => {
        const ratio = row.limit ? Math.min(row.used / row.limit, 1) : 0;
        return (
          <div key={row.label} className="flex items-center gap-2 text-xs">
            <div className="h-1 w-12 overflow-hidden rounded-full bg-surface-2">
              <div
                className={ratio >= 0.9 ? 'h-full bg-warning' : 'h-full bg-foreground/40'}
                style={{ width: `${row.limit ? ratio * 100 : 0}%` }}
              />
            </div>
            <span className="tabular text-muted-foreground">
              {row.used}{row.limit === null ? '' : `/${row.limit}`} {row.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function TermCell({ store }: { store: PlatformStore }) {
  //
  const subscription = store.subscription;
  if (subscription?.lifetimeAccessAt) {
    return <span className="text-xs text-muted-foreground">Muddatsiz · {formatDate(subscription.lifetimeAccessAt)} dan</span>;
  }
  if (store.status === 'TRIALING') {
    const days = daysUntil(subscription?.trialEndsAt ?? store.trialEndsAt);
    return (
      <div className="grid text-xs">
        <span className={days !== null && days <= 3 ? 'font-medium text-warning' : ''}>{days !== null && days > 0 ? `${days} kun qoldi` : 'Bugun tugaydi'}</span>
        <span className="text-muted-foreground">Sinov · {formatDate(subscription?.trialEndsAt ?? store.trialEndsAt)}</span>
      </div>
    );
  }
  if (subscription?.currentPeriodEnd) {
    return (
      <div className="grid text-xs">
        <span>{formatDate(subscription.currentPeriodEnd)} gacha</span>
        <span className="text-muted-foreground">Keyingi to‘lov</span>
      </div>
    );
  }
  return <span className="text-xs text-muted-foreground">—</span>;
}
