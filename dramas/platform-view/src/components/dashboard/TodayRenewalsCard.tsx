import { Button } from 'antd';
import { CalendarBlank, Clock, CreditCard, UserCircle } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { EmptyState } from '../common/EmptyState';
import { GlassCard } from '../common/GlassCard';
import { SectionHeader } from '../common/SectionHeader';
import type { SubscriptionRenewal } from '../../types/dashboard';

interface TodayRenewalsCardProps {
  renewals: SubscriptionRenewal[];
}

export const TodayRenewalsCard = ({ renewals }: TodayRenewalsCardProps) => (
  <GlassCard className="renewals-card">
    <SectionHeader
      title="Bugungi obunalar"
      actionLabel="Barcha obunalar"
      onAction={() => toast.info('Bu bo‘lim keyingi bosqichda qo‘shiladi')}
    />
    {renewals.length ? (
      <div className="renewal-timeline">
        {renewals.map((renewal) => (
          <article className="renewal-item" key={renewal.id}>
            <div className="renewal-item__time">
              <Clock size={17} weight="duotone" aria-hidden="true" />
              <span>{renewal.time}</span>
            </div>
            <div className="renewal-item__line" aria-hidden="true" />
            <div className="renewal-item__content">
              <span className="renewal-item__type">
                <CreditCard size={16} weight="duotone" aria-hidden="true" />
                {renewal.type}
              </span>
              <h3>{renewal.company}</h3>
              <div className="renewal-item__meta">
                <span>{renewal.plan}</span>
                <span>
                  <UserCircle size={15} weight="duotone" aria-hidden="true" />
                  {renewal.responsibleAdmin ?? 'Mas’ul belgilanmagan'}
                </span>
              </div>
              <Button type="primary" onClick={() => toast.success('Mijoz sahifasi ochilmoqda')}>
                Mijozni ochish
              </Button>
            </div>
          </article>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={CalendarBlank}
        title="Bugun obuna yo‘q"
        description="Yangilanishlar paydo bo‘lsa, shu yerda ko‘rinadi."
      />
    )}
  </GlassCard>
);
