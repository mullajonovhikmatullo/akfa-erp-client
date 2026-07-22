import { Button } from 'antd';
import { GearSix, Headset } from '@phosphor-icons/react';
import { EmptyState } from '../common/EmptyState';
import { GlassCard } from '../common/GlassCard';

interface ComingSoonViewProps {
  isSupportRequests?: boolean;
  onBack: () => void;
}

export const ComingSoonView = ({ isSupportRequests = false, onBack }: ComingSoonViewProps) => {
  //
  if (isSupportRequests) {
    return (
      <GlassCard className="coming-soon">
        <EmptyState
          icon={Headset}
          title="Yangi murojaat yo‘q"
          description="Qo‘llab-quvvatlash so‘rovlari kelganda shu yerda ko‘rinadi."
        />
        <Button type="primary" onClick={onBack}>
          Boshqaruv paneliga qaytish
        </Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="coming-soon">
      <div className="empty-state__icon" aria-hidden="true">
        <GearSix size={28} weight="duotone" />
      </div>
      <div>
        <h1>Bu bo‘lim tayyorlanmoqda</h1>
        <p>Platforma kengayishi uchun sahifa yo‘li saqlandi. Hozircha boshqaruv paneliga qayting.</p>
      </div>
      <Button type="primary" onClick={onBack}>
        Boshqaruv paneliga qaytish
      </Button>
    </GlassCard>
  );
};
