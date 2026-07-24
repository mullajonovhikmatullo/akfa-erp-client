import { Buildings } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { EmptyState } from '../common/EmptyState';
import { GlassCard } from '../common/GlassCard';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';
import type { TenantCompany } from '../../types/dashboard';

interface TenantListCardProps {
  tenants: TenantCompany[];
}

export const TenantListCard = ({ tenants }: TenantListCardProps) => (
  <GlassCard className="list-card">
    <SectionHeader
      title="Mijoz kompaniyalar"
      actionLabel="Barchasini ko‘rish"
      onAction={() => toast.info('Bu bo‘lim keyingi bosqichda qo‘shiladi')}
    />
    {tenants.length ? (
      <div className="tenant-list">
        {tenants.map((tenant) => (
          <button
            className="tenant-item"
            type="button"
            key={tenant.id}
            onClick={() => toast.success('Kompaniya tanlandi')}
          >
            <span className="tenant-item__icon" aria-hidden="true">
              <Buildings size={19} weight="duotone" />
            </span>
            <span className="tenant-item__content">
              <strong>{tenant.name}</strong>
              <small>
                {tenant.plan} · {tenant.stores}
              </small>
            </span>
            <StatusBadge label={tenant.status} />
          </button>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={Buildings}
        title="Mijoz kompaniya yo‘q"
        description="Yangi kompaniyalar qo‘shilganda ro‘yxat shu yerda chiqadi."
      />
    )}
  </GlassCard>
);
