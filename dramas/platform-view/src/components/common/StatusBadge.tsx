import clsx from 'clsx';
import type { TenantStatus } from '../../types/dashboard';

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
}

const tenantStatusTone: Record<TenantStatus, BadgeTone> = {
  Faol: 'success',
  'Sinov muddatida': 'info',
  Qarzdor: 'warning',
  Bloklangan: 'danger',
};

const inferTone = (label: string): BadgeTone => {
  //
  if (label in tenantStatusTone) {
    return tenantStatusTone[label as TenantStatus];
  }

  if (label === 'Obuna') {
    return 'purple';
  }

  if (label === 'Admin') {
    return 'info';
  }

  return 'neutral';
};

export const StatusBadge = ({ label, tone }: StatusBadgeProps) => (
  <span className={clsx('status-badge', `status-badge--${tone ?? inferTone(label)}`)}>{label}</span>
);
