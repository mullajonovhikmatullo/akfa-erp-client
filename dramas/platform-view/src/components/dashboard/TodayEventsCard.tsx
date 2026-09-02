import { toast } from 'sonner';
import { EmptyState } from '../common/EmptyState';
import { GlassCard } from '../common/GlassCard';
import { SectionHeader } from '../common/SectionHeader';
import { StatusBadge } from '../common/StatusBadge';
import type { CalendarEvent } from '../../types/dashboard';

interface TodayEventsCardProps {
  events: CalendarEvent[];
}

export const TodayEventsCard = ({ events }: TodayEventsCardProps) => (
  <GlassCard className="today-card">
    <SectionHeader
      title="Bugun"
      actionLabel="Barchasini ko‘rish"
      onAction={() => toast.info('Bu bo‘lim keyingi bosqichda qo‘shiladi')}
    />
    {events.length ? (
      <div className="today-events">
        {events.map((event) => (
          <button
            className="today-event"
            type="button"
            key={event.id}
            onClick={() => toast.info('Bu bo‘lim keyingi bosqichda qo‘shiladi')}
          >
            <span className="today-event__icon" aria-hidden="true">
              <i className="icons-calendar-empty icon-size-20" />
            </span>
            <span className="today-event__content">
              <span className="today-event__title">{event.title}</span>
              <span className="today-event__company">{event.company}</span>
            </span>
            <StatusBadge label={event.type} />
            <span className="today-event__time">
              <i className="icons-clock icon-size-15" aria-hidden="true" />
              {event.time}
            </span>
          </button>
        ))}
      </div>
    ) : (
      <EmptyState
        icon="calendar-empty"
        title="Bugun tadbir yo‘q"
        description="Kalendar voqealari qo‘shilganda shu yerda chiqadi."
      />
    )}
  </GlassCard>
);
