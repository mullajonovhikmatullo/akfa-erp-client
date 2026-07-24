import { CalendarBlank, Receipt } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { EmptyState } from '../common/EmptyState';
import { GlassCard } from '../common/GlassCard';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrencyUZS, formatUzbekShortDateTime } from '../../lib/formatters';
import type { PaymentDue } from '../../types/dashboard';

interface UpcomingPaymentsCardProps {
  payments: PaymentDue[];
}

export const UpcomingPaymentsCard = ({ payments }: UpcomingPaymentsCardProps) => (
  <GlassCard className="list-card payments-card">
    <SectionHeader
      title="Yaqinlashayotgan to‘lovlar"
      actionLabel="Barchasini ko‘rish"
      onAction={() => toast.info('Bu bo‘lim keyingi bosqichda qo‘shiladi')}
    />
    {payments.length ? (
      <div className="payment-list">
        {payments.map((payment) => (
          <button
            className="payment-item"
            type="button"
            key={payment.id}
            onClick={() => toast.info('Bu bo‘lim keyingi bosqichda qo‘shiladi')}
          >
            <span className="payment-item__icon" aria-hidden="true">
              <Receipt size={20} weight="duotone" />
            </span>
            <span className="payment-item__content">
              <strong>{payment.company}</strong>
              <small>
                <CalendarBlank size={14} weight="duotone" aria-hidden="true" />
                {formatUzbekShortDateTime(payment.date)}
              </small>
            </span>
            <span className="payment-item__side">
              <StatusBadge label={payment.remaining} tone="purple" />
              <strong>{formatCurrencyUZS(payment.amount)}</strong>
            </span>
          </button>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={Receipt}
        title="Yaqin to‘lov yo‘q"
        description="To‘lov muddati yaqinlashgan mijozlar shu yerda ko‘rinadi."
      />
    )}
  </GlassCard>
);
