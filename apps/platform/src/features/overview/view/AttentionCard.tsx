import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles } from 'lucide-react';
import type { PlatformStore } from '@store/platform-stub';
import { routes } from '../../../config/routes';
import { daysUntil, storeStatusLabels } from '../../../shared/lib/format';
import { Badge, Card, CardHeader, EmptyState, Skeleton } from '../../../shared/ui/display';

interface AttentionCardProps {
  stores: PlatformStore[];
  loading: boolean;
}

function reason(store: PlatformStore) {
  //
  if (store.status === 'PAST_DUE') return { tone: 'warning' as const, text: storeStatusLabels.PAST_DUE };
  const days = daysUntil(store.subscription?.trialEndsAt ?? store.trialEndsAt);
  return { tone: 'primary' as const, text: days !== null && days <= 0 ? 'Sinov bugun tugaydi' : `Sinov ${days} kunda tugaydi` };
}

export function AttentionCard({ stores, loading }: AttentionCardProps) {
  //
  return (
    <Card>
      <CardHeader title="E’tibor talab qiladi" description="Sinovi tugayotgan va to‘lov kutayotgan do‘konlar" />
      {loading ? (
        <div className="grid gap-3 px-5 pb-5">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : stores.length === 0 ? (
        <EmptyState icon={<Sparkles />} title="Hozircha tinch" description="Sinovi 7 kun ichida tugaydigan yoki to‘lov kutayotgan do‘kon yo‘q." />
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {stores.map((store) => {
            const { tone, text } = reason(store);
            return (
              <li key={store.id}>
                <Link
                  to={`${routes.companies}?q=${encodeURIComponent(store.name)}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2/60"
                >
                  <div className="grid min-w-0 flex-1">
                    <span className="truncate text-[13px] font-medium">{store.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{store.plan?.name ?? 'Tarifsiz'} · {store.phone ?? store.slug}</span>
                  </div>
                  <Badge tone={tone} dot>{text}</Badge>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
