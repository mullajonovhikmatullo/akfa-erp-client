import { Button } from 'antd';

import { GlassCard } from './GlassCard';

interface ErrorStateProps {
  onRetry: () => void;
}

export const ErrorState = ({ onRetry }: ErrorStateProps) => (
  <GlassCard className="error-state">
    <div className="empty-state__icon empty-state__icon--danger" aria-hidden="true">
      <i className="icons-warning icon-size-26" />
    </div>
    <div>
      <h2>Ma’lumotlarni yuklab bo‘lmadi</h2>
      <p>Internet aloqasini tekshirib, qayta urinib ko‘ring.</p>
    </div>
    <Button type="primary" onClick={onRetry}>
      Qayta urinish
    </Button>
  </GlassCard>
);
