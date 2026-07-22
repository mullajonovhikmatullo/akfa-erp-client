import { Megaphone, ShieldCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { EmptyState } from '../common/EmptyState';
import { GlassCard } from '../common/GlassCard';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';
import { formatUzbekDate } from '../../lib/formatters';
import type { SystemAnnouncement } from '../../types/dashboard';

interface SystemAnnouncementsCardProps {
  announcements: SystemAnnouncement[];
}

export const SystemAnnouncementsCard = ({ announcements }: SystemAnnouncementsCardProps) => (
  <GlassCard className="list-card announcements-card">
    <SectionHeader
      title="So‘nggi tizim xabarlari"
      actionLabel="Barchasini ko‘rish"
      onAction={() => toast.info('Bu bo‘lim keyingi bosqichda qo‘shiladi')}
    />
    {announcements.length ? (
      <div className="announcement-list">
        {announcements.map((announcement) => {
          //
          const Icon = announcement.category === 'Admin' ? ShieldCheck : Megaphone;
          return (
            <button
              className="announcement-item"
              type="button"
              key={announcement.id}
              onClick={() => toast.info('Bu bo‘lim keyingi bosqichda qo‘shiladi')}
            >
              <span className="announcement-item__icon" aria-hidden="true">
                <Icon size={19} weight="duotone" />
              </span>
              <span className="announcement-item__content">
                <strong>{announcement.title}</strong>
                <small>{formatUzbekDate(announcement.date)}</small>
              </span>
              <StatusBadge label={announcement.category} />
            </button>
          );
        })}
      </div>
    ) : (
      <EmptyState
        icon={Megaphone}
        title="Tizim xabari yo‘q"
        description="Yangiliklar e’lon qilinganda shu yerda ko‘rinadi."
      />
    )}
  </GlassCard>
);
