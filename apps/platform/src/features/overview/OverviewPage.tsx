import { useMemo, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import type { PlatformPayment } from '@store/platform-stub';
import { readPlatformUser } from '../../shared/auth/session';
import { daysUntil } from '../../shared/lib/format';
import { PageHeader } from '../../shared/ui/display';
import { usePlatformStoresPage } from '../companies/hooks/usePlatformStoresPage';
import { usePaymentMutation } from '../payments/hooks/usePaymentMutation';
import { usePaymentsList } from '../payments/hooks/usePaymentsList';
import { usePlatformDashboardSummary } from './hooks/usePlatformDashboardSummary';
import { AttentionCard } from './view/AttentionCard';
import { PendingPaymentsCard } from './view/PendingPaymentsCard';
import { StatusOverview } from './view/StatusOverview';

const greeting = () => {
  //
  const hour = new Date().getHours();
  if (hour < 5) return 'Xayrli tun';
  if (hour < 12) return 'Xayrli tong';
  if (hour < 18) return 'Xayrli kun';
  return 'Xayrli kech';
};

export function OverviewPage() {
  //
  const user = readPlatformUser();
  const summaryQuery = usePlatformDashboardSummary();
  const pendingQuery = usePaymentsList('PENDING');
  const trialingQuery = usePlatformStoresPage({ status: 'TRIALING', page: 1, pageSize: 50 });
  const pastDueQuery = usePlatformStoresPage({ status: 'PAST_DUE', page: 1, pageSize: 10 });
  const { approvePayment } = usePaymentMutation();
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const attention = useMemo(() => {
    //
    const endingTrials = (trialingQuery.data?.items ?? [])
      .filter((store) => (daysUntil(store.subscription?.trialEndsAt ?? store.trialEndsAt) ?? 99) <= 7)
      .sort((left, right) => (daysUntil(left.trialEndsAt) ?? 0) - (daysUntil(right.trialEndsAt) ?? 0));
    return [...(pastDueQuery.data?.items ?? []), ...endingTrials].slice(0, 6);
  }, [pastDueQuery.data, trialingQuery.data]);

  const approve = (payment: PlatformPayment) => {
    //
    setApprovingId(payment.id);
    approvePayment.mutate(payment.id, { onSettled: () => setApprovingId(null) });
  };

  const renewals = summaryQuery.data?.renewalsDueSoon ?? 0;

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(' ')[0] ?? 'xo‘jayin'}`}
        description={new Intl.DateTimeFormat('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}
        actions={renewals > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-[13px] text-muted-foreground">
            <CalendarClock className="size-4" /> 7 kun ichida {renewals} ta to‘lov muddati
          </span>
        ) : undefined}
      />
      <StatusOverview byStatus={summaryQuery.data?.storesByStatus} loading={summaryQuery.isLoading} />
      <div className="grid gap-6 lg:grid-cols-2">
        <PendingPaymentsCard
          payments={pendingQuery.data ?? []}
          loading={pendingQuery.isLoading}
          approvingId={approvingId}
          onApprove={approve}
        />
        <AttentionCard stores={attention} loading={trialingQuery.isLoading || pastDueQuery.isLoading} />
      </div>
    </>
  );
}
