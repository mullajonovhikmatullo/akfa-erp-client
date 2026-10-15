import { Link } from 'react-router-dom';
import { Check, CheckCheck, ChevronRight } from 'lucide-react';
import type { PlatformPayment } from '@store/platform-stub';
import { routes } from '../../../config/routes';
import { formatDateTime, formatMoney } from '../../../shared/lib/format';
import { Button } from '../../../shared/ui/button';
import { Card, CardHeader, EmptyState, Skeleton } from '../../../shared/ui/display';

interface PendingPaymentsCardProps {
  payments: PlatformPayment[];
  loading: boolean;
  approvingId: string | null;
  onApprove: (payment: PlatformPayment) => void;
}

export function PendingPaymentsCard({ payments, loading, approvingId, onApprove }: PendingPaymentsCardProps) {
  //
  return (
    <Card>
      <CardHeader
        title="Tasdiq kutayotgan to‘lovlar"
        description={payments.length ? `${payments.length} ta to‘lov ko‘rib chiqilishi kerak` : undefined}
        action={
          <Link to={routes.payments} className="inline-flex items-center gap-0.5 text-[13px] text-muted-foreground hover:text-foreground">
            Barchasi <ChevronRight className="size-4" />
          </Link>
        }
      />
      {loading ? (
        <div className="grid gap-3 px-5 pb-5">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      ) : payments.length === 0 ? (
        <EmptyState icon={<CheckCheck />} title="Hammasi ko‘rib chiqilgan" description="Yangi to‘lov kelsa shu yerda chiqadi." />
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {payments.slice(0, 5).map((payment) => (
            <li key={payment.id} className="flex items-center gap-3 px-5 py-3">
              <div className="grid min-w-0 flex-1">
                <span className="truncate text-[13px] font-medium">{payment.store.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(payment.createdAt)}
                  {payment.receiptMedia ? ' · chek bor' : ''}
                </span>
              </div>
              <span className="tabular text-[13px] font-semibold">{formatMoney(payment.amount, payment.currency)}</span>
              <Button
                size="sm"
                variant="outline"
                loading={approvingId === payment.id}
                onClick={() => onApprove(payment)}
              >
                <Check /> Tasdiqlash
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
