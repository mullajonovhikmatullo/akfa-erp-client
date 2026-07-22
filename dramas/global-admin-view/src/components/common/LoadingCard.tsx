import { Skeleton } from 'antd';
import clsx from 'clsx';
import { GlassCard } from './GlassCard';

interface LoadingCardProps {
  className?: string;
  rows?: number;
  compact?: boolean;
}

export const LoadingCard = ({ className, rows = 4, compact = false }: LoadingCardProps) => (
  <GlassCard className={clsx('loading-card', compact && 'loading-card--compact', className)}>
    <Skeleton active avatar={compact} title paragraph={{ rows }} />
  </GlassCard>
);
